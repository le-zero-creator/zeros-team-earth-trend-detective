import { useState, type ReactNode } from 'react'
import { motion, MotionConfig } from 'motion/react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AskDock } from './AskDock'
import { Intro } from './Intro'
import { Motion } from './Motion'
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
  const { pathname } = useLocation()
  const [menu, setMenu] = useState(false)
  const close = () => setMenu(false)
  return (
    <MotionConfig reducedMotion="user" transition={{ type: 'spring', bounce: 0, duration: 0.28 }}>
      <Intro />
      <a className="skip" href="#main" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus() }}>
        {t('nav.skip')}
      </a>
      <Motion />
      <header className="topbar">
        <Link to="/" className="brand" onClick={close}>
          <span className="brand__name">{t('app.name')}</span>
        </Link>
        <button type="button" className="nav-burger" aria-expanded={menu} aria-controls="nav-panel" onClick={() => setMenu((open) => !open)}>
          {menu ? t('nav.close') : t('nav.menu')}
        </button>
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
      {menu && (
        <div id="nav-panel" className="nav-panel">
          <p className="nav-panel__brand">{t('app.name')}</p>
          <NavLink to="/" end onClick={close}>{t('nav.earth')}</NavLink>
          <NavLink to="/congo" onClick={close}>{t('nav.congo')}</NavLink>
          <NavLink to="/you" onClick={close}>{t('nav.you')}</NavLink>
          <NavLink to="/ask" onClick={close}>{t('nav.ask')}</NavLink>
          <NavLink to="/me" onClick={close}>{t('nav.me')}</NavLink>
          <ThemeToggle />
          <LangToggle />
        </div>
      )}
      <main id="main" tabIndex={-1}>
        <motion.div
          key={pathname}
          className="page-in"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 0.84, 0.24, 1] }}
        >
          {children}
        </motion.div>
      </main>
      <Footer />
      <AskDock />
    </MotionConfig>
  )
}
