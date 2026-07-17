import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { DataTable, type DataTableColumn } from '@/components/common/DataTable'
import { initializeI18n } from '@/core/i18n'

interface Row {
  id: string
  name: string
  status: string
}

const rows: Row[] = [
  { id: '1', name: '甲', status: '启用' },
  { id: '2', name: '乙', status: '停用' },
]

const columns: DataTableColumn<Row>[] = [
  { key: 'name', header: '名称', cell: (row) => row.name },
  { key: 'status', header: '状态', cell: (row) => row.status },
]

describe('DataTable', () => {
  beforeAll(async () => {
    await initializeI18n('zh-CN')
  })

  afterEach(cleanup)

  it('通过 TanStack 行模型渲染桌面表格', () => {
    render(<DataTable columns={columns} getKey={(row) => row.id} items={rows} />)

    const table = screen.getByRole('table')
    expect(within(table).getAllByRole('columnheader')).toHaveLength(2)
    expect(within(table).getAllByRole('row')).toHaveLength(3)
    expect(within(table).getByText('甲')).toBeInTheDocument()
  })

  it('保留移动端卡片降级结构', () => {
    const { container } = render(
      <DataTable columns={columns} getKey={(row) => row.id} items={rows} />,
    )

    const cards = container.querySelectorAll('.mobile-data-card')
    expect(cards).toHaveLength(2)
    expect(within(cards[0] as HTMLElement).getByText('名称')).toBeInTheDocument()
    expect(within(cards[0] as HTMLElement).getByText('甲')).toBeInTheDocument()
  })
})
