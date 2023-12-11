import { useRef, type RefObject } from 'react'
import { getPlatform } from '../utils/responsive.clint'

export function useMateEnterSubmit(isNeedHelper = true): {
  formRef: RefObject<HTMLFormElement>
  onKeyDown: (
    event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => void
} {
  const platform = getPlatform()
  const formRef = useRef<HTMLFormElement>(null)
  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>
  ): void => {
    const isHelperDown = platform === 'Mac OS' ? event.metaKey : event.ctrlKey

    if (event.key === 'Enter') {
      if ((isHelperDown && !event.nativeEvent.isComposing) || !isNeedHelper) {
        event.preventDefault()
        formRef.current?.requestSubmit()
      }
    }
  }

  return { formRef, onKeyDown: handleKeyDown }
}

export function useEnterSubmit(): {
  submitRef: RefObject<HTMLButtonElement>
  cancelRef: RefObject<HTMLButtonElement>
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void
} {
  const submitRef = useRef<HTMLButtonElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ): void => {
    if (!event.shiftKey && !event.nativeEvent.isComposing) {
      if (event.key === 'Enter') {
        submitRef.current?.click()
        event.preventDefault()
      } else if (event.key === 'Escape') {
        cancelRef.current?.click()
        event.preventDefault()
      }
    }
  }

  return { submitRef, cancelRef, onKeyDown: handleKeyDown }
}
