/** Lecture de la réponse NASA POWER. Aucune pente, aucune moyenne : on recopie les mois. */

export interface PowerMonth {
  month: string
  t2m_max: number | null
  rh2m: number | null
  precip_mm_per_day: number | null
}

const MONTH = /^\d{6}$/

function clean(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= -998) return null
  return Math.round(value * 100) / 100
}

/** Garde les mois YYYYMM. Les clés annuelles (ANN) ne sont pas un résultat de nos tests. */
export function parsePowerPayload(body: unknown): PowerMonth[] {
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
}

/** Latitude ou longitude écrite par l'utilisateur. Quatre décimales au plus, rien d'autre. */
export function readCoord(value: string | null, kind: 'lat' | 'lon'): number | null {
  if (value == null || !/^-?\d{1,3}(\.\d{1,4})?$/.test(value)) return null
  const n = Number(value)
  if (!Number.isFinite(n)) return null
  if (kind === 'lat' && (n < -90 || n > 90)) return null
  if (kind === 'lon' && (n < -180 || n > 180)) return null
  return n
}

/** Année NASA POWER autorisée. Hors de la fenêtre : refus, pas de valeur de repli silencieuse. */
export function readYear(value: string | null): number | null {
  if (value == null || !/^\d{4}$/.test(value)) return null
  const year = Number(value)
  if (year < 1981 || year > 2026) return null
  return year
}

export function powerUrl(lat: number, lon: number, start: number, end: number): string {
  const url = new URL('https://power.larc.nasa.gov/api/temporal/monthly/point')
  url.searchParams.set('parameters', 'T2M_MAX,RH2M,PRECTOTCORR')
  url.searchParams.set('community', 'AG')
  url.searchParams.set('longitude', String(lon))
  url.searchParams.set('latitude', String(lat))
  url.searchParams.set('start', String(start))
  url.searchParams.set('end', String(end))
  url.searchParams.set('format', 'JSON')
  return url.toString()
}

/** Texte court pour le modèle. Les unités sont celles de NASA POWER, pas nos pentes. */
export function liveLines(months: PowerMonth[]): string {
  return months
    .map((row) => {
      const parts = [`${row.month}`]
      if (row.t2m_max !== null) parts.push(`T2M_MAX ${row.t2m_max} °C`)
      if (row.rh2m !== null) parts.push(`RH2M ${row.rh2m} %`)
      if (row.precip_mm_per_day !== null) parts.push(`PRECTOTCORR ${row.precip_mm_per_day} mm/day`)
      return parts.join(' | ')
    })
    .join('\n')
}
