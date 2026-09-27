import { useState } from 'react'

const ICON_PATHS = {
  globe: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 0c2.5 2.4 3.8 5.4 3.8 9s-1.3 6.6-3.8 9m0-18c-2.5 2.4-3.8 5.4-3.8 9s1.3 6.6 3.8 9M3.5 9h17M3.5 15h17',
  quotes: 'M12 5a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm0 3.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Z',
  news: 'M5 5h14v14H5zM8 9h8M8 12h8M8 15h5',
  megaphone: 'M4 10v4h3l7 4V6L7 10H4Zm13-1a4 4 0 0 1 0 6',
  diff: 'M5 5h14v14H5zM9 8v8M15 8v8M7 11h4M13 13h4',
  reports: 'M10.5 5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11Zm4 9.5L19 19',
  ai: 'M5 5h14v14H5zM8.5 15l2-6 2 6M9.2 13h2.6M15 9v6',
  weather: 'M8 16h9a3 3 0 0 0 0-6 4.5 4.5 0 0 0-8.6 1A2.5 2.5 0 0 0 8 16ZM6 6.5l1 1M10 4v1.5',
}

const NAV_ITEMS = [
  { label: 'CoffeeWeb', icon: 'globe', color: '#2d7fd3' },
  { label: 'Coffee Quotes', icon: 'quotes', color: '#d63a2b' },
  { label: 'Coffee News', icon: 'news', color: '#9b4fc8' },
  { label: 'Your News', icon: 'megaphone', color: '#f08a24' },
  { label: 'Coffee Differentials', icon: 'diff', color: '#23884a' },
  { label: 'Coffee Reports', icon: 'reports', color: '#e0572e', active: true },
  { label: 'Coffeeweb AI', icon: 'ai', color: '#2f6fd0' },
  { label: 'Coffee Weather', icon: 'weather', color: '#3a86e0' },
]

function Glyph({ path }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={path} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Logo() {
  return (
    <div className="logo">
      <svg className="logo-globe" viewBox="0 0 40 40" aria-hidden="true">
        <circle cx="20" cy="20" r="17" fill="#fff" />
        <path
          d="M20 3c-6 5-6 29 0 34M20 3c6 5 6 29 0 34M5 14h30M5 26h30M3 20h34"
          fill="none"
          stroke="var(--brand)"
          strokeWidth="2.2"
        />
      </svg>
      <div>
        <span className="logo-name">CoffeeWeb</span>
        <span className="logo-tagline">Connect With Coffee</span>
      </div>
    </div>
  )
}

export default function Header({ theme, onToggleTheme }) {
  const [mode, setMode] = useState('business')

  return (
    <>
      <header className="topbar">
        <Logo />
        <div className="topbar-actions">
          <div className="mode-switch" role="group" aria-label="Account mode">
            {['business', 'general'].map((m) => (
              <button key={m} type="button" aria-pressed={mode === m} onClick={() => setMode(m)}>
                {m.toUpperCase()}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="round-btn"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            <Glyph path="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
          </button>
          <button type="button" className="round-btn round-btn-text" aria-label="Profile">
            M
          </button>
          <button type="button" className="round-btn round-btn-solid" aria-label="Notifications">
            <Glyph path="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15L6 16Zm4 4h4" />
          </button>
          <button type="button" className="icon-btn" aria-label="Log out">
            <Glyph path="M12 3v8M7 6.3a8 8 0 1 0 10 0" />
          </button>
        </div>
      </header>

      <nav className="main-nav" aria-label="Main">
        {NAV_ITEMS.map((item) => (
          <a
            key={item.label}
            href="#"
            className={item.active ? 'nav-item active' : 'nav-item'}
            aria-current={item.active ? 'page' : undefined}
            onClick={(e) => e.preventDefault()}
          >
            <span className="nav-icon" style={{ background: item.color }}>
              <Glyph path={ICON_PATHS[item.icon]} />
            </span>
            {item.label}
          </a>
        ))}
        <a href="#" className="nav-item nav-menu" onClick={(e) => e.preventDefault()}>
          Menu
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </a>
      </nav>
    </>
  )
}
