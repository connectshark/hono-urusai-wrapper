import { Hono } from 'hono'
import createTelegramBot from './telegramBot'

const app = new Hono()

const uploadToUrusai = async ({ imageUrl, file_name, mime_type }) => {
  const fetch_response = await fetch(imageUrl)
  const buffer = await fetch_response.arrayBuffer()

  const imageFile = new File([buffer], file_name, { type: mime_type })

  const formData = new FormData()
  formData.append('file', imageFile)

  const res = await fetch('https://api.urusai.cc/v1/upload', {
    method: 'POST',
    body: formData
  })

  const json = await res.json()
  return json
}

const uploadSheet = async ({ URL, payload }) => {
  const response = await fetch(URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  return await response.text()
}

const isOver20MB = (fileSize) => fileSize > 20 * 1024 * 1024

app.get('/', async (c) => {
  return c.json('OK')
})


app.post('/', async (c) => {
  const { message } = await c.req.json()
  const APP_SCRIPT_URL = c.env.APP_SCRIPT_URL
  const BOT_TOKEN = c.env.BOT_TOKEN
  const SECRET_TOKEN = c.env.SECRET_TOKEN
  const telegramBot = createTelegramBot(BOT_TOKEN)
  if (message.document) {
    if (isOver20MB(message.document.file_size)) {
      telegramBot.sendMessage({
        id: message.from.id,
        content: '❌ 檔案超過 20MB，無法處理。請重新上傳較小的檔案。',
      })
      return c.body(null, 204)
    }
    await telegramBot.sendChatAction({
      id: message.from.id,
      action: 'upload_document'
    })
    const file = await telegramBot.getFile({
      file_id: message.document.file_id
    })
    const fileUrl = `https://api.telegram.org/file/bot${ BOT_TOKEN }/${ file.result.file_path }`
    const upload = await uploadToUrusai({
      imageUrl: fileUrl,
      file_name: message.document.file_name,
      mime_type: message.document.mime_type
    })
    const payload = {
      token: SECRET_TOKEN,
      id: upload.data.id,
      filename: upload.data.filename,
      url_preview: upload.data.url_preview,
      url_direct: upload.data.url_direct,
      r18: upload.data.r18,
      url_delete: upload.data.url_delete,
      mime: upload.data.mime,
    }
    await uploadSheet({ URL: APP_SCRIPT_URL, payload: payload })
    await telegramBot.sendChatAction({
      id: message.from.id,
      action: 'typing'
    })
    const msg = `成功！
  預覽: ${upload.data.url_direct}
  刪除: ${upload.data.url_delete}`
    await telegramBot.sendMessage({
      id: message.from.id,
      content: msg,
    })
  }
  return c.body(null, 204)
})

export default app
