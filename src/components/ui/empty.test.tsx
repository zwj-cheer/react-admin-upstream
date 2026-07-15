import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { initializeI18n } from '@/core/i18n'
import { Empty } from '@/components/ui/empty'
import { Spin } from '@/components/ui/spin'

describe('Empty', () => {
  beforeAll(async () => {
    await initializeI18n('zh-CN')
  })

  afterEach(cleanup)

  it('falls back to i18n default description', () => {
    render(<Empty />)
    expect(screen.getByText('暂无数据')).toBeInTheDocument()
  })

  it('renders custom description, icon and children', () => {
    render(
      <Empty description="还没有角色" icon={<svg data-testid="ic" />}>
        <button type="button">新建</button>
      </Empty>,
    )
    expect(screen.getByText('还没有角色')).toBeInTheDocument()
    expect(screen.getByTestId('ic')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '新建' })).toBeInTheDocument()
  })
})

describe('Spin', () => {
  afterEach(cleanup)

  it('renders inline loading text in standalone mode and null when idle', () => {
    const { rerender, container } = render(<Spin spinning />)
    expect(screen.getByText('加载中…')).toBeInTheDocument()
    rerender(<Spin spinning={false} />)
    expect(container.firstChild).toBeNull()
  })

  it('overlays children only while spinning in wrap mode', () => {
    const { rerender } = render(
      <Spin spinning>
        <p>内容</p>
      </Spin>,
    )
    expect(screen.getByText('内容')).toBeInTheDocument()
    expect(screen.getByText('加载中…')).toBeInTheDocument()
    rerender(
      <Spin spinning={false}>
        <p>内容</p>
      </Spin>,
    )
    expect(screen.getByText('内容')).toBeInTheDocument()
    expect(screen.queryByText('加载中…')).not.toBeInTheDocument()
  })
})
