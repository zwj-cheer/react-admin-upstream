import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { initializeI18n } from '@/core/i18n'
import { Slider } from '@/components/ui/slider'

describe('Slider', () => {
  beforeAll(async () => {
    await initializeI18n('zh-CN')
  })

  afterEach(cleanup)

  it('reflects the controlled value on the thumb', () => {
    render(<Slider value={40} onChange={vi.fn()} />)
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '40')
  })

  it('reports keyboard-driven changes stepwise', () => {
    const onChange = vi.fn()
    render(<Slider value={40} step={5} onChange={onChange} />)
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowRight' })
    expect(onChange).toHaveBeenCalledWith(45)
  })

  it('does not report changes when disabled', () => {
    const onChange = vi.fn()
    render(<Slider disabled value={40} onChange={onChange} />)
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowRight' })
    expect(onChange).not.toHaveBeenCalled()
  })
})
