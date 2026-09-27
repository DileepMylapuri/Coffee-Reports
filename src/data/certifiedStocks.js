// Data access for the certified stocks reports. Each dataset is fetched lazily on
// first use and cached for the session.
//
// By default the JSON files are served from /public. Set VITE_DATA_BASE_URL (e.g.
// "https://api.example.com/reports/") to load the same files from another origin.
const DATA_BASE_URL = (import.meta.env.VITE_DATA_BASE_URL || import.meta.env.BASE_URL).replace(/\/?$/, '/')

const MONTHS = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 }

// Source dates look like "24-Sep-2026".
export const toTime = (date) => {
  const [day, month, year] = date.split('-')
  return Date.UTC(Number(year), MONTHS[month], Number(day))
}

const byDateDesc = (a, b) => toTime(b.date) - toTime(a.date)

// The source isn't always clean (e.g. "6-Jun-2023", "011-Aug-2024", or just "0"
// in PortwiseCertifiedStocks.json). Returns the canonical "DD-Mon-YYYY", or null
// when the value can't be read as a date.
export function normalizeDate(raw) {
  const match = /^(\d{1,3})-([A-Z][a-z]{2})-(\d{4})$/.exec(String(raw).trim())
  if (!match || !(match[2] in MONTHS)) return null
  const day = Number(match[1])
  if (day < 1 || day > 31) return null
  return `${String(day).padStart(2, '0')}-${match[2]}-${match[3]}`
}

// Normalizes every record's date, drops (and reports) unreadable ones, newest first.
function cleanByDate(records, source) {
  const clean = []
  const skipped = []
  for (const record of records) {
    const date = normalizeDate(record.date)
    if (date) clean.push(date === record.date ? record : { ...record, date })
    else skipped.push(record)
  }
  if (skipped.length) console.warn(`${source}: skipped ${skipped.length} record(s) with unreadable dates`, skipped)
  return clean.sort(byDateDesc)
}

// Puts every port on the same date list so side-by-side tables stay aligned; a
// date a port has no record for becomes an empty row (rendered as "-").
function alignPorts(json) {
  const ports = json.map((p) => ({ ...p, report: cleanByDate(p.report, `PortwiseCertifiedStocks.json ${p.port}`) }))
  const dates = [...new Set(ports.flatMap((p) => p.report.map((r) => r.date)))]
    .map((date) => ({ date }))
    .sort(byDateDesc)
  return ports.map((p) => {
    const byDate = new Map(p.report.map((r) => [r.date, r]))
    return {
      ...p,
      report: dates.map(
        ({ date }) =>
          byDate.get(date) ?? { date, valid: null, comparedToPreDay: null, nonTenderable: null, suspended: null },
      ),
    }
  })
}

export const ARABICA_PORTS = [
  { key: 'antwerp', label: 'Antwerp' },
  { key: 'barcelona', label: 'Barcelona' },
  { key: 'hamburg', label: 'Hamburg' },
  { key: 'houston', label: 'Houston' },
  { key: 'miami', label: 'Miami' },
  { key: 'newOrleans', label: 'New Orleans' },
  { key: 'newYork', label: 'New York' },
  { key: 'virginia', label: 'Virginia' },
]

// Metric tons per exchange lot: ICE Robusta = 10 MT, ICE Arabica = 37,500 lb.
export const LOT_SIZE_MT = { robusta: 10, arabica: 17.0097 }

const SOURCES = {
  robustaTotal: {
    file: 'CertifiedStocksReports.json',
    normalize: (json) => cleanByDate(json.details, 'CertifiedStocksReports.json'),
  },
  robustaCountry: {
    file: 'AllCountryCertifiedStocks.json',
    normalize: (json) => cleanByDate(json, 'AllCountryCertifiedStocks.json'),
  },
  robustaPort: {
    file: 'PortwiseCertifiedStocks.json',
    normalize: alignPorts,
  },
  arabica: {
    file: 'Arabica.json',
    normalize: (json) => cleanByDate(json, 'Arabica.json'),
  },
}

const cache = new Map()

export function loadDataset(name) {
  if (!cache.has(name)) {
    const { file, normalize } = SOURCES[name]
    const promise = fetch(`${DATA_BASE_URL}${file}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load ${file} (HTTP ${res.status})`)
        return res.json()
      })
      .then(normalize)
    // Drop failed requests so a later visit can retry.
    promise.catch(() => cache.delete(name))
    cache.set(name, promise)
  }
  return cache.get(name)
}

const round2 = (n) => Math.round(n * 100) / 100
const sum = (items, pick) => items.reduce((total, item) => total + pick(item), 0)

export const arabicaRowTotal = (row) => round2(sum(ARABICA_PORTS, (p) => row[p.key]))

// Memoises a derivation per loaded dataset (and optional key), so switching tabs
// reuses the result instead of recomputing it over every day on each visit.
function perDataset(derive) {
  const results = new WeakMap()
  return (data, key = '') => {
    let byKey = results.get(data)
    if (!byKey) results.set(data, (byKey = new Map()))
    if (!byKey.has(key)) byKey.set(key, derive(data, key))
    return byKey.get(key)
  }
}

export const arabicaTotals = perDataset((days) =>
  days.map((day) => ({
    date: day.date,
    certifiedStocks: round2(sum(day.countryCertifiedData, arabicaRowTotal)),
    comparedToPreDay: round2(sum(day.countryCertifiedData, (r) => r.compareToPreDay)),
  })),
)

// Each day's origin rows with a per-origin TOTAL across ports.
export const arabicaCountryDays = perDataset((days) =>
  days.map((day) => ({
    date: day.date,
    rows: day.countryCertifiedData.map((r) => ({ ...r, total: arabicaRowTotal(r) })),
  })),
)

// The source has no per-port change, so derive it from the previous trading day.
export const arabicaPortSeries = perDataset((days, portKey) => {
  const values = days.map((day) => round2(sum(day.countryCertifiedData, (r) => r[portKey])))
  return days.map((day, i) => ({
    date: day.date,
    certifiedStocks: values[i],
    comparedToPreDay: i + 1 < values.length ? round2(values[i] - values[i + 1]) : null,
  }))
})

export function sumColumns(rows, keys) {
  return Object.fromEntries(keys.map((key) => [key, round2(sum(rows, (r) => r[key]))]))
}
