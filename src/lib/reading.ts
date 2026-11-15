import rulesJson from '../../public/data/rules.json'
import type { Analysis, Lang } from './types'

export interface RuleCard {
  id: string
  group: string
  direction: string
  profile: string
  when_not_significant?: boolean
  why_en: string
  why_fr: string
  questions_en: string[]
  questions_fr: string[]
  needed_en: string[]
  needed_fr: string[]
}

export const rules = rulesJson as {
  cards: RuleCard[]
  groups: Record<string, string[]>
  fallback_en: string
  fallback_fr: string
  disclaimer: { en: string; fr: string }
  level1_template: { en: string; fr: string }
  profiles: { id: string; en: string; fr: string }[]
}

export interface Reading {
  why: string
  questions: string[]
  needed: string[]
  source: 'rules' | 'gap' | 'fallback'
}

interface Gap {
  why_en: string
  why_fr: string
  questions_en: string[]
  questions_fr: string[]
  needed_en: string[]
  needed_fr: string[]
}

/**
 * Humidité de l'air : rules.json n'a pas de carte pour rh2m.
 * Questions seulement, sans consigne. Marqué dans DECISIONS.md.
 */
const HUMIDITY: Record<string, Gap> = {
  farmer: {
    why_en: 'Drier air can matter for how fast leaves lose water. It does not say that the rains have failed, and it does not say what to plant.',
    why_fr: "Un air plus sec peut compter pour la vitesse à laquelle les feuilles perdent de l'eau. Cela ne dit pas que les pluies ont manqué, ni quoi planter.",
    questions_en: [
      'Do plants on my plot wilt earlier in the day than they used to?',
      'Would a reading on the farm match this 55 km cell?',
    ],
    questions_fr: [
      'Les plantes de ma parcelle flétrissent-elles plus tôt dans la journée qu’avant ?',
      'Une mesure sur la ferme correspondrait-elle à cette maille de 55 km ?',
    ],
    needed_en: ['Notes from the plot', 'A rain gauge', 'Advice from a local extension worker'],
    needed_fr: ['Notes de la parcelle', 'Un pluviomètre', 'Le conseil d’un agent agricole local'],
  },
  architect: {
    why_en: 'Drier air can change how a room feels and how fast materials dry. By itself it does not say what to build.',
    why_fr: 'Un air plus sec peut changer le ressenti d’une pièce et la vitesse de séchage des matériaux. À lui seul, il ne dit pas quoi construire.',
    questions_en: [
      'Does indoor air feel drier in the hottest months in buildings like this one?',
      'Are shade and natural ventilation already questions for this site?',
    ],
    questions_fr: [
      'L’air intérieur semble-t-il plus sec pendant les mois les plus chauds, dans des bâtiments comme celui-ci ?',
      'L’ombre et la ventilation naturelle sont-elles déjà des questions pour ce site ?',
    ],
    needed_en: ['Hourly humidity on the site', 'How the building is used', "A local architect's judgement"],
    needed_fr: ['Humidité horaire sur le site', 'L’usage du bâtiment', 'L’avis d’un architecte local'],
  },
  health: {
    why_en: 'Drier air can matter for people who work outside in the hottest months. This record does not measure illness.',
    why_fr: 'Un air plus sec peut compter pour les personnes qui travaillent dehors pendant les mois les plus chauds. Cette série ne mesure pas les maladies.',
    questions_en: [
      'Do more people mention a dry throat or irritated eyes in those months?',
      'Is drinking water easy to reach where people wait and work?',
    ],
    questions_fr: [
      'Davantage de personnes parlent-elles d’une gorge sèche ou d’yeux irrités pendant ces mois ?',
      'L’eau potable est-elle facile à atteindre là où les gens attendent et travaillent ?',
    ],
    needed_en: ['Health records', 'Local health workers'],
    needed_fr: ['Registres de santé', 'Soignants locaux'],
  },
  urban_planner: {
    why_en: 'A drier-air signal on a 55 km cell is a reason to ask where shade and water are missing. It is not a drought map of the city.',
    why_fr: 'Un signal d’air plus sec sur une maille de 55 km invite à demander où l’ombre et l’eau manquent. Ce n’est pas une carte de sécheresse de la ville.',
    questions_en: [
      'Which markets, schools and bus stops have little shade and no water?',
      'Does this wide cell match what each neighbourhood feels? Finer maps are not in this version.',
    ],
    questions_fr: [
      'Quels marchés, quelles écoles et quels arrêts ont peu d’ombre et pas d’eau ?',
      'Cette large maille correspond-elle à ce que chaque quartier ressent ? Des cartes plus fines ne sont pas dans cette version.',
    ],
    needed_en: ['A walk through the neighbourhoods', 'A map of water points', 'City services'],
    needed_fr: ['Une visite des quartiers', 'Une carte des points d’eau', 'Les services de la ville'],
  },
}

