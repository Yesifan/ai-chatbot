import { APIError } from 'openai'
import { OpenAIStream, StreamingTextResponse } from 'ai'

import { auth } from '@/auth'
import { NextRequest } from 'next/server'
import { ErrorCode, GPT_Model, TEMPERATURE } from '@/lib/constants'
import { createOpenai } from './openai'
import { getChat, recordConversation } from './database'
import { ChatBody } from '@/types/api'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  const session = await auth()

  if (!session?.user) {
    return new Response('Unauthorized', {
      status: 401
    })
  }
  const now = new Date()
  const openai = createOpenai()
  const chatJson = (await req.json()) as ChatBody
  const { id, model, messages, temperature } = chatJson

  if (!messages || messages.length === 0) {
    return new Response(ErrorCode.BadRequest, {
      status: 400
    })
  }

  const userId = session.user.id
  const chat = await getChat(id, userId)

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
        recordConversation(answer, now, chatJson)
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
