import { useMemo, useState, type ComponentProps, type ReactNode } from 'react'
import { Icon } from '@/components/ui/icon'
import { useTranslation } from 'react-i18next'
import { Checkbox } from '@/components/ui/checkbox'
import { Pagination } from '@/components/ui/pagination'
import { Spin } from '@/components/ui/spin'
import { cn } from '@/core/utils'

/* ------------------------------------------------------------------ */
/* 低层基元（shadcn 形态），供 DataTable 等组合层复用                    */
/* ------------------------------------------------------------------ */

export function TableRoot({ className, ...props }: ComponentProps<'table'>) {
  return (
    <div
      data-slot="table-wrap"
      className="relative w-full overflow-x-auto rounded-[14px] border border-[var(--border)] bg-[var(--card)]"
    >
      <table
        data-slot="table"
        className={cn('w-full border-collapse text-[13px]', className)}
        {...props}
      />
    </div>
  )
}

export function TableHeader({ className, ...props }: ComponentProps<'thead'>) {
  return <thead data-slot="table-header" className={cn(className)} {...props} />
}

export function TableBody({ className, ...props }: ComponentProps<'tbody'>) {
  return (
    <tbody
      data-slot="table-body"
      className={cn('[&_tr:last-child>td]:border-b-0', className)}
      {...props}
    />
  )
}

export function TableFooter({ className, ...props }: ComponentProps<'tfoot'>) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn('border-t border-[var(--border)] font-medium', className)}
      {...props}
    />
  )
}

export function TableRow({ className, ...props }: ComponentProps<'tr'>) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        'transition-colors hover:bg-[color-mix(in_srgb,var(--gold-light)_35%,transparent)] data-[state=selected]:bg-[var(--gold-light)]',
        className,
      )}
      {...props}
    />
  )
}

export function TableHead({ className, ...props }: ComponentProps<'th'>) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        'border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_70%,var(--card))] px-4 py-3 text-left align-middle text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--t3)]',
        className,
      )}
      {...props}
    />
  )
}

export function TableCell({ className, ...props }: ComponentProps<'td'>) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        'border-b border-[var(--border)] px-4 py-[15px] align-middle text-[var(--t2)]',
        className,
      )}
      {...props}
    />
  )
}

export function TableCaption({ className, ...props }: ComponentProps<'caption'>) {
  return (
    <caption
      data-slot="table-caption"
      className={cn('mt-4 text-[13px] text-[var(--t3)]', className)}
      {...props}
    />
  )
}

/* ------------------------------------------------------------------ */
/* 高层 Table：参数与交互对齐 Ant Design Table 的常用子集               */
/* ------------------------------------------------------------------ */

/** 排序方向：升序 / 降序 / 未排序（对齐 antd 的 sortOrder） */
export type SortOrder = 'ascend' | 'descend' | null

/** 表格列定义（对齐 antd ColumnType 的常用子集） */
export interface TableColumn<T> {
  /** 列的稳定标识，用作 React key 与排序回调标识，需在同一表格内唯一 */
  key: string
  /** 表头内容，调用方负责走 i18n */
  title: ReactNode
  /** 直接取行数据某个字段展示；与 render 同时提供时 render 优先 */
  dataIndex?: keyof T
  /** 自定义单元格渲染，入参为（dataIndex 取到的值, 整行数据, 行下标） */
  render?: (value: unknown, record: T, index: number) => ReactNode
  /** 列宽，数字按 px 处理；未设置时自动分配 */
  width?: number | string
  /** 水平对齐方式，默认 'left' */
  align?: 'left' | 'center' | 'right'
  /**
   * 排序配置：传比较函数则本地排序；传 true 表示服务端排序，
   * 点击表头只切换方向并通过 onSortChange 通知调用方
   */
  sorter?: boolean | ((a: T, b: T) => number)
  /** 附加到该列所有单元格（含表头）的类名 */
  className?: string
}

