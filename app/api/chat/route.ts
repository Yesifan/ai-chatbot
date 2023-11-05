import { OpenAIStream, StreamingTextResponse } from 'ai'

import { auth } from '@/auth'
import { NextRequest } from 'next/server'
import database from '@/lib/database'
import { NewChat } from '@/types/chat'
import { GPT_Model, Role } from '@/lib/constants'
import { createOpenai } from './openai'
import { nanoid } from '@/lib/utils'
import { ChatCompletionMessageParam } from 'openai/resources'

export const runtime = 'edge'

export interface ChatBody {
  id: string
  model: GPT_Model
  messages: ChatCompletionMessageParam[]
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
        id: nanoid(),
        chatId: chat.id,
        content: question,
        role: Role.User,
        createdAt: new Date()
      },
      {
        id: nanoid(),
        chatId: chat.id,
        content: answer,
        role: Role.Assistant,
        createdAt: new Date()
      }
    ])
    .execute()
}

export async function POST(req: NextRequest) {
  const session = await auth()

  const openai = createOpenai()

  if (!session.user) {
    return new Response('Unauthorized', {
      status: 401
    })
  }

  const json = (await req.json()) as ChatBody
  const { id, model, messages } = json

  if (!messages || messages.length === 0) {
    return new Response('Empty messages', {
      status: 400
    })
  }

  const userId = session.user.id

  const content = messages[0].content!
  const title = content.substring(0, 100)

  const chat = await getOrCreateChat(id, userId, title)

  try {
    const res = await openai.createChatCompletion(messages, {
      model: model ?? GPT_Model.GPT_3_5_TURBO,
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
    return new Response('Error', {
      status: 500
    })
  }
}
