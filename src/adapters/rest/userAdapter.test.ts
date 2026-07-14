import { describe, expect, it, vi } from 'vitest'
import { HttpClient } from '@/core/http/client'
import { RestUserAdapter } from './userAdapter'

describe('RestUserAdapter', () => {
  it('encodes identifiers as a single URL path segment', async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 'user/with?separator',
          name: 'Test User',
          email: 'test@example.com',
          status: 'active',
          roleIds: [],
          createdAt: '2026-07-10T00:00:00.000Z',
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    )
    const adapter = new RestUserAdapter(
      new HttpClient({
        baseUrl: '/api',
        timeoutMs: 1000,
        csrfHeaderName: 'x-csrf-token',
        fetcher,
      }),
    )

    await adapter.update('user/with?separator', {
      name: 'Test User',
      email: 'test@example.com',
      roleIds: [],
    })

    expect(fetcher).toHaveBeenCalledWith(
      '/api/users/user%2Fwith%3Fseparator',
      expect.objectContaining({ method: 'PATCH' }),
    )
  })
})
