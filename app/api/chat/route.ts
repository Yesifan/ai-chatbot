import { APIError } from 'openai'
import { OpenAIStream, StreamingTextResponse } from 'ai'

import { auth } from '@/auth'
import { NextRequest } from 'next/server'
import database from '@/lib/database'
import { Message, NewChat } from '@/types/chat'
import { GPT_Model, Role, TEMPERATURE } from '@/lib/constants'
import { createOpenai } from './openai'

export const runtime = 'edge'

export interface ChatBody {
  id: string
  model: GPT_Model
  messages: Message[]
  replyId: string
  temperature: number
}

const getOrCreateChat = async (
  id: string,
  userId: string,
  messages: Message[]
): Promise<NewChat> => {
  const content = messages[0].content!
  const title = content.substring(0, 100)

  const chat = await database
    .selectFrom('chat')
    .selectAll()
    .where('id', '=', id)
    .where('userId', '=', userId)
    .executeTakeFirst()
  if (chat === undefined) {
    const chat: NewChat = {
      id,
      userId,
      title,
      createdAt: new Date()
    }
    await database.insertInto('chat').values(chat).executeTakeFirstOrThrow()
    return chat
  } else {
    return chat
  }
}

const recordConversation = async (
  chat: NewChat,
  model: GPT_Model,
  question: Message,
  answer: Message
) => {
  await database
    .insertInto('message')
    .values([
      {
        id: question.id,
        chatId: chat.id,
        content: question.content,
        role: Role.User,
        model: model,
        createdAt: new Date()
      },
      {
        id: answer.id,
        chatId: chat.id,
        content: answer.content,
        role: Role.Assistant,
        model: model,
        createdAt: new Date()
      }
    ])
    .execute()
}

export async function POST(req: NextRequest) {
  const session = await auth()

  const openai = createOpenai()

  if (!session?.user) {
    return new Response('Unauthorized', {
      status: 401
    })
  }

  const json = (await req.json()) as ChatBody
  const { id, model, messages, replyId, temperature } = json

  if (!messages || messages.length === 0) {
    return new Response('Empty messages', {
      status: 400
    })
  }

  const userId = session.user.id

  try {
    const res = await openai.createChatCompletion(messages as any, {
      model: model ?? GPT_Model.GPT_3_5_TURBO,
      temperature: temperature ?? TEMPERATURE,
      stream: true
    })
    const stream = OpenAIStream(res, {
      async onCompletion(answer) {
        const question = messages[messages.length - 1]
        const answerMessage = {
          id: replyId,
          content: answer,
          role: Role.Assistant
        }
        const chat = await getOrCreateChat(id, userId, messages)
        await recordConversation(chat, model, question, answerMessage)
      }
    })
    return new StreamingTextResponse(stream)
  } catch (e) {
    if (e instanceof APIError) {
      console.error('[OPENAI CHAT ERROR]', e)
      const status = typeof e.status === 'number' ? e.status : 500
      return new Response(e.message, {
        status
      })
    } else {
      console.error('[OPENAI CHAT ERROR] unknown error', e)
      return new Response('Internal Server Error', {
        status: 500
      })
    }
  }
}
