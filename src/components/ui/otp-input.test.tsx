import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { initializeI18n } from '@/core/i18n'
import { OtpInput } from '@/components/ui/otp-input'

describe('OtpInput', () => {
  beforeAll(async () => {
    await initializeI18n('zh-CN')
  })

  afterEach(cleanup)

  it('renders one box per length and spreads the value', () => {
    render(<OtpInput length={4} value="12" onChange={vi.fn()} />)
    const boxes = screen.getAllByRole('textbox')
    expect(boxes).toHaveLength(4)
    expect((boxes[0] as HTMLInputElement).value).toBe('1')
    expect((boxes[1] as HTMLInputElement).value).toBe('2')
    expect((boxes[2] as HTMLInputElement).value).toBe('')
  })

  it('writes an accepted digit into its slot', () => {
    const onChange = vi.fn()
    render(<OtpInput length={4} value="" onChange={onChange} />)
    fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: '7' } })
    expect(onChange).toHaveBeenCalledWith('7')
  })

  it('rejects a character failing the pattern', () => {
    const onChange = vi.fn()
    render(<OtpInput length={4} value="" onChange={onChange} />)
    fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: 'a' } })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('distributes a pasted string across slots', () => {
    const onChange = vi.fn()
    render(<OtpInput length={4} value="" onChange={onChange} />)
    fireEvent.paste(screen.getAllByRole('textbox')[0], {
      clipboardData: { getData: () => '123456' },
    })
    expect(onChange).toHaveBeenCalledWith('1234')
  })

  it('backspaces into the previous slot when the current slot is empty', () => {
    const onChange = vi.fn()
    render(<OtpInput length={4} value="12" onChange={onChange} />)
    const boxes = screen.getAllByRole('textbox')
    fireEvent.keyDown(boxes[2], { key: 'Backspace' })
    expect(onChange).toHaveBeenCalledWith('1')
  })

  it('does not fire onChange when backspacing at the empty first slot', () => {
    const onChange = vi.fn()
    render(<OtpInput length={4} value="" onChange={onChange} />)
    fireEvent.keyDown(screen.getAllByRole('textbox')[0], { key: 'Backspace' })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('falls back to rejecting all input when pattern is an invalid regex', () => {
    const onChange = vi.fn()
    render(<OtpInput length={4} pattern="[" value="" onChange={onChange} />)
    const boxes = screen.getAllByRole('textbox')
    expect(boxes).toHaveLength(4)
    fireEvent.change(boxes[0], { target: { value: '5' } })
    expect(onChange).not.toHaveBeenCalled()
  })
})
