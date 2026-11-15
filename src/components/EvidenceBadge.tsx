import { useI18n } from '../i18n'
import type { Direction, EvidenceLevel } from '../lib/types'

/** Icône du niveau de preuve : jamais la couleur seule. */
export function evidenceIcon(level: EvidenceLevel, direction: Direction): string {
  if (level === 'not_enough_evidence_yet') return '≈'
  const arrow = direction === 'increasing' ? '▲' : '▼'
  return level === 'robust' ? arrow : `${arrow}?`
}

export function EvidenceBadge({ level, direction }: { level: EvidenceLevel; direction: Direction }) {
  const { t } = useI18n()
  const withDirection = level !== 'not_enough_evidence_yet'
  return (
    <span className={`badge badge--${level}${withDirection ? ` badge--${direction}` : ''}`} data-evidence={level}>
      <span aria-hidden="true" className="badge__icon">
        {evidenceIcon(level, direction)}
      </span>
      <span>{t(`evidence.${level}`)}</span>
      {withDirection && <span className="sr-only">, {t(`direction.${direction}`)}</span>}
    </span>
  )
}