/** 分页配置（对齐 antd pagination 的受控用法） */
export interface TablePagination {
  /** 当前页码，从 1 开始 */
  current: number
  /** 每页条数 */
  pageSize: number
  /** 总条数；服务端分页时必传，本地分页可省略（取 dataSource.length） */
  total?: number
  /** 页码变化回调 */
  onChange: (page: number) => void
}

/** 行选择配置（对齐 antd rowSelection 的受控用法） */
export interface TableRowSelection<T> {
  /** 当前选中行的 key 集合（受控） */
  selectedRowKeys: string[]
  /** 选中集合变化回调，入参为（新的 key 集合, 对应的行数据） */
  onChange: (keys: string[], rows: T[]) => void
}

/** Table 组件属性 */
export interface TableProps<T> {
  /** 列定义数组 */
  columns: TableColumn<T>[]
  /** 数据行数组 */
  dataSource: T[]
  /** 从单行数据取稳定唯一 key 的函数 */
  rowKey: (record: T) => string
  /** 加载中：在表体上覆盖半透明 loading 层 */
  loading?: boolean
  /** 分页：传 false 关闭；省略时不分页（由调用方外部分页） */
  pagination?: TablePagination | false
  /** 行选择：提供后在首列渲染复选框（含表头全选，支持半选态） */
  rowSelection?: TableRowSelection<T>
  /** 尺寸密度，'small' 收紧行高，默认 'middle' */
  size?: 'middle' | 'small'
  /** 服务端排序时的方向变化回调（配合 sorter: true 使用） */
  onSortChange?: (columnKey: string, order: SortOrder) => void
  /** 行点击回调 */
  onRowClick?: (record: T) => void
  /** 空数据占位内容，默认取 i18n 的 common.empty */
  emptyText?: ReactNode
  /** 附加到 table 元素的类名 */
  className?: string
}

const ALIGN: Record<string, string> = { center: 'text-center', right: 'text-right' }

function SortIcon({ order }: { order: SortOrder }) {
  return (
    <span aria-hidden className="inline-flex flex-col leading-none text-[var(--icon)]">
      <Icon
        className={cn('-mb-0.5', order === 'ascend' && 'text-[var(--gold)]')}
        name="chevron-up"
        size={11}
      />
      <Icon
        className={cn(order === 'descend' && 'text-[var(--gold)]')}
        name="chevron-down"
        size={11}
      />
    </span>
  )
}

/**
 * 数据表格：参数与交互对齐 Ant Design Table 常用子集
 * （columns/dataSource/rowKey/loading/pagination/rowSelection/sorter），
 * 视觉沿用模板令牌体系：圆角卡片容器、浅底大写表头、行 hover、居中分页。
 */
