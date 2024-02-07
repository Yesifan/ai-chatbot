import type { RequiredActionFunctionToolCall } from 'openai/resources/beta/threads/runs/runs'
import * as AssistantFunctions from './functions'

export const functionCallAction = (
  threadId: string,
  toolCalls: RequiredActionFunctionToolCall[]
) => {
  return toolCalls.map(({ id, function: func }) => {
    const callFunction = (AssistantFunctions as Record<string, Function>)[
      func.name
    ]
    if (callFunction) {
      console.debug('[functionCallAction] Toggy', func.name)
      try {
        const args = JSON.parse(func.arguments)
        const output = callFunction(threadId, args)
        console.debug('[functionCallAction] assistant function call', output)
        return {
          tool_call_id: id,
          output: 'success'
        }
      } catch (e) {
        console.error('[functionCallAction] assistant function call error', e)
        return {
          tool_call_id: id,
          output: 'error'
        }
      }
    } else {
      console.error(
        '[functionCallAction] assistant function not found',
        func.name
      )
      return {
        tool_call_id: id,
        output: 'function not found'
      }
    }
  })
}
