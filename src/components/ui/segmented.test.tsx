import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Segmented, type SegmentedOption } from '@/components/ui/segmented'

const options: SegmentedOption[] = [
  { label: '日', value: 'day' },
  { label: '周', value: 'week' },
  { label: '月', value: 'month', disabled: true },
]

describe('Segmented', () => {
  afterEach(cleanup)

  it('marks the controlled value active and reports changes', () => {
    const onChange = vi.fn()
    render(<Segmented options={options} value="day" onChange={onChange} />)
    expect(screen.getByRole('radio', { name: '日' })).toHaveAttribute('aria-checked', 'true')
    fireEvent.click(screen.getByRole('radio', { name: '周' }))
    expect(onChange).toHaveBeenCalledWith('week')
  })

  it('does not fire when clicking the already active option', () => {
    const onChange = vi.fn()
    render(<Segmented options={options} value="day" onChange={onChange} />)
    fireEvent.click(screen.getByRole('radio', { name: '日' }))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('blocks disabled options and whole-control disabled', () => {
    const onChange = vi.fn()
    const { rerender } = render(<Segmented options={options} value="day" onChange={onChange} />)
    fireEvent.click(screen.getByRole('radio', { name: '月' }))
    expect(onChange).not.toHaveBeenCalled()
    rerender(<Segmented disabled options={options} value="day" onChange={onChange} />)
    fireEvent.click(screen.getByRole('radio', { name: '周' }))
    expect(onChange).not.toHaveBeenCalled()
  })
})
