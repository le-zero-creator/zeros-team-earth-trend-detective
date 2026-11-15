import { PROFILE_IDS, type ProfileId } from './profile.js'
import { ZONE_IDS } from './params.js'
import type { Lang } from './types'

export interface AskInput {
  question: string
  lang: Lang
  profile: ProfileId
  zone: string
}

const PROFILES = new Set<string>(PROFILE_IDS)
const ZONES = new Set<string>(ZONE_IDS)

/** Question courte, langue, métier et lieu dans les listes blanches. */
export function parseAsk(body: unknown): AskInput | null {
  if (!body || typeof body !== 'object') return null
  const record = body as Record<string, unknown>
  if (typeof record.question !== 'string') return null
  const question = record.question.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim()
  if (question.length < 2 || question.length > 400) return null
  const lang: Lang = record.lang === 'fr' ? 'fr' : 'en'
  const profile = typeof record.profile === 'string' && PROFILES.has(record.profile) ? (record.profile as ProfileId) : 'student'
  const zone = typeof record.zone === 'string' && ZONES.has(record.zone) ? record.zone : ''
  return { question, lang, profile, zone }
}
