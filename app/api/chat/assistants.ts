import { createOpenai } from './openai'
import { config } from '@/config/server'

export const knowledgeManagementAssistant = async (
  msg: string,
  options: string[] = []
) => {
  const assistantId = config.OPENAI_TAG_ASSISTANT
  if (assistantId) {
    const openai = createOpenai()
    const thread = await openai.beta.threads.create()
    const content = JSON.stringify({ text: msg, options: options })
    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: content
    })
    await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId
    })
    const messages = await openai.beta.threads.messages.list(thread.id)
    return messages
  } else {
    return undefined
  }
}