/** Questions en plus, quand le test ne conclut pas. On ne dit pas que la pluie a baissé. */
const NEE_EXTRA: Record<string, { en: string[]; fr: string[] }> = {
  farmer: {
    en: ['Does my own rain gauge tell a different story from this 55 km cell?'],
    fr: ['Mon propre pluviomètre raconte-t-il autre chose que cette maille de 55 km ?'],
  },
  architect: {
    en: ['For tanks and drainage, do I have daily rain records? This yearly test is not conclusive.'],
    fr: ['Pour les citernes et le drainage, ai-je des pluies journalières ? Ce test annuel n’est pas concluant.'],
  },
  health: {
    en: ['Do clinic records show a shift in the rainy season that this yearly total cannot confirm?'],
    fr: ['Les registres du centre de santé montrent-ils un décalage de la saison des pluies que ce cumul annuel ne peut pas confirmer ?'],
  },
  urban_planner: {
    en: ["Have the city's own flood or dry-spell notes been checked? This yearly test is not conclusive."],
    fr: ['Les notes de la ville sur les inondations ou les périodes sèches ont-elles été relues ? Ce test annuel n’est pas concluant.'],
  },
}

function groupOf(variableId: string): string | null {
  for (const [group, ids] of Object.entries(rules.groups)) {
    if (ids.includes(variableId)) return group
  }
  return null
}

function pick<T extends 'why' | 'questions' | 'needed'>(card: RuleCard, field: T, lang: Lang): RuleCard[`${T}_en`] {
  return (lang === 'fr' ? card[`${field}_fr`] : card[`${field}_en`]) as RuleCard[`${T}_en`]
}

/**
 * Même résultat, questions différentes. Le choix suit evidence_level et significatif
 * tels que publiés : on ne compare pas un p arrondi à 0,05.
 */
export function pickReading(variableId: string, analysis: Analysis, profile: string, lang: Lang): Reading {
  if (analysis.evidence_level === 'not_enough_evidence_yet' || !analysis.significatif) {
    const base = rules.cards.find((c) => c.when_not_significant)
    if (!base) return { why: lang === 'fr' ? rules.fallback_fr : rules.fallback_en, questions: [], needed: [], source: 'fallback' }
    const extra = NEE_EXTRA[profile]
    return {
      why: pick(base, 'why', lang) as string,
      questions: [...(pick(base, 'questions', lang) as string[]), ...(extra ? (lang === 'fr' ? extra.fr : extra.en) : [])],
      needed: pick(base, 'needed', lang) as string[],
      source: extra ? 'gap' : 'rules',
    }
  }

  const group = groupOf(variableId)
  let best: RuleCard | null = null
  let bestScore = -1
  for (const card of rules.cards) {
    if (card.when_not_significant) continue
    if (card.profile !== profile && card.profile !== '*') continue
    if (card.group !== '*' && card.group !== group) continue
    if (card.direction !== '*' && card.direction !== analysis.direction) continue
    let score = 0
    if (card.profile === profile) score += 4
    if (card.group === group) score += 2
    if (card.direction === analysis.direction) score += 1
    if (score > bestScore) {
      best = card
      bestScore = score
    }
  }
  if (best) {
    return {
      why: pick(best, 'why', lang) as string,
      questions: pick(best, 'questions', lang) as string[],
      needed: pick(best, 'needed', lang) as string[],
      source: 'rules',
    }
  }

  const gap = HUMIDITY[profile]
  if (variableId === 'rh2m' && analysis.direction === 'decreasing' && gap) {
    return {
      why: lang === 'fr' ? gap.why_fr : gap.why_en,
      questions: lang === 'fr' ? gap.questions_fr : gap.questions_en,
      needed: lang === 'fr' ? gap.needed_fr : gap.needed_en,
      source: 'gap',
    }
  }

  return {
    why: lang === 'fr' ? rules.fallback_fr : rules.fallback_en,
    questions: [],
    needed: [],
    source: 'fallback',
  }
}
