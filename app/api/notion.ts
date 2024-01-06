import { Client, isFullPage } from '@notionhq/client'
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import { RobotTemplate } from '@/types/api'
import { config } from '@/config/server'

export const createNotion = () => {
  const { NOTION_API_KEY } = config
  return new Client({ auth: NOTION_API_KEY, fetch: fetch })
}

const getJarvisPromptProps = (page: PageObjectResponse) => {
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

// https://www.notion.so/alan66/38762f011a4842a9a28145c466036d5f
const promptDatabaseId = config.NOTION_PROMPT_DATABASE_ID
export const getPromptDatabase = async () => {
  if (!promptDatabaseId) return []

  const notion = createNotion()
  const res = await notion.databases.query({
    database_id: promptDatabaseId,
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
