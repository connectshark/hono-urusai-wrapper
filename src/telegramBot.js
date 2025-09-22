class TelegramBot {
  #API_URL
  constructor (token) {
    this.#API_URL = `https://api.telegram.org/bot${ token }`
  }
  sendChatAction = async ({ id, action }) => {
    return await this.#useFetch('/sendChatAction', {
      chat_id: id,
      action: action
    })
  }

  sendMessage = async ({ id, text, options }) => {
    const body = {
      chat_id: id,
      text: text
    }
    if (options) {
      for (const key in options) {
        if (Object.hasOwnProperty.call(options, key)) {
          const content = options[key]
          body[key] = content
        }
      }
    }
    return this.#useFetch('/sendMessage', body)
  }

  sendPhoto = async ({ id, photo, options }) => {
    const body = {
      chat_id: id,
      photo: photo
    }
    if (options) {
      for (const key in options) {
        if (Object.hasOwnProperty.call(options, key)) {
          const content = options[key]
          body[key] = content
        }
      }
    }
    return this.#useFetch('/sendPhoto', body)
  }

  answerCallbackQuery = async ({ callback_query_id, options }) => {
    const body = {
      callback_query_id
    }
    if (options) {
      for (const key in options) {
        if (Object.hasOwnProperty.call(options, key)) {
          const content = options[key]
          body[key] = content
        }
      }
    }
    return this.#useFetch('/answerCallbackQuery', body)
  }

  getFile = async ({ file_id }) => {
    return await this.#useFetch(`/getFile`, {
      file_id
    })
  }

  #useFetch = async (path, options) => {
    const fetchOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options)
    }
    const fetch_response = await fetch(this.#API_URL + path, fetchOptions)
    return await fetch_response.json()
  }
}

const createTelegramBot = (token) => {
  if (!token) {
    throw new Error('Token is required.')
  }
  return new TelegramBot(token)
}

export default createTelegramBot