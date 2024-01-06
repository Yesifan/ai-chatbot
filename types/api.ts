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
  icon?: string
  cover?: string
  name: string
  description?: string
  tags?: string[]
  input_template?: string
  createdAt?: Date
  lastEditedAt?: Date
}
