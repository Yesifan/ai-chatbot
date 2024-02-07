import database from '@/lib/database'
import { createOpenai } from './openai'
import { config } from '@/config/server'
import { AssistantType } from '@/lib/constants'

export const createKnowledgeManagementThread = async (
  userId: string,
  messageId: string,
  msg: string,
  options: string[] = []
) => {
  const assistantId = config.OPENAI_TAG_ASSISTANT
  if (assistantId) {
    const openai = createOpenai()
    const content = JSON.stringify({ text: msg, options: options })
    try {
      const run = await openai.beta.threads.createAndRun({
        assistant_id: assistantId,
        thread: {
          messages: [{ role: 'user', content: content }]
        }
      })

      // save thread for corn task
      await database
        .insertInto('thread')
        .values({
          id: run.thread_id,
          runId: run.id,
          userId: userId,
          messageId: messageId,
          type: AssistantType.KNOWLEDGE_MANAGEMENT,
          status: run.status,
          createdAt: new Date()
        })
        .executeTakeFirstOrThrow()

      return run
    } catch (e) {
      console.error('[createKnowledgeManagementThread]', e)
    }
  } else {
    console.error('[createKnowledgeManagementThread] assistantId is empty')
  }
}
