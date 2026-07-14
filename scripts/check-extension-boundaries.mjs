import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'

const roots = ['src/core', 'src/components', 'src/layouts', 'src/modules']
const sourceExtensions = new Set(['.ts', '.tsx', '.css'])
// 下层不允许依赖的上层目录（含违规原因），保证依赖单向：
// bootstrap → app → core/adapters/components/layouts/modules → project。
const forbiddenLayers = [
  { pattern: /['"]@\/project\//, reason: 'project-owned modules' },
  { pattern: /['"]@\/app\//, reason: 'app composition root (invert via @/core/routing or props)' },
]
const violations = []

function walk(directory) {
  for (const entry of readdirSync(directory)) {
    const file = path.join(directory, entry)
    if (statSync(file).isDirectory()) {
      walk(file)
      continue
    }
    if (!sourceExtensions.has(path.extname(file))) continue
    const content = readFileSync(file, 'utf8')
    for (const { pattern, reason } of forbiddenLayers) {
      if (pattern.test(content)) {
        violations.push({ file, reason })
      }
    }
  }
}

roots.forEach(walk)

if (violations.length) {
  console.error('Template-owned files import forbidden upper layers:')
  violations.forEach(({ file, reason }) => console.error('- ' + file + ' -> ' + reason))
  process.exit(1)
}

console.log('Extension boundaries verified.')
