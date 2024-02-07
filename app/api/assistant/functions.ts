/**
 * Assistants Function
 * https://platform.openai.com/assistants
 */
// {
//   "name": "set_tiltle_tags",
//   "parameters": {
//     "type": "object",
//     "properties": {
//       "title": {
//         "type": "string",
//         "description": "title, less than 10 words"
//       },
//       "tags": {
//         "type": "array",
//         "description": "knowledge tag",
//         "items": {
//           "type": "string"
//         }
//       }
//     },
//     "required": [
//       "title",
//       "tags"
//     ]
//   },
//   "description": "Set title and tag for knowledge"
// }

import database from '@/lib/database'
export const set_tiltle_tags = async (
  threadId: string,
  {
    title,
    tags
  }: {
    title: string
    tags: string[]
  }
) => {
  const thread = await database
    .selectFrom('thread')
    .selectAll()
    .where('id', '=', threadId)
    .executeTakeFirstOrThrow()
  if (thread.messageId) {
    const res = database
      .updateTable('message')
      .set({
        title: title,
        tags: JSON.stringify(tags)
      })
      .where('id', '=', thread.messageId)
      .executeTakeFirstOrThrow()
    console.log('[set_tiltle_tags] update database', res)
  }
}
