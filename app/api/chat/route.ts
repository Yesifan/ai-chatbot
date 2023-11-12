import { APIError } from 'openai'
import { OpenAIStream, StreamingTextResponse } from 'ai'

import { auth } from '@/auth'
import { NextRequest } from 'next/server'
import database from '@/lib/database'
import { Message, NewChat } from '@/types/chat'
import { ErrorCode, GPT_Model, Role, TEMPERATURE } from '@/lib/constants'
import { createOpenai } from './openai'
import { getOrCreateChat } from '@/app/actions'

export const runtime = 'edge'

export interface ChatBody {
  id: string
  model: GPT_Model
  messages: Message[]
  replyId: string
  temperature: number
}

const recordConversation = async (
  chat: NewChat,
  model: GPT_Model,
  question: Message,
  answer: Message
) => {
  const now = new Date()
  await database
    .updateTable('chat')
    .set({
      lastMessage: question.content,
      lastMessageAt: now
    })
    .where('chat.id', '=', chat.id)
    .executeTakeFirstOrThrow()

  return await database
    .insertInto('message')
    .values([
      {
        id: question.id,
        chatId: chat.id,
        content: question.content,
        role: Role.User,
        model: model,
        createdAt: now
      },
      {
        id: answer.id,
        chatId: chat.id,
        content: answer.content,
        role: Role.Assistant,
        model: model,
        createdAt: now
      }
    ])
    .executeTakeFirstOrThrow()
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
    return new Response(ErrorCode.BadRequest, {
      status: 400
    })
  }

  const userId = session.user.id
  const chat = await getOrCreateChat(id, userId, messages)

  if (!chat) {
    return new Response(ErrorCode.BadRequest, {
      status: 400
    })
  }

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
