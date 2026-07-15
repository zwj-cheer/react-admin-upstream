import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { initializeI18n } from '@/core/i18n'
import { Popconfirm } from '@/components/ui/popconfirm'

function renderConfirm(props: Partial<Parameters<typeof Popconfirm>[0]> = {}) {
  return render(
    <Popconfirm title="确定删除该行？" onConfirm={() => {}} {...props}>
      <button type="button">删除</button>
    </Popconfirm>,
  )
}

describe('Popconfirm', () => {
  beforeAll(async () => {
    await initializeI18n('zh-CN')
  })

  afterEach(cleanup)

  it('opens on trigger click and confirms then closes', async () => {
    const onConfirm = vi.fn()
    renderConfirm({ onConfirm })
    fireEvent.click(screen.getByRole('button', { name: '删除' }))
    expect(screen.getByText('确定删除该行？')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '确认' }))
    expect(onConfirm).toHaveBeenCalledOnce()
    await waitFor(() => expect(screen.queryByText('确定删除该行？')).not.toBeInTheDocument())
  })

  it('cancels through the cancel button', async () => {
    const onCancel = vi.fn()
    renderConfirm({ onCancel })
    fireEvent.click(screen.getByRole('button', { name: '删除' }))
    fireEvent.click(screen.getByRole('button', { name: '取消' }))
    expect(onCancel).toHaveBeenCalledOnce()
    await waitFor(() => expect(screen.queryByText('确定删除该行？')).not.toBeInTheDocument())
  })

  it('keeps the panel open while async confirm is pending and on rejection', async () => {
    let reject!: (reason: unknown) => void
    const onConfirm = vi.fn(
      () =>
        new Promise<void>((_, r) => {
          reject = r
        }),
    )
    renderConfirm({ onConfirm })
    fireEvent.click(screen.getByRole('button', { name: '删除' }))
    fireEvent.click(screen.getByRole('button', { name: '确认' }))
    await waitFor(() => expect(screen.getByRole('button', { name: '确认' })).toBeDisabled())
    reject(new Error('fail'))
    await waitFor(() => expect(screen.getByRole('button', { name: '确认' })).toBeEnabled())
    expect(screen.getByText('确定删除该行？')).toBeInTheDocument()
  })

  it('waits for async confirm success before closing', async () => {
    let resolve!: () => void
    const onConfirm = vi.fn(
      () =>
        new Promise<void>((r) => {
          resolve = r
        }),
    )
    renderConfirm({ onConfirm })
    fireEvent.click(screen.getByRole('button', { name: '删除' }))
    fireEvent.click(screen.getByRole('button', { name: '确认' }))
    expect(screen.getByText('确定删除该行？')).toBeInTheDocument()
    resolve()
    await waitFor(() => expect(screen.queryByText('确定删除该行？')).not.toBeInTheDocument())
  })

  it('renders danger variant with custom texts', () => {
    renderConfirm({ okDanger: true, okText: '移除', cancelText: '保留' })
    fireEvent.click(screen.getByRole('button', { name: '删除' }))
    expect(screen.getByRole('button', { name: '保留' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '移除' }).className).toContain('bg-[var(--red)]')
  })

  it('does not close a reopened panel when a stale async confirm resolves', async () => {
    let resolve!: () => void
    const onConfirm = vi.fn(
      () =>
        new Promise<void>((r) => {
          resolve = r
        }),
    )
    renderConfirm({ onConfirm })
    fireEvent.click(screen.getByRole('button', { name: '删除' }))
    fireEvent.click(screen.getByRole('button', { name: '确认' }))
    // pending 中取消关闭面板,再重开新会话
    fireEvent.click(screen.getByRole('button', { name: '取消' }))
    await waitFor(() => expect(screen.queryByText('确定删除该行？')).not.toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: '删除' }))
    expect(screen.getByText('确定删除该行？')).toBeInTheDocument()
    // 旧 Promise resolve:新面板必须保持打开
    resolve()
    await waitFor(() => expect(onConfirm).toHaveBeenCalledOnce())
    expect(screen.getByText('确定删除该行？')).toBeInTheDocument()
  })
})
