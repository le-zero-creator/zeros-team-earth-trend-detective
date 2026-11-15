import { formatSigned } from '../lib/format'
import type { Lang } from '../lib/types'

/**
 * Affiche le nombre publié, déjà formaté. Pas de décompte :
 * une capture ou un appareil lent doit voir la valeur finale, pas +0,38 puis +0,54.
 * prefers-reduced-motion n'a rien à couper, parce qu'il n'y a pas d'animation.
 */
export function CountUp({ value, decimals, lang }: { value: number; decimals: number; lang: Lang }) {
  return <span data-figure="final">{formatSigned(value, decimals, lang)}</span>
}
