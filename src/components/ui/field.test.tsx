import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Field, FieldError, FieldGroup, FieldLabel } from './field'
import { Input } from './input'

describe('Field', () => {
  it('links labels, invalid styling metadata and accessible errors', () => {
    render(
      <FieldGroup>
        <Field data-invalid>
          <FieldLabel htmlFor="email">邮箱</FieldLabel>
          <Input id="email" aria-invalid />
          <FieldError>邮箱格式错误</FieldError>
        </Field>
      </FieldGroup>,
    )

    expect(screen.getByLabelText('邮箱')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('alert')).toHaveTextContent('邮箱格式错误')
  })
})
