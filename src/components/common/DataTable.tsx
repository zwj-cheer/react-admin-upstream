import type { ReactNode } from 'react'
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from '@/components/ui/table'

/** 表格列定义 */
export interface DataTableColumn<T> {
  /** 列的稳定标识，用作 React key，需在同一表格内唯一 */
  key: string
  /** 表头文案，调用方负责走 i18n */
  header: string
  /** 单元格渲染函数，接收当前行数据返回节点 */
  cell: (item: T) => ReactNode
}

/** DataTable 组件属性 */
export interface DataTableProps<T> {
  /** 数据行数组 */
  items: T[]
  /** 列定义数组 */
  columns: DataTableColumn<T>[]
  /** 从单行数据取稳定唯一 key 的函数 */
  getKey: (item: T) => string
}

/**
 * 数据表格：桌面端基于 shadcn Table 基元渲染，移动端自动切换为卡片列表。
 * 视觉样式由 `src/components/ui/table.tsx` 与 `src/styles/components.css` 的
 * `.mobile-data-*` 语义类提供，颜色统一引用设计令牌。
 */
export function DataTable<T>({ items, columns, getKey }: DataTableProps<T>) {
  return (
    <div className="data-table-wrap">
      <TableRoot className="data-table">
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key}>{column.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={getKey(item)}>
              {columns.map((column) => (
                <TableCell key={column.key}>{column.cell(item)}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </TableRoot>
      <div className="mobile-data-list">
        {items.map((item) => (
          <article className="mobile-data-card" key={getKey(item)}>
            {columns.map((column) => (
              <div className="mobile-data-row" key={column.key}>
                <span className="mobile-data-label">{column.header}</span>
                <div className="mobile-data-value">{column.cell(item)}</div>
              </div>
            ))}
          </article>
        ))}
      </div>
    </div>
  )
}
