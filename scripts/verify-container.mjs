import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

const image = process.argv[2] ?? 'react-admin-upstream:verify'
const container = `react-admin-verify-${process.pid}-${Date.now()}`
const temporaryDirectory = mkdtempSync(path.join(tmpdir(), 'react-admin-container-'))
const runtimePath = path.join(temporaryDirectory, 'runtime.json')

function docker(args, options = {}) {
  return execFileSync('docker', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options,
  }).trim()
}

async function waitForServer(baseUrl) {
  const deadline = Date.now() + 30_000
  while (Date.now() < deadline) {
    try {
      const response = await fetch(baseUrl)
      if (response.ok) return
    } catch {
      // Caddy is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  throw new Error('Timed out waiting for the container to serve HTTP')
}

function expectSecurityHeaders(response) {
  assert.equal(response.headers.get('server'), null)
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff')
  assert.equal(response.headers.get('x-frame-options'), 'DENY')
  assert.match(response.headers.get('content-security-policy') ?? '', /default-src 'self'/)
}

try {
  const configuredUser = JSON.parse(
    docker(['image', 'inspect', image, '--format', '{{json .Config.User}}']),
  )
  assert.equal(configuredUser, 'caddy', 'runtime image must use the caddy user')

  docker(['run', '--detach', '--name', container, '--publish', '127.0.0.1::8080', image])
  const publishedAddress = docker(['port', container, '8080/tcp']).split('\n').at(-1)
  assert.ok(publishedAddress, 'Docker did not publish port 8080')
  const baseUrl = `http://${publishedAddress}`
  await waitForServer(baseUrl)

  const missingRuntime = await fetch(`${baseUrl}/config/runtime.json`)
  assert.equal(missingRuntime.status, 404, 'the image must not contain runtime.json')
  expectSecurityHeaders(missingRuntime)

  const missingWorker = await fetch(`${baseUrl}/mockServiceWorker.js`)
  assert.equal(missingWorker.status, 404, 'the image must not contain the MSW worker')
  expectSecurityHeaders(missingWorker)

  writeFileSync(
    runtimePath,
    JSON.stringify({
      schemaVersion: 1,
      app: { name: 'Container verification' },
      api: { baseUrl: '/api', timeoutMs: 10000 },
      auth: { mode: 'local', local: { csrfHeaderName: 'x-csrf-token' } },
      defaults: { theme: 'system' },
      mock: { enabled: false },
    }),
  )
  docker(['cp', runtimePath, `${container}:/srv/config/runtime.json`])

  const runtime = await fetch(`${baseUrl}/config/runtime.json`)
  assert.equal(runtime.status, 200)
  assert.match(runtime.headers.get('cache-control') ?? '', /no-store/)
  assert.equal((await runtime.json()).app.name, 'Container verification')

  const index = await fetch(baseUrl)
  const indexHtml = await index.text()
  assert.equal(index.status, 200)
  assert.match(index.headers.get('cache-control') ?? '', /no-store/)
  assert.match(indexHtml, /<div id="root"><\/div>/)

  const spaFallback = await fetch(`${baseUrl}/downstream/example`)
  assert.equal(spaFallback.status, 200)
  assert.match(spaFallback.headers.get('content-type') ?? '', /text\/html/)
  assert.match(await spaFallback.text(), /<div id="root"><\/div>/)

  const assetPath = indexHtml.match(/(?:src|href)="(\/assets\/[^"]+\.(?:js|css))"/)?.[1]
  assert.ok(assetPath, 'index.html does not reference a built asset')
  const asset = await fetch(baseUrl + assetPath)
  assert.equal(asset.status, 200)
  assert.match(asset.headers.get('cache-control') ?? '', /max-age=31536000, immutable/)

  const missingAsset = await fetch(`${baseUrl}/assets/missing.js`)
  assert.equal(missingAsset.status, 404)
  assert.doesNotMatch(await missingAsset.text(), /<div id="root">/)
  expectSecurityHeaders(missingAsset)

  console.log(`Container verification passed for ${image}.`)
} catch (error) {
  try {
    const logs = docker(['logs', container])
    if (logs) console.error(logs)
  } catch {
    // The container may not have been created.
  }
  throw error
} finally {
  try {
    docker(['rm', '--force', container])
  } catch {
    // Cleanup is best-effort when startup failed before container creation.
  }
  rmSync(temporaryDirectory, { recursive: true, force: true })
}