export function Table<T>({
  columns,
  dataSource,
  rowKey,
  loading,
  pagination,
  rowSelection,
  size = 'middle',
  onSortChange,
  onRowClick,
  emptyText,
  className,
}: TableProps<T>) {
  const { t } = useTranslation()
  const [sort, setSort] = useState<{ key: string; order: SortOrder }>({ key: '', order: null })

  const sorted = useMemo(() => {
    const column = columns.find((item) => item.key === sort.key)
    if (!sort.order || typeof column?.sorter !== 'function') return dataSource
    const compare = column.sorter
    const flip = sort.order === 'descend' ? -1 : 1
    return [...dataSource].sort((a, b) => compare(a, b) * flip)
  }, [columns, dataSource, sort])

  const total = pagination ? (pagination.total ?? dataSource.length) : dataSource.length
  const rows =
    pagination && dataSource.length > pagination.pageSize
      ? sorted.slice(
          (pagination.current - 1) * pagination.pageSize,
          pagination.current * pagination.pageSize,
        )
      : sorted

  const selected = new Set(rowSelection?.selectedRowKeys)
  const allChecked = rows.length > 0 && rows.every((row) => selected.has(rowKey(row)))
  const someChecked = rows.some((row) => selected.has(rowKey(row)))
  const emitSelection = (keys: Set<string>) => {
    rowSelection?.onChange(
      [...keys],
      dataSource.filter((row) => keys.has(rowKey(row))),
    )
  }
  const toggleAll = (checked: boolean) => {
    const keys = new Set(rowSelection?.selectedRowKeys)
    for (const row of rows) {
      if (checked) keys.add(rowKey(row))
      else keys.delete(rowKey(row))
    }
    emitSelection(keys)
  }

  const cellPad = size === 'small' ? 'py-2' : undefined
  const colSpan = columns.length + (rowSelection ? 1 : 0)

  return (
    <div className="min-w-0">
      <Spin spinning={Boolean(loading)}>
        <TableRoot className={className}>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {rowSelection && (
                <TableHead className="w-10 pr-0">
                  <Checkbox
                    aria-label={t('common.selectAll')}
                    checked={allChecked ? true : someChecked ? 'indeterminate' : false}
                    onCheckedChange={(checked) => toggleAll(checked === true)}
                  />
                </TableHead>
              )}
              {columns.map((column) => {
                const order = sort.key === column.key ? sort.order : null
                const cycleSort = () => {
                  const next: SortOrder =
                    order === 'ascend' ? 'descend' : order === 'descend' ? null : 'ascend'
                  setSort({ key: column.key, order: next })
                  if (column.sorter === true) onSortChange?.(column.key, next)
                }
                return (
                  <TableHead
                    key={column.key}
                    aria-sort={
                      order === 'ascend'
                        ? 'ascending'
                        : order === 'descend'
                          ? 'descending'
                          : undefined
                    }
                    className={cn(ALIGN[column.align ?? 'left'], column.className)}
                    style={{ width: column.width }}
                  >
                    {column.sorter ? (
                      <button
                        className="inline-flex cursor-pointer select-none items-center gap-1 border-0 bg-transparent p-0 font-[inherit] text-inherit [font-size:inherit] [letter-spacing:inherit] [text-transform:inherit]"
                        type="button"
                        onClick={cycleSort}
                      >
                        {column.title}
                        <SortIcon order={order} />
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1">{column.title}</span>
                    )}
                  </TableHead>
                )
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell className="py-12 text-center text-[var(--t3)]" colSpan={colSpan}>
                  {emptyText ?? t('common.empty')}
                </TableCell>
              </TableRow>
            )}
            {rows.map((row, index) => {
              const key = rowKey(row)
              return (
                <TableRow
                  key={key}
                  data-state={selected.has(key) ? 'selected' : undefined}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {rowSelection && (
                    <TableCell className={cn('w-10 pr-0', cellPad)}>
                      <Checkbox
                        aria-label={t('common.selectRow')}
                        checked={selected.has(key)}
                        onCheckedChange={(checked) => {
                          const keys = new Set(rowSelection.selectedRowKeys)
                          if (checked === true) keys.add(key)
                          else keys.delete(key)
                          emitSelection(keys)
                        }}
                        onClick={(event) => event.stopPropagation()}
                      />
                    </TableCell>
                  )}
                  {columns.map((column) => {
                    const value = column.dataIndex ? row[column.dataIndex] : undefined
                    return (
                      <TableCell
                        key={column.key}
                        className={cn(ALIGN[column.align ?? 'left'], cellPad, column.className)}
                      >
                        {column.render ? column.render(value, row, index) : (value as ReactNode)}
                      </TableCell>
                    )
                  })}
                </TableRow>
              )
            })}
          </TableBody>
        </TableRoot>
      </Spin>
      {pagination && (
        <Pagination
          className="mt-4"
          current={pagination.current}
          pageSize={pagination.pageSize}
          showTotal
          total={total}
          onChange={pagination.onChange}
        />
      )}
    </div>
  )
}
