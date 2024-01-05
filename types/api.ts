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

export interface RobotTemplate {
  id: string
  name: string
  description?: string
  pinPrompt?: string
  tags?: string[]
  input_template?: string
}
