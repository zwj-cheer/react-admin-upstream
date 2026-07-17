import { z } from 'zod'
import type { HttpClient } from '@/core/http/client'
import type { AuthServiceContract, AuthSource, Session } from '@/core/services/contracts'
import { capabilitySchema } from './schemas'

export const sessionSchema = z.object({
  user: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    email: z.string().email(),
    avatarUrl: z.string().url().optional(),
  }),
  source: z.enum(['local', 'oidc']),
  expiresAt: z.string().datetime(),
  capabilities: z.array(capabilitySchema),
})

export type SessionResponse = z.infer<typeof sessionSchema>

function parseSession(response: unknown, expectedSource: AuthSource): Session {
  const session = sessionSchema.parse(response)
  if (session.source !== expectedSource) {
    throw new Error('session_source_mismatch')
  }
  return session
}

export class RestAuthAdapter implements AuthServiceContract {
  constructor(private readonly client: HttpClient) {}

  async loginLocal(email: string, password: string): Promise<Session> {
    const response = await this.client.request('/auth/login', {
      method: 'POST',
      body: { email, password },
      authSource: 'local',
      notifyUnauthorized: false,
    })
    return parseSession(response, 'local')
  }

  async getSession(source: AuthSource, signal?: AbortSignal): Promise<Session> {
    const response = await this.client.request('/session', { authSource: source, signal })
    return parseSession(response, source)
  }

  async logout(source: AuthSource): Promise<void> {
    await this.client.request('/auth/logout', {
      method: 'POST',
      authSource: source,
      notifyUnauthorized: false,
    })
  }
}
