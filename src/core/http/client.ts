import type { AuthSource } from '@/core/services/contracts'
import { getTransportAuthSource } from './authTransport'
import { HttpError } from './errors'
import { emitUnauthorized } from './unauthorized'

export interface HttpClientOptions {
  baseUrl: string
  timeoutMs: number
  csrfHeaderName: string
  accessTokenProvider?: () => Promise<string | undefined>
  csrfTokenProvider?: () => Promise<string | undefined>
  fetcher?: typeof fetch
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  authSource?: AuthSource
  notifyUnauthorized?: boolean
}

function joinUrl(baseUrl: string, path: string): string {
  return baseUrl.replace(/\/$/, '') + '/' + path.replace(/^\//, '')
}

function errorKind(status: number): HttpError['kind'] {
  if (status === 401) return 'unauthorized'
  if (status === 403) return 'forbidden'
  if (status === 409) return 'conflict'
  if (status === 422 || status === 400) return 'validation'
  return 'server'
}

export class HttpClient {
  constructor(private readonly options: HttpClientOptions) {}

  async request(path: string, options: RequestOptions = {}): Promise<unknown> {
    const method = options.method ?? 'GET'
    const authSource = options.authSource ?? getTransportAuthSource() ?? 'local'
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), this.options.timeoutMs)
    const headers = new Headers({ Accept: 'application/json' })

    if (options.body !== undefined) {
      headers.set('Content-Type', 'application/json')
    }

    if (authSource === 'oidc') {
      const token = await this.options.accessTokenProvider?.()
      if (token) {
        headers.set('Authorization', 'Bearer ' + token)
      }
    }

    if (method !== 'GET') {
      const csrfToken = await this.options.csrfTokenProvider?.()
      if (csrfToken) {
        headers.set(this.options.csrfHeaderName, csrfToken)
      }
    }

    let response: Response
    try {
      response = await (this.options.fetcher ?? fetch)(joinUrl(this.options.baseUrl, path), {
        method,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        credentials: authSource === 'oidc' ? 'omit' : 'include',
        headers,
        signal: controller.signal,
      })
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new HttpError('timeout')
      }
      throw new HttpError('network')
    } finally {
      window.clearTimeout(timeout)
    }

    if (!response.ok) {
      let details: unknown
      try {
        details = await response.json()
      } catch {
        details = undefined
      }
      const kind = errorKind(response.status)
      if (kind === 'unauthorized' && options.notifyUnauthorized !== false) {
        emitUnauthorized()
      }
      throw new HttpError(kind, response.status, details)
    }

    if (response.status === 204) {
      return undefined
    }

    const contentType = response.headers.get('content-type') ?? ''
    if (!contentType.includes('application/json')) {
      throw new HttpError('invalid-response', response.status)
    }

    try {
      return await response.json()
    } catch {
      throw new HttpError('invalid-response', response.status)
    }
  }
}
