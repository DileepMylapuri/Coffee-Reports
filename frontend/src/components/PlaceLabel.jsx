// Flag + name + "- Country". `inline` packs it tightly (for captions); otherwise the
// parts sit in fixed columns so stacked rows line up. On narrower screens the
// country text is hidden by CSS; the title keeps it available on hover / long-press.
export default function PlaceLabel({ flag, name, country, inline = false }) {
  return (
    <span className={inline ? 'place place-inline' : 'place'} title={inline ? undefined : country}>
      {flag ? (
        <img className="flag" src={flag} alt="" width="36" height="27" loading="lazy" decoding="async" />
      ) : (
        <span className="flag" />
      )}
      <span className="place-name">{name}</span>
      {country && <span className="place-country">- {country}</span>}
    </span>
  )
}

// `position` ("3 / 13") is only shown on phones, where one port fills the screen.
export function PortCaption({ position, ...props }) {
  return (
    <>
      <span className="caption-prefix">PORT :</span> <PlaceLabel inline {...props} />
      {position && <span className="caption-position">{position}</span>}
    </>
  )
}
