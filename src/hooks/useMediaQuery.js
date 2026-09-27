import { useSyncExternalStore } from 'react'

// Phones: tables switch to compact column sets and fit the screen width.
export const COMPACT_QUERY = '(max-width: 640px)'

export function useMediaQuery(query) {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}
