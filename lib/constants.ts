export const enum Credential {
  AccessToken = 'access-token'
}

export const enum GPT_Model {
  GPT_4 = 'gpt-4',
  GPT_4_32K = 'gpt-4-32k',
  GPT_3_5_TURBO = 'gpt-3.5-turbo',
  GPT_3_5_TURBO_16K = 'gpt-3.5-turbo-16k'
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
  Unauthorized = 'Unauthorized'
}
