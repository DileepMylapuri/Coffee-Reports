import { useVirtualizer } from '@tanstack/react-virtual'
import { useLayoutEffect, useRef, useState } from 'react'

const ESTIMATED_ROW_HEIGHT = 40
const OVERSCAN = 10

// Every row in our tables has the same height, so one sample row is measured (and
// re-measured on resize, since fonts change per breakpoint) instead of each row.
// Measuring every row forces a layout pass per measurement, which is expensive
// when several wide tables share the scroll area.
function useUniformRowHeight(scrollRef, hasRows) {
  const [height, setHeight] = useState(ESTIMATED_ROW_HEIGHT)
  useLayoutEffect(() => {
    const measure = () => {
      const row = scrollRef.current?.querySelector('tbody tr[data-index]')
      if (row) setHeight(row.getBoundingClientRect().height)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [scrollRef, hasRows])
  return height
}

// Windows `count` equal-height table rows inside a scroll container. Attach
// `scrollRef` to the container, render `items`, and put spacer rows of
// `paddingTop` / `paddingBottom` around them so the scroll height stays right.
export function useVirtualRows({ count, getItemKey }) {
  const scrollRef = useRef(null)
  const [hasRows, setHasRows] = useState(false)
  const rowHeight = useUniformRowHeight(scrollRef, hasRows)

  // Only relevant under React Compiler, which this project doesn't use.
  // oxlint-disable-next-line react/incompatible-library
  const virtualizer = useVirtualizer({
    count,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => rowHeight,
    getItemKey,
    overscan: OVERSCAN,
  })

  // A new row height invalidates the cached offsets.
  useLayoutEffect(() => virtualizer.measure(), [virtualizer, rowHeight])

  const items = virtualizer.getVirtualItems()
  if (!hasRows && items.length > 0) setHasRows(true)

  const paddingTop = items.length ? items[0].start : 0
  const paddingBottom = items.length ? virtualizer.getTotalSize() - items[items.length - 1].end : 0
  return { scrollRef, items, paddingTop, paddingBottom }
}
