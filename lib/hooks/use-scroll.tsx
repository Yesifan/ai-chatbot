import * as React from 'react'

export interface ScrollContextProps {
  fromBottm: number
  target?: HTMLDivElement
  scrollToBottom?: (offset?: number, behavior?: ScrollBehavior) => void
}

const ScrollContext = React.createContext<ScrollContextProps>({
  fromBottm: Infinity
})

export const ScrollProvider = ({
  children,
  ...props
}: React.ComponentProps<'div'>) => {
  const ref = React.useRef<HTMLDivElement>(null)
  const [fromBottm, setFromBottm] = React.useState(Infinity)

  const scrollToBottom = React.useCallback(
    (offset = 0, behavior: ScrollBehavior = 'smooth') => {
      const target = ref.current
      if (!target) return
      target.scrollTo({ top: target.scrollHeight - offset, behavior })
    },
    []
  )

  const value = React.useMemo(
    () => ({
      target: ref?.current ?? undefined,
      fromBottm,
      scrollToBottom
    }),
    [ref, fromBottm, scrollToBottom]
  )

  React.useEffect(() => {
    const target = ref.current
    if (!target) return

    const handleScroll = () => {
      setFromBottm(target.scrollHeight - target.scrollTop - target.clientHeight)
    }

    target.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => {
      target.removeEventListener('scroll', handleScroll)
    }
  }, [ref])

  return (
    <ScrollContext.Provider value={value}>
      <div {...props} ref={ref}>
        {children}
      </div>
    </ScrollContext.Provider>
  )
}

export const useScroll = () => {
  return React.useContext(ScrollContext)
}

export function useAtBottom(offset = 15) {
  const context = React.useContext(ScrollContext)
  return context.fromBottm <= offset
}
