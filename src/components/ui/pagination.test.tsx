import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { initializeI18n } from '@/core/i18n'
import { Pagination } from '@/components/ui/pagination'

describe('Pagination', () => {
  beforeAll(async () => {
    await initializeI18n('zh-CN')
  })

  afterEach(cleanup)

  it('reports page changes from page buttons and prev/next', () => {
    const onChange = vi.fn()
    render(<Pagination current={2} pageSize={10} total={50} onChange={onChange} />)
    fireEvent.click(screen.getByText('4'))
    expect(onChange).toHaveBeenCalledWith(4)
    fireEvent.click(screen.getByText('上一页'))
    expect(onChange).toHaveBeenCalledWith(1)
    fireEvent.click(screen.getByText('下一页'))
    expect(onChange).toHaveBeenCalledWith(3)
  })

  it('disables prev on first page and next on last page', () => {
    const { rerender } = render(
      <Pagination current={1} pageSize={10} total={30} onChange={() => {}} />,
    )
    expect(screen.getByText('上一页')).toBeDisabled()
    expect(screen.getByText('下一页')).toBeEnabled()
    rerender(<Pagination current={3} pageSize={10} total={30} onChange={() => {}} />)
    expect(screen.getByText('下一页')).toBeDisabled()
  })

  it('collapses page buttons with ellipses when pageCount exceeds 7', () => {
    render(<Pagination current={5} pageSize={10} total={100} onChange={() => {}} />)
    const labels = screen
      .getAllByRole('button')
      .map((button) => button.textContent)
      .filter((text) => text && !['上一页', '下一页'].includes(text))
    expect(labels).toEqual(['1', '4', '5', '6', '10'])
    expect(screen.getAllByText('…')).toHaveLength(2)
    expect(screen.getByText('5')).toHaveAttribute('aria-current', 'page')
  })

  it('shows i18n total summary when showTotal is set', () => {
    render(<Pagination current={1} pageSize={8} total={20} showTotal onChange={() => {}} />)
    expect(screen.getByText('第 1 / 3 页 · 共 20 条')).toBeInTheDocument()
  })

  it('disables every control when disabled', () => {
    render(<Pagination current={2} pageSize={10} total={50} disabled onChange={() => {}} />)
    for (const button of screen.getAllByRole('button')) {
      expect(button).toBeDisabled()
    }
  })

  it('keeps the exact last page reachable when total is a multiple of pageSize', () => {
    const onChange = vi.fn()
    render(<Pagination current={1} pageSize={8} total={16} onChange={onChange} />)
    // total 恰为 pageSize 整数倍:页数是 2 而非 3,末页可达且 next 在末页禁用
    fireEvent.click(screen.getByText('2'))
    expect(onChange).toHaveBeenCalledWith(2)
    expect(screen.queryByText('3')).not.toBeInTheDocument()
  })

  it('renders a single disabled page when total is 0', () => {
    render(<Pagination current={1} pageSize={8} total={0} onChange={() => {}} />)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('上一页')).toBeDisabled()
    expect(screen.getByText('下一页')).toBeDisabled()
  })
})
