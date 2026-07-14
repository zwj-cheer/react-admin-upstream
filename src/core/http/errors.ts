export type HttpErrorKind =
  | 'network'
  | 'timeout'
  | 'unauthorized'
  | 'forbidden'
  | 'validation'
  | 'conflict'
  | 'server'
  | 'invalid-response'

export class HttpError extends Error {
  constructor(
    readonly kind: HttpErrorKind,
    readonly status?: number,
    readonly details?: unknown,
  ) {
    super(kind)
    this.name = 'HttpError'
  }
}
