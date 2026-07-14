import type { ReactNode } from 'react'

export interface DataTableColumn<T> {
  key: string
  header: string
  cell: (item: T) => ReactNode
}

export function DataTable<T>({
  items,
  columns,
  getKey,
}: {
  items: T[]
  columns: DataTableColumn<T>[]
  getKey: (item: T) => string
}) {
  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={getKey(item)}>
              {columns.map((column) => (
                <td key={column.key}>{column.cell(item)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
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
