import { describe, expect, it } from 'vitest'
import { parseRuntimeConfig } from './runtimeConfig'

const config = {
  schemaVersion: 1,
  app: { name: 'Admin' },
  api: { baseUrl: 'https://api.example.com', timeoutMs: 10000 },
  auth: { mode: 'local', local: { csrfHeaderName: 'x-csrf-token' } },
  defaults: { theme: 'system', locale: 'zh-CN' },
  mock: { enabled: false },
}

describe('parseRuntimeConfig', () => {
  it.each([
    ['top level', { ...config, unexpected: true }],
    ['app', { ...config, app: { ...config.app, unexpected: true } }],
    ['api', { ...config, api: { ...config.api, unexpected: true } }],
    ['auth', { ...config, auth: { ...config.auth, unexpected: true } }],
    [
      'local auth',
      {
        ...config,
        auth: {
          ...config.auth,
          local: { ...config.auth.local, unexpected: true },
        },
      },
    ],
    ['defaults', { ...config, defaults: { ...config.defaults, unexpected: true } }],
    ['ui', { ...config, ui: { unexpected: true } }],
    ['ui accountMenu', { ...config, ui: { accountMenu: { sidebar: true, unexpected: true } } }],
    ['mock', { ...config, mock: { ...config.mock, unexpected: true } }],
  ])('rejects unknown fields at the %s object', (_location, input) => {
    expect(() =>
      parseRuntimeConfig(input, {
        appOrigin: 'https://admin.example.com',
        isProduction: true,
        trustedOrigins: [],
      }),
    ).toThrowError(expect.objectContaining({ category: 'invalid-schema' }))
  })

  it('rejects OIDC client secrets and unknown OIDC fields', () => {
    expect(() =>
      parseRuntimeConfig(
        {
          ...config,
          api: { baseUrl: '/api', timeoutMs: 10000 },
          auth: {
            mode: 'oidc',
            local: { csrfHeaderName: 'x-csrf-token' },
            oidc: {
              authority: 'https://admin.example.com/idp',
              clientId: 'public-client',
              clientSecret: 'must-not-be-in-a-browser',
              redirectPath: '/auth/callback',
              postLogoutRedirectPath: '/login',
              scope: 'openid profile',
            },
          },
        },
        {
          appOrigin: 'https://admin.example.com',
          isProduction: true,
          trustedOrigins: [],
        },
      ),
    ).toThrowError(expect.objectContaining({ category: 'invalid-schema' }))
  })

  it.each([
    ['redirectPath', '/unregistered-callback'],
    ['postLogoutRedirectPath', '/unregistered-logout'],
  ])('rejects an unapproved OIDC %s', (field, path) => {
    const oidc = {
      authority: 'https://admin.example.com/idp',
      clientId: 'public-client',
      redirectPath: '/auth/callback',
      postLogoutRedirectPath: '/login',
      scope: 'openid profile',
      [field]: path,
    }

    expect(() =>
      parseRuntimeConfig(
        {
          ...config,
          api: { baseUrl: '/api', timeoutMs: 10000 },
          auth: { mode: 'oidc', local: config.auth.local, oidc },
        },
        {
          appOrigin: 'https://admin.example.com',
          isProduction: true,
          trustedOrigins: [],
        },
      ),
    ).toThrowError(expect.objectContaining({ category: 'invalid-schema' }))
  })

  it('defaults the account menu to sidebar-only when ui is omitted', () => {
    expect(
      parseRuntimeConfig(
        { ...config, api: { baseUrl: '/api', timeoutMs: 10000 } },
        {
          appOrigin: 'https://admin.example.com',
          isProduction: true,
          trustedOrigins: [],
        },
      ).ui.accountMenu,
    ).toEqual({ sidebar: true, header: false })
  })

  it('accepts an explicit account menu override', () => {
    expect(
      parseRuntimeConfig(
        {
          ...config,
          api: { baseUrl: '/api', timeoutMs: 10000 },
          ui: { accountMenu: { sidebar: false, header: true } },
        },
        {
          appOrigin: 'https://admin.example.com',
          isProduction: true,
          trustedOrigins: [],
        },
      ).ui.accountMenu,
    ).toEqual({ sidebar: false, header: true })
  })

  it('leaves locale undefined so browser-language fallback can run', () => {
    expect(
      parseRuntimeConfig(
        { ...config, api: { baseUrl: '/api' }, defaults: { theme: 'system' } },
        {
          appOrigin: 'https://admin.example.com',
          isProduction: true,
          trustedOrigins: [],
        },
      ).defaults.locale,
    ).toBeUndefined()
  })

  it('requires explicit credentialed-cookie approval for external local auth APIs', () => {
    expect(() =>
      parseRuntimeConfig(config, {
        appOrigin: 'https://admin.example.com',
        isProduction: true,
        trustedOrigins: [{ origin: 'https://api.example.com', usages: ['api'] }],
      }),
    ).toThrowError(expect.objectContaining({ category: 'unsafe-auth' }))
  })

  it('accepts an exact approved HTTPS cookie API origin', () => {
    expect(
      parseRuntimeConfig(config, {
        appOrigin: 'https://admin.example.com',
        isProduction: true,
        trustedOrigins: [
          {
            origin: 'https://api.example.com',
            usages: ['api'],
            allowCredentialedCookies: true,
          },
        ],
      }),
    ).toMatchObject({ api: { baseUrl: 'https://api.example.com' } })
  })

  it('rejects mock mode in production', () => {
    expect(() =>
      parseRuntimeConfig(
        { ...config, api: { baseUrl: '/api', timeoutMs: 10000 }, mock: { enabled: true } },
        {
          appOrigin: 'https://admin.example.com',
          isProduction: true,
          trustedOrigins: [],
        },
      ),
    ).toThrowError(expect.objectContaining({ category: 'mock-in-production' }))
  })

  it('rejects oidc mode when OIDC settings are incomplete', () => {
    expect(() =>
      parseRuntimeConfig(
        {
          ...config,
          api: { baseUrl: '/api', timeoutMs: 10000 },
          auth: {
            mode: 'oidc',
            local: { csrfHeaderName: 'x-csrf-token' },
          },
        },
        {
          appOrigin: 'https://admin.example.com',
          isProduction: true,
          trustedOrigins: [],
        },
      ),
    ).toThrowError(expect.objectContaining({ category: 'invalid-schema' }))
  })
})
