import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'

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
