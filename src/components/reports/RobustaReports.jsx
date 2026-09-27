import { useMemo } from 'react'
import { robustaPortPlace } from '../../data/places'
import { useDataset } from '../../data/useDataset'
import PlaceLabel, { PortCaption } from '../PlaceLabel'
import ReportShell from '../ReportShell'
import VirtualTable from '../VirtualTable'
import { dateColumn, quantityColumn, responsiveLabel, withWidths } from './columns'
import { DateStack, PortColumns } from './layouts'

const SUSPENDED_LABEL = responsiveLabel('SUSPENDED', 'SUSP.')

export function RobustaTotal({ bar, toUnit, compact }) {
  const status = useDataset('robustaTotal')

  const columns = useMemo(
    () => [
      dateColumn,
      quantityColumn('certifiedStocks', 'CERTIFIED STOCKS', toUnit, 'ComparedToPreDay'),
      quantityColumn('ComparedToPreDay', 'COMPARE TO PRE DAY', toUnit, 'ComparedToPreDay'),
      quantityColumn('nonTenderable', 'Non-Tenderable', toUnit),
      quantityColumn('suspended', SUSPENDED_LABEL, toUnit),
    ],
    [toUnit],
  )

  return (
    <ReportShell bar={bar} title="TOTAL CERTIFIED STOCKS" status={status}>
      {status.data && (
        <VirtualTable
          columns={columns}
          rows={status.data}
          rowKey={(r) => r.date}
          minWidth={compact ? undefined : 720}
        />
      )}
    </ReportShell>
  )
}

const COUNTRY_TOTAL_KEYS = ['valid', 'compareToPreDay', 'NonTenderable', 'suspend']

export function RobustaAllCountry({ bar, toUnit, compact }) {
  const status = useDataset('robustaCountry')

  const days = useMemo(
    () => status.data?.map((d) => ({ date: d.date, rows: d.countryCertifiedData })),
    [status.data],
  )

  // Phones drop SL NO and pin ORIGIN so the port stays visible while scrolling sideways.
  const columns = useMemo(
    () => [
      ...(compact ? [] : [{ key: 'slNo', label: 'SL NO', width: '6%' }]),
      {
        key: 'origin',
        label: 'ORIGIN',
        width: compact ? '32%' : '27%',
        sticky: compact,
        render: (r) => (r.slNo != null ? <PlaceLabel name={r.origin} {...robustaPortPlace(r.origin)} /> : r.origin),
      },
      quantityColumn('valid', 'VALID', toUnit, 'compareToPreDay'),
      {
        ...quantityColumn('compareToPreDay', 'COMPARE TO PRE DAY', toUnit, 'compareToPreDay'),
        width: compact ? undefined : '23%',
      },
      quantityColumn('NonTenderable', 'Non-Tenderable', toUnit),
      quantityColumn('suspend', SUSPENDED_LABEL, toUnit),
    ],
    [toUnit, compact],
  )

  return (
    <ReportShell bar={bar} title="ALL COUNTRY CERTIFIED STOCKS" status={status}>
      {days && (
        <DateStack
          days={days}
          columns={columns}
          rowKey={(r) => r.slNo}
          totalKeys={COUNTRY_TOTAL_KEYS}
          totalLabelKey="origin"
          minWidth={compact ? 520 : 980}
        />
      )}
    </ReportShell>
  )
}

// Fixed-layout port tables need explicit column widths.
const PORT_WIDTHS = { date: '18%', valid: '11%', comparedToPreDay: '30%', nonTenderable: '22%', suspended: '19%' }
const PORT_WIDTHS_COMPACT = { date: '28%', valid: '16%', comparedToPreDay: '20%', nonTenderable: '18%', suspended: '18%' }

export function RobustaPortwise({ bar, toUnit, compact }) {
  const status = useDataset('robustaPort')

  const ports = useMemo(
    () =>
      status.data?.map((p, i, all) => {
        const { flag, country } = robustaPortPlace(p.port)
        return {
          id: p.port,
          caption: (
            <PortCaption
              flag={flag}
              name={p.port}
              country={country?.toUpperCase()}
              position={`${i + 1} / ${all.length}`}
            />
          ),
          rows: p.report,
        }
      }),
    [status.data],
  )

  const columns = useMemo(
    () =>
      withWidths(
        [
          dateColumn,
          quantityColumn('valid', 'VALID', toUnit, 'comparedToPreDay'),
          quantityColumn('comparedToPreDay', 'COMPARE TO PRE DAY', toUnit, 'comparedToPreDay'),
          quantityColumn('nonTenderable', 'Non-Tenderable', toUnit),
          quantityColumn('suspended', SUSPENDED_LABEL, toUnit),
        ],
        compact ? PORT_WIDTHS_COMPACT : PORT_WIDTHS,
      ),
    [toUnit, compact],
  )

  return (
    <ReportShell bar={bar} title="PORT WISE CERTIFIED STOCKS" status={status}>
      {ports && <PortColumns ports={ports} columns={columns} tableWidth={940} compact={compact} />}
    </ReportShell>
  )
}
