import { useEffect, useRef } from 'react'
import { Map as GlobeMap, Marker } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { Zone } from '../lib/types'

const STYLE = {
  version: 8 as const,
  sources: {
    sat: {
      type: 'raster' as const,
      tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
      tileSize: 256,
      attribution: 'Esri, Maxar, Earthstar Geographics',
    },
  },
  layers: [{ id: 'sat', type: 'raster' as const, source: 'sat' }],
}

export type FlyTarget = { lon: number; lat: number; zoom: number } | null

/** Globe satellite. Les chiffres des tests ne viennent pas de cette carte. */
export function EarthGlobe({ zones, onPick, target }: { zones: Zone[]; onPick: (zoneId: string) => void; target: FlyTarget }) {
  const node = useRef<HTMLDivElement>(null)
  const mapRef = useRef<GlobeMap | null>(null)
  const pick = useRef(onPick)
  pick.current = onPick

  useEffect(() => {
    if (!node.current || mapRef.current) return
    const map = new GlobeMap({
      container: node.current,
      style: STYLE,
      center: [15, 2],
      zoom: 1.5,
    })
    mapRef.current = map
    let frame = 0
    let spinning = typeof window.matchMedia !== 'function' || !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const spin = () => {
      if (!spinning) return
      const center = map.getCenter()
      map.setCenter([center.lng + 0.06, center.lat])
      frame = window.requestAnimationFrame(spin)
    }
    const stop = () => {
      spinning = false
      window.cancelAnimationFrame(frame)
    }
    map.on('load', () => {
      try {
        map.setProjection({ type: 'globe' })
      } catch {
        /* la carte satellite reste affichée */
      }
      for (const zone of zones) {
        const marker = document.createElement('button')
        marker.type = 'button'
        marker.className = zone.in_hydrobasins_congo ? 'globe-pin' : 'globe-pin globe-pin--hollow'
        marker.textContent = zone.name_en
        marker.addEventListener('click', () => pick.current(zone.zone_id))
        new Marker({ element: marker }).setLngLat([zone.lon, zone.lat]).addTo(map)
      }
      frame = window.requestAnimationFrame(spin)
    })
    map.on('mousedown', stop)
    map.on('touchstart', stop)
    return () => {
      stop()
      map.remove()
      mapRef.current = null
    }
  }, [zones])

  useEffect(() => {
    if (!target || !mapRef.current) return
    mapRef.current.flyTo({ center: [target.lon, target.lat], zoom: target.zoom, duration: 1800 })
  }, [target])

  return <div ref={node} className="globe-live" />
}
