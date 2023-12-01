import { experimental_StreamingReactResponse, FunctionCall } from 'ai'
import { Message } from './database'

export type RequestOptions = {
  headers?: Record<string, string> | Headers
  body?: object
}

export type ChatRequest = {
  messages: Message[]
  options?: RequestOptions
  functions?: Array<Function>
  function_call?: FunctionCall
}

export type ChatRequestOptions = {
  options?: RequestOptions
  functions?: Array<Function>
  function_call?: FunctionCall
}

export type UseChatOptions = {
  /**
   * Initial messages of the chat. Useful to load an existing chat history.
   */
  initialMessages?: Message[]
  /**
   * Initial input of the chat.
   */
  initialInput?: string
  /**
   * Callback function to be called when the API response is received.
   */
  // TODO: 添加输入模版
  onResponse?: (response: Response) => void | Promise<void>
  /**
   * Callback function to be called when an error is encountered.
   */
  onError?: (error: Error) => void
  /**
   * HTTP headers to be sent with the API request.
   */
  headers?: Record<string, string> | Headers
  /**
   * Extra body object to be sent with the API request.
   * @example
   * Send a `sessionId` to the API along with the messages.
   * ```js
   * useChat({
   *   body: {
   *     sessionId: '123',
   *   }
   * })
   * ```
   */
  body?: object
}

export type UseChatHelpers = {
  /** Current messages in the chat */
  messages: Message[]
  /**
   * Update the `messages` state locally. This is useful when you want to
   * edit the messages on the client, and then trigger the `reload` method
   * manually to regenerate the AI response.
   */
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  pin: (id: string) => void
  /**
   * Append a user message to the chat list. This triggers the API call to fetch
   * the assistant's response.
   * @param message The message to append
   * @param options Additional options to pass to the API call
   */
  append: (
    content: string,
    historyCount?: number,
    pinPrompt?: Message[],
    chatRequestOptions?: ChatRequestOptions
  ) => Promise<Message | null | undefined>
  /**
   * Reload the last AI chat response for the given chat history. If the last
   * message isn't from the assistant, it will request the API to generate a
   * new response.
   */
  reload: (
    id: string,
    historyCount?: number,
    chatRequestOptions?: ChatRequestOptions
  ) => Promise<Message | null | undefined>
  remove: (id: string) => Message[] | null | undefined
  /**
   * Abort the current request immediately, keep the generated tokens if any.
   */
  stop: () => void

  /** The current value of the input */
  input: string
  /** setState-powered method to update the input value */
  setInput: React.Dispatch<React.SetStateAction<string>>
  /** Whether the API request is in progress */
  isLoading: boolean
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
  /** Additional data added on the server via StreamData */
  streamData?: any
  /** The error object of the API request */
  error: undefined | Error
}

export type StreamingReactResponseAction = (payload: {
  messages: Message[]
}) => Promise<experimental_StreamingReactResponse>
