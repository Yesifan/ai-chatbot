import { OpenAIApi, Configuration } from 'openai-edge'
import { OpenAIStream, StreamingTextResponse } from 'ai'

import { auth } from '@/auth'
import { nanoid } from '@/lib/utils'

export const runtime = 'edge'

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
  basePath: process.env.OPENAI_BASEPATH
})

const openai = new OpenAIApi(config)

export async function POST(req: Request) {
  const json = await req.json()
  const { messages } = json
  const session = await auth()

  console.debug('[CHAT API SESSION]', session)

  console.debug('[OPENAI BASEPATH]', config.basePath)

  if (!session) {
    return new Response('Unauthorized', {
      status: 401
    })
  }
  try {
    const res = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.7,
      stream: true
    })
    const stream = OpenAIStream(res, {
      async onCompletion(completion) {
        const title = json.messages[0].content.substring(0, 100)
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
