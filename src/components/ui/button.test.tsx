import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Button } from '@/components/ui/button'

describe('Button loading', () => {
  afterEach(cleanup)

  it('disables the button and shows a spinner while loading', () => {
    const onClick = vi.fn()
    const { container } = render(
      <Button loading onClick={onClick}>
        保存
      </Button>,
    )
    const button = screen.getByRole('button', { name: '保存' })
    expect(button).toBeDisabled()
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
    fireEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('renders no spinner when idle', () => {
    const { container } = render(<Button>保存</Button>)
    expect(screen.getByRole('button', { name: '保存' })).toBeEnabled()
    expect(container.querySelector('.animate-spin')).not.toBeInTheDocument()
  })
})
