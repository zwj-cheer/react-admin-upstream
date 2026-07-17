import type { PropsWithChildren } from 'react'
import { act, renderHook } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { parseListSearchParams, useListSearchParams } from './useListSearchParams'

function Router({ children }: PropsWithChildren) {
  return <MemoryRouter initialEntries={['/users?q=alice&page=3']}>{children}</MemoryRouter>
}

describe('useListSearchParams', () => {
  it('hydrates from the URL and resets pagination when the search changes', () => {
    const { result } = renderHook(useListSearchParams, { wrapper: Router })

    expect(result.current).toMatchObject({ query: 'alice', page: 3 })

    act(() => result.current.setQuery('bob'))

    expect(result.current).toMatchObject({ query: 'bob', page: 1 })
  })

  it('normalizes non-positive page numbers and writes valid pages', () => {
    const { result } = renderHook(useListSearchParams, { wrapper: Router })

    act(() => result.current.setPage(5))
    expect(result.current.page).toBe(5)

    act(() => result.current.setPage(1))
    expect(result.current.page).toBe(1)
  })
})

describe('parseListSearchParams', () => {
  it('parses query and positive integer page values', () => {
    expect(parseListSearchParams(new URLSearchParams('q=alice&page=3'))).toEqual({
      query: 'alice',
      page: 3,
    })
  })

  it.each(['', '0', '-1', '1.5', 'invalid'])(
    'normalizes an invalid page value %j to the first page',
    (page) => {
      expect(parseListSearchParams(new URLSearchParams({ page }))).toEqual({
        query: '',
        page: 1,
      })
    },
  )
})
