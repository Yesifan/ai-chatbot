import database from '@/lib/database'
import { createOpenai } from '../../chat/openai'
import { functionCallAction } from '../helper'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

/**
 * process thread.
 * Trigger with corn job every 10 minutes.
 *
 * Corn job server is running on [upstash](https://console.upstash.com/)
 */
const getQueueThreads = () => {
  return database
    .selectFrom('thread')
    .selectAll()
    .where('status', 'in', ['queued', 'in_progress', 'requires_action'])
    .execute()
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', {
      status: 401
    })
  }
  try {
    const threads = await getQueueThreads()
    if (threads.length === 0) {
      return new Response('empty', {
        status: 200
      })
    }

    const openai = createOpenai()
    for (let thread of threads) {
      const run = await openai.beta.threads.runs.retrieve(
        thread.id,
        thread.runId
      )

      if (run.status === 'requires_action' && run.required_action) {
        const tool_outputs = functionCallAction(
          thread.id,
          run.required_action.submit_tool_outputs.tool_calls
        )
        const actionRun = await openai.beta.threads.runs.submitToolOutputs(
          thread.id,
          thread.runId,
          {
            tool_outputs: tool_outputs
          }
        )
        database
          .updateTable('thread')
          .set({ status: actionRun.status, lastProcessAt: new Date() })
          .where('id', '=', thread.id)
          .execute()
      } else {
        database
          .updateTable('thread')
          .set({ status: run.status, lastProcessAt: new Date() })
          .where('id', '=', thread.id)
          .execute()
        console.log(
          `[ASSISTANT] [THREAD] ${thread.id} update status ${run.status}`
        )
      }
    }

    return new Response('success', {
      status: 200
    })
  } catch (e) {
    return new Response('error', {
      status: 500
    })
  }
}
