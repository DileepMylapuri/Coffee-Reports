import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// The report shown first (Robusta › Total Certified Stocks). Keep in sync with
// SOURCES.robustaTotal in src/data/certifiedStocks.js.
const DEFAULT_DATASET = 'CertifiedStocksReports.json'

// Starts downloading the default dataset from index.html, in parallel with the JS
// bundle, instead of only after React has mounted and requested it.
function preloadDefaultDataset(dataBaseUrl) {
  return {
    name: 'preload-default-dataset',
    transformIndexHtml: () => [
      {
        tag: 'link',
        attrs: {
          rel: 'preload',
          href: `${dataBaseUrl.replace(/\/?$/, '/')}${DEFAULT_DATASET}`,
          as: 'fetch',
          // Matches fetch()'s default mode so the browser reuses this response.
          crossorigin: 'anonymous',
        },
        injectTo: 'head',
      },
    ],
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const base = '/'
  return {
    base,
    plugins: [react(), preloadDefaultDataset(env.VITE_DATA_BASE_URL || base)],
  }
})
