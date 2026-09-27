import { memo } from 'react'

// `sticky` columns stay pinned to the left edge when a wide table scrolls sideways.
const cellClass = (column, row) => {
  const classes = [column.sticky && 'sticky-col', column.className?.(row)].filter(Boolean)
  return classes.length ? classes.join(' ') : undefined
}

function Cell({ column, row }) {
  return <td className={cellClass(column, row)}>{column.render ? column.render(row) : row[column.key]}</td>
}

// Memoised so revealing more rows doesn't re-render the ones already on screen.
// `ref` and `index` let a virtualizer measure the row and know which one it is;
// `headerRows` offsets the 1-based aria-rowindex past the header rows.
export const Row = memo(function Row({ columns, row, ref, index, headerRows = 1 }) {
  return (
    <tr ref={ref} data-index={index} aria-rowindex={index == null ? undefined : index + headerRows + 1}>
      {columns.map((c) => (
        <Cell key={c.key} column={c} row={row} />
      ))}
    </tr>
  )
})

// Stands in for virtualized rows that aren't mounted, keeping the scroll height right.
export function SpacerRow({ height, span }) {
  return (
    <tr className="spacer-row" aria-hidden="true">
      <td colSpan={span} style={{ height }} />
    </tr>
  )
}

export function TableHead({ columns, caption }) {
  return (
    <>
      <colgroup>
        {columns.map((c) => (
          <col key={c.key} className={`col-${c.key}`} style={{ width: c.width }} />
        ))}
      </colgroup>
      <thead>
        {caption && (
          <tr className="caption-row">
            {/* The inner box stays centred in the visible area when the table is wider than the screen. */}
            <th colSpan={columns.length}>
              <div className="caption-inner">{caption}</div>
            </th>
          </tr>
        )}
        <tr>
          {columns.map((c) => (
            <th key={c.key} scope="col" className={c.sticky ? 'sticky-col' : undefined}>
              {c.label}
            </th>
          ))}
        </tr>
      </thead>
    </>
  )
}

export function Table({ columns, rows, rowKey, footer, caption, className, minWidth }) {
  return (
    <table className={className ? `report-table ${className}` : 'report-table'} style={{ minWidth }}>
      <TableHead columns={columns} caption={caption} />
      <tbody>
        {rows.map((row) => (
          <Row key={rowKey(row)} columns={columns} row={row} />
        ))}
      </tbody>
      {footer && (
        <tfoot>
          <tr>
            {columns.map((c) => (
              <Cell key={c.key} column={c} row={footer} />
            ))}
          </tr>
        </tfoot>
      )}
    </table>
  )
}
