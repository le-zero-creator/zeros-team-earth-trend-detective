import { useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { LivingEarth, type EarthHandle } from '../components/LivingEarth'
import { useI18n, type Key } from '../i18n'
import { useData } from '../lib/data'
import { SLOPE_DECIMALS, formatSigned, plainUnit } from '../lib/format'
import { investigateLink } from '../lib/params'
import type { Zone } from '../lib/types'

const LAYERS = ['t2m_max', 'rh2m', 'precip'] as const

function basinRing(boundary: GeoJSON.FeatureCollection | null): Array<[number, number]> {
  if (!boundary) return []
  let best: number[][] = []
  for (const feature of boundary.features) {
    const geometry = feature.geometry
    if (!geometry) continue
    const polys = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.type === 'MultiPolygon' ? geometry.coordinates : []
    for (const poly of polys) {
      const ring = poly[0] as number[][]
      if (ring && ring.length > best.length) best = ring
    }
  }
  const step = Math.max(1, Math.ceil(best.length / 240))
  return best.filter((_, index) => index % step === 0).map((pair) => [pair[0], pair[1]])
}

function ZoneGroup({
  title,
  zones,
  local = false,
  lang,
  selected,
  layer,
  analyses,
  onFly,
  outside,
}: {
  title: string
  zones: Zone[]
  local?: boolean
  lang: 'en' | 'fr'
  selected: string | null
  layer: string
  analyses: Array<{ zone_id: string; variable_id: string; period_id: string; pente_decennie: number; significatif: boolean }>
  onFly: (zone: Zone) => void
  outside: string
}) {
  if (!zones.length) return null
  return (
    <div>
      <p className="zone-group">{title}</p>
      <ul className="zone-list">
        {zones.map((item) => {
          const hit = analyses.find((row) => row.zone_id === item.zone_id && row.variable_id === layer && row.period_id === 'p2001_2025')
          const badge = hit ? formatSigned(hit.pente_decennie, 2, lang) : 'n/a'
          return (
            <li key={item.zone_id}>
              <button type="button" className="zone-row" aria-pressed={selected === item.zone_id} onClick={() => onFly(item)}>
                <strong>{lang === 'fr' ? item.name_fr : item.name_en}</strong>
                <span className="zone-tag">{item.country}</span>
                <span className={hit && !hit.significatif ? 'zone-trend is-quiet' : 'zone-trend'}>{local ? outside : badge}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function Explore() {
  const { t, lang } = useI18n()
  const { state } = useData()
  const earth = useRef<EarthHandle>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [layer, setLayer] = useState<(typeof LAYERS)[number]>('t2m_max')
  const [query, setQuery] = useState('')
  const ready = state.status === 'ready' ? state.data : null
  const zones = ready?.zones ?? []
  const outline = useMemo(() => basinRing(ready?.boundary ?? null), [ready])
  const ordered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return zones
      .filter((zone) => !q || `${zone.name_en} ${zone.name_fr} ${zone.country}`.toLowerCase().includes(q))
      .sort((a, b) => a.name_en.localeCompare(b.name_en))
  }, [zones, query])
  const basinZones = ordered.filter((zone) => zone.in_hydrobasins_congo)
  const localZones = ordered.filter((zone) => !zone.in_hydrobasins_congo)

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
        outline={outline}
        selected={selected}
        onPick={(zoneId) => {
          const found = zones.find((item) => item.zone_id === zoneId)
          if (found) fly(found)
        }}
      />
      <aside className="globe-float glass">
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
        <ZoneGroup
          title={t('globe.groupBasin')}
          zones={basinZones}
          lang={lang}
          selected={selected}
          layer={layer}
          analyses={ready?.results.analyses ?? []}
          onFly={fly}
          outside={t('globe.outside')}
        />
        <ZoneGroup
          title={t('globe.groupLocal')}
          zones={localZones}
          local
          lang={lang}
          selected={selected}
          layer={layer}
          analyses={ready?.results.analyses ?? []}
          onFly={fly}
          outside={t('globe.outside')}
        />
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
