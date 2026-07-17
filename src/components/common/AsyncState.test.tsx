import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { initializeI18n } from '@/core/i18n'
import { AsyncState } from '@/components/common/AsyncState'

describe('AsyncState', () => {
  beforeAll(async () => {
    await initializeI18n('zh-CN')
  })

  afterEach(cleanup)

  it('renders the Spin indicator while loading', () => {
    render(
      <AsyncState loading>
        <p>content</p>
      </AsyncState>,
    )
    expect(screen.getByText('加载中…')).toBeInTheDocument()
    expect(screen.queryByText('content')).not.toBeInTheDocument()
  })

  it('renders the error state with a retry button that fires onRetry', () => {
    const onRetry = vi.fn()
    render(
      <AsyncState error onRetry={onRetry}>
        <p>content</p>
      </AsyncState>,
    )
    expect(screen.getByText('数据加载失败')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '重试' }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('renders Empty for the empty state', () => {
    render(
      <AsyncState empty>
        <p>content</p>
      </AsyncState>,
    )
    expect(screen.getByText('暂无数据')).toBeInTheDocument()
    expect(screen.queryByText('content')).not.toBeInTheDocument()
  })

  it('renders children when no state flag is set', () => {
    render(
      <AsyncState>
        <p>content</p>
      </AsyncState>,
    )
    expect(screen.getByText('content')).toBeInTheDocument()
  })
})
