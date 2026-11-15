import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
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

async function loadResults(signal: AbortSignal): Promise<Results> {
  try {
    return await getJson<Results>('results.min.json', signal)
  } catch (error) {
    if (signal.aborted) throw error
    return getJson<Results>('results.json', signal)
  }
}

export async function loadData(signal: AbortSignal = new AbortController().signal): Promise<AppData> {
  const [results, points, boundary] = await Promise.all([
    loadResults(signal),
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
  const autoRetried = useRef(false)

  useEffect(() => {
    let alive = true
    const ctrl = new AbortController()
    const timer = window.setTimeout(() => ctrl.abort(), 40000)
    setState((current) => (current.status === 'ready' ? current : { status: 'loading' }))
    loadData(ctrl.signal)
      .then((data) => {
        if (alive) setState({ status: 'ready', data })
      })
      .catch(() => {
        if (!alive || ctrl.signal.aborted) return
        if (!autoRetried.current) {
          autoRetried.current = true
          window.setTimeout(() => alive && setAttempt((n) => n + 1), 400)
          return
        }
        setState({ status: 'error' })
      })
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
