import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Dropdown, type DropdownMenuItemDef } from '@/components/ui/dropdown-menu'

const items: DropdownMenuItemDef[] = [
  { key: 'edit', label: '编辑' },
  { key: 'd1', type: 'divider' },
  { key: 'remove', label: '删除', danger: true },
  { key: 'locked', label: '锁定', disabled: true },
]

function openMenu() {
  fireEvent.pointerDown(screen.getByRole('button', { name: '操作' }), {
    button: 0,
    ctrlKey: false,
    pointerType: 'mouse',
  })
}

describe('Dropdown', () => {
  afterEach(cleanup)

  it('opens on trigger click and reports item key through menu.onClick', () => {
    const onClick = vi.fn()
    render(
      <Dropdown menu={{ items, onClick }}>
        <button type="button">操作</button>
      </Dropdown>,
    )
    openMenu()
    fireEvent.click(screen.getByRole('menuitem', { name: '编辑' }))
    expect(onClick).toHaveBeenCalledWith('edit')
  })

  it('renders divider and marks danger item red', () => {
    render(
      <Dropdown menu={{ items }}>
        <button type="button">操作</button>
      </Dropdown>,
    )
    openMenu()
    expect(screen.getByRole('separator')).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: '删除' }).className).toContain('text-[var(--red)]')
  })

  it('ignores clicks on disabled items', () => {
    const onClick = vi.fn()
    render(
      <Dropdown menu={{ items, onClick }}>
        <button type="button">操作</button>
      </Dropdown>,
    )
    openMenu()
    fireEvent.click(screen.getByRole('menuitem', { name: '锁定' }))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('does not open when disabled', () => {
    render(
      <Dropdown disabled menu={{ items }}>
        <button type="button">操作</button>
      </Dropdown>,
    )
    openMenu()
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })
})
