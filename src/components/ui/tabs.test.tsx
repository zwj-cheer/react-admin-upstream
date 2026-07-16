import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Tabs, type TabItem } from '@/components/ui/tabs'

const items: TabItem[] = [
  { key: 'a', label: '概览', children: <div>面板A</div> },
  { key: 'b', label: '明细', children: <div>面板B</div> },
  { key: 'c', label: '禁用', disabled: true },
]

describe('Tabs', () => {
  afterEach(cleanup)

  it('marks the active tab selected and renders its panel', () => {
    render(<Tabs items={items} activeKey="a" onChange={vi.fn()} />)
    expect(screen.getByRole('tab', { name: '概览' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText('面板A')).toBeInTheDocument()
  })

  it('reports changes when clicking an inactive tab', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Tabs items={items} activeKey="a" onChange={onChange} />)
    await user.click(screen.getByRole('tab', { name: '明细' }))
    expect(onChange).toHaveBeenCalledWith('b')
  })

  it('does not report changes for a disabled tab', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Tabs items={items} activeKey="a" onChange={onChange} />)
    await user.click(screen.getByRole('tab', { name: '禁用' }))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('renders no panel for an active childless tab in a mixed set', () => {
    render(<Tabs items={items} activeKey="c" onChange={vi.fn()} />)
    expect(screen.queryByRole('tabpanel')).not.toBeInTheDocument()
  })
})
