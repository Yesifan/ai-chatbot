import { createChunkDecoder, FunctionCall } from 'ai'
import React, { useCallback, useRef, useState } from 'react'

import { nanoid } from '../utils'
import { Role } from '../constants'
import { Message } from '@/types/chat'
import {
  UseChatOptions,
  ChatRequest,
  ChatRequestOptions,
  UseChatHelpers
} from '@/types/ai'

const CHAT_URL = '/api/chat'

const getStreamedResponse = async (
  chatRequest: ChatRequest,
  abortControllerRef: React.MutableRefObject<AbortController | null>,
  onStream: (data: string) => void,
  onResponse?: (response: Response) => void | Promise<void>
) => {
  const replyId = nanoid()

  const constructedMessagesPayload = chatRequest.messages.map(
    ({ role, content, name, function_call }) => ({
      role,
      content,
      ...(name !== undefined && { name }),
      ...(function_call !== undefined && {
        function_call: function_call
      })
    })
  )

  const res = await fetch(CHAT_URL, {
    method: 'POST',
    body: JSON.stringify({
      replyId,
      messages: constructedMessagesPayload,
      functions: chatRequest.functions,
      function_call: chatRequest.function_call,
      ...chatRequest.options?.body
    }),
    headers: {
      ...chatRequest.options?.headers
    },
    signal: abortControllerRef?.current?.signal
  }).catch(err => {
    // Restore the previous messages if the request fails.
    throw err
  })

  if (onResponse) {
    await onResponse(res)
  }

  if (!res.ok) {
    // Restore the previous messages if the request fails.
    throw new Error((await res.text()) || 'Failed to fetch the chat response.')
  }

  if (!res.body) {
    throw new Error('The response body is empty.')
  }

  const reader = res.body.getReader()

  const createdAt = new Date()
  const decode = createChunkDecoder(false)

  // TODO-STREAMDATA: Remove this once Strem Data is not experimental
  let streamedResponse = ''
  let responseMessage: Message = {
    id: replyId,
    createdAt,
    content: '',
    role: Role.Assistant
  }

  // TODO-STREAMDATA: Remove this once Strem Data is not experimental
  while (true) {
    // 流式读取，在这里更新回应
    const { done, value } = await reader.read()
    if (done) {
      break
    }
    // Update the chat state with the new message tokens.
    streamedResponse += decode(value)
    onStream(streamedResponse)

    if (streamedResponse.startsWith('{"function_call":')) {
      // While the function call is streaming, it will be a string.
      responseMessage['function_call'] = streamedResponse
    } else {
      responseMessage['content'] = streamedResponse
    }

    // The request has been aborted, stop reading the stream.
    if (abortControllerRef.current === null) {
      reader.cancel()
      break
    }
  }

  if (streamedResponse.startsWith('{"function_call":')) {
    // Once the stream is complete, the function call is parsed into an object.
    const parsedFunctionCall: FunctionCall =
      JSON.parse(streamedResponse).function_call

    responseMessage['function_call'] = parsedFunctionCall
  }

  return responseMessage
}

export function useChat({
  initialMessages,
  initialInput = '',
  body,
  headers,
  onError,
  onResponse
}: UseChatOptions): UseChatHelpers {
  const [streamData, setStreamData] = useState<string>()
  const [messages, setMessages] = useState(initialMessages ?? [])
  const messagesRef = useRef<Message[]>(messages)
  const mutateMessages = useCallback<
    React.Dispatch<React.SetStateAction<Message[]>>
  >(messages => {
    if (typeof messages === 'function') {
      setMessages(prevMessages => {
        const newMessages = messages(prevMessages)
        messagesRef.current = newMessages
        return newMessages
      })
    } else {
      messagesRef.current = messages
      setMessages(messages)
    }
  }, [])

  const [isLoading, setLoading] = useState(false)

  // Abort controller to cancel the current API call.
  const abortControllerRef = useRef<AbortController | null>(null)

  // Actual mutation hook to send messages to the API endpoint and update the
  // chat state.
  const [error, setError] = useState<undefined | Error>()

  const triggerRequest = useCallback(
    async (chatRequest: ChatRequest) => {
      try {
        setLoading(true)
        setError(undefined)

        const abortController = new AbortController()
        abortControllerRef.current = abortController

        chatRequest.options = chatRequest.options ?? {}
        chatRequest.options.body = {
          ...(chatRequest.options.body ?? {}),
          ...(body ?? {})
        }
        chatRequest.options.headers = {
          ...(chatRequest.options.headers ?? {}),
          ...(headers ?? {})
        }
        // await getStreamedResponse(} once Stream Data is not experimental
        const message = await getStreamedResponse(
          chatRequest,
          abortControllerRef,
          setStreamData,
          onResponse
        )

        abortControllerRef.current = null
        mutateMessages(prevMessages => [...prevMessages, message])
        return message
      } catch (err) {
        // Ignore abort errors as they are expected.
        if ((err as any).name === 'AbortError') {
          abortControllerRef.current = null
          return null
        }

        if (onError && err instanceof Error) {
          onError(err)
        }

        setError(err as Error)
      } finally {
        setLoading(false)
        setStreamData(undefined)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const append = useCallback(
    async (
      content: string,
      historyCount = 5,
      { options, functions, function_call }: ChatRequestOptions = {}
    ) => {
      const message = {
        id: nanoid(),
        content,
        role: Role.User
      }
      mutateMessages([...messagesRef.current, message])

      const historyMessages =
        historyCount === -1
          ? messagesRef.current
          : messagesRef.current.slice(-historyCount)

      const chatRequest: ChatRequest = {
        messages: historyMessages,
        options,
        ...(functions !== undefined && { functions }),
        ...(function_call !== undefined && { function_call })
      }

      return triggerRequest(chatRequest)
    },
    [mutateMessages, triggerRequest]
  )

  const pin = useCallback(
    async (id: string) => {
      mutateMessages(messages =>
        messages.map(message => {
          if (message.id === id) {
            message.isPin = true
          }
          return message
        })
      )
    },
    [mutateMessages]
  )

  const reload = useCallback(
    async ({ options, functions, function_call }: ChatRequestOptions = {}) => {
      if (messages.length === 0) return null

      // Remove last assistant message and retry last user message.
      const lastMessage = messages[messages.length - 1]
      const sendMessages =
        lastMessage.role === Role.Assistant ? messages.slice(0, -1) : messages

      const chatRequest: ChatRequest = {
        messages: sendMessages,
        options,
        ...(functions !== undefined && { functions }),
        ...(function_call !== undefined && { function_call })
      }

      return triggerRequest(chatRequest)
    },
    [messages, triggerRequest]
  )

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }, [])

  // Input state and handlers.
  const [input, setInput] = useState(initialInput)

  return {
    messages,
    streamData,
    error,
    pin,
    append,
    reload,
    stop,
    setMessages,
    input,
    setInput,
    isLoading
  }
}
