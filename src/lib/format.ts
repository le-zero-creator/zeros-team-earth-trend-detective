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

/** Mots simples pour le même slope_unit. Le nombre ne change pas. */
const PLAIN_UNIT: Record<string, Record<Lang, string>> = {
  '°C per decade': { en: '°C every 10 years', fr: '°C tous les 10 ans' },
  'percentage points per decade': { en: 'points every 10 years', fr: 'points tous les 10 ans' },
  'mm per decade (annual total)': { en: 'mm every 10 years', fr: 'mm tous les 10 ans' },
  'MJ/m²/day per decade': { en: 'sun units every 10 years', fr: 'unités de soleil tous les 10 ans' },
  'm/s per decade': { en: 'm/s every 10 years', fr: 'm/s tous les 10 ans' },
  'fraction per decade': { en: 'steps every 10 years', fr: 'parts tous les 10 ans' },
}

export function plainUnit(slopeUnit: string, lang: Lang): string {
  return PLAIN_UNIT[slopeUnit]?.[lang] ?? slopeUnit
}

/** Nombre déjà publié, sans signe forcé. Aucun calcul : seulement l'affichage. */
export function formatNumber(value: number, decimals: number, lang: Lang): string {
  return new Intl.NumberFormat(lang, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
    .format(value)
    .replace('-', MINUS)
}
