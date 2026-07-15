import { readFileSync } from 'node:fs'
import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { ICON_NAMES, Icon } from '@/components/ui/icon'

describe('Icon', () => {
  afterEach(cleanup)

  it('renders sprite reference with default size and decorative aria', () => {
    const { container } = render(<Icon name="pencil" />)
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('aria-hidden')).toBe('true')
    expect(svg.getAttribute('role')).toBeNull()
    expect(svg.getAttribute('width')).toBe('16')
    expect(svg.getAttribute('height')).toBe('16')
    expect(svg.querySelector('use')?.getAttribute('href')).toBe('/icons.svg#icon-pencil')
  })

  it('switches to semantic img role when label is provided', () => {
    const { container } = render(<Icon label="编辑" name="pencil" size={14} />)
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('aria-hidden')).toBeNull()
    expect(svg.getAttribute('role')).toBe('img')
    expect(svg.getAttribute('aria-label')).toBe('编辑')
    expect(svg.getAttribute('width')).toBe('14')
  })

  it('keeps ICON_NAMES and the sprite symbol set in two-way sync', () => {
    const svg = readFileSync('public/icons.svg', 'utf8')
    const spriteNames = [...svg.matchAll(/<symbol id="icon-([a-z0-9-]+)"/g)].map(
      (match) => match[1],
    )
    // 双向:sprite 无重复,且与 ICON_NAMES 集合完全相等(漂移=静默空白图标)
    expect(new Set(spriteNames).size).toBe(spriteNames.length)
    expect([...spriteNames].sort()).toEqual([...ICON_NAMES].sort())
  })
})
