import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { initializeI18n } from '@/core/i18n'
import { Progress } from '@/components/ui/progress'

describe('Progress', () => {
  beforeAll(async () => {
    await initializeI18n('zh-CN')
  })

  afterEach(cleanup)

  it('exposes the clamped percent through aria-valuenow', () => {
    render(<Progress percent={42} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '42')
  })

  it('clamps out-of-range percent to 0..100', () => {
    const { rerender } = render(<Progress percent={-20} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
    rerender(<Progress percent={140} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100')
  })

  it('renders the percent text only when showInfo is set', () => {
    const { rerender } = render(<Progress percent={30} />)
    expect(screen.queryByText('30%')).not.toBeInTheDocument()
    rerender(<Progress showInfo percent={30} />)
    expect(screen.getByText('30%')).toBeInTheDocument()
  })

  it('falls back to 0 for non-finite percent', () => {
    render(<Progress showInfo percent={Number.NaN} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
    expect(screen.getByText('0%')).toBeInTheDocument()
  })
})
