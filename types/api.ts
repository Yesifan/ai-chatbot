import { Message } from '@/types/database'
import { GPT_Model } from '@/lib/constants'

export interface ChatBody {
  id: string
  model: GPT_Model
  isReload: boolean
  messages: Message[]
  replyId: string
  questionId: string
  temperature: number
}
