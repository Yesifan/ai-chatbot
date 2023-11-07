import OpenAI from 'openai'
import { config } from '@/config/server'
import { OpenAIChatStreamPayload } from '@/types/openai'
import { ChatCompletionMessageParam } from 'openai/resources'

interface MessageParam extends ChatCompletionMessageParam {
  id: string
}

declare module 'openai' {
  interface OpenAI {
    createChatCompletion: (
      messages: MessageParam[],
      payload: OpenAIChatStreamPayload
    ) => Promise<any>
  }
}

// 创建 OpenAI 实例
export const createOpenai = (userApiKey?: string, endpoint?: string) => {
  const { OPENAI_API_KEY, OPENAI_BASEPATH } = config

  const baseURL = endpoint ?? OPENAI_BASEPATH ?? undefined

  const apiKey = !userApiKey ? OPENAI_API_KEY : userApiKey

  if (!apiKey) throw new Error('OPENAI_API_KEY is empty')

  const openai = new OpenAI({ apiKey, baseURL })

  console.debug('[OPENAI BASEPATH]', openai.baseURL)

  openai.completions.create
  openai.createChatCompletion = (
    messages: MessageParam[],
    payload: OpenAIChatStreamPayload
  ) => createChatCompletion(openai, messages, payload)

  return openai
}

export const createChatCompletion = async (
  openai: OpenAI,
  messages: MessageParam[],
  payload: OpenAIChatStreamPayload
) => {
  const { ...params } = payload

  // ============  2. send api   ============ //

  return await openai.chat.completions.create(
    {
      messages,
      ...params,
      stream: true
    },
    { headers: { Accept: '*/*' } }
  )
}
