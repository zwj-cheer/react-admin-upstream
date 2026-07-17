import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Avatar, AvatarFallback } from './avatar'

describe('Avatar', () => {
  it('requires callers to provide an explicit accessible fallback', () => {
    render(
      <Avatar aria-label="Alice">
        <AvatarFallback>A</AvatarFallback>
      </Avatar>,
    )

    expect(screen.getByLabelText('Alice')).toHaveTextContent('A')
  })
})
