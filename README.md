# Coffee Reports – Certified Stocks

CoffeeWeb's Certified Stocks report: Robusta and Arabica stocks by day, by port and by country, in metric tons or lots. Built with React 19 and Vite.

## Running it

```bash
npm install
npm run dev       # development server with hot reload
npm run build     # production build in dist/
npm run preview   # serve the production build locally
npm run lint      # oxlint
```

Use `npm run build && npm run preview` when measuring performance. Development mode is several times slower.

## Views

| Tab | Robusta source | Arabica source |
|---|---|---|
| Total Certified Stocks | `CertifiedStocksReports.json` | totals derived from `Arabica.json` |
| All Country Certified Stocks | `AllCountryCertifiedStocks.json` (one block per day) | origin × port grid from `Arabica.json` |
| Portwise Certified Stocks | `PortwiseCertifiedStocks.json` (one table per port) | per-port series derived from `Arabica.json` |

Toggles in the blue bar switch between Robusta and Arabica, and between metric tons and lots. A lot is 10 MT for Robusta and 17.0097 MT (37,500 lb) for Arabica.

## Data source

By default the JSON files are served from `public/`. To load them from an API instead, set the base URL at build time:

```bash
# .env.production
VITE_DATA_BASE_URL=https://api.example.com/reports/
```

The app then requests `<VITE_DATA_BASE_URL>CertifiedStocksReports.json` and so on. The preload tag for the default dataset (see below) follows the same setting.

Dates are cleaned when the data loads (`src/data/certifiedStocks.js`):
- Readable variants such as `6-Jun-2023` or `011-Aug-2024` are normalized to `DD-Mon-YYYY`.
- Unreadable records are skipped and reported with `console.warn`.
- Portwise ports are aligned to one shared date list; a missing date shows `-`.

At the time of writing, `PortwiseCertifiedStocks.json` has 6 such records, including a Rotterdam record dated `"0"`. These should be fixed at the source.

## Hosting: enable compression

The JSON is very repetitive, so compression matters more than anything else on real networks:

| File | Raw | gzip | brotli |
|---|---|---|---|
| `Arabica.json` | 8.2 MB | 97 KB | 46 KB |
| `AllCountryCertifiedStocks.json` | 3.8 MB | 38 KB | 17 KB |
| `PortwiseCertifiedStocks.json` | 3.2 MB | 57 KB | 26 KB |
| `CertifiedStocksReports.json` | 241 KB | 11 KB | 7 KB |

Make sure the web server or CDN serves `.json` with gzip or brotli. Most CDNs do this by default; on nginx, enable `gzip on; gzip_types application/json;`.

## Performance design

The official page renders every row it receives (1,185+ per report), which on an average machine means tens of seconds and hundreds of thousands of DOM nodes for the All Country and Portwise views. This app keeps the DOM small whatever the data size:

- **Virtualized rendering** (`@tanstack/react-virtual`):
  - Total renders only the visible rows (`src/components/VirtualTable.jsx`).
  - All Country renders only the visible day blocks, each measured once rendered (`DateStack` in `src/components/reports/layouts.jsx`).
  - Portwise uses one row window shared by every port table, so dates stay aligned (`PortColumns`).
  - Rows are all the same height, so one sample row is measured, not every row (`src/hooks/useVirtualRows.js`).
- **Lazy, cached data:** each dataset is fetched on first use and cached for the session. Arabica derivations (totals, per-port series, row totals) are computed once per dataset, not on every tab switch.
- **Preloaded default dataset:** a Vite plugin (`vite.config.js`) adds `<link rel="preload">` for the first report, so it downloads in parallel with the JS.
- **Code splitting:** the Arabica views are a separate chunk, loaded when the user switches coffee.
- **Memoized rows and tables:** scrolling and toggles only re-render what changed.
- **Only the flags in use** are bundled from `flag-icons`, lazy-loaded as images.

Measured on production builds with a 4× CPU slowdown, against a render-everything build:

| Tab | Metric | Render everything | This app |
|---|---|---|---|
| Total | Open → table visible | ~2.9 s | ~1.0 s |
| Total | DOM nodes | 13,269 | 489 |
| All Country | Open tab | ~38–41 s | ~1.2 s |
| All Country | Memory | 65.6 MB | 3.0 MB |
| Portwise | Open tab | ~17–20 s | ~0.6–1.0 s |
| Portwise | Memory | 31.7 MB | 3.5 MB |
| All tabs | Metric tons ⇄ lots | 0.8–9 s | 60–210 ms |

## Responsive layout

| Width | Behaviour |
|---|---|
| > 1024 px | Full layout as on the CoffeeWeb site |
| 641–1024 px | ORIGIN shows flag + port. The country is in the tooltip, and the flag carries it |
| ≤ 640 px | Compact tables fit the screen: Total and Portwise need no sideways scroll. All Country drops SL NO and pins ORIGIN. Portwise shows one port per screen, and swiping snaps port to port ("2 / 13"). Short tab labels |

Wide tables keep their captions (date, port) centred in the visible area while scrolling sideways, using a CSS container query (`100cqw`).

## Project structure

```
src/
  App.jsx                    page shell, toggles, tabs, lazy Arabica views
  components/
    Header.jsx               CoffeeWeb header and main nav
    ReportShell.jsx          blue report bar + loading/error states
    DataTable.jsx            table primitives (Row, TableHead, SpacerRow, Table)
    VirtualTable.jsx         virtualized single table (Total)
    PlaceLabel.jsx           flag + place name, port captions
    reports/
      RobustaReports.jsx     Robusta views
      ArabicaReports.jsx     Arabica views (separate chunk)
      layouts.jsx            DateStack (All Country), PortColumns (Portwise)
      columns.jsx            shared column helpers
  data/
    certifiedStocks.js       loading, date cleaning, port alignment, Arabica derivations
    places.js                port/origin → country and flag
    useDataset.js            data hook
  hooks/
    useVirtualRows.js        shared row virtualization
    useMediaQuery.js         phone breakpoint
```

To add a report view, write a component that takes `{ bar, toUnit, compact }`, uses `useDataset`, and renders one of `VirtualTable`, `DateStack` or `PortColumns`. Then register it in `VIEWS` in `App.jsx`.
