import { isFullPage } from '@notionhq/client'
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import type { RobotTemplate } from '@/types/api'
import {
  notion2Markdown,
  isJarvisPromptPage,
  getJarvisPromptProps,
  getJarvisPromptDatabase
} from './helper'

export const getPromptDatabase = async (cursor?: string) => {
  const res = await getJarvisPromptDatabase(cursor)

  return res?.results
    .filter(page => isFullPage(page))
    .map(page => {
      const props = getJarvisPromptProps(page as PageObjectResponse)
      return {
        id: page.id,
        ...props
      }
    }) as RobotTemplate[]
}

export const getPromptMarkdown = async (id: string) => {
  const isPrompt = await isJarvisPromptPage(id)
  if (isPrompt) {
    return notion2Markdown(id)
  } else {
    return 'This page does not belong to Robot Template!'
  }
}
