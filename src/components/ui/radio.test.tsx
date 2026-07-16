import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { RadioGroup, type RadioOption } from '@/components/ui/radio'

const options: RadioOption[] = [
  { label: '一人', value: '1', description: '仅本人' },
  { label: '团队', value: '5' },
  { label: '企业', value: '20', disabled: true },
]

describe('RadioGroup', () => {
  afterEach(cleanup)

  it('marks the controlled value checked and reports changes', () => {
    const onChange = vi.fn()
    render(<RadioGroup options={options} value="1" onChange={onChange} />)
    expect(screen.getByRole('radio', { name: '一人' })).toHaveAttribute('aria-checked', 'true')
    fireEvent.click(screen.getByRole('radio', { name: '团队' }))
    expect(onChange).toHaveBeenCalledWith('5')
  })

  it('does not report changes for a disabled option', () => {
    const onChange = vi.fn()
    render(<RadioGroup options={options} value="1" onChange={onChange} />)
    fireEvent.click(screen.getByRole('radio', { name: '企业' }))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('renders card descriptions in card mode', () => {
    render(<RadioGroup optionType="card" options={options} value="1" onChange={vi.fn()} />)
    expect(screen.getByText('仅本人')).toBeInTheDocument()
  })
})
