import {
  developmentRuntimeConfig,
  parseRuntimeConfig,
  RuntimeConfigError,
  type RuntimeConfigValidationContext,
} from '@/core/config/runtimeConfig'
import type { RuntimeConfig } from '@/core/config/runtimeConfig.schema'
import type { TrustedOriginPolicy } from '@/core/config/trustedOrigins'

interface LoadRuntimeConfigOptions {
  fetcher?: typeof fetch
  appOrigin?: string
  isProduction?: boolean
  trustedOrigins?: TrustedOriginPolicy[]
}

export async function loadRuntimeConfig(
  options: LoadRuntimeConfigOptions = {},
): Promise<RuntimeConfig> {
  const fetcher = options.fetcher ?? fetch
  const isProduction = options.isProduction ?? import.meta.env.PROD
  const appOrigin = options.appOrigin ?? window.location.origin
  const trustedOrigins = options.trustedOrigins ?? []
  const validationContext: RuntimeConfigValidationContext = {
    appOrigin,
    isProduction,
    trustedOrigins,
  }

  try {
    const response = await fetcher('/config/runtime.json', {
      cache: 'no-store',
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new RuntimeConfigError('missing')
    }

    let input: unknown
    try {
      input = await response.json()
    } catch {
      throw new RuntimeConfigError('invalid-json')
    }

    return parseRuntimeConfig(input, validationContext)
  } catch (error) {
    if (!isProduction) {
      console.warn('[bootstrap] Runtime configuration unavailable; using safe defaults.')
      return developmentRuntimeConfig
    }

    if (error instanceof RuntimeConfigError) {
      throw error
    }

    throw new RuntimeConfigError('missing')
  }
}
