import type { RequiredActionFunctionToolCall } from 'openai/resources/beta/threads/runs/runs'
import * as AssistantFunctions from './functions'

export const functionCallAction = (
  toolCalls: RequiredActionFunctionToolCall[]
) => {
  return toolCalls.map(({ id, function: func }) => {
    const callFunction = (AssistantFunctions as Record<string, Function>)[
      func.name
    ]
    if (callFunction) {
      try {
        const args = JSON.parse(func.arguments)
        const output = callFunction(args)
        console.debug('assistant function call', output)
        return {
          tool_call_id: id,
          output: 'success'
        }
      } catch (e) {
        console.error('assistant function call error', e)
        return {
          tool_call_id: id,
          output: 'error'
        }
      }
    } else {
      console.error('assistant function not found', func.name)
      return {
        tool_call_id: id,
        output: 'function not found'
      }
    }
  })
}
