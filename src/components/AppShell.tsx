import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { AskDock } from './AskDock'
import { Intro } from './Intro'
import { Tour } from './Tour'
import { useTheme } from '../lib/theme'
import { useI18n } from '../i18n'
import { useData } from '../lib/data'

function LangToggle() {
  const { lang, setLang, t } = useI18n()
  return (
    <div className="lang" role="group" aria-label={t('lang.label')}>
      {(['en', 'fr'] as const).map((l) => (
        <button key={l} type="button" aria-pressed={lang === l} onClick={() => setLang(l)} lang={l}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

function Footer() {
  const { t } = useI18n()
  const { state } = useData()
  const accessed = state.status === 'ready' ? state.data.results.meta.sources[0]?.accessed : undefined
  return (
    <footer className="footer">
      <p>
        {t('footer.copyright')} · {t('footer.data')} · {t('footer.basin')} · {t('footer.map')} · {t('footer.license')}{' '}
        · <Link to="/ask">{t('nav.ask')}</Link> · <Link to="/method">{t('nav.method')}</Link> · <Link to="/about">{t('footer.credits')}</Link> ·{' '}
        {t('footer.notracking')}
        {accessed && <> · {t('footer.version', { date: accessed })}</>}
      </p>
    </footer>
  )
}

function ThemeToggle() {
  const { t } = useI18n()
  const { theme, toggle } = useTheme()
  return (
    <button type="button" className="theme-toggle" aria-pressed={theme === 'dark'} onClick={toggle}>
      {theme === 'dark' ? t('theme.light') : t('theme.dark')}
    </button>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  const { t } = useI18n()
  return (
    <>
      <Intro />
      <a className="skip" href="#main" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus() }}>
        {t('nav.skip')}
      </a>
      <header className="topbar">
        <Link to="/" className="brand">
          <span className="brand__name">{t('app.name')}</span>
        </Link>
        <nav className="topnav" aria-label={t('nav.main')}>
          <NavLink to="/" end>{t('nav.earth')}</NavLink>
          <NavLink to="/congo">{t('nav.congo')}</NavLink>
          <NavLink to="/you">{t('nav.you')}</NavLink>
          <NavLink to="/ask">{t('nav.ask')}</NavLink>
          <NavLink to="/me">{t('nav.me')}</NavLink>
          <Tour />
          <ThemeToggle />
          <LangToggle />
        </nav>
      </header>
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <Footer />
      <AskDock />
    </>
  )
}
