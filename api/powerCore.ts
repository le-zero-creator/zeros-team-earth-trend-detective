import { cachedJson } from './guard'
import { liveLines, parsePowerPayload, powerUrl, type PowerMonth } from '../src/lib/powerSeries'

export interface PowerReading {
  label: 'Live NASA data, not yet analysed by our tests'
  source: 'NASA POWER (MERRA-2)'
  units: { t2m_max: '°C'; rh2m: '%'; precip_mm_per_day: 'mm/day' }
  latitude: number
  longitude: number
  start: number
  end: number
  months: PowerMonth[]
  lines: string
}

/** Huit derniers mois seulement. Pas de cumul, pas de pente. */
export async function readPower(lat: number, lon: number, start: number, end: number): Promise<PowerReading> {
  const key = `power:${lat}:${lon}:${start}:${end}`
  const { value } = await cachedJson(key, 60 * 60 * 6, async () => {
    const response = await fetch(powerUrl(lat, lon, start, end), {
      signal: AbortSignal.timeout(12_000),
      headers: { accept: 'application/json' },
    })
    if (!response.ok) throw new Error('power-http')
    const payload: unknown = await response.json()
    return parsePowerPayload(payload).slice(-8)
  })
  return {
    label: 'Live NASA data, not yet analysed by our tests',
    source: 'NASA POWER (MERRA-2)',
    units: { t2m_max: '°C', rh2m: '%', precip_mm_per_day: 'mm/day' },
    latitude: lat,
    longitude: lon,
    start,
    end,
    months: value,
    lines: liveLines(value),
  }
}
