function SortArrows() {
  return (
    <svg className="sort-arrows" viewBox="0 0 10 16" aria-hidden="true">
      <path d="M1.5 6 5 2.5 8.5 6M1.5 10 5 13.5 8.5 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Blue bar with the coffee / unit toggles and the report title, plus the report body.
export default function ReportShell({ bar, title, status, children }) {
  const { coffee, onToggleCoffee, unitLabel, onToggleUnit } = bar
  return (
    <section className="report">
      <div className="report-bar">
        <button type="button" className="bar-toggle" onClick={onToggleCoffee} title="Switch between Robusta and Arabica">
          {coffee.toUpperCase()} <SortArrows />
        </button>
        <h2 className="bar-title">{title}</h2>
        <button type="button" className="bar-toggle bar-toggle-end" onClick={onToggleUnit} title="Switch units">
          {unitLabel} <SortArrows />
        </button>
      </div>
      {status.error ? (
        <p className="report-status error">Could not load report data. {status.error.message}</p>
      ) : status.loading ? (
        <p className="report-status">Loading report…</p>
      ) : (
        children
      )}
    </section>
  )
}

