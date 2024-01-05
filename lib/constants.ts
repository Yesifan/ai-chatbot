export const INBOX_PATH = 'inbox'
export const TOKEN_COOKIE_KEY = 'jarvis.token'

export const JARVIS = 'Jarvis'
export const INBOX_CHAT = 'Small Talk'
export const DEFAULT_CHAT_NAME = 'New Chat'
export const DEFAULT_ROBOT_NAME = 'New Ai Assistant'

// [openai chat docs](https://platform.openai.com/docs/api-reference/chat)
/**
 * What sampling [temperature](https://platform.openai.com/docs/api-reference/chat/create#chat-create-temperature) to use, between 0 and 2. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic.
 * We generally recommend altering this or top_p but not both.
 */
export const TEMPERATURE = 0.9
export const ATTACHED_MESSAGES_COUNT = 6
export const INFINITE_ATTACHED_MESSAGES_COUNT = 31

// [openai models](https://platform.openai.com/docs/models/gpt-4-and-gpt-4-turbo)
/**
 * ID of the model to use. See the [model endpoint](https://platform.openai.com/docs/models/model-endpoint-compatibility)
 * compatibility table for details on which models work with the Chat API.
 */
export const enum GPT_Model {
  GPT_4 = 'gpt-4',
  GPT_4_PREVIEW = 'gpt-4-1106-preview',
  GPT_3_5_TURBO = 'gpt-3.5-turbo'
}

export const enum Role {
  User = 'user',
  System = 'system',
  Function = 'function',
  Assistant = 'assistant'
}

export const enum Theme {
  Light = 'light',
  Dark = 'dark',
  System = 'system'
}

export const enum ErrorCode {
  NotFound = 'NotFound',
  Unauthorized = 'Unauthorized',
  BadRequest = 'BadRequest',
  InternetError = 'InternetError',
  InternalServerError = 'InternalServerError'
}

// COMMAND:SYSTEM_MESSAGE_KEY:BODY
export const SYSTEM_MESSAGE_COMMAND = 'SYSTEM_MESSAGE_COMMAND'
export const enum SystemMessageKey {
  Logging = 'Logging',
  Error = 'Error',
  Warning = 'Warning'
}
