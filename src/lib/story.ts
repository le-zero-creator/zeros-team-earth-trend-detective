import type { Analysis } from './types'

/** Couleurs parlées de la carte d'accueil. Le gris est réservé au manque de preuves. */
export const STORY_COLOR = {
  warmer: '#E36414',
  cooler: '#2C6E8A',
  drier: '#8A4B2A',
  wetter: '#1F7A6F',
  unsure: '#64748B',
} as const

export type StoryWord = keyof typeof STORY_COLOR

const HEAT = new Set(['t2m', 't2m_max', 't2m_min', 'ts'])
const MOIST = new Set(['precip', 'rh2m', 'soil_root'])

/** Mot de légende. Le niveau de preuve vient de results.json : on ne recalcule pas un seuil. */
export function storyWord(variableId: string, a: Analysis): StoryWord {
  if (a.evidence_level === 'not_enough_evidence_yet') return 'unsure'
  if (HEAT.has(variableId)) return a.direction === 'increasing' ? 'warmer' : 'cooler'
  if (MOIST.has(variableId)) return a.direction === 'decreasing' ? 'drier' : 'wetter'
  return a.direction === 'increasing' ? 'warmer' : 'cooler'
}

/**
 * Cadres de la caméra pour les régions pas encore analysées.
 * Coordonnées de cadrage seulement : aucune série, aucune pente.
 */
export const COMING_REGIONS = [
  { id: 'amazon', lat: -3.4, lon: -62 },
  { id: 'seasia', lat: 5, lon: 114 },
  { id: 'europe', lat: 50, lon: 10 },
  { id: 'namerica', lat: 40, lon: -98 },
  { id: 'sahel', lat: 16, lon: 8 },
  { id: 'arctic', lat: 72, lon: 0 },
  { id: 'pacific', lat: -8, lon: 165 },
] as const

export type ComingRegionId = (typeof COMING_REGIONS)[number]['id']

export function periodLabel(period: string): string {
  return period.replace('-', '–')
}
