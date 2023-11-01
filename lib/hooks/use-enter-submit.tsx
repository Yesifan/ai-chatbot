import { UseChatHelpers } from 'ai/react/dist'
import { useRef, type RefObject } from 'react'
import { Platform, getPlatform } from '../utils'

const platform = getPlatform()

export function useEnterSubmit(setInput?: UseChatHelpers['setInput']): {
  formRef: RefObject<HTMLFormElement>
  onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void
} {
  const formRef = useRef<HTMLFormElement>(null)

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ): void => {
    const isHelperDown =
      platform === Platform.Mac ? event.metaKey : event.ctrlKey

    if (event.key === 'Enter') {
      if (!isHelperDown) {
        event.preventDefault()
        setInput?.(event => event + '\n')
      } else if (!event.nativeEvent.isComposing) {
        event.preventDefault()
        formRef.current?.requestSubmit()
      }
    }
  }

  return { formRef, onKeyDown: handleKeyDown }
}
