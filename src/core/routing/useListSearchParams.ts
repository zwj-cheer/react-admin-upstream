import { useSearchParams } from 'react-router'

/** 从 URL 参数解析列表查询词与页码；非法页码统一回退到 1。 */
export function parseListSearchParams(searchParams: URLSearchParams): {
  query: string
  page: number
} {
  const query = searchParams.get('q') ?? ''
  const rawPage = Number(searchParams.get('page'))
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1
  return { query, page }
}

/** 列表页 URL 状态；查询词与页码可复制、刷新和浏览器前进后退恢复。 */
export interface ListSearchParamsState {
  /** 当前搜索词；URL 参数缺失时为空字符串。 */
  query: string
  /** 当前页码，从 1 开始；非法 URL 值自动回退到 1。 */
  page: number
  /** 更新搜索词并把页码重置到 1。空字符串会移除 URL 参数。 */
  setQuery: (query: string) => void
  /** 更新页码；1 会移除 URL 参数，其他值写入 URL。 */
  setPage: (page: number) => void
}

/**
 * 统一管理后台列表的 `q`/`page` URL 参数。更新使用 replace，避免每次键入都污染浏览器历史。
 */
export function useListSearchParams(): ListSearchParamsState {
  const [searchParams, setSearchParams] = useSearchParams()
  const { query, page } = parseListSearchParams(searchParams)

  const setQuery = (nextQuery: string) => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current)
        if (nextQuery) next.set('q', nextQuery)
        else next.delete('q')
        next.delete('page')
        return next
      },
      { replace: true },
    )
  }

  const setPage = (nextPage: number) => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current)
        if (nextPage > 1) next.set('page', String(nextPage))
        else next.delete('page')
        return next
      },
      { replace: true },
    )
  }

  return { query, page, setQuery, setPage }
}
