import { formatDate, formatNumber, trendClass } from '../../utils/format'

// Not pinned: date tables fit the screen, and pinned cells in every row of the
// side-by-side port tables cost layout time for no benefit.
export const dateColumn = { key: 'date', label: 'DATE', render: (r) => formatDate(r.date) }

// A header that shows `short` on phones. The full text stays in the accessibility tree.
export const responsiveLabel = (full, short) => (
  <>
    <span className="label-full">{full}</span>
    <span className="label-short" aria-hidden="true">
      {short}
    </span>
  </>
)

// Applies per-column widths (by key) to a column list; keys not listed keep theirs.
export const withWidths = (columns, widths) =>
  columns.map((c) => (widths[c.key] ? { ...c, width: widths[c.key] } : c))

// A quantity column shown in the selected unit. When `trendKey` is set the value
// is coloured green/red by the sign of that day-over-day change.
export const quantityColumn = (key, label, toUnit, trendKey) => ({
  key,
  label,
  render: (r) => formatNumber(r[key] == null ? null : toUnit(r[key])),
  className: trendKey ? (r) => trendClass(r[trendKey]) : undefined,
})
