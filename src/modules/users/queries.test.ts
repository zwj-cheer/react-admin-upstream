import { QueryClient } from '@tanstack/react-query'
import { describe, expect, it, vi } from 'vitest'
import type { Services } from '@/core/services/contracts'
import { userKeys, usersQueryOptions } from './queries'

describe('users query options', () => {
  it('co-locates a hierarchical key and forwards the Query cancellation signal', async () => {
    const params = { query: 'alice', page: 2, pageSize: 8 }
    const list = vi.fn().mockResolvedValue({ items: [], total: 0, page: 2, pageSize: 8 })
    const services = { users: { list } } as unknown as Services
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

    await queryClient.fetchQuery(usersQueryOptions(services, params))

    expect(userKeys.list(params)).toEqual(['users', 'list', params])
    expect(list).toHaveBeenCalledWith(params, expect.any(AbortSignal))
  })
})
