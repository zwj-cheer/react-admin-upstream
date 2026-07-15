import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { initializeI18n } from '@/core/i18n'
import { Table, type TableColumn } from '@/components/ui/table'

interface Row {
  id: string
  name: string
  score: number
}

const rows: Row[] = [
  { id: '1', name: '甲', score: 30 },
  { id: '2', name: '乙', score: 10 },
  { id: '3', name: '丙', score: 20 },
]

const columns: TableColumn<Row>[] = [
  { key: 'name', title: '名称', dataIndex: 'name' },
  { key: 'score', title: '分数', dataIndex: 'score', sorter: (a, b) => a.score - b.score },
]

function bodyTexts() {
  const body = screen.getByRole('table').querySelector('tbody')!
  return [...body.querySelectorAll('tr')].map((tr) => tr.querySelector('td')?.textContent)
}

describe('Table', () => {
  beforeAll(async () => {
    await initializeI18n('zh-CN')
  })

  afterEach(cleanup)

  it('renders dataIndex values and custom render cells', () => {
    render(
      <Table
        columns={[
          ...columns,
          { key: 'x', title: '双倍', render: (_, record: Row) => `${record.score * 2}` },
        ]}
        dataSource={rows}
        rowKey={(row) => row.id}
      />,
    )
    expect(screen.getByText('甲')).toBeInTheDocument()
    expect(screen.getByText('60')).toBeInTheDocument()
  })

  it('cycles local sort ascend -> descend -> none on header click', () => {
    render(<Table columns={columns} dataSource={rows} rowKey={(row) => row.id} />)
    const header = screen.getByText('分数')
    fireEvent.click(header)
    expect(bodyTexts()).toEqual(['乙', '丙', '甲'])
    fireEvent.click(header)
    expect(bodyTexts()).toEqual(['甲', '丙', '乙'])
    fireEvent.click(header)
    expect(bodyTexts()).toEqual(['甲', '乙', '丙'])
  })

  it('notifies server-side sort via onSortChange when sorter is true', () => {
    const onSortChange = vi.fn()
    render(
      <Table
        columns={[{ key: 'name', title: '名称', dataIndex: 'name', sorter: true }]}
        dataSource={rows}
        rowKey={(row) => row.id}
        onSortChange={onSortChange}
      />,
    )
    fireEvent.click(screen.getByText('名称'))
    expect(onSortChange).toHaveBeenCalledWith('name', 'ascend')
  })

  it('paginates locally and reports page changes', () => {
    const onChange = vi.fn()
    render(
      <Table
        columns={columns}
        dataSource={rows}
        pagination={{ current: 1, pageSize: 2, onChange }}
        rowKey={(row) => row.id}
      />,
    )
    expect(bodyTexts()).toEqual(['甲', '乙'])
    expect(screen.getByText('上一页')).toBeDisabled()
    fireEvent.click(screen.getByText('下一页'))
    expect(onChange).toHaveBeenCalledWith(2)
  })

  it('selects rows and toggles all through the header checkbox', () => {
    const onChange = vi.fn()
    render(
      <Table
        columns={columns}
        dataSource={rows}
        rowKey={(row) => row.id}
        rowSelection={{ selectedRowKeys: ['1'], onChange }}
      />,
    )
    const body = screen.getByRole('table').querySelector('tbody')!
    expect(within(body).getAllByRole('checkbox')[0]).toBeChecked()
    fireEvent.click(screen.getByLabelText('全选'))
    expect(onChange).toHaveBeenCalledWith(['1', '2', '3'], rows)
  })

  it('shows empty text when dataSource is empty', () => {
    render(<Table columns={columns} dataSource={[]} rowKey={(row: Row) => row.id} />)
    expect(screen.getByText('暂无数据')).toBeInTheDocument()
  })
})
