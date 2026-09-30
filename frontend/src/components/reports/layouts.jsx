import { useVirtualizer } from '@tanstack/react-virtual'
import { memo, useMemo, useRef } from 'react'
import { sumColumns } from '../../data/certifiedStocks'
import { formatDate } from '../../utils/format'
import { useVirtualRows } from '../../hooks/useVirtualRows'
import { Row, SpacerRow, Table, TableHead } from '../DataTable'

// Rough height of one day block (caption + header + TOTAL + gap, plus ~40px per row).
// Blocks are measured once rendered, so this only needs to be close.
const estimateDayHeight = (day) => 150 + day.rows.length * 40

const DayTable = memo(function DayTable({ day, columns, rowKey, totalKeys, totalLabelKey, minWidth }) {
  const footer = useMemo(
    () => ({ [totalLabelKey]: 'TOTAL', ...sumColumns(day.rows, totalKeys) }),
    [day, totalKeys, totalLabelKey],
  )
  return (
    <Table
      className="day-table"
      caption={formatDate(day.date)}
      columns={columns}
      rows={day.rows}
      rowKey={rowKey}
      footer={footer}
      minWidth={minWidth}
    />
  )
})

// One table per day, newest first, stacked vertically in a single scroll area.
// `days` is [{ date, rows }]; each table gets a TOTAL row summing `totalKeys`.
// Virtualized per day: only the blocks in (and just around) the viewport are
// mounted, and padding stands in for the rest so the scrollbar spans every day.
export function DateStack({ days, ...tableProps }) {
  const scrollRef = useRef(null)

  // Only relevant under React Compiler, which this project doesn't use.
  // oxlint-disable-next-line react/incompatible-library
  const virtualizer = useVirtualizer({
    count: days.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: (index) => estimateDayHeight(days[index]),
    getItemKey: (index) => days[index].date,
    overscan: 2,
  })

  const items = virtualizer.getVirtualItems()
  const paddingTop = items.length ? items[0].start : 0
  const paddingBottom = items.length ? virtualizer.getTotalSize() - items[items.length - 1].end : 0

  return (
    <div className="table-scroll" ref={scrollRef}>
      <div style={{ paddingTop, paddingBottom }}>
        {items.map((item) => (
          <div key={item.key} ref={virtualizer.measureElement} data-index={item.index} className="day-block">
            <DayTable day={days[item.index]} {...tableProps} />
          </div>
        ))}
      </div>
    </div>
  )
}

// Each port table has two header rows: the "PORT : …" caption and the column labels.
const PORT_HEADER_ROWS = 2

// Fixed layout with an explicit width: column widths come from the <col>s, so the
// browser doesn't have to measure every cell of every port table to lay them out.
const PortTable = memo(function PortTable({ port, columns, items, paddingTop, paddingBottom, width }) {
  return (
    <table
      className="report-table port-table"
      style={{ width }}
      aria-rowcount={port.rows.length + PORT_HEADER_ROWS}
    >
      <TableHead columns={columns} caption={port.caption} />
      <tbody>
        {paddingTop > 0 && <SpacerRow height={paddingTop} span={columns.length} />}
        {items.map((item) => (
          <Row
            key={item.key}
            index={item.index}
            headerRows={PORT_HEADER_ROWS}
            columns={columns}
            row={port.rows[item.index]}
          />
        ))}
        {paddingBottom > 0 && <SpacerRow height={paddingBottom} span={columns.length} />}
      </tbody>
    </table>
  )
})

// One table per port, side by side, sharing one scroll area so dates stay aligned.
// `ports` is [{ id, caption, rows }], with every port covering the same dates in
// the same order. One virtualizer windows the dates for all tables at once.
// On phones (`compact`) each table is one screen wide and swipes snap port to port.
export function PortColumns({ ports, columns, tableWidth, compact }) {
  const dates = ports[0]?.rows ?? []
  const { scrollRef, items, paddingTop, paddingBottom } = useVirtualRows({
    count: dates.length,
    getItemKey: (index) => dates[index].date,
  })

  return (
    <div className={compact ? 'table-scroll snap-x' : 'table-scroll'} ref={scrollRef}>
      <div className="port-columns">
        {ports.map((p) => (
          <PortTable
            key={p.id}
            port={p}
            columns={columns}
            items={items}
            paddingTop={paddingTop}
            paddingBottom={paddingBottom}
            width={compact ? undefined : tableWidth}
          />
        ))}
      </div>
    </div>
  )
}
