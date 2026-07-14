import { describe, expect, it } from 'vitest'
import { authorize } from './authorize'

describe('authorize', () => {
  it('denies missing, empty, and unknown capabilities', () => {
    expect(authorize(undefined, 'users:read')).toBe(false)
    expect(authorize([], 'users:read')).toBe(false)
    expect(authorize(['users:read'], 'roles:read')).toBe(false)
  })

  it('allows an exact capability match', () => {
    expect(authorize(['users:read'], 'users:read')).toBe(true)
  })
})
