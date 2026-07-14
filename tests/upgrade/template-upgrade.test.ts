import { execFileSync } from 'node:child_process'
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function files(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name)
    return entry.isDirectory() ? files(file) : [file]
  })
}

function git(repository: string, ...args: string[]): string {
  return execFileSync('git', args, {
    cwd: repository,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim()
}

function commitAll(repository: string, message: string): void {
  git(repository, 'add', '--all')
  git(repository, 'commit', '--message', message)
}

describe('sample downstream upgrade', () => {
  it('merges an adjacent upstream tag without overwriting the project overlay', () => {
    const repository = mkdtempSync(path.join(tmpdir(), 'react-admin-upgrade-'))
    const overlayRoot = path.resolve('tests/upgrade/fixtures/project-overlay')
    const overlayFiles = files(overlayRoot).map((file) => path.relative(overlayRoot, file))
    const projectFiles = files(path.resolve('src/project')).map((file) =>
      path.relative(path.resolve(), file),
    )

    expect([...overlayFiles].sort()).toEqual(projectFiles.sort())
    expect(overlayFiles.every((file) => file.startsWith('src/project/'))).toBe(true)

    try {
      git(repository, 'init', '--initial-branch=main')
      git(repository, 'config', 'user.name', 'Template Upgrade Test')
      git(repository, 'config', 'user.email', 'template-upgrade@example.invalid')
      git(repository, 'config', 'commit.gpgSign', 'false')
      git(repository, 'config', 'tag.gpgSign', 'false')

      cpSync(path.resolve('src/project'), path.join(repository, 'src/project'), {
        recursive: true,
      })
      mkdirSync(path.join(repository, 'src/core'), { recursive: true })
      writeFileSync(
        path.join(repository, 'src/core/template-version.ts'),
        "export const templateVersion = 'v0.1.0'\n",
      )
      commitAll(repository, 'release: v0.1.0')
      git(repository, 'tag', 'v0.1.0')

      git(repository, 'switch', '--create', 'downstream')
      for (const relativeFile of overlayFiles) {
        const destination = path.join(repository, relativeFile)
        mkdirSync(path.dirname(destination), { recursive: true })
        cpSync(path.join(overlayRoot, relativeFile), destination)
      }
      commitAll(repository, 'feat: apply downstream project overlay')

      git(repository, 'switch', 'main')
      writeFileSync(
        path.join(repository, 'src/core/template-version.ts'),
        "export const templateVersion = 'v0.1.1'\n",
      )
      commitAll(repository, 'release: v0.1.1')
      git(repository, 'tag', 'v0.1.1')

      git(repository, 'switch', 'downstream')
      git(repository, 'merge', '--no-edit', 'v0.1.1')

      for (const relativeFile of overlayFiles) {
        expect(readFileSync(path.join(repository, relativeFile), 'utf8')).toBe(
          readFileSync(path.join(overlayRoot, relativeFile), 'utf8'),
        )
      }
      expect(readFileSync(path.join(repository, 'src/core/template-version.ts'), 'utf8')).toBe(
        "export const templateVersion = 'v0.1.1'\n",
      )
      expect(git(repository, 'status', '--porcelain')).toBe('')
    } finally {
      rmSync(repository, { recursive: true, force: true })
    }
  })
})
