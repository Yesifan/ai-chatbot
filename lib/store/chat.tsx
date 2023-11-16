'use client'

import { Chat } from '@/types/chat'
import {
  PropsWithChildren,
  createContext,
  useContext,
  useMemo,
  useState
} from 'react'
import { GPT_Model, TEMPERATURE } from '../constants'

export type ChatStoreProps = Pick<
  Chat,
  'id' | 'title' | 'model' | 'temperature' | 'attachedMessagesCount'
>

export interface ChatStore extends Partial<ChatStoreProps> {
  id?: string
  clear?: () => void
  update?: (chat: Partial<ChatStoreProps>) => void
  setTitle?: (title?: string) => void
  setModel?: (model: GPT_Model) => void
  setTemperature?: (temperature: number) => void
  setAttachedMessagesCount?: (count: number) => void
}

const ChatStoreContext = createContext<ChatStore>({})

export const ChatStoreProvider = ({
  id: _id,
  children,
  ...chat
}: PropsWithChildren & Partial<ChatStoreProps>) => {
  const [id, setId] = useState(_id)
  const [title, setTitle] = useState(chat.title)
  const [model, setModel] = useState(chat.model ?? GPT_Model.GPT_3_5_TURBO)
  const [temperature, setTemperature] = useState(
    chat.temperature ?? TEMPERATURE
  )
  const [attachedMessagesCount, setAttachedMessagesCount] = useState(
    chat.attachedMessagesCount ?? 5
  )

  const update = (chat: Partial<ChatStoreProps>) => {
    setId(chat.id)
    setTitle(chat.title)
    setModel(chat.model ?? GPT_Model.GPT_3_5_TURBO)
    setTemperature(chat.temperature ?? TEMPERATURE)
    setAttachedMessagesCount(chat.attachedMessagesCount ?? 5)
  }

  const clear = () => {
    setId(undefined)
    setTitle(undefined)
  }

  const store = useMemo<ChatStore>(() => {
    return {
      id,
      title,
      model,
      temperature,
      attachedMessagesCount,
      clear,
      update,
      setModel,
      setTitle,
      setTemperature,
      setAttachedMessagesCount
    }
  }, [attachedMessagesCount, id, model, temperature, title])

  return (
    <ChatStoreContext.Provider value={store}>
      {children}
    </ChatStoreContext.Provider>
  )
}

export const useChatStore = () => useContext(ChatStoreContext)
