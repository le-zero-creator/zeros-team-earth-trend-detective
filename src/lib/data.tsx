import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import type { AppData, Results, Zone, ZoneProps } from './types'

type State = { status: 'loading' } | { status: 'error' } | { status: 'ready'; data: AppData }

const DataContext = createContext<{ state: State; retry: () => void }>({
  state: { status: 'loading' },
  retry: () => {},
})

async function getJson<T>(path: string, signal: AbortSignal): Promise<T> {
  const res = await fetch(`${import.meta.env.BASE_URL}data/${path}`, { signal })
  if (!res.ok) throw new Error('fetch failed')
  return res.json() as Promise<T>
}

export async function loadData(signal: AbortSignal = new AbortController().signal): Promise<AppData> {
  const [results, points, boundary] = await Promise.all([
    getJson<Results>('results.json', signal),
    getJson<GeoJSON.FeatureCollection<GeoJSON.Point, ZoneProps>>('zones/congo_basin_points.geojson', signal),
    getJson<GeoJSON.FeatureCollection>('zones/congo_basin_boundary.geojson', signal),
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
    const ctrl = new AbortController()
    const timer = window.setTimeout(() => ctrl.abort(), 25000)
    setState({ status: 'loading' })
    loadData(ctrl.signal)
      .then((data) => alive && setState({ status: 'ready', data }))
      .catch(() => alive && setState({ status: 'error' }))
    return () => {
      alive = false
      window.clearTimeout(timer)
      ctrl.abort()
    }
  }, [attempt])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])
  return <DataContext.Provider value={{ state, retry }}>{children}</DataContext.Provider>
}

export function useData() {
  return useContext(DataContext)
}
