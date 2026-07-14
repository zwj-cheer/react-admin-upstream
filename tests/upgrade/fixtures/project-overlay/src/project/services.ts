import { createRestServices } from '@/adapters/rest'
import type { RuntimeConfig } from '@/core/config/runtimeConfig.schema'
import { HttpClient } from '@/core/http/client'
import type { Services } from '@/core/services/contracts'

export const sampleServiceAdapter = 'sample-downstream-rest-adapter'

export function createProjectServices(
  config: RuntimeConfig,
  accessTokenProvider: () => Promise<string | undefined>,
): Services {
  return createRestServices(
    new HttpClient({
      baseUrl: config.api.baseUrl,
      timeoutMs: config.api.timeoutMs,
      csrfHeaderName: config.auth.local.csrfHeaderName,
      accessTokenProvider,
    }),
  )
}
