import { Hono } from 'hono'
import createTelegramBot from './telegramBot'

const app = new Hono()

// --- Urusai API Functions ---

const uploadToUrusai = async ({ token, imageUrl, file_name, mime_type }) => {
  const fetch_response = await fetch(imageUrl)
  const buffer = await fetch_response.arrayBuffer()
  const imageFile = new File([buffer], file_name, { type: mime_type })
  const formData = new FormData()
  formData.append('file', imageFile)
  formData.append('token', token)

  const res = await fetch('https://api.urusai.cc/v1/upload', {
    method: 'POST',
    body: formData
  })

  return res.json()
}

const queryUrusaiRepository = async ({ username, token, type }) => {
  const formData = new FormData()
  formData.append('username', username)
  formData.append('token', token)
  formData.append('type', type)

  const res = await fetch('https://api.urusai.cc/v1/repository', {
    method: 'POST',
    body: formData
  })

  return res.json()
}

// --- Telegram Bot Handlers ---

const handleTextMessage = async (text, chatId, { telegramBot, URUSAI_USERNAME, URUSAI_TOKEN }) => {
  const [command, ...args] = text.split(' ')

  if (command === '/menu') {
    await telegramBot.sendMessage({
      id: chatId,
      text: '請選擇要查詢的類型：',
      options: {
        reply_markup: {
          inline_keyboard: [
            [{ text: '檔案', callback_data: '/query file' }, { text: '相簿', callback_data: '/query album' }]
          ]
        }
      }
    })
    return true
  }

  if (command === '/query') {
    const type = args[0]
    if (!type || !['file', 'album'].includes(type)) {
      await telegramBot.sendMessage({
        id: chatId,
        text: '請提供有效的查詢類型'
      })
      return true // Command was handled, even with wrong args
    }

    await telegramBot.sendChatAction({ id: chatId, action: 'typing' })

    const result = await queryUrusaiRepository({
      username: URUSAI_USERNAME,
      token: URUSAI_TOKEN,
      type: type
    })

    if (result.status !== 'success') {
      await telegramBot.sendMessage({
        id: chatId,
        text: `查詢失敗： ${result.message}`
      })
      return true
    }

    let responseText = `查詢成功！共 ${result.total} 筆資料：\n\n`
    if (type === 'file') {
      result.data.forEach(file => {
        responseText += `檔名: \`${file.filename}\`\n`
        responseText += `網址: \`${file.url_direct}\`\n\n`
      })
    } else if (type === 'album') {
      result.data.forEach(album => {
        responseText += `相簿網址: ${album.url}\n`
        responseText += `包含檔案ID: ${album.fileid}\n\n`
      })
    }
    if (responseText.length > 4096) {
      responseText = responseText.substring(0, 4090) + '\n...'
    }

    await telegramBot.sendMessage({
      id: chatId,
      text: responseText,
      options: {
        parse_mode: 'MarkdownV2'
      }
    })
    return true
  }
  return false // Not a recognized command
}

const handleDocumentMessage = async (message, { telegramBot, BOT_TOKEN, URUSAI_TOKEN }) => {
  const { document, chat } = message

  if (document.file_size > 20 * 1024 * 1024) {
    await telegramBot.sendMessage({
      id: chat.id,
      text: '❌ 檔案超過 20MB，無法處理。請重新上傳較小的檔案。',
    })
    return
  }

  await telegramBot.sendChatAction({ id: chat.id, action: 'upload_document' })

  const file = await telegramBot.getFile({ file_id: document.file_id })
  const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${file.result.file_path}`

  const upload = await uploadToUrusai({
    token: URUSAI_TOKEN,
    imageUrl: fileUrl,
    file_name: document.file_name,
    mime_type: document.mime_type
  })

  await telegramBot.sendChatAction({ id: chat.id, action: 'typing' })

  const msg = `成功！\n預覽: \`${upload.data.url_direct}\`\n刪除: \`${upload.data.url_delete}\``
  await telegramBot.sendPhoto({
    id: chat.id,
    photo: upload.data.url_direct,
    options: {
      caption: msg,
      parse_mode: 'MarkdownV2'
    }
  })
}

app.get('/', (c) => c.json('OK'))

app.post('/', async (c) => {
  const MY_TELEGRAM_ID = c.env.MY_TELEGRAM_ID
  try {
    const { message, callback_query } = await c.req.json()

    if (!message && !callback_query) {
      return c.body(null, 204)
    }

    const fromId = message?.from?.id || callback_query?.from?.id
    if (fromId.toString() !== MY_TELEGRAM_ID) {
      return c.body(null, 204)
    }

    const BOT_TOKEN = c.env.BOT_TOKEN
    const URUSAI_USERNAME = c.env.URUSAI_USERNAME
    const URUSAI_TOKEN = c.env.URUSAI_API_TOKEN
    const telegramBot = createTelegramBot(BOT_TOKEN)

    const context = { telegramBot, BOT_TOKEN, URUSAI_USERNAME, URUSAI_TOKEN }
    let handled = false

    if (callback_query) {
      await telegramBot.answerCallbackQuery({ callback_query_id: callback_query.id })
      await handleTextMessage(callback_query.data, callback_query.message.chat.id, context)
      handled = true // Assume callbacks are always handled
    } else if (message.text) {
      handled = await handleTextMessage(message.text, message.chat.id, context)
    } else if (message.document) {
      await handleDocumentMessage(message, context)
      handled = true
    }

    if (message && !handled) {
      await telegramBot.sendMessage({ id: message.chat.id, text: 'Hello' })
    }

  } catch (err) {
    console.error(err)
  }

  return c.body(null, 204)
})

export default app
