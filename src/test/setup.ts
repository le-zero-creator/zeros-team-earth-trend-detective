import { readFileSync } from 'node:fs'

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
if (!('ResizeObserver' in globalThis)) {
  globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver
}
import { resolve } from 'node:path'
import type { AppData, Results, Zone, ZoneProps } from '../lib/types'

const read = <T,>(path: string): T => JSON.parse(readFileSync(resolve(process.cwd(), 'public/data', path), 'utf8')) as T

/** Charge les vrais fichiers de public/data pour les tests (aucune donnée inventée). */
export function loadRealData(): AppData {
  const results = read<Results>('results.json')
  const points = read<GeoJSON.FeatureCollection<GeoJSON.Point, ZoneProps>>('zones/congo_basin_points.geojson')
  const boundary = read<GeoJSON.FeatureCollection>('zones/congo_basin_boundary.geojson')
  const zones: Zone[] = points.features.map((f) => ({
    ...f.properties,
    lon: f.geometry.coordinates[0],
    lat: f.geometry.coordinates[1],
  }))
  return { results, zones, boundary }
}
