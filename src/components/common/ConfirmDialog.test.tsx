import { fireEvent, render, screen } from '@testing-library/react'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { initializeI18n } from '@/core/i18n'
import { ConfirmDialog } from './ConfirmDialog'

describe('ConfirmDialog', () => {
  beforeAll(async () => initializeI18n('zh-CN'))

  it('delegates async confirmation without closing before the caller succeeds', () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined)
    const onOpenChange = vi.fn()
    render(<ConfirmDialog open onConfirm={onConfirm} onOpenChange={onOpenChange} />)

    fireEvent.click(screen.getByRole('button', { name: '删除' }))

    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('disables both actions while confirmation is pending', () => {
    render(<ConfirmDialog open pending onConfirm={vi.fn()} onOpenChange={vi.fn()} />)

    expect(screen.getByRole('button', { name: '取消' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '删除' })).toBeDisabled()
  })
})
