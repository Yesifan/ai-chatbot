'use client'

import * as React from 'react'

export interface useDelayStatusProps {
  timeout?: number
}

export function useDelayStatus({ timeout = 2000 }: useDelayStatusProps):[boolean, () => void] {
  const [isPicked, setPicked] = React.useState(false)

  const pick = () => {
    setPicked(true)

    setTimeout(() => {
      setPicked(false)
    }, timeout)
  }

  return [isPicked, pick]
}
