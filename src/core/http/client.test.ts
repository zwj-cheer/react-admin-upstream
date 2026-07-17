import { describe, expect, it, vi } from 'vitest'
import { HttpClient } from './client'

describe('HttpClient', () => {
  it('uses credentialed cookie requests for local authentication', async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    )
    const client = new HttpClient({
      baseUrl: '/api',
      timeoutMs: 1000,
      csrfHeaderName: 'x-csrf-token',
      csrfTokenProvider: async () => 'csrf',
      fetcher,
    })

    await client.request('/users', { method: 'POST', body: { name: 'A' }, authSource: 'local' })

    expect(fetcher).toHaveBeenCalledWith(
      '/api/users',
      expect.objectContaining({
        credentials: 'include',
        method: 'POST',
      }),
    )
    const headers = fetcher.mock.calls[0][1].headers as Headers
    expect(headers.get('x-csrf-token')).toBe('csrf')
  })

  it('rejects non-json success responses at the adapter boundary', async () => {
    const client = new HttpClient({
      baseUrl: '/api',
      timeoutMs: 1000,
      csrfHeaderName: 'x-csrf-token',
      fetcher: vi.fn().mockResolvedValue(new Response('ok', { status: 200 })),
    })

    await expect(client.request('/users')).rejects.toEqual(
      expect.objectContaining({ kind: 'invalid-response' }),
    )
  })

  it('propagates caller cancellation without converting it into a network error', async () => {
    const controller = new AbortController()
    const fetcher = vi.fn(
      (_url: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            reject(new DOMException('Aborted', 'AbortError'))
          })
        }),
    )
    const client = new HttpClient({
      baseUrl: '/api',
      timeoutMs: 1000,
      csrfHeaderName: 'x-csrf-token',
      fetcher,
    })

    const request = client.request('/users', { signal: controller.signal })
    controller.abort()

    await expect(request).rejects.toMatchObject({ name: 'AbortError' })
    expect(fetcher.mock.calls[0][1]?.signal?.aborted).toBe(true)
  })
})
