'use client'

import { Chat, Robot } from '@/types/database'
import {
  PropsWithChildren,
  createContext,
  useContext,
  useMemo,
  useState
} from 'react'
import { GPT_Model, TEMPERATURE } from '../constants'

export interface ChatStore extends Partial<Chat> {
  id?: string
  robotId?: string
  clear?: () => void
  update?: (chat: Partial<Chat>) => void
  setTitle?: (title?: string) => void
  setPinPrompt?: (prompt: string) => void
  setModel?: (model: GPT_Model) => void
  setTemperature?: (temperature: number) => void
  setAttachedMessagesCount?: (count: number) => void
}

const ChatStoreContext = createContext<ChatStore>({})

export const ChatStoreProvider = ({
  id: _id,
  children,
  ...chat
}: Partial<Chat> & PropsWithChildren) => {
  const [id, setId] = useState(_id)
  const [robotId, setRobotId] = useState(chat.robotId)
  const [title, setTitle] = useState(chat.title)
  const [pinPrompt, setPinPrompt] = useState(chat.pinPrompt)
  const [model, setModel] = useState(chat.model ?? GPT_Model.GPT_3_5_TURBO)
  const [temperature, setTemperature] = useState(
    chat.temperature ?? TEMPERATURE
  )
  const [attachedMessagesCount, setAttachedMessagesCount] = useState(
    chat.attachedMessagesCount ?? 5
  )

  const update = (chat: Partial<Chat>) => {
    setId(chat.id)
    setRobotId(chat.robotId)
    setTitle(chat.title)
    setModel(chat.model ?? GPT_Model.GPT_3_5_TURBO)
    setTemperature(chat.temperature ?? TEMPERATURE)
    setAttachedMessagesCount(chat.attachedMessagesCount ?? 5)
  }

  const clear = () => {
    setId(undefined)
    setRobotId(undefined)
    setTitle(undefined)
  }

  const store = useMemo<ChatStore>(() => {
    return {
      id,
      robotId,
      title,
      model,
      pinPrompt,
      temperature,
      attachedMessagesCount,
      clear,
      update,
      setTitle,
      setModel,
      setPinPrompt,
      setTemperature,
      setAttachedMessagesCount
    }
  }, [attachedMessagesCount, id, model, pinPrompt, robotId, temperature, title])

  return (
    <ChatStoreContext.Provider value={store}>
      {children}
    </ChatStoreContext.Provider>
  )
}

export const useChatStore = () => useContext(ChatStoreContext)
