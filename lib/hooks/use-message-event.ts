import { useEffect } from 'react'

const enum MessageEventTypes {
  CHAT_UPDATE = 'chat-update'
}

export const sendMessageEvent = async (
  type: MessageEventTypes,
  message: string
) => {
  const event = new CustomEvent<string>(type, {
    detail: message
  })
  window.dispatchEvent(event)
}

export const useMessageEvent = (
  type: MessageEventTypes,
  callback: (message: string) => void
) => {
  useEffect(() => {
    const handler: EventListener = event => {
      callback((event as CustomEvent<string>).detail)
    }
    window.addEventListener(type, handler)
    return () => {
      window.removeEventListener(type, handler)
    }
  }, [type, callback])
}
