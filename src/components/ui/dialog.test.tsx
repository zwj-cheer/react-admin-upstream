import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { initializeI18n } from '@/core/i18n'
import { Modal } from '@/components/ui/dialog'

describe('Modal', () => {
  beforeAll(async () => {
    await initializeI18n('zh-CN')
  })

  afterEach(cleanup)

  it('renders default footer with i18n texts and fires onOk without closing', () => {
    const onOk = vi.fn()
    const onOpenChange = vi.fn()
    render(<Modal open title="确认操作" onOk={onOk} onOpenChange={onOpenChange} />)
    fireEvent.click(screen.getByRole('button', { name: '确认' }))
    expect(onOk).toHaveBeenCalledOnce()
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('closes through cancel button and calls onCancel first', () => {
    const order: string[] = []
    render(
      <Modal
        open
        title="t"
        onCancel={() => order.push('cancel')}
        onOpenChange={(next) => order.push(`open:${next}`)}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: '取消' }))
    expect(order).toEqual(['cancel', 'open:false'])
  })

  it('renders danger ok button and custom texts', () => {
    render(
      <Modal open okDanger okText="删除" cancelText="再想想" title="t" onOpenChange={() => {}} />,
    )
    expect(screen.getByRole('button', { name: '再想想' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '删除' })).toBeInTheDocument()
  })

  it('disables ok button while confirmLoading', () => {
    render(<Modal open confirmLoading title="t" onOpenChange={() => {}} />)
    expect(screen.getByRole('button', { name: '确认' })).toBeDisabled()
  })

  it('hides footer entirely with footer null', () => {
    render(
      <Modal open footer={null} title="t" onOpenChange={() => {}}>
        <p>正文</p>
      </Modal>,
    )
    expect(screen.getByText('正文')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '确认' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '取消' })).not.toBeInTheDocument()
  })

  it('renders custom footer ReactNode instead of default buttons', () => {
    render(
      <Modal
        open
        footer={<button type="button">自定义脚</button>}
        title="t"
        onOpenChange={() => {}}
      />,
    )
    expect(screen.getByRole('button', { name: '自定义脚' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '确认' })).not.toBeInTheDocument()
  })
})
