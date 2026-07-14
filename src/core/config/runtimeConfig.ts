import { runtimeConfigSchema, type RuntimeConfig } from './runtimeConfig.schema'
import {
  findTrustedOrigin,
  type TrustedOriginPolicy,
  type TrustedOriginUsage,
} from './trustedOrigins'

export class RuntimeConfigError extends Error {
  constructor(
    readonly category:
      | 'missing'
      | 'invalid-json'
      | 'invalid-schema'
      | 'untrusted-origin'
      | 'unsafe-auth'
      | 'mock-in-production',
  ) {
    super(category)
    this.name = 'RuntimeConfigError'
  }
}

export interface RuntimeConfigValidationContext {
  appOrigin: string
  isProduction: boolean
  trustedOrigins: TrustedOriginPolicy[]
}

export const developmentRuntimeConfig: RuntimeConfig = {
  schemaVersion: 1,
  app: {
    name: 'Admin Workspace',
  },
  api: {
    baseUrl: '/api',
    timeoutMs: 10000,
  },
  auth: {
    mode: 'local',
    local: {
      csrfHeaderName: 'x-csrf-token',
    },
  },
  defaults: {
    theme: 'system',
  },
  ui: {
    accountMenu: {
      sidebar: true,
      header: false,
    },
  },
  mock: {
    enabled: true,
  },
}

function resolveTrustedUrl(
  rawUrl: string,
  usage: TrustedOriginUsage,
  config: RuntimeConfig,
  context: RuntimeConfigValidationContext,
): URL {
  let url: URL

  try {
    url = new URL(rawUrl, context.appOrigin)
  } catch {
    throw new RuntimeConfigError('untrusted-origin')
  }

  if (url.origin === context.appOrigin) {
    return url
  }

  if (url.protocol !== 'https:') {
    throw new RuntimeConfigError('untrusted-origin')
  }

  const policy = findTrustedOrigin(context.trustedOrigins, url.origin, usage)
  if (!policy) {
    throw new RuntimeConfigError('untrusted-origin')
  }

  const usesCookieAuth =
    usage === 'api' && (config.auth.mode === 'local' || config.auth.mode === 'hybrid')

  if (usesCookieAuth && !policy.allowCredentialedCookies) {
    throw new RuntimeConfigError('unsafe-auth')
  }

  return url
}

export function parseRuntimeConfig(
  input: unknown,
  context: RuntimeConfigValidationContext,
): RuntimeConfig {
  const result = runtimeConfigSchema.safeParse(input)
  if (!result.success) {
    throw new RuntimeConfigError('invalid-schema')
  }

  const config = result.data

  if (context.isProduction && config.mock.enabled) {
    throw new RuntimeConfigError('mock-in-production')
  }

  resolveTrustedUrl(config.api.baseUrl, 'api', config, context)

  if (config.auth.oidc && (config.auth.mode === 'oidc' || config.auth.mode === 'hybrid')) {
    resolveTrustedUrl(config.auth.oidc.authority, 'oidc', config, context)
  }

  return config
}
