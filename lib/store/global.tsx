'use client'

import { createContext, useContext, useMemo, useState } from 'react'
import type { Dispatch, PropsWithChildren, SetStateAction } from 'react'

export interface GlobalStore {
  isChatSidebar: boolean
  setShowChatSidebar: Dispatch<SetStateAction<boolean>>
}

const GlobalStoreContext = createContext<GlobalStore | undefined>(undefined)

type GlobalProviderProps = Partial<Pick<GlobalStore, 'isChatSidebar'>> &
  PropsWithChildren

export const GlobalStoreProvider = ({
  children,
  ...props
}: GlobalProviderProps) => {
  const [isChatSidebar, setShowChatSidebar] = useState(
    props.isChatSidebar ?? false
  )

  const store = useMemo<GlobalStore>(() => {
    return {
      isChatSidebar: isChatSidebar,
      setShowChatSidebar: setShowChatSidebar
    }
  }, [isChatSidebar])

  return (
    <GlobalStoreContext.Provider value={store}>
      {children}
    </GlobalStoreContext.Provider>
  )
}

export const useGlobalStore = () => {
  const store = useContext(GlobalStoreContext)
  if (!store) {
    throw new Error('useGlobalStore must be used within a GlobalStoreProvider')
  }
  return store
}
