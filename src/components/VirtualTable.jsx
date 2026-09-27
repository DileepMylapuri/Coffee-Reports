import { useVirtualRows } from '../hooks/useVirtualRows'
import { Row, SpacerRow, TableHead } from './DataTable'

// A <table> that only mounts the rows in (and just around) the viewport. Two spacer
// rows stand in for everything above and below, so the scrollbar still reflects
// the full list while the DOM stays a constant size.
export default function VirtualTable({ columns, rows, rowKey, minWidth }) {
  const { scrollRef, items, paddingTop, paddingBottom } = useVirtualRows({
    count: rows.length,
    getItemKey: (index) => rowKey(rows[index]),
  })

  return (
    <div className="table-scroll" ref={scrollRef}>
      <table className="report-table" style={{ minWidth }} aria-rowcount={rows.length + 1}>
        <TableHead columns={columns} />
        <tbody>
          {paddingTop > 0 && <SpacerRow height={paddingTop} span={columns.length} />}
          {items.map((item) => (
            <Row key={item.key} index={item.index} columns={columns} row={rows[item.index]} />
          ))}
          {paddingBottom > 0 && <SpacerRow height={paddingBottom} span={columns.length} />}
        </tbody>
      </table>
    </div>
  )
}
