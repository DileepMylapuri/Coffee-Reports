import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import Header from './components/Header'
import ReportShell from './components/ReportShell'
import { RobustaAllCountry, RobustaPortwise, RobustaTotal } from './components/reports/RobustaReports'
import { LOT_SIZE_MT } from './data/certifiedStocks'
import { COMPACT_QUERY, useMediaQuery } from './hooks/useMediaQuery'
import './App.css'

const TABS = [
  { id: 'total', label: 'Total Certified Stocks', short: 'Total', title: 'TOTAL CERTIFIED STOCKS' },
  { id: 'country', label: 'All Country Certified Stocks', short: 'All Country', title: 'ALL COUNTRY CERTIFIED STOCKS' },
  { id: 'port', label: 'Portwise Certified Stocks', short: 'Portwise', title: 'PORT WISE CERTIFIED STOCKS' },
]

// Robusta is the default view, so it ships in the main bundle; the Arabica views
// are split into their own chunk and only downloaded when someone switches coffee.
const loadArabica = () => import('./components/reports/ArabicaReports')
const lazyArabica = (name) => lazy(() => loadArabica().then((m) => ({ default: m[name] })))

const VIEWS = {
  robusta: { total: RobustaTotal, country: RobustaAllCountry, port: RobustaPortwise },
  arabica: {
    total: lazyArabica('ArabicaTotal'),
    country: lazyArabica('ArabicaAllCountry'),
    port: lazyArabica('ArabicaPortwise'),
  },
}

const UNIT_LABELS = { mt: 'METRIC TONS', lots: 'LOTS' }

function readStoredTheme() {
  try {
    return localStorage.getItem('theme') === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

export default function App() {
  const [theme, setTheme] = useState(readStoredTheme)
  const [coffee, setCoffee] = useState('robusta')
  const [unit, setUnit] = useState('mt')
  const [tab, setTab] = useState('total')
  const compact = useMediaQuery(COMPACT_QUERY)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem('theme', theme)
    } catch {
      // Storage unavailable (private mode); the theme just won't persist.
    }
  }, [theme])

  const lotSize = LOT_SIZE_MT[coffee]
  const toUnit = useCallback((mt) => (unit === 'lots' ? mt / lotSize : mt), [unit, lotSize])

  const bar = {
    coffee,
    onToggleCoffee: () => setCoffee((c) => (c === 'robusta' ? 'arabica' : 'robusta')),
    unitLabel: UNIT_LABELS[unit],
    onToggleUnit: () => setUnit((u) => (u === 'mt' ? 'lots' : 'mt')),
  }

  const View = VIEWS[coffee][tab]
  const activeTab = TABS.find((t) => t.id === tab)

  return (
    <div className="app">
      <Header theme={theme} onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))} />

      <main className="page">
        <div className="page-head">
          <h1>Coffee Reports</h1>
          <select className="report-picker" aria-label="Report" defaultValue="certified-stocks">
            <option value="certified-stocks">Certified Stocks Report</option>
          </select>
        </div>

        <Suspense fallback={<ReportShell bar={bar} title={activeTab.title} status={{ loading: true }} />}>
          <View key={`${coffee}-${tab}`} bar={bar} toUnit={toUnit} compact={compact} />
        </Suspense>
      </main>

      <footer className="report-tabs-wrap">
        <div className="report-tabs" role="tablist" aria-label="Certified stocks views">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={tab === t.id ? 'active' : undefined}
              onClick={() => setTab(t.id)}
            >
              {compact ? t.short : t.label}
            </button>
          ))}
        </div>
      </footer>
    </div>
  )
}
