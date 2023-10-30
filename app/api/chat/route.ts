import {
  OpenAIApi,
  Configuration,
  ChatCompletionRequestMessage
} from 'openai-edge'
import { OpenAIStream, StreamingTextResponse } from 'ai'

import { auth } from '@/auth'
import { NextRequest } from 'next/server'
import database from '@/lib/database'
import { GPT_MODEL, NewChat, NewMessage } from '@/lib/types'

export const runtime = 'edge'

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
  basePath: process.env.OPENAI_BASEPATH
})

console.debug('[OPENAI BASEPATH]', config.basePath)

const openai = new OpenAIApi(config)

export interface ChatBody {
  id: string
  model: GPT_MODEL
  messages: ChatCompletionRequestMessage[]
}

const getOrCreateChat = async (
  id: string,
  userId: string,
  title: string
): Promise<NewChat> => {
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
  question: string,
  answer: string
) => {
  await database
    .insertInto('message')
    .values([
      {
        chatId: chat.id,
        content: question,
        role: 'user',
        createdAt: new Date()
      },
      {
        chatId: chat.id,
        content: answer,
        role: 'assistant',
        createdAt: new Date()
      }
    ])
    .execute()
}

export async function POST(req: NextRequest) {
  const session = await auth()

  if (!session.user) {
    return new Response('Unauthorized', {
      status: 401
    })
  }

  const json = (await req.json()) as ChatBody
  const { id, model, messages } = json
  const userId = session.user.id

  const content = messages[0].content ?? 'Robot Chat'
  const title = content.substring(0, 100)

  const chat = await getOrCreateChat(id, userId, title)

  try {
    const question: NewMessage = {
      chatId: chat.id,
      content: messages[messages.length - 1].content!,
      role: 'user',
      createdAt: new Date()
    }
    const res = await openai.createChatCompletion({
      model: model ?? GPT_MODEL.GPT_3_5_TURBO,
      messages: messages,
      temperature: 0.7,
      stream: true
    })
    const stream = OpenAIStream(res, {
      async onCompletion(answer) {
        const question = messages[messages.length - 1].content!
        await recordConversation(chat, question, answer)
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
