import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ToggleGroup, ToggleGroupItem } from './toggle-group'

describe('ToggleGroup', () => {
  it('uses the Radix single-selection state machine', () => {
    const onValueChange = vi.fn()
    render(
      <ToggleGroup type="single" value="light" onValueChange={onValueChange}>
        <ToggleGroupItem value="light">浅色</ToggleGroupItem>
        <ToggleGroupItem value="dark">深色</ToggleGroupItem>
      </ToggleGroup>,
    )

    fireEvent.click(screen.getByRole('radio', { name: '深色' }))
    expect(onValueChange).toHaveBeenCalledWith('dark')
  })
})
