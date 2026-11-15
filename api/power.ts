import { allow, clientIp, json } from './guard.js'
import { readPower } from './powerCore.js'
import { readCoord, readYear } from '../src/lib/powerSeries.js'

export const maxDuration = 15

/** Mois NASA POWER pour un point. Mis en cache six heures. Ce n'est pas un test de tendance. */
export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'GET') return json({ error: 'bad' }, 405)
  if (!(await allow(clientIp(request), 'power', 30, 600))) return json({ error: 'rate' }, 429)

  const query = new URL(request.url).searchParams
  const lat = readCoord(query.get('lat'), 'lat')
  const lon = readCoord(query.get('lon'), 'lon')
  const start = readYear(query.get('start') ?? '2025')
  const end = readYear(query.get('end') ?? '2026')
  if (lat === null || lon === null || start === null || end === null || start > end) return json({ error: 'bad' }, 400)

  try {
    const reading = await readPower(lat, lon, start, end)
    return json(reading, 200, 'public, s-maxage=3600, stale-while-revalidate=86400')
  } catch {
    return json({ error: 'down' }, 502)
  }
}
