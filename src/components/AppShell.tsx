import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { AskDock } from './AskDock'
import { Intro } from './Intro'
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
          <NavLink to="/investigate" className="topnav__wide">
            {t('nav.investigate')}
          </NavLink>
          <NavLink to="/method" className="topnav__wide">
            {t('nav.method')}
          </NavLink>
          <NavLink to="/compare" className="topnav__wide">
            {t('nav.compare')}
          </NavLink>
          <NavLink to="/ask" className="topnav__wide">
            {t('nav.ask')}
          </NavLink>
          <NavLink to="/about">{t('nav.about')}</NavLink>
          <LangToggle />
        </nav>
      </header>
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <Footer />
      <AskDock />
      <nav className="bottomnav" aria-label={t('nav.main')}>
        <NavLink to="/" end>
          <span aria-hidden="true">⌂</span>
          {t('nav.home')}
        </NavLink>
        <NavLink to="/investigate">
          <span aria-hidden="true">⌕</span>
          {t('nav.investigate')}
        </NavLink>
        <NavLink to="/method">
          <span aria-hidden="true">≡</span>
          {t('nav.method')}
        </NavLink>
      </nav>
    </>
  )
}
