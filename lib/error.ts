export const enum ActionErrorCode {
  NotFound = 'NotFound',
  Unauthorized = 'Unauthorized',
  BadRequest = 'BadRequest',
  InternetError = 'InternetError',
  InternalServerError = 'InternalServerError'
}

/**
 * Base error class for all Auth.js errors.
 * It's optimized to be printed in the server logs in a nicely formatted way
 * via the [`logger.error`](https://authjs.dev/reference/core#logger) option.
 */
export class AuthError extends Error {
  statue: number

  constructor(message?: string | Error, status?: number) {
    if (message instanceof Error) {
      super(message.message, {
        cause: {
          cause: { err: message, ...(message.cause as any) }
        }
      })
    } else if (typeof message === 'string') {
      super(message)
    } else {
      super(undefined, message)
    }
    this.statue = status ?? 500

    Error.captureStackTrace?.(this, this.constructor)
  }
}
