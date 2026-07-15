import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { initializeI18n } from '@/core/i18n'
import { Tag } from '@/components/ui/tag'

describe('Tag', () => {
  beforeAll(async () => {
    await initializeI18n('zh-CN')
  })

  afterEach(cleanup)

  it('renders children with color variant classes', () => {
    render(<Tag color="green">启用</Tag>)
    const tag = screen.getByText('启用')
    expect(tag.className).toContain('bg-[var(--green-light)]')
    expect(tag.className).toContain('text-[var(--green)]')
  })

  it('switches to pill shape with breathing dot when dot is set', () => {
    const { container } = render(
      <Tag color="gold" dot>
        运行中
      </Tag>,
    )
    const tag = screen.getByText('运行中')
    expect(tag.className).toContain('rounded-xl')
    expect(container.querySelector('[aria-hidden]')).toBeInTheDocument()
  })

  it('fires onClose from the close button without removing itself', () => {
    const onClose = vi.fn()
    render(
      <Tag closable onClose={onClose}>
        可关闭
      </Tag>,
    )
    fireEvent.click(screen.getByLabelText('关闭'))
    expect(onClose).toHaveBeenCalledOnce()
    expect(screen.getByText('可关闭')).toBeInTheDocument()
  })
})
