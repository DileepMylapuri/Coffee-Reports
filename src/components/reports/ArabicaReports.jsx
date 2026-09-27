import { useMemo } from 'react'
import { ARABICA_PORTS, arabicaCountryDays, arabicaPortSeries, arabicaTotals } from '../../data/certifiedStocks'
import { ARABICA_PORT_PLACES, originFlag } from '../../data/places'
import { useDataset } from '../../data/useDataset'
import PlaceLabel, { PortCaption } from '../PlaceLabel'
import ReportShell from '../ReportShell'
import VirtualTable from '../VirtualTable'
import { dateColumn, quantityColumn, withWidths } from './columns'
import { DateStack, PortColumns } from './layouts'

const seriesColumns = (toUnit, stockLabel) => [
  dateColumn,
  quantityColumn('certifiedStocks', stockLabel, toUnit, 'comparedToPreDay'),
  quantityColumn('comparedToPreDay', 'COMPARE TO PRE DAY', toUnit, 'comparedToPreDay'),
]

// Derived rows (totals, per-port series, row totals) are cached per loaded dataset
// in the data layer, so these views don't recompute them on every tab switch.

export function ArabicaTotal({ bar, toUnit, compact }) {
  const status = useDataset('arabica')
  const rows = status.data && arabicaTotals(status.data)
  const columns = useMemo(() => seriesColumns(toUnit, 'CERTIFIED STOCKS'), [toUnit])

  return (
    <ReportShell bar={bar} title="TOTAL CERTIFIED STOCKS" status={status}>
      {rows && (
        <VirtualTable columns={columns} rows={rows} rowKey={(r) => r.date} minWidth={compact ? undefined : 560} />
      )}
    </ReportShell>
  )
}

const COUNTRY_TOTAL_KEYS = [...ARABICA_PORTS.map((p) => p.key), 'total', 'compareToPreDay']

export function ArabicaAllCountry({ bar, toUnit, compact }) {
  const status = useDataset('arabica')
  const days = status.data && arabicaCountryDays(status.data)

  // Phones drop SL NO and pin ORIGIN; the eight port columns scroll beside it.
  const columns = useMemo(
    () => [
      ...(compact ? [] : [{ key: 'slNo', label: 'SL NO', width: '5%' }]),
      {
        key: 'origin',
        label: 'ORIGIN',
        width: compact ? '19%' : '17%',
        sticky: compact,
        render: (r) => (r.slNo != null ? <PlaceLabel flag={originFlag(r.origin)} name={r.origin} /> : r.origin),
      },
      ...ARABICA_PORTS.map((p) => quantityColumn(p.key, p.label.toUpperCase(), toUnit)),
      quantityColumn('total', 'TOTAL', toUnit, 'compareToPreDay'),
      { ...quantityColumn('compareToPreDay', 'COMPARE TO PRE DAY', toUnit, 'compareToPreDay'), width: '10%' },
    ],
    [toUnit, compact],
  )

  return (
    <ReportShell bar={bar} title="ALL COUNTRY CERTIFIED STOCKS" status={status}>
      {days && (
        <DateStack
          days={days}
          columns={columns}
          rowKey={(r) => r.origin}
          totalKeys={COUNTRY_TOTAL_KEYS}
          totalLabelKey="origin"
          minWidth={compact ? 1000 : 1400}
        />
      )}
    </ReportShell>
  )
}

// Fixed-layout port tables need explicit column widths.
const PORT_WIDTHS = { date: '36%', certifiedStocks: '26%', comparedToPreDay: '38%' }

export function ArabicaPortwise({ bar, toUnit, compact }) {
  const status = useDataset('arabica')

  const ports = useMemo(
    () =>
      status.data &&
      ARABICA_PORTS.map(({ key, label }, i) => {
        const { flag, country } = ARABICA_PORT_PLACES[key]
        return {
          id: key,
          caption: (
            <PortCaption
              flag={flag}
              name={label.toUpperCase()}
              country={country.toUpperCase()}
              position={`${i + 1} / ${ARABICA_PORTS.length}`}
            />
          ),
          rows: arabicaPortSeries(status.data, key),
        }
      }),
    [status.data],
  )

  const columns = useMemo(() => withWidths(seriesColumns(toUnit, 'VALID'), PORT_WIDTHS), [toUnit])

  return (
    <ReportShell bar={bar} title="PORT WISE CERTIFIED STOCKS" status={status}>
      {ports && <PortColumns ports={ports} columns={columns} tableWidth={560} compact={compact} />}
    </ReportShell>
  )
}
