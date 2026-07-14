import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'

const failures = []
const forbidden = [
  /QRouter/i,
  /Open WebUI/i,
  /open-webui/i,
  /\/payg\//i,
  /admin@example\.com/i,
  /Admin123!/,
  /mock-csrf-token/,
  /react-admin-template\.mock-session/,
]

function collect(directory) {
  const files = []
  if (!existsSync(directory)) return files
  for (const entry of readdirSync(directory)) {
    const file = path.join(directory, entry)
    if (statSync(file).isDirectory()) files.push(...collect(file))
    else files.push(file)
  }
  return files
}

if (!existsSync('dist/index.html')) failures.push('dist/index.html is missing')
if (existsSync('dist/mockServiceWorker.js'))
  failures.push('MSW worker entered the production bundle')

for (const file of collect('dist')) {
  if (!/\.(?:html|js|css|json|svg)$/.test(file)) continue
  const content = readFileSync(file, 'utf8')
  for (const pattern of forbidden) {
    if (pattern.test(content)) failures.push(file + ' contains forbidden pattern ' + pattern)
  }
}

for (const file of ['public/config/runtime.json', 'deploy/runtime-config.example.json']) {
  try {
    JSON.parse(readFileSync(file, 'utf8'))
  } catch {
    failures.push(file + ' is not valid JSON')
  }
}

for (const file of collect('src/core').concat(
  collect('src/components'),
  collect('src/layouts'),
  collect('src/modules'),
)) {
  if (!/\.(?:ts|tsx|css)$/.test(file)) continue
  if (/['"]@\/project\//.test(readFileSync(file, 'utf8'))) {
    failures.push(file + ' imports a project-owned module')
  }
}

if (failures.length) {
  failures.forEach((failure) => console.error('- ' + failure))
  process.exit(1)
}

console.log('Template release checks passed.')
