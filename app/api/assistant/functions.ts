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
export const set_tiltle_tags = ({
  title,
  tags
}: {
  title: string
  tags: string[]
}) => {
  console.log('saveKnowledge', title, tags)
}
