import { describe, expect, it, vi } from 'vitest'
import { RestAuthAdapter } from './authAdapter'
import type { HttpClient } from '@/core/http/client'

const session = {
  user: { id: '1', name: 'Admin', email: 'admin@example.com' },
  source: 'local' as const,
  expiresAt: new Date().toISOString(),
  capabilities: ['users:read'],
}

describe('RestAuthAdapter', () => {
  it('fails closed when session capabilities have an invalid shape', async () => {
    const client = {
      request: async () => ({
        user: { id: '1', name: 'Admin', email: 'admin@example.com' },
        source: 'local',
        expiresAt: new Date().toISOString(),
        capabilities: [null],
      }),
    } as unknown as HttpClient

    await expect(new RestAuthAdapter(client).getSession('local')).rejects.toBeDefined()
  })

  it('rejects a restored session whose source differs from the requested source', async () => {
    const client = {
      request: vi.fn().mockResolvedValue(session),
    } as unknown as HttpClient

    await expect(new RestAuthAdapter(client).getSession('oidc')).rejects.toThrow(
      'session_source_mismatch',
    )
  })

  it('rejects a local login response labeled as an OIDC session', async () => {
    const client = {
      request: vi.fn().mockResolvedValue({ ...session, source: 'oidc' }),
    } as unknown as HttpClient

    await expect(
      new RestAuthAdapter(client).loginLocal('admin@example.com', 'Admin123!'),
    ).rejects.toThrow('session_source_mismatch')
  })
})
