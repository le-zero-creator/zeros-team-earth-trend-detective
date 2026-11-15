import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { AskChat } from './AskChat'
import { useI18n, type Key } from '../i18n'
import { useData } from '../lib/data'
import { useProfile } from '../lib/profile'
import { pickReading } from '../lib/reading'

const STATIC: Key[] = ['ask.q.heat', 'ask.q.air', 'ask.q.rain', 'ask.q.basin']

/** Bouton flottant sur chaque page. Le panneau reste un coin du site, pas un écran d'application. */
export function AskDock() {
  const { t, lang } = useI18n()
  const { profile } = useProfile()
  const { state } = useData()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
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

  return (
    <div className="ask-dock">
      <button type="button" className="ask-fab" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M5 6.5h14v8.2H9.2L5 18.2V6.5Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
        </svg>
        {open ? t('ask.close') : t('ask.open')}
      </button>
      {open && (
        <div className="ask-panel" role="dialog" aria-label={t('ask.title')}>
          <AskChat
            compact
            suggestions={suggestions}
            profile={profile}
            zoneId={zone?.zone_id ?? 'cmr_yaounde'}
            lat={zone?.lat}
            lon={zone?.lon}
          />
        </div>
      )}
    </div>
  )
}
