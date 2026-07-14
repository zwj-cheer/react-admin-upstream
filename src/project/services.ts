import { createRestServices } from '@/adapters/rest'
import type { RuntimeConfig } from '@/core/config/runtimeConfig.schema'
import { HttpClient } from '@/core/http/client'
import type { Services } from '@/core/services/contracts'

export function createProjectServices(
  config: RuntimeConfig,
  accessTokenProvider: () => Promise<string | undefined>,
): Services {
  const client = new HttpClient({
    baseUrl: config.api.baseUrl,
    timeoutMs: config.api.timeoutMs,
    csrfHeaderName: config.auth.local.csrfHeaderName,
    accessTokenProvider,
    csrfTokenProvider:
      import.meta.env.DEV && config.mock.enabled ? async () => 'mock-csrf-token' : undefined,
  })

  return createRestServices(client)
}
