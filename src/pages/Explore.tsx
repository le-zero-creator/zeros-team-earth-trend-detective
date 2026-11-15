import { useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { LivingEarth, type EarthHandle } from '../components/LivingEarth'
import { Scene } from '../components/Scene'
import { useI18n, type Key } from '../i18n'
import { useData } from '../lib/data'
import { SLOPE_DECIMALS, formatSigned, plainUnit } from '../lib/format'
import { investigateLink } from '../lib/params'
import type { Zone } from '../lib/types'

const LAYERS = ['t2m_max', 'rh2m', 'precip'] as const

export function Explore() {
  const { t, lang } = useI18n()
  const { state } = useData()
  const earth = useRef<EarthHandle>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [layer, setLayer] = useState<(typeof LAYERS)[number]>('t2m_max')
  const [query, setQuery] = useState('')
  const zones = state.status === 'ready' ? state.data.zones : []
  const ordered = useMemo(() => {
    const list = [...zones].sort((a, b) => {
      if (a.zone_id === 'cmr_yaounde') return 1
      if (b.zone_id === 'cmr_yaounde') return -1
      return a.name_en.localeCompare(b.name_en)
    })
    const q = query.trim().toLowerCase()
    if (!q) return list
    return list.filter((zone) => `${zone.name_en} ${zone.name_fr}`.toLowerCase().includes(q))
  }, [zones, query])

  function fly(zone: Zone | 'basin') {
    if (zone === 'basin') {
      setSelected('basin')
      earth.current?.lookAt(1, 18, 2.05)
      return
    }
    setSelected(zone.zone_id)
    earth.current?.lookAt(zone.lat, zone.lon, 1.72)
  }

  const zone = zones.find((item) => item.zone_id === selected)
  const analysis =
    state.status === 'ready' && zone
      ? state.data.results.analyses.find(
          (item) => item.zone_id === zone.zone_id && item.variable_id === layer && item.period_id === 'p2001_2025',
        )
      : undefined
  const figure = analysis ? `${formatSigned(analysis.pente_decennie, SLOPE_DECIMALS[layer] ?? 2, lang)} ${plainUnit(analysis.slope_unit, lang)}` : ''

  const screen = (
    <div className="explore-screen">
      <LivingEarth
        ref={earth}
        zones={zones}
        selected={selected}
        onPick={(zoneId) => {
          const found = zones.find((item) => item.zone_id === zoneId)
          if (found) fly(found)
        }}
      />
      <aside className="globe-float glass">
        <Scene name="nasa-africa-radar" alt={t('scene.radar')} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('globe.places')} aria-label={t('globe.places')} />
        <div className="globe-layers" role="group" aria-label={t('globe.layers')}>
          {LAYERS.map((id) => (
            <button key={id} type="button" aria-pressed={layer === id} onClick={() => setLayer(id)}>
              {t(`plain.var.${id}` as Key)}
            </button>
          ))}
        </div>
        <button type="button" className="zone-btn" aria-pressed={selected === 'basin'} onClick={() => fly('basin')}>
          {t('globe.flyCongo')}
        </button>
        <ul>
          {ordered.map((item) => (
            <li key={item.zone_id}>
              <button type="button" className="zone-btn" aria-pressed={selected === item.zone_id} onClick={() => fly(item)}>
                {lang === 'fr' ? item.name_fr : item.name_en}
                {!item.in_hydrobasins_congo && <small> · {t('globe.outside')}</small>}
              </button>
            </li>
          ))}
        </ul>
        <p className="note">{t('globe.credit')}</p>
      </aside>
      {selected && (
        <aside className="globe-sheet glass" aria-live="polite">
          <h2>{selected === 'basin' ? t('globe.flyCongo') : lang === 'fr' ? zone?.name_fr : zone?.name_en}</h2>
          {selected === 'basin' ? (
            <p>{t('globe.basinNote')}</p>
          ) : (
            <>
              <p className="big">{figure}</p>
              <p>
                {analysis && (analysis.evidence_level === 'not_enough_evidence_yet' || !analysis.significatif)
                  ? t('evidence.plain.not_enough_evidence_yet')
                  : t('evidence.plain.robust')}
                . {t('ask.source')} 2001–2025.
              </p>
              {zone && (
                <Link className="cta cta--sun" to={investigateLink(zone.zone_id, layer, 'p2001_2025')}>
                  {t('nav.investigate')}
                </Link>
              )}
            </>
          )}
        </aside>
      )}
    </div>
  )

  return createPortal(screen, document.body)
}
