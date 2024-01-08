import { Client, isFullPage } from '@notionhq/client'
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import { RobotTemplate } from '@/types/api'
import { config } from '@/config/server'
import { getJarvisPromptProps } from './helper'
import { NotionToMarkdown } from 'notion-to-md'

export const createNotion = () => {
  const { NOTION_API_KEY } = config
  return new Client({ auth: NOTION_API_KEY, fetch: fetch })
}

// https://www.notion.so/alan66/38762f011a4842a9a28145c466036d5f
const promptDatabaseId = config.NOTION_PROMPT_DATABASE_ID
export const getPromptDatabase = async (cursor?: string) => {
  if (!promptDatabaseId) return []

  const notion = createNotion()
  const res = await notion.databases.query({
    archived: false,
    database_id: promptDatabaseId,
    start_cursor: cursor,
    page_size: 20,
    filter: {
      property: 'published',
      checkbox: {
        equals: true
      }
    },
    sorts: [
      {
        timestamp: 'created_time',
        direction: 'descending'
      }
    ]
  })

  return res.results
    .filter(page => isFullPage(page))
    .map(page => {
      const props = getJarvisPromptProps(page as PageObjectResponse)
      return {
        id: page.id,
        ...props
      }
    }) as RobotTemplate[]
}

export const getPageMarkdown = async (id: string) => {
  const notion = createNotion()
  const page = await notion.pages.retrieve({ page_id: id })
  if (
    isFullPage(page) &&
    page.parent.type === 'database_id' &&
    page.parent.database_id === promptDatabaseId
  ) {
    const n2m = new NotionToMarkdown({
      notionClient: notion,
      config: { parseChildPages: false }
    })
    const mdblocks = await n2m.pageToMarkdown(id)
    const mdString = n2m.toMarkdownString(mdblocks)

    return mdString.parent
  } else {
    return 'This page does not belong to Robot Template!'
  }
}
