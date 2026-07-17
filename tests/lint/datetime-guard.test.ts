import { describe, expect, it } from 'vitest'
import { loadESLint } from 'eslint'

/**
 * 固化 eslint.config.js 「日期展示护栏」的保真度:
 * 护栏声称拦截散装日期写法——这些反例必须真的报错(fail-closed),
 * 而封装出口 @/core/datetime 的正常用法不得误伤。
 * 文件路径伪装在 src/modules/ 下,命中护栏的 files 范围。
 */
const DefaultESLint = await loadESLint()
const eslint = new DefaultESLint({ cwd: process.cwd() })

async function messagesFor(code: string): Promise<string[]> {
  const [result] = await eslint.lintText(code, { filePath: 'src/modules/__probe__.ts' })
  return result.messages.map((message) => message.ruleId ?? 'fatal')
}

describe('datetime lint guard fidelity', () => {
  it('blocks the bare dayjs import', async () => {
    expect(await messagesFor("import dayjs from 'dayjs'\nexport const x = dayjs")).toContain(
      'no-restricted-imports',
    )
  })

  it('blocks dayjs subpath imports (esm / plugin)', async () => {
    expect(await messagesFor("import dayjs from 'dayjs/esm'\nexport const x = dayjs")).toContain(
      'no-restricted-imports',
    )
    expect(await messagesFor("import utc from 'dayjs/plugin/utc'\nexport const x = utc")).toContain(
      'no-restricted-imports',
    )
  })

  it('blocks Intl.DateTimeFormat in both constructed and callable forms', async () => {
    expect(await messagesFor('export const x = new Intl.DateTimeFormat("zh-CN")')).toContain(
      'no-restricted-syntax',
    )
    expect(await messagesFor('export const x = Intl.DateTimeFormat("zh-CN")')).toContain(
      'no-restricted-syntax',
    )
  })

  it('blocks toLocaleString family on values', async () => {
    expect(await messagesFor('export const x = new Date().toLocaleDateString("zh-CN")')).toContain(
      'no-restricted-syntax',
    )
  })

  it('does not flag the sanctioned @/core/datetime entry point', async () => {
    const ruleIds = await messagesFor(
      "import { formatDate } from '@/core/datetime'\nexport const x = formatDate(0)",
    )
    expect(ruleIds).not.toContain('no-restricted-imports')
    expect(ruleIds).not.toContain('no-restricted-syntax')
  })
})
