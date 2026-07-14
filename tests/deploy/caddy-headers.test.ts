import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const caddyfile = readFileSync('deploy/Caddyfile', 'utf8')

describe('Caddy delivery policy', () => {
  it('keeps runtime configuration and the SPA entry out of long-lived caches', () => {
    expect(caddyfile).toContain('path /config/runtime.json')
    expect(caddyfile).toContain('no-store, max-age=0')
    expect(caddyfile).toContain('no-cache, no-store, must-revalidate')
  })

  it('sets immutable asset caching and security headers', () => {
    expect(caddyfile).toContain('max-age=31536000, immutable')
    expect(caddyfile).toContain('Content-Security-Policy')
    expect(caddyfile).toContain('X-Content-Type-Options')
    expect(caddyfile).toContain('Permissions-Policy')
  })

  it('applies security headers to missing files without exposing the server', () => {
    expect(caddyfile).toContain('handle_errors')
    expect(caddyfile).toContain('-Server')
    expect(caddyfile).toContain(
      'respond "{http.error.status_code} {http.error.status_text}" {http.error.status_code}',
    )
  })
})
