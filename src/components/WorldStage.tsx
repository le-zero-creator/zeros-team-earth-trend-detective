import { useEffect, useMemo, useState } from 'react'
import { CircleMarker, GeoJSON, MapContainer, TileLayer, Tooltip, ZoomControl, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { publicMarkerStyle } from './BasinMap'
import { useI18n, type Key } from '../i18n'
import { COMING_REGIONS, storyWord, type ComingRegionId } from '../lib/story'
import type { Analysis, Zone } from '../lib/types'

type Mode = { kind: 'basin' } | { kind: 'earth' } | { kind: 'soon'; id: ComingRegionId | 'custom'; label: string }

function norm(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
}

function reduced(): boolean {
  return typeof window.matchMedia !== 'function' || window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function Flight({ mode }: { mode: Mode }) {
  const map = useMap()
  const lat = mode.kind === 'soon' && mode.id !== 'custom' ? COMING_REGIONS.find((r) => r.id === mode.id)?.lat : undefined
  const lon = mode.kind === 'soon' && mode.id !== 'custom' ? COMING_REGIONS.find((r) => r.id === mode.id)?.lon : undefined
  useEffect(() => {
    const calm = reduced()
    const basin: [[number, number], [number, number]] = [
      [-8.2, 10.5],
      [6.8, 31.5],
    ]
    map.invalidateSize()
    if (mode.kind === 'earth' || (mode.kind === 'soon' && mode.id === 'custom')) {
      map.setView([6, 17], 2, { animate: false })
      return
    }
    if (mode.kind === 'soon' && lat !== undefined && lon !== undefined) {
      if (calm) map.setView([lat, lon], 3, { animate: false })
      else map.flyTo([lat, lon], 3, { duration: 1.15 })
      return
    }
    if (calm) {
      map.fitBounds(basin, { padding: [16, 16], animate: false })
      return
    }
    map.setView([6, 17], 2, { animate: false })
    const timer = window.setTimeout(() => {
      map.flyToBounds(basin, { padding: [16, 16], duration: 1.7 })
    }, 420)
    return () => window.clearTimeout(timer)
  }, [mode.kind, mode.kind === 'soon' ? mode.id : '', lat, lon, map])
  return null
}

export function SoonNote({ label }: { label: string }) {
  const { t } = useI18n()
  return (
    <div className="soon-panel" role="status">
      <p className="soon-badge">{t('soon.badge')}</p>
      <h3>{t('soon.panel')}</h3>
      <p>{t('soon.panelBody', { place: label })}</p>
    </div>
  )
}

export function WorldStage({
  zones,
  boundary,
  analyses,
  variableId,
  initial,
  onSelect,
}: {
  zones: Zone[]
  boundary: GeoJSON.FeatureCollection
  analyses: Map<string, Analysis>
  variableId: string
  initial: 'enter' | 'earth' | 'soon'
  onSelect: (zoneId: string) => void
}) {
  const { t, lang } = useI18n()
  const [mode, setMode] = useState<Mode>(initial === 'earth' ? { kind: 'earth' } : initial === 'soon' ? { kind: 'soon', id: 'amazon', label: '' } : { kind: 'basin' })
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [pins, setPins] = useState(initial !== 'enter')

  useEffect(() => {
    if (initial === 'soon') setMode({ kind: 'soon', id: 'amazon', label: t('region.amazon') })
  }, [initial, t])

  useEffect(() => {
    if (mode.kind !== 'basin') {
      setPins(false)
      return
    }
    if (reduced()) {
      setPins(true)
      return
    }
    const timer = window.setTimeout(() => setPins(true), 1900)
    return () => window.clearTimeout(timer)
  }, [mode])

  const suggestions = useMemo(() => {
    const q = norm(query.trim())
    const places = zones
      .filter((z) => !q || norm(z.name_en).includes(q) || norm(z.name_fr).includes(q))
      .map((z) => ({ kind: 'place' as const, id: z.zone_id, label: lang === 'fr' ? z.name_fr : z.name_en, hollow: !z.in_hydrobasins_congo }))
    const regions = COMING_REGIONS.filter((r) => !q || norm(t(`region.${r.id}` as Key)).includes(q)).map((r) => ({
      kind: 'soon' as const,
      id: r.id,
      label: t(`region.${r.id}` as Key),
      hollow: false,
    }))
    return [...places, ...regions].slice(0, 8)
  }, [query, zones, lang, t])

  function choosePlace(id: string) {
    setOpen(false)
    setQuery('')
    onSelect(id)
  }

  function chooseSoon(id: ComingRegionId, label: string) {
    setOpen(false)
    setMode({ kind: 'soon', id, label })
  }

  function commit() {
    const q = norm(query.trim())
    if (!q) return
    if (q.includes('congo') || q.includes('bassin')) {
      setMode({ kind: 'basin' })
      setOpen(false)
      return
    }
    const place = zones.find((z) => norm(z.name_en).includes(q) || norm(z.name_fr).includes(q))
    if (place) {
      choosePlace(place.zone_id)
      return
    }
    const region = COMING_REGIONS.find((r) => norm(t(`region.${r.id}` as Key)).includes(q))
    if (region) {
      chooseSoon(region.id, t(`region.${region.id}` as Key))
      return
    }
    setMode({ kind: 'soon', id: 'custom', label: query.trim().slice(0, 80) })
    setOpen(false)
  }

  const words = (['warmer', 'cooler', 'drier', 'wetter', 'unsure'] as const).filter((word) =>
    [...analyses.values()].some((a) => storyHas(variableId, a, word)),
  )

  return (
    <section className="world" aria-labelledby="world-title">
      <div className="world__head">
        <h2 id="world-title">{t('home.promise')}</h2>
        <div className="world__switch">
          <button type="button" aria-pressed={mode.kind === 'earth'} onClick={() => setMode({ kind: 'earth' })}>
            {t('home.earth')}
          </button>
          <button type="button" aria-pressed={mode.kind === 'basin'} onClick={() => setMode({ kind: 'basin' })}>
            {t('home.basin')}
          </button>
        </div>
      </div>
      <div className="search">
        <label htmlFor="place-search">{t('home.search.label')}</label>
        <div className="search__row">
          <input
            id="place-search"
            value={query}
            placeholder={t('home.search.placeholder')}
            onChange={(e) => {
              setQuery(e.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                commit()
              }
            }}
          />
          <button type="button" onClick={commit}>
            {t('home.search.button')}
          </button>
        </div>
        {open && suggestions.length > 0 && (
          <ul className="search__list" role="listbox">
            {suggestions.map((item) => (
              <li key={`${item.kind}-${item.id}`}>
                <button
                  type="button"
                  onClick={() => (item.kind === 'place' ? choosePlace(item.id) : chooseSoon(item.id, item.label))}
                >
                  <span>{item.label}</span>
                  {item.kind === 'soon' && <span className="soon-badge">{t('soon.badge')}</span>}
                  {item.hollow && <span className="outside">{t('yaounde.outside')}</span>}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className={`globe${mode.kind === 'earth' ? ' is-earth' : ''}`}>
        <MapContainer bounds={[[-40, -20], [40, 50]]} zoomControl={false} scrollWheelZoom={false} minZoom={2} maxZoom={8} className="map__leaflet">
          <Flight mode={mode} />
          <ZoomControl position="bottomleft" />
          <TileLayer
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>'
            referrerPolicy="no-referrer"
          />
          <GeoJSON data={boundary} interactive={false} style={{ color: '#d6ff6b', weight: 8, opacity: 0.45, fill: false }} />
          <GeoJSON data={boundary} interactive={false} style={{ color: '#f3ffd2', weight: 2, fillColor: '#3dce7a', fillOpacity: 0.42 }} />
          {pins &&
            mode.kind === 'basin' &&
            zones.map((z) => {
              const a = analyses.get(z.zone_id)
              if (!a) return null
              const hollow = !z.in_hydrobasins_congo
              const name = lang === 'fr' ? z.name_fr : z.name_en
              return (
                <CircleMarker
                  key={z.zone_id}
                  center={[z.lat, z.lon]}
                  radius={hollow ? 12 : 8}
                  pathOptions={publicMarkerStyle(a, hollow, variableId)}
                  eventHandlers={{ click: () => onSelect(z.zone_id) }}
                >
                  <Tooltip permanent={hollow} direction="right" offset={[8, -18]} className="map__label">
                    {hollow ? (
                      t('yaounde.mapLabel')
                    ) : (
                      <>
                        <strong>{name}</strong>
                        <br />
                        {t(`map.word.${storyWord(variableId, a)}` as Key)}
                      </>
                    )}
                  </Tooltip>
                </CircleMarker>
              )
            })}
        </MapContainer>
        <div className="globe__shade" aria-hidden="true" />
        {mode.kind === 'soon' && <SoonNote label={mode.label || t('region.amazon')} />}
      </div>
      <ul className="word-legend" aria-label={t('legend.title')}>
        {words.map((word) => (
          <li key={word}>
            <span className={`swatch swatch--${word}`} aria-hidden="true" />
            {t(`map.word.${word}` as Key)}
          </li>
        ))}
        <li>
          <span className="swatch swatch--early" aria-hidden="true" />
          {t('map.word.early')}
        </li>
        <li>
          <span className="swatch swatch--hollow" aria-hidden="true" />
          {t('legend.yaounde')}
        </li>
      </ul>
      <p className="note">{t('home.colors')}</p>
      <p className="note">{t('home.map.note')}</p>
    </section>
  )
}

function storyHas(variableId: string, a: Analysis, word: string): boolean {
  return storyWord(variableId, a) === word
}
