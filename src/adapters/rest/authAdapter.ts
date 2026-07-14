import type { HttpClient } from '@/core/http/client'
import type { AuthServiceContract, AuthSource, Session } from '@/core/services/contracts'
import { sessionSchema } from './schemas'

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

  async getSession(source: AuthSource): Promise<Session> {
    const response = await this.client.request('/session', { authSource: source })
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
