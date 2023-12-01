import toast from 'react-hot-toast'
import { useState } from 'react'
import { useChatStore } from '../store/chat'
import { updateChat } from '@/app/actions'

export const usePrompt = () => {
  const chatStore = useChatStore()
  const [isPrompt, setIsPrompt] = useState(false)
  const [isPromptLoading, setPromptLoading] = useState(false)

  const setPinPrompt = async (value: string) => {
    if (!chatStore.id) {
      throw new Error('Chat id is undefined')
    }
    setPromptLoading(true)
    try {
      if (value.trim() === '') {
        await updateChat(chatStore.id, { pinPrompt: undefined })
      } else {
        await updateChat(chatStore.id, { pinPrompt: value })
      }
      chatStore.setPinPrompt?.(value)
    } catch (e) {
      toast.error('Set prompt failed!')
    }
    setIsPrompt(false)
    setPromptLoading(false)
  }

  return { setPinPrompt, isPrompt, setIsPrompt, isPromptLoading }
}
