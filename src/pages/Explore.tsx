import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { LivingEarth, type EarthHandle } from '../components/LivingEarth'
import { Scene } from '../components/Scene'
import { useI18n, type Key } from '../i18n'
import { useData } from '../lib/data'
import { SLOPE_DECIMALS, formatSigned, plainUnit } from '../lib/format'
import { investigateLink } from '../lib/params'
import { COMING_REGIONS } from '../lib/story'
import type { Zone } from '../lib/types'

function basinRing(boundary: GeoJSON.FeatureCollection | undefined): Array<[number, number]> {
  const geometry = boundary?.features[0]?.geometry
  if (!geometry || geometry.type !== 'MultiPolygon') return []
  let best: number[][] = []
  for (const poly of geometry.coordinates) {
    const ring = poly[0] as number[][]
    if (ring.length > best.length) best = ring
  }
  const step = Math.max(1, Math.floor(best.length / 220))
  const slim = best.filter((_, index) => index % step === 0).map((pair) => [pair[0], pair[1]] as [number, number])
  if (slim.length > 1) slim.push(slim[0])
  return slim
}

const LAYERS = ['t2m_max', 'rh2m', 'precip'] as const

export function Explore() {
  const { t, lang } = useI18n()
  const { state } = useData()
  const earth = useRef<EarthHandle>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [inside, setInside] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [layer, setLayer] = useState<(typeof LAYERS)[number]>('t2m_max')
  const [query, setQuery] = useState('')
  const outline = useMemo(
    () => basinRing(state.status === 'ready' ? state.data.boundary : undefined),
    [state],
  )
  useEffect(() => {
    if (state.status === 'ready') earth.current?.lookAt(1, 18, 3.4)
  }, [state.status])
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

  function enterBasin() {
    setInside(true)
    setSelected('basin')
    setToast(null)
    earth.current?.lookAt(1, 18, 2.15)
  }

  function fly(zone: Zone) {
    setSelected(zone.zone_id)
    earth.current?.lookAt(zone.lat, zone.lon, 1.72)
  }

  const labels = useMemo(() => {
    const map: Record<string, string> = {}
    for (const item of zones) {
      const name = lang === 'fr' ? item.name_fr : item.name_en
      map[item.zone_id] = name.split(/[–—-]/)[0].trim()
    }
    return map
  }, [zones, lang])

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
        labels={labels}
        showPlaces={inside}
        outline={outline}
        selected={selected}
        onPick={(zoneId) => {
          const found = zones.find((item) => item.zone_id === zoneId)
          if (found) fly(found)
        }}
      >
        {!inside && (
          <>
            <button type="button" className="study-tag" data-pin="" data-lat="1" data-lon="18" onClick={enterBasin}>
              {t('globe.study')}
            </button>
            {COMING_REGIONS.map((region) => (
              <button
                key={region.id}
                type="button"
                className="soon-tag"
                data-pin=""
                data-lat={region.lat}
                data-lon={region.lon}
                onClick={() => setToast(t(`region.${region.id}` as Key))}
              >
                {t(`region.${region.id}` as Key)}
                <small>{t('globe.soonTag')}</small>
              </button>
            ))}
          </>
        )}
      </LivingEarth>
      <aside className="globe-float glass">
        <Scene name="nasa-africa-radar" alt={t('scene.radar')} />
        {!inside ? (
          <>
            <p className="study-note">{t('globe.study')}</p>
            <button type="button" className="cta cta--sun" onClick={enterBasin}>{t('globe.enterBasin')}</button>
          </>
        ) : (
          <>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('globe.places')} aria-label={t('globe.places')} />
            <div className="globe-layers" role="group" aria-label={t('globe.layers')}>
              {LAYERS.map((id) => (
                <button key={id} type="button" aria-pressed={layer === id} onClick={() => setLayer(id)}>
                  {t(`plain.var.${id}` as Key)}
                </button>
              ))}
            </div>
            <p className="zone-group">{t('globe.groupBasin')}</p>
            <ul className="zone-rows">
              {ordered.filter((item) => item.zone_id !== 'cmr_yaounde').map((item) => (
                <li key={item.zone_id}>
                  <button type="button" className="zone-btn" aria-pressed={selected === item.zone_id} onClick={() => fly(item)}>
                    {labels[item.zone_id]}
                  </button>
                </li>
              ))}
            </ul>
            <p className="zone-group">{t('globe.groupLocal')}</p>
            <ul className="zone-rows">
              {ordered.filter((item) => item.zone_id === 'cmr_yaounde').map((item) => (
                <li key={item.zone_id}>
                  <button type="button" className="zone-btn" aria-pressed={selected === item.zone_id} onClick={() => fly(item)}>
                    {labels[item.zone_id]}
                    <small> · {t('globe.outside')}</small>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
        <p className="note">{t('globe.credit')}</p>
      </aside>
      {toast && (
        <div className="soon-toast" role="status">
          <p>{t('globe.soon', { name: toast })}</p>
          <button type="button" className="cta cta--sun" onClick={enterBasin}>{t('globe.toCongo')}</button>
        </div>
      )}
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
