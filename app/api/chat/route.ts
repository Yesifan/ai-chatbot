import {
  OpenAIApi,
  Configuration,
  ChatCompletionRequestMessage
} from 'openai-edge'
import { OpenAIStream, StreamingTextResponse } from 'ai'

import { auth } from '@/auth'
import { nanoid } from '@/lib/utils'
import { NextRequest } from 'next/server'
import { Chat, Message } from '@/lib/types'

export const runtime = 'edge'

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
  basePath: process.env.OPENAI_BASEPATH
})

console.debug('[OPENAI BASEPATH]', config.basePath)

const openai = new OpenAIApi(config)

export interface ChatBody extends Chat {
  messages: Message[]
}

export async function POST(req: NextRequest) {
  const session = await auth()

  if (!session) {
    return new Response('Unauthorized', {
      status: 401
    })
  }

  const json = (await req.json()) as ChatBody
  const { messages } = json

  const chatMessages = messages.filter(
    item => item.role !== 'helper'
  ) as ChatCompletionRequestMessage[]

  if (chatMessages.length === 0) {
    return new Response('Empty', {
      status: 400
    })
  }

  try {
    const res = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: chatMessages,
      temperature: 0.7,
      stream: true
    })
    const stream = OpenAIStream(res, {
      async onCompletion(completion) {
        const content = chatMessages[0].content ?? 'Robot Chat'
        const title = content.substring(0, 100)
        console.log(`[Assistant][${title}] ${completion}`)
      }
    })
    return new StreamingTextResponse(stream)
  } catch (e: any) {
    console.error('[CHAT API ERROR]', e)
    return new Response('Error', {
      status: 500
    })
  }
}
