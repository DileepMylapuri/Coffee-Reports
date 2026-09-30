const NUMBER = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 })

// "24-Sep-2026" -> "Sep-24-2026"
export const formatDate = (date) => {
  const [day, month, year] = date.split('-')
  return `${month}-${day}-${year}`
}

// Adding 0 turns -0 into 0 so it never renders as "-0".
export const formatNumber = (n) => (n == null ? '-' : NUMBER.format(n + 0))

export const trendClass = (delta) => (delta > 0 ? 'up' : delta < 0 ? 'down' : undefined)
