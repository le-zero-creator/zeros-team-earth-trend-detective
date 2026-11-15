// Liste blanche des paramètres d'URL : toute valeur inconnue est remplacée par la valeur par défaut.

export const ZONE_IDS = [
  'cmr_yaounde',
  'cmr_yokadouma',
  'cog_ouesso',
  'caf_bangui',
  'cod_mbandaka',
  'cod_kinshasa',
  'cod_salonga_forest',
  'cod_kisangani',
  'cod_kananga',
  'cod_bukavu',
  'cod_lubumbashi',
] as const

export const VARIABLE_IDS = ['t2m', 't2m_max', 't2m_min', 'ts', 'precip', 'rh2m', 'solar', 'wind', 'soil_root'] as const

export const PERIOD_IDS = ['p2001_2025', 'p1981_2025'] as const

export const DEFAULTS = { zone: 'cmr_yaounde', var: 't2m_max', period: 'p2001_2025' } as const

function pick(value: string | null, allowed: readonly string[], fallback: string): string {
  return value !== null && allowed.includes(value) ? value : fallback
}

export function safeParams(search: URLSearchParams) {
  return {
    zone: pick(search.get('zone'), ZONE_IDS, DEFAULTS.zone),
    var: pick(search.get('var'), VARIABLE_IDS, DEFAULTS.var),
    period: pick(search.get('period'), PERIOD_IDS, DEFAULTS.period),
  }
}

export const STEP_IDS = ['place', 'clues', 'evidence', 'act'] as const
export type StepId = (typeof STEP_IDS)[number]

/** Étape d'écran seulement. Une valeur inconnue ouvre l'analyse (le cœur jugé). */
export function safeStep(value: string | null): StepId {
  return value !== null && (STEP_IDS as readonly string[]).includes(value) ? (value as StepId) : 'evidence'
}

export function investigateLink(zone: string, variable: string, period: string): string {
  const p = safeParams(new URLSearchParams({ zone, var: variable, period }))
  return `/investigate?zone=${p.zone}&var=${p.var}&period=${p.period}`
}
