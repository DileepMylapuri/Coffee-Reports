import { useEffect, useState } from 'react'
import { loadDataset } from './certifiedStocks'

export function useDataset(name) {
  const [results, setResults] = useState({})

  useEffect(() => {
    let active = true
    loadDataset(name).then(
      (data) => active && setResults((r) => ({ ...r, [name]: { data } })),
      (error) => active && setResults((r) => ({ ...r, [name]: { error } })),
    )
    return () => {
      active = false
    }
  }, [name])

  return results[name] ?? { loading: true }
}
