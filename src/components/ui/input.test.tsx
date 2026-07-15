import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { useState } from 'react'
import { initializeI18n } from '@/core/i18n'
import { Input } from '@/components/ui/input'

function Controlled() {
  const [value, setValue] = useState('abc')
  return (
    <Input
      allowClear
      aria-label="搜索"
      value={value}
      onChange={(event) => setValue(event.target.value)}
    />
  )
}

describe('Input', () => {
  beforeAll(async () => {
    await initializeI18n('zh-CN')
  })

  afterEach(cleanup)

  it('renders a bare input without decoration props', () => {
    const { container } = render(<Input aria-label="名称" />)
    expect(container.firstElementChild?.tagName).toBe('INPUT')
  })

  it('clears controlled value through the clear button and refocuses', () => {
    render(<Controlled />)
    const input = screen.getByLabelText('搜索')
    expect(input).toHaveValue('abc')
    fireEvent.click(screen.getByLabelText('清除'))
    expect(input).toHaveValue('')
    expect(screen.queryByLabelText('清除')).not.toBeInTheDocument()
  })

  it('renders prefix and suffix decorations', () => {
    render(<Input aria-label="套餐" prefix={<span>￥</span>} suffix={<span>RMB</span>} />)
    expect(screen.getByText('￥')).toBeInTheDocument()
    expect(screen.getByText('RMB')).toBeInTheDocument()
  })

  it('marks error status with aria-invalid', () => {
    render(<Input aria-label="邮箱" status="error" />)
    expect(screen.getByLabelText('邮箱')).toHaveAttribute('aria-invalid', 'true')
  })

  it('keeps forwarding ref and onChange for register-style usage', () => {
    const onChange = vi.fn()
    const ref = vi.fn()
    render(<Input allowClear aria-label="编码" ref={ref} onChange={onChange} />)
    const input = screen.getByLabelText('编码')
    expect(ref).toHaveBeenCalledWith(input)
    fireEvent.change(input, { target: { value: 'x' } })
    expect(onChange).toHaveBeenCalled()
    expect(screen.getByLabelText('清除')).toBeInTheDocument()
  })

  it('hides the clear button while disabled', () => {
    render(<Input allowClear disabled aria-label="搜索" value="abc" onChange={() => {}} />)
    expect(screen.queryByLabelText('清除')).not.toBeInTheDocument()
  })
})
