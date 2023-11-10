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
import { nanoid } from '../utils'

export type ChatStoreProps = Pick<
  Chat,
  'id' | 'title' | 'model' | 'temperature' | 'attachedMessagesCount'
>

export interface ChatStore extends Partial<ChatStoreProps> {
  id: string
  setTitle?: (title: string) => void
  setModel?: (model: GPT_Model) => void
  setTemperature?: (temperature: number) => void
  setAttachedMessagesCount?: (count: number) => void
}

const ChatStoreContext = createContext<ChatStore>({
  id: nanoid()
})

export const ChatStoreProvider = ({
  id,
  children,
  ...chat
}: PropsWithChildren & Partial<ChatStoreProps>) => {
  const [title, setTitle] = useState(chat.title)
  const [model, setModel] = useState(chat.model ?? GPT_Model.GPT_3_5_TURBO)
  const [temperature, setTemperature] = useState(
    chat.temperature ?? TEMPERATURE
  )
  const [attachedMessagesCount, setAttachedMessagesCount] = useState(
    chat.attachedMessagesCount ?? 5
  )
  const store = useMemo<ChatStore>(() => {
    return {
      id: id ?? nanoid(),
      title,
      model,
      temperature,
      attachedMessagesCount,
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
