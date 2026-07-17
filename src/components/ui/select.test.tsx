import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select'

describe('Select', () => {
  it('delegates keyboard and selection behavior to the Radix primitive', () => {
    const onValueChange = vi.fn()
    render(
      <Select value="a" onValueChange={onValueChange}>
        <SelectTrigger aria-label="选项">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="a">甲选项</SelectItem>
            <SelectItem value="b">乙选项</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>,
    )

    fireEvent.click(screen.getByRole('combobox', { name: '选项' }))
    fireEvent.click(screen.getByRole('option', { name: '乙选项' }))

    expect(onValueChange).toHaveBeenCalledWith('b')
  })
})
