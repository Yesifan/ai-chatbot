import React from 'react'

import { encodeAsync } from '@/lib/utils/tokenizer'

export const useTokenCount = (input: string = '') => {
  const [value, setNum] = React.useState(0)

  React.useEffect(() => {
    React.startTransition(() => {
      encodeAsync(input)
        .then(setNum)
        .catch(() => {
          // 兜底采用字符数
          setNum(input.length)
        })
    })
  }, [input])

  return value
}
