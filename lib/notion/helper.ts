import { Client, isFullPage } from '@notionhq/client'
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import { config } from '@/config/server'
import { NotionToMarkdown } from 'notion-to-md'

export const createNotion = () => {
  const { NOTION_API_KEY } = config
  return new Client({ auth: NOTION_API_KEY, fetch: fetch })
}

export const notion2Markdown = async (id: string) => {
  const notion = createNotion()
  const n2m = new NotionToMarkdown({
    notionClient: notion,
    config: { parseChildPages: false }
  })
  const mdblocks = await n2m.pageToMarkdown(id)
  const mdString = n2m.toMarkdownString(mdblocks)

  return mdString.parent
}

export const getJarvisPromptDatabase = async (cursor?: string) => {
  const notion = createNotion()

  const promptDatabaseId = config.NOTION_PROMPT_DATABASE_ID
  if (!promptDatabaseId) return undefined
  return await notion.databases.query({
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
}

export const isJarvisPromptPage = async (id: string) => {
  const notion = createNotion()
  const page = await notion.pages.retrieve({ page_id: id })
  if (
    isFullPage(page) &&
    page.parent.type === 'database_id' &&
    page.parent.database_id === config.NOTION_PROMPT_DATABASE_ID
  ) {
    return true
  } else {
    return false
  }
}

export const getJarvisPromptProps = (page: PageObjectResponse) => {
  const props = page.properties
  const icon =
    page.icon?.type === 'emoji'
      ? page.icon.emoji
      : page.icon?.type === 'external'
      ? page.icon.external.url
      : undefined
  const cover =
    page.cover?.type === 'external' ? page.cover.external.url : undefined

  const published =
    props.published?.type === 'checkbox' ? props.published.checkbox : true

  const name =
    props.name?.type === 'title' ? props.name.title?.[0]?.plain_text : ''

  const description =
    props.description?.type === 'rich_text'
      ? props.description?.rich_text?.[0]?.plain_text
      : ''

  const input_template =
    props.input_template?.type === 'rich_text'
      ? props.input_template?.rich_text?.[0]?.plain_text
      : ''

  const tags =
    props.tags?.type === 'multi_select'
      ? (props.tags.multi_select as any as { name: string }[]).map(
          item => item.name
        )
      : []

  const createdAt = new Date(page.created_time)
  const lastEditedAt = new Date(page.last_edited_time)

  return {
    icon,
    cover,
    name,
    description,
    input_template,
    tags,
    createdAt,
    lastEditedAt,
    published
  }
}

export const getJarvisMessageTags = async () => {
  const notion = createNotion()

  const messageDatabaseId = config.NOTION_MESSAGES_DATABASE_ID
  if (!messageDatabaseId) return undefined
  const response = await notion.databases.retrieve({
    database_id: messageDatabaseId
  })

  if (response.properties.tags.type === 'multi_select') {
    return response.properties.tags.multi_select.options
  } else {
    return []
  }
}
