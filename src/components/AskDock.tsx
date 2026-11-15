import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useLocation } from 'react-router-dom'
import { AskChat } from './AskChat'
import { TerraMascot, type TerraMood } from './TerraMascot'
import { useI18n, type Key } from '../i18n'
import { useData } from '../lib/data'
import { useProfile } from '../lib/profile'
import { pickReading } from '../lib/reading'

const STATIC: Key[] = ['ask.q.heat', 'ask.q.air', 'ask.q.rain', 'ask.q.basin']
const MUTE = 'td.terra.mute'
const SEEN = 'td.terra.seen'

function hintKey(pathname: string): Key {
  if (pathname === '/') return 'ask.hint.home'
  if (pathname.startsWith('/explore')) return 'ask.hint.explore'
  if (pathname.startsWith('/investigate')) return 'ask.hint.investigate'
  if (pathname.startsWith('/you')) return 'ask.hint.you'
  if (pathname.startsWith('/congo')) return 'ask.hint.congo'
  return 'ask.hint.else'
}

function muted(): boolean {
  try { return localStorage.getItem(MUTE) === '1' } catch { return false }
}

function seen(pathname: string): boolean {
  try { return sessionStorage.getItem(SEEN) === pathname } catch { return false }
}

/** Compagnon Terra : une bulle par page, et le chat au clic. */
export function AskDock() {
  const { t, lang } = useI18n()
  const { profile } = useProfile()
  const { state } = useData()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const [mood, setMood] = useState<TerraMood>('idle')
  const [showHint, setShowHint] = useState(false)

  useEffect(() => {
    setShowHint(!muted() && !seen(pathname))
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (mood !== 'happy') return
    const timer = window.setTimeout(() => setMood('idle'), 2200)
    return () => window.clearTimeout(timer)
  }, [mood])

  if (pathname === '/ask') return null

  const zone = state.status === 'ready' ? state.data.zones.find((item) => item.zone_id === 'cmr_yaounde') : undefined
  const analysis =
    state.status === 'ready'
      ? state.data.results.analyses.find(
          (item) => item.zone_id === 'cmr_yaounde' && item.variable_id === 't2m_max' && item.period_id === 'p2001_2025',
        )
      : undefined
  const extra = analysis ? pickReading('t2m_max', analysis, profile, lang).questions.slice(0, 2) : []
  const suggestions = [...STATIC.map((key) => t(key)), ...extra]

  function dismiss() {
    try { sessionStorage.setItem(SEEN, pathname) } catch { /* une seule bulle cette visite */ }
    setShowHint(false)
  }

  function mute() {
    try { localStorage.setItem(MUTE, '1') } catch { /* le choix reste pour cette visite */ }
    dismiss()
  }

  return (
    <div className="ask-dock">
      {showHint && !open && (
        <div className="terra-hint" role="status">
          <p>{t(hintKey(pathname))}</p>
          <div>
            <button type="button" onClick={dismiss}>{t('ask.hint.dismiss')}</button>
            <button type="button" onClick={mute}>{t('ask.hint.mute')}</button>
          </div>
        </div>
      )}
      <button
        type="button"
        className="terra-launcher"
        aria-expanded={open}
        aria-label={open ? t('ask.close') : t('ask.open')}
        onClick={() => {
          dismiss()
          setOpen((value) => !value)
        }}
      >
        <TerraMascot mood={open ? mood : 'idle'} />
        <span className="terra-name">{t('ask.mascot')}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="ask-panel glass"
            role="dialog"
            aria-label={t('ask.title')}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            style={{ transformOrigin: 'bottom right' }}
          >
            <AskChat
              compact
              suggestions={suggestions}
              profile={profile}
              zoneId={zone?.zone_id ?? 'cmr_yaounde'}
              lat={zone?.lat}
              lon={zone?.lon}
              onStatus={setMood}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
