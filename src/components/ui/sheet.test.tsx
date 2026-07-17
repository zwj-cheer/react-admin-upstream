import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { initializeI18n } from '@/core/i18n'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from './sheet'

describe('Sheet', () => {
  it('provides a titled modal surface and closes with Escape', async () => {
    await initializeI18n('zh-CN')
    render(
      <Sheet>
        <SheetTrigger>打开</SheetTrigger>
        <SheetContent>
          <SheetTitle>主导航</SheetTitle>
        </SheetContent>
      </Sheet>,
    )

    fireEvent.click(screen.getByRole('button', { name: '打开' }))
    expect(screen.getByRole('dialog', { name: '主导航' })).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog', { name: '主导航' })).not.toBeInTheDocument()
  })
})
