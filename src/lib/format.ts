// Formatage des nombres uniquement. Aucun calcul statistique ici (règle bloquante).
import type { Lang } from './types'

const MINUS = '−'

/** Décimales affichées pour la pente, selon la variable. */
export const SLOPE_DECIMALS: Record<string, number> = {
  t2m: 2,
  t2m_max: 2,
  t2m_min: 2,
  ts: 2,
  precip: 0,
  rh2m: 2,
  solar: 2,
  wind: 3,
  soil_root: 3,
}

/** Valeur p : « n/a » si absente, « < 0.001 » si très petite, sinon 3 chiffres significatifs. */
export function formatP(p: number | null | undefined, lang: Lang): string {
  if (p === null || p === undefined || Number.isNaN(p)) return 'n/a'
  if (p < 0.001) return `< ${new Intl.NumberFormat(lang, { minimumFractionDigits: 3 }).format(0.001)}`
  return new Intl.NumberFormat(lang, { maximumSignificantDigits: 3 }).format(p)
}

/** Nombre avec signe explicite (+ ou −), pour une pente ou une variation. */
export function formatSigned(value: number, decimals: number, lang: Lang): string {
  return new Intl.NumberFormat(lang, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    signDisplay: 'exceptZero',
  })
    .format(value)
    .replace('-', MINUS)
}

/** Pente par décennie telle que fournie par results.json, suivie de son unité (slope_unit). */
export function formatSlope(value: number, variableId: string, slopeUnit: string, lang: Lang): string {
  return `${formatSigned(value, SLOPE_DECIMALS[variableId] ?? 2, lang)} ${slopeUnit}`
}
