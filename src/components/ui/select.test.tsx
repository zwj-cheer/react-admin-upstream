import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { initializeI18n } from '@/core/i18n'
import { Select, type SelectOption } from '@/components/ui/select'

const options: SelectOption[] = [
  { label: '甲选项', value: 'a' },
  { label: '乙选项', value: 'b' },
  { label: '丙禁用', value: 'c', disabled: true },
]

describe('Select', () => {
  beforeAll(async () => {
    await initializeI18n('zh-CN')
  })

  afterEach(cleanup)

  it('opens panel and reports single selection then closes', () => {
    const onChange = vi.fn()
    render(<Select options={options} placeholder="请选择" onChange={onChange} />)
    fireEvent.click(screen.getByRole('combobox'))
    fireEvent.click(screen.getByRole('option', { name: '甲选项' }))
    expect(onChange).toHaveBeenCalledWith('a')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('keeps panel open in multiple mode and toggles values', () => {
    const onChange = vi.fn()
    render(<Select mode="multiple" options={options} value={['a']} onChange={onChange} />)
    fireEvent.click(screen.getByRole('combobox'))
    fireEvent.click(screen.getByRole('option', { name: /乙选项/ }))
    expect(onChange).toHaveBeenCalledWith(['a', 'b'])
    fireEvent.click(screen.getByRole('option', { name: /甲选项/ }))
    expect(onChange).toHaveBeenCalledWith([])
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('filters options locally with showSearch', () => {
    render(<Select showSearch options={options} value="a" onChange={() => {}} />)
    fireEvent.click(screen.getByRole('combobox'))
    fireEvent.change(screen.getByLabelText('搜索'), { target: { value: '乙' } })
    expect(screen.queryByRole('option', { name: /甲选项/ })).not.toBeInTheDocument()
    expect(screen.getByRole('option', { name: /乙选项/ })).toBeInTheDocument()
  })

  it('clears value via allowClear without opening panel', () => {
    const onChange = vi.fn()
    render(<Select allowClear options={options} value="a" onChange={onChange} />)
    fireEvent.click(screen.getByLabelText('清除'))
    expect(onChange).toHaveBeenCalledWith(undefined)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('ignores clicks on disabled options', () => {
    const onChange = vi.fn()
    render(<Select options={options} onChange={onChange} />)
    fireEvent.click(screen.getByRole('combobox'))
    fireEvent.click(screen.getByRole('option', { name: /丙禁用/ }))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('shows loading state and blocks opening', () => {
    render(<Select loading options={options} placeholder="请选择" onChange={() => {}} />)
    fireEvent.click(screen.getByRole('combobox'))
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('clears search query after single-mode pick so reopening shows all options', () => {
    render(<Select showSearch options={options} onChange={() => {}} />)
    const trigger = screen.getByRole('combobox')
    fireEvent.click(trigger)
    fireEvent.change(screen.getByLabelText('搜索'), { target: { value: '乙' } })
    fireEvent.click(screen.getByRole('option', { name: /乙选项/ }))
    fireEvent.click(trigger)
    expect(screen.getByRole('option', { name: /甲选项/ })).toBeInTheDocument()
  })

  it('clears to empty array in multiple mode via allowClear', () => {
    const onChange = vi.fn()
    render(
      <Select
        allowClear
        mode="multiple"
        options={options}
        value={['a', 'b']}
        onChange={onChange}
      />,
    )
    fireEvent.click(screen.getByLabelText('清除'))
    expect(onChange).toHaveBeenCalledWith([])
  })

  it('does not open the panel when the trigger is disabled', () => {
    render(<Select disabled options={options} placeholder="请选择" onChange={() => {}} />)
    fireEvent.click(screen.getByRole('combobox'))
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('opens with keyboard and moves option focus with arrow keys', () => {
    render(<Select options={options} placeholder="请选择" onChange={() => {}} />)
    const trigger = screen.getByRole('combobox')
    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    const listbox = screen.getByRole('listbox')
    expect(listbox).toBeInTheDocument()
    const [first, second] = screen.getAllByRole('option')
    first.focus()
    fireEvent.keyDown(listbox, { key: 'ArrowDown' })
    expect(second).toHaveFocus()
    fireEvent.keyDown(listbox, { key: 'ArrowUp' })
    expect(first).toHaveFocus()
    fireEvent.keyDown(listbox, { key: 'End' })
    // 丙禁用不可聚焦,End 落在最后一个可用项(乙)
    expect(second).toHaveFocus()
  })

  it('removes a multiple-mode tag through its real button', () => {
    const onChange = vi.fn()
    render(<Select mode="multiple" options={options} value={['a']} onChange={onChange} />)
    const remove = screen.getByLabelText('取消选择 甲选项')
    expect(remove.tagName).toBe('BUTTON')
    fireEvent.click(remove)
    expect(onChange).toHaveBeenCalledWith([])
  })
})
