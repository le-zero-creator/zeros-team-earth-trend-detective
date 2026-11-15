import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import type { AppData, Results, Zone, ZoneProps } from './types'

type State = { status: 'loading' } | { status: 'error' } | { status: 'ready'; data: AppData }

const DataContext = createContext<{ state: State; retry: () => void }>({
  state: { status: 'loading' },
  retry: () => {},
})

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${import.meta.env.BASE_URL}data/${path}`)
  if (!res.ok) throw new Error('fetch failed')
  return res.json() as Promise<T>
}

export async function loadData(): Promise<AppData> {
  const [results, points, boundary] = await Promise.all([
    getJson<Results>('results.json'),
    getJson<GeoJSON.FeatureCollection<GeoJSON.Point, ZoneProps>>('zones/congo_basin_points.geojson'),
    getJson<GeoJSON.FeatureCollection>('zones/congo_basin_boundary.geojson'),
  ])
  const zones: Zone[] = points.features.map((f) => ({
    ...f.properties,
    lon: f.geometry.coordinates[0],
    lat: f.geometry.coordinates[1],
  }))
  return { results, zones, boundary }
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let alive = true
    setState({ status: 'loading' })
    loadData()
      .then((data) => alive && setState({ status: 'ready', data }))
      .catch(() => alive && setState({ status: 'error' }))
    return () => {
      alive = false
    }
  }, [attempt])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])
  return <DataContext.Provider value={{ state, retry }}>{children}</DataContext.Provider>
}

export function useData() {
  return useContext(DataContext)
}
