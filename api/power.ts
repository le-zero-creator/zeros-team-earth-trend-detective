import { getCache } from '@vercel/functions'
import type { IncomingMessage, ServerResponse } from 'node:http'

/** Signature Node (req, res). Un seul fichier : aucun import local, sinon Node ESM plante au démarrage. */
export const config = { runtime: 'nodejs' }
export const maxDuration = 15

type NodeReq = IncomingMessage & { query?: Record<string, string | string[]> }

const MONTH = /^\d{6}$/
const memory = new Map<string, { n: number; exp: number }>()

function send(res: ServerResponse, status: number, body: unknown, cache = 'no-store') {
  res.statusCode = status
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.setHeader('cache-control', cache)
  res.setHeader('x-content-type-options', 'nosniff')
  res.end(JSON.stringify(body))
}

function header(req: IncomingMessage, name: string): string {
  const value = req.headers[name]
  return Array.isArray(value) ? value[0] ?? '' : value ?? ''
}

function clientIp(req: IncomingMessage): string {
  const ip = header(req, 'x-forwarded-for').split(',')[0]?.trim() ?? ''
  if (!/^[0-9a-fA-F:.]+$/.test(ip) || ip.length > 64) return 'unknown'
  return ip
}

async function allow(ip: string, limit: number): Promise<boolean> {
  const key = `rl:power:${ip}:${Math.floor(Date.now() / 600_000)}`
  try {
    const cache = getCache({ namespace: 'terra-trace' })
    const raw = await cache.get(key)
    const current = typeof raw === 'number' ? raw : Number(raw ?? 0)
    const count = Number.isFinite(current) ? current : 0
    if (count >= limit) return false
    await cache.set(key, count + 1, { ttl: 600, name: 'rate' })
    return true
  } catch {
    const now = Date.now()
    const row = memory.get(key)
    const count = row && row.exp > now ? row.n : 0
    if (count >= limit) return false
    memory.set(key, { n: count + 1, exp: now + 600_000 })
    return true
  }
}

function readCoord(value: string | null, kind: 'lat' | 'lon'): number | null {
  if (value == null || !/^-?\d{1,3}(\.\d{1,4})?$/.test(value)) return null
  const n = Number(value)
  if (!Number.isFinite(n)) return null
  if (kind === 'lat' && (n < -90 || n > 90)) return null
  if (kind === 'lon' && (n < -180 || n > 180)) return null
  return n
}

function readYear(value: string | null): number | null {
  if (value == null || !/^\d{4}$/.test(value)) return null
  const year = Number(value)
  if (year < 1981 || year > 2026) return null
  return year
}

function one(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}

function clean(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= -998) return null
  return Math.round(value * 100) / 100
}

function parseMonths(body: unknown) {
  if (!body || typeof body !== 'object') return []
  const parameter = (body as { properties?: { parameter?: Record<string, Record<string, unknown>> } }).properties?.parameter
  if (!parameter) return []
  const keys = new Set<string>()
  for (const series of Object.values(parameter)) {
    if (!series || typeof series !== 'object') continue
    for (const key of Object.keys(series)) if (MONTH.test(key)) keys.add(key)
  }
  return [...keys]
    .sort()
    .map((key) => ({
      month: `${key.slice(0, 4)}-${key.slice(4)}`,
      t2m_max: clean(parameter.T2M_MAX?.[key]),
      rh2m: clean(parameter.RH2M?.[key]),
      precip_mm_per_day: clean(parameter.PRECTOTCORR?.[key]),
    }))
    .filter((row) => row.t2m_max !== null || row.rh2m !== null || row.precip_mm_per_day !== null)
    .slice(-8)
}

export default async function handler(req: NodeReq, res: ServerResponse) {
  if (req.method !== 'GET') return send(res, 405, { error: 'bad' })
  if (!(await allow(clientIp(req), 30))) return send(res, 429, { error: 'rate' })

  const url = new URL(req.url ?? '/', 'https://trend-detective-congo.vercel.app')
  const lat = readCoord(one(req.query?.lat) ?? url.searchParams.get('lat'), 'lat')
  const lon = readCoord(one(req.query?.lon) ?? url.searchParams.get('lon'), 'lon')
  const start = readYear(one(req.query?.start) ?? url.searchParams.get('start') ?? '2025')
  const end = readYear(one(req.query?.end) ?? url.searchParams.get('end') ?? '2026')
  if (lat === null || lon === null || start === null || end === null || start > end) return send(res, 400, { error: 'bad' })

  const key = `power:${lat}:${lon}:${start}:${end}`
  try {
    let hit: unknown = null
    let cache: ReturnType<typeof getCache> | null = null
    try {
      cache = getCache({ namespace: 'terra-trace' })
      hit = await cache.get(key)
    } catch {
      cache = null
    }
    const months = Array.isArray(hit)
      ? hit
      : await (async () => {
          const remote = new URL('https://power.larc.nasa.gov/api/temporal/monthly/point')
          remote.searchParams.set('parameters', 'T2M_MAX,RH2M,PRECTOTCORR')
          remote.searchParams.set('community', 'AG')
          remote.searchParams.set('longitude', String(lon))
          remote.searchParams.set('latitude', String(lat))
          remote.searchParams.set('start', String(start))
          remote.searchParams.set('end', String(end))
          remote.searchParams.set('format', 'JSON')
          const response = await fetch(remote, { signal: AbortSignal.timeout(12_000), headers: { accept: 'application/json' } })
          if (!response.ok) throw new Error('power-http')
          const parsed = parseMonths(await response.json())
          if (cache) await cache.set(key, parsed, { ttl: 60 * 60 * 6, name: 'nasa-power', tags: ['nasa-power'] }).catch(() => undefined)
          return parsed
        })()
    return send(
      res,
      200,
      {
        label: 'Live NASA data, not yet analysed by our tests',
        source: 'NASA POWER (MERRA-2)',
        units: { t2m_max: '°C', rh2m: '%', precip_mm_per_day: 'mm/day' },
        latitude: lat,
        longitude: lon,
        start,
        end,
        months,
      },
      'public, s-maxage=3600, stale-while-revalidate=86400',
    )
  } catch (error) {
    console.error('power-failed', error instanceof Error ? error.name : 'error')
    return send(res, 502, { error: 'down' })
  }
}
