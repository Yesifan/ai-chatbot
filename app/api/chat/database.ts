import database from '@/lib/database'
import { NewChat } from '@/types/chat'
import { Role } from '@/lib/constants'
import { ChatBody } from '@/types/api'

export const getChat = async (
  id: string,
  userId: string
): Promise<NewChat | null> => {
  const chat = await database
    .selectFrom('chat')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst()

  if (chat?.userId != userId) {
    return null
  }
  return chat
}

export const recordConversation = async (
  answer: string,
  questionAt: Date,
  chatBody: ChatBody
) => {
  const now = new Date()
  const question = chatBody.messages[chatBody.messages.length - 1].content

  database
    .updateTable('chat')
    .set({
      lastMessage: question,
      lastMessageAt: questionAt
    })
    .where('chat.id', '=', chatBody.id)
    .executeTakeFirst()
    .catch(e => {
      console.error('[update chat error]', e?.message)
    })

  const questionMessage = {
    id: chatBody.questionId,
    chatId: chatBody.id,
    content: question,
    role: Role.User,
    model: chatBody.model,
    createdAt: questionAt
  }

  const answerMessage = {
    id: chatBody.replyId,
    chatId: chatBody.id,
    content: answer,
    role: Role.Assistant,
    model: chatBody.model,
    createdAt: now
  }

  return await database
    .insertInto('message')
    .values(
      chatBody.isReload ? [answerMessage] : [questionMessage, answerMessage]
    )
    .executeTakeFirstOrThrow()
    .then(res => {
      console.log('[record conversation success]', res)
    })
    .catch(error => {
      console.error('[OPENAI CHAT ERROR]', error)
      console.error('[OPENAI CHAT ERROR]', chatBody)
    })
}