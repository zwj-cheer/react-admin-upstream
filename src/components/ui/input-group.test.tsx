import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from './input-group'

describe('InputGroup', () => {
  it('composes input adornments and actions without nesting buttons inside an input', () => {
    const onClear = vi.fn()
    render(
      <InputGroup>
        <InputGroupAddon>搜索</InputGroupAddon>
        <InputGroupInput aria-label="关键词" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton aria-label="清除" onClick={onClear} />
        </InputGroupAddon>
      </InputGroup>,
    )

    fireEvent.click(screen.getByRole('button', { name: '清除' }))
    expect(onClear).toHaveBeenCalledTimes(1)
  })
})
