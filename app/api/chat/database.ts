import database from '@/lib/database'
import { Role } from '@/lib/constants'
import { ChatBody } from '@/types/api'

export const recordConversation = async (
  answer: string,
  questionAt: Date,
  chatBody: ChatBody
) => {
  const now = new Date()
  const question = chatBody.messages[chatBody.messages.length - 1].content

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
  try {
    await database
      .insertInto('message')
      .values(
        chatBody.isReload ? [answerMessage] : [questionMessage, answerMessage]
      )
      .executeTakeFirstOrThrow()
    console.log(
      '[record conversation][success]',
      chatBody.questionId,
      chatBody.replyId
    )
  } catch (error) {
    console.error('[record conversation][error]', error)
    console.error('[record conversation][chat body]', chatBody)
  }
  await database
    .updateTable('chat')
    .set({
      lastMessage: question,
      lastMessageAt: questionAt
    })
    .where('chat.id', '=', chatBody.id)
    .executeTakeFirstOrThrow()
    .catch(e => {
      console.error('[update chat error]', e?.message)
    })
}
