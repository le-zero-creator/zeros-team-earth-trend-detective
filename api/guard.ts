import { getCache } from '@vercel/functions'

const memory = new Map<string, { n: number; exp: number }>()

export function clientIp(request: Request): string {
  const raw = request.headers.get('x-forwarded-for') ?? ''
  const ip = raw.split(',')[0]?.trim() ?? ''
  if (!/^[0-9a-fA-F:.]+$/.test(ip) || ip.length > 64) return 'unknown'
  return ip
}

/** Compteur court dans le Runtime Cache. Sans cache (hors Vercel), un compteur mémoire de secours. */
export async function allow(ip: string, bucket: string, limit: number, windowSec: number): Promise<boolean> {
  const slot = Math.floor(Date.now() / (windowSec * 1000))
  const key = `rl:${bucket}:${ip}:${slot}`
  try {
    const cache = getCache({ namespace: 'terra-trace' })
    const raw = await cache.get(key)
    const current = typeof raw === 'number' ? raw : Number(raw ?? 0)
    const count = Number.isFinite(current) ? current : 0
    if (count >= limit) return false
    await cache.set(key, count + 1, { ttl: windowSec, name: 'rate' })
    return true
  } catch {
    const now = Date.now()
    const row = memory.get(key)
    const count = row && row.exp > now ? row.n : 0
    if (count >= limit) return false
    memory.set(key, { n: count + 1, exp: now + windowSec * 1000 })
    return true
  }
}

export async function cachedJson<T>(key: string, ttl: number, load: () => Promise<T>): Promise<{ value: T; hit: boolean }> {
  const cache = getCache({ namespace: 'terra-trace' })
  try {
    const hit = await cache.get(key)
    if (hit !== null && hit !== undefined) return { value: hit as T, hit: true }
  } catch {
    /* le cache peut manquer hors Vercel : on lit la source */
  }
  const value = await load()
  try {
    await cache.set(key, value, { ttl, name: 'nasa-power', tags: ['nasa-power'] })
  } catch {
    /* une réponse fraîche reste valable même si le cache refuse l'écriture */
  }
  return { value, hit: false }
}

export function json(body: unknown, status: number, cache = 'no-store'): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': cache,
      'x-content-type-options': 'nosniff',
    },
  })
}
