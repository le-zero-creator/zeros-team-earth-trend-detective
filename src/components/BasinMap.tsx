import { useEffect } from 'react'
import { CircleMarker, GeoJSON, MapContainer, TileLayer, Tooltip, ZoomControl, useMap } from 'react-leaflet'
import type { PathOptions } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useI18n } from '../i18n'
import { formatSlope } from '../lib/format'
import { STORY_COLOR, storyWord } from '../lib/story'
import type { Analysis, Zone } from '../lib/types'

export const COLORS = { increasing: '#E85D04', decreasing: '#2B6CB0', nee: '#64748B' }

/** Style d'un point : couleur selon le sens, plein / pointillé / gris selon le niveau de preuve.
 *  Un lieu hors du bassin hydrologique (Yaoundé) est toujours dessiné creux. */
export function markerStyle(a: Analysis, hollow: boolean): PathOptions {
  const color = a.evidence_level === 'not_enough_evidence_yet' ? COLORS.nee : COLORS[a.direction]
  const exploratory = a.evidence_level === 'exploratory'
  if (hollow) {
    return { color, weight: 3.5, fillColor: '#ffffff', fillOpacity: 0, dashArray: exploratory ? '4 4' : undefined }
  }
  return {
    color: exploratory ? color : '#ffffff',
    weight: 2,
    fillColor: color,
    fillOpacity: exploratory ? 0.5 : 1,
    dashArray: exploratory ? '3 3' : undefined,
  }
}

/** Carte grand public : mêmes règles de creux et de pointillé, couleurs en mots (chaud, sec, pas sûr). */
export function publicMarkerStyle(a: Analysis, hollow: boolean, variableId: string): PathOptions {
  const base = markerStyle(a, hollow)
  const color = STORY_COLOR[storyWord(variableId, a)]
  if (hollow) {
    return { ...base, color, fillColor: '#fffef8', fillOpacity: 0, weight: 3.5, className: 'pin pin--yaounde' }
  }
  return {
    ...base,
    fillColor: color,
    color: a.evidence_level === 'exploratory' ? color : '#ffffff',
    className: 'pin',
  }
}

/** Attribution courte (sans préfixe) pour qu'elle tienne sur une ligne et ne cache aucun point sur mobile. */
function ShortAttribution() {
  const map = useMap()
  useEffect(() => {
    map.attributionControl?.setPrefix(false)
  }, [map])
  return null
}

interface Props {
  zones: Zone[]
  boundary: GeoJSON.FeatureCollection
  analyses: Map<string, Analysis>
  alt: string
  onSelect: (zoneId: string) => void
}

export function BasinMap({ zones, boundary, analyses, alt, onSelect }: Props) {
  const { t, lang } = useI18n()
  return (
    <div className="map" role="group" aria-label={alt}>
      <MapContainer
        bounds={[
          [-12.5, 11],
          [8, 33],
        ]}
        boundsOptions={{ paddingBottomRight: [0, 18] }}
        zoomControl={false}
        scrollWheelZoom={false}
        minZoom={3}
        maxZoom={8}
        className="map__leaflet"
      >
        <ShortAttribution />
        <ZoomControl position="bottomleft" />
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors · Basin: HydroSHEDS'
          referrerPolicy="no-referrer"
        />
        <GeoJSON
          data={boundary}
          interactive={false}
          style={{ color: '#0F233C', weight: 2, fillColor: '#2A9D8F', fillOpacity: 0.08 }}
        />
        {zones.map((z) => {
          const a = analyses.get(z.zone_id)
          if (!a) return null
          const hollow = !z.in_hydrobasins_congo
          const name = lang === 'fr' ? z.name_fr : z.name_en
          return (
            <CircleMarker
              key={`${z.zone_id}-${a.variable_id}-${a.period_id}`}
              center={[z.lat, z.lon]}
              radius={hollow ? 9 : 8}
              pathOptions={markerStyle(a, hollow)}
              eventHandlers={{ click: () => onSelect(z.zone_id) }}
            >
              {hollow ? (
                <Tooltip permanent direction="right" offset={[6, -30]} className="map__label">
                  Yaoundé — {t('yaounde.outside')}
                </Tooltip>
              ) : (
                <Tooltip direction="top" offset={[0, -8]}>
                  <strong>{name}</strong>
                  <br />
                  {formatSlope(a.pente_decennie, a.variable_id, a.slope_unit, lang)}
                  <br />
                  {t(`evidence.${a.evidence_level}`)}
                </Tooltip>
              )}
            </CircleMarker>
          )
        })}
      </MapContainer>
    </div>
  )
}

export function MapLegend() {
  const { t } = useI18n()
  return (
    <ul className="legend" aria-label={t('legend.title')}>
      <li>
        <span className="dot dot--robust dot--up" aria-hidden="true" />
        <span className="dot dot--robust dot--down" aria-hidden="true" />
        {t('legend.robust')} (▲ {t('legend.rising')} · ▼ {t('legend.falling')})
      </li>
      <li>
        <span className="dot dot--exploratory dot--up" aria-hidden="true" />
        <span className="dot dot--exploratory dot--down" aria-hidden="true" />
        {t('legend.exploratory')} (▲? · ▼?)
      </li>
      <li>
        <span className="dot dot--nee" aria-hidden="true" />≈ {t('legend.nee')}
      </li>
      <li>
        <span className="dot dot--hollow" aria-hidden="true" />
        {t('legend.yaounde')}
      </li>
    </ul>
  )
}
