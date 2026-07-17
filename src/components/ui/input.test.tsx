import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it } from 'vitest'
import { Input } from './input'

describe('Input', () => {
  it('passes native props and React 19 refs to the actual input', () => {
    const ref = createRef<HTMLInputElement>()
    render(<Input ref={ref} aria-label="名称" aria-invalid />)

    expect(screen.getByLabelText('名称')).toHaveAttribute('aria-invalid', 'true')
    expect(ref.current).toBe(screen.getByLabelText('名称'))
  })
})
