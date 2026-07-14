import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const dockerfile = readFileSync('Dockerfile', 'utf8')

describe('container image definition', () => {
  it('uses separate Node and Caddy stages with an unprivileged runtime', () => {
    expect(dockerfile).toMatch(/FROM node:24-alpine@sha256:[a-f0-9]{64} AS builder/)
    expect(dockerfile).toMatch(/FROM caddy:2\.10-alpine@sha256:[a-f0-9]{64} AS runtime/)
    expect(dockerfile).toContain('USER caddy')
    expect(dockerfile).toContain('EXPOSE 8080')
  })

  it('does not ship the MSW worker or a real runtime document', () => {
    expect(dockerfile).toContain('rm -f /srv/mockServiceWorker.js')
    expect(dockerfile).not.toContain('runtime.json /srv/config/runtime.json')
  })
})
