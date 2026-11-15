import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { LivingEarth, type EarthHandle } from '../components/LivingEarth'
import { Picture } from '../components/Picture'
import { useI18n } from '../i18n'
import { useData } from '../lib/data'
import { investigateLink } from '../lib/params'
import type { Zone } from '../lib/types'

export function Explore() {
  const { t, lang } = useI18n()
  const { state } = useData()
  const earth = useRef<EarthHandle>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [live, setLive] = useState(false)
  const zones = state.status === 'ready' ? state.data.zones : []
  const ordered = useMemo(
    () =>
      [...zones].sort((a, b) => {
        if (a.zone_id === 'cmr_yaounde') return 1
        if (b.zone_id === 'cmr_yaounde') return -1
        return a.name_en.localeCompare(b.name_en)
      }),
    [zones],
  )

  function fly(zone: Zone | 'basin') {
    if (zone === 'basin') {
      setSelected('basin')
      earth.current?.lookAt(1, 18, 2.05)
      return
    }
    setSelected(zone.zone_id)
    earth.current?.lookAt(zone.lat, zone.lon, 1.7)
  }

  return (
    <article className="explore sheet">
      <header className="sheet__head">
        <h1>{t('globe.h1')}</h1>
        <p>{t('globe.lead')}</p>
      </header>
      <div className="explore-layout">
        <div className="earth-stage">
          {state.status !== 'ready' && <Picture name="earth-hero" alt={t('story.caption.earth')} />}
          {state.status === 'ready' && (
            <LivingEarth
              ref={earth}
              zones={zones}
              selected={selected}
              onReady={() => setLive(true)}
              onFallback={() => setLive(false)}
              onPick={(zoneId) => {
                const zone = zones.find((item) => item.zone_id === zoneId)
                if (zone) fly(zone)
              }}
            />
          )}
          {!live && state.status === 'ready' && <Picture name="earth-hero" alt={t('story.caption.earth')} />}
          {state.status === 'loading' && <p role="status">{t('state.loading')}</p>}
        </div>
        <aside className="glass place-list">
          <h2>{t('globe.places')}</h2>
          <button type="button" aria-pressed={selected === 'basin'} onClick={() => fly('basin')}>
            {t('globe.flyCongo')}
          </button>
          <ul>
            {ordered.map((zone) => (
              <li key={zone.zone_id}>
                <button type="button" aria-pressed={selected === zone.zone_id} onClick={() => fly(zone)}>
                  <span>{lang === 'fr' ? zone.name_fr : zone.name_en}</span>
                  {!zone.in_hydrobasins_congo && <small>{t('globe.outside')}</small>}
                </button>
              </li>
            ))}
          </ul>
          {selected && selected !== 'basin' && (
            <Link className="cta cta--sun" to={investigateLink(selected, 't2m_max', 'p2001_2025')}>
              {t('nav.investigate')}
            </Link>
          )}
          <p className="note">{t('globe.credit')}</p>
        </aside>
      </div>
    </article>
  )
}
