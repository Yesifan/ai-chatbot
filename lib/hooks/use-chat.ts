import { createChunkDecoder, FunctionCall } from 'ai'
import React, { useCallback, useRef, useState } from 'react'

import { nanoid } from '../utils'
import {
  ATTACHED_MESSAGES_COUNT,
  INFINITE_ATTACHED_MESSAGES_COUNT,
  Role
} from '../constants'
import type { Message } from '@/types/database'
import {
  UseChatOptions,
  ChatRequest,
  ChatRequestOptions,
  UseChatHelpers
} from '@/types/ai'
import { useChatStore } from '../store/chat'
import { favoriteMessage, removeMessage } from '@/app/actions/message'

const CHAT_URL = '/api/chat'

const getStreamedResponse = async (
  chatRequest: ChatRequest,
  abortControllerRef: React.MutableRefObject<AbortController | null>,
  onStream: (data: string) => void,
  onResponse?: (response: Response) => void | Promise<void>
) => {
  const replyId = nanoid(8)
  const questionId = chatRequest.messages[chatRequest.messages.length - 1].id

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
      questionId,
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
  const chatStore = useChatStore()

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
          id: chatStore.id,
          model: chatStore.model,
          temperature: chatStore.temperature,
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
    [
      body,
      chatStore.id,
      chatStore.model,
      chatStore.temperature,
      headers,
      mutateMessages,
      onError,
      onResponse
    ]
  )

  const append = useCallback(
    (
      content: string,
      messagesCount = chatStore.attachedMessagesCount ??
        ATTACHED_MESSAGES_COUNT,
      pinPrompt: Message[] = [],
      { options, functions, function_call }: ChatRequestOptions = {}
    ) => {
      const message = {
        id: nanoid(8),
        content,
        role: Role.User,
        createdAt: new Date()
      }
      mutateMessages([...messagesRef.current, message])

      const historyMessages =
        messagesCount === INFINITE_ATTACHED_MESSAGES_COUNT
          ? messagesRef.current
          : messagesRef.current.slice(-(messagesCount + 1))

      const chatRequest: ChatRequest = {
        messages: [...pinPrompt, ...historyMessages],
        options,
        ...(functions !== undefined && { functions }),
        ...(function_call !== undefined && { function_call })
      }

      return triggerRequest(chatRequest)
    },
    [chatStore.attachedMessagesCount, mutateMessages, triggerRequest]
  )

  const reload = useCallback(
    async (
      id: string,
      messagesCount = chatStore.attachedMessagesCount ??
        ATTACHED_MESSAGES_COUNT,
      { options, functions, function_call }: ChatRequestOptions = {}
    ) => {
      if (messages.length === 0) return null

      // Remove last assistant message and retry last user message.
      const messageIndex = messages.findIndex(message => message.id === id)
      if (messageIndex === -1) {
        throw new Error('The message is not found.')
      }
      if (messages[messageIndex]?.role === Role.Assistant) {
        throw new Error('The message is not user message.')
      }
      options = options ?? {}
      options.body = {
        isReload: true,
        ...(options.body ?? {})
      }
      const historyMessages = messages.slice(0, messageIndex + 1)
      const sendMessages =
        messagesCount === INFINITE_ATTACHED_MESSAGES_COUNT
          ? historyMessages
          : historyMessages.slice(-(messagesCount + 1))

      const chatRequest: ChatRequest = {
        messages: sendMessages,
        options,
        ...(functions !== undefined && { functions }),
        ...(function_call !== undefined && { function_call })
      }
      return triggerRequest(chatRequest)
    },
    [chatStore.attachedMessagesCount, messages, triggerRequest]
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

  const favor = useCallback(
    async (id: string, isFavourite?: boolean) => {
      const isFavoriteTarget =
        isFavourite ?? !messages.find(message => message.id === id)?.isFavourite
      await favoriteMessage(id, isFavoriteTarget)
      mutateMessages(messages => {
        return messages.map(message => {
          if (message.id === id) {
            message.isFavourite = isFavoriteTarget
          }
          return message
        })
      })
      return true
    },
    [messages, mutateMessages]
  )

  const remove = useCallback(
    async (id: string) => {
      const res = await removeMessage(id)
      if (res.ok !== true) {
        return false
      }
      mutateMessages(messages => messages.filter(message => message.id !== id))
      return true
    },
    [mutateMessages]
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
    favor,
    append,
    reload,
    remove,
    stop,
    setMessages,
    input,
    setInput,
    isLoading,
    setLoading
  }
}
