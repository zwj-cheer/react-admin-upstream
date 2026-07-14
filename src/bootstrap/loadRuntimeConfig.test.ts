import { describe, expect, it, vi } from 'vitest'
import { loadRuntimeConfig } from './loadRuntimeConfig'

const validConfig = {
  schemaVersion: 1,
  app: { name: 'Test Admin' },
  api: { baseUrl: '/api', timeoutMs: 10000 },
  auth: { mode: 'local', local: { csrfHeaderName: 'x-csrf-token' } },
  defaults: { theme: 'dark', locale: 'en-US' },
  mock: { enabled: false },
}

describe('loadRuntimeConfig', () => {
  it('loads a valid runtime document before application startup', async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(validConfig), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    )

    await expect(
      loadRuntimeConfig({
        fetcher,
        isProduction: true,
        appOrigin: 'https://admin.example.com',
      }),
    ).resolves.toMatchObject({ app: { name: 'Test Admin' } })
    expect(fetcher).toHaveBeenCalledWith(
      '/config/runtime.json',
      expect.objectContaining({ cache: 'no-store' }),
    )
  })

  it('uses safe defaults when development configuration is missing', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(null, { status: 404 }))
    await expect(
      loadRuntimeConfig({
        fetcher,
        isProduction: false,
        appOrigin: 'http://localhost:5173',
      }),
    ).resolves.toMatchObject({ mock: { enabled: true }, auth: { mode: 'local' } })
  })

  it('blocks production startup when configuration is missing', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(null, { status: 404 }))
    await expect(
      loadRuntimeConfig({
        fetcher,
        isProduction: true,
        appOrigin: 'https://admin.example.com',
      }),
    ).rejects.toEqual(expect.objectContaining({ category: 'missing' }))
  })
})
