import { senY } from '../lib/senLine'
import type { Analysis } from '../lib/types'

/**
 * Animated chart for the story: the published yearly points appear one by one,
 * then Sen's line (intercept + slope from results.json) is drawn. No new statistic here.
 */
export function TraceChart({ analysis, label, play }: { analysis: Analysis; label: string; play: boolean }) {
  const series = analysis.serie_annuelle
  if (series.length < 2) return null
  const w = 560
  const h = 220
  const pad = 18
  const first = series[0].annee
  const last = series[series.length - 1].annee
  const sen = (year: number) => senY(analysis.intercept, analysis.pente_decennie, year, first)
  const vals = [...series.map((s) => s.valeur), sen(first), sen(last)]
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const span = max - min || 1
  const x = (year: number) => pad + ((year - first) / (last - first || 1)) * (w - pad * 2)
  const y = (v: number) => h - pad - ((v - min) / span) * (h - pad * 2)
  const grey = analysis.evidence_level === 'not_enough_evidence_yet' || !analysis.significatif
  return (
    <svg className={`trace-chart${play ? ' is-play' : ''}${grey ? ' is-grey' : ''}`} viewBox={`0 0 ${w} ${h}`} role="img" aria-label={label}>
      <line className="trace-chart__axis" x1={pad} x2={w - pad} y1={h - pad} y2={h - pad} />
      {series.map((s, i) => (
        <circle key={s.annee} className="trace-chart__dot" cx={x(s.annee)} cy={y(s.valeur)} r={5} style={{ ['--i' as string]: i }} />
      ))}
      {!grey && (
        <path className="trace-chart__sen" pathLength={1} d={`M${x(first)} ${y(sen(first))} L${x(last)} ${y(sen(last))}`} style={{ ['--n' as string]: series.length }} />
      )}
      <text className="trace-chart__year" x={pad} y={h - 2}>{first}</text>
      <text className="trace-chart__year" x={w - pad} y={h - 2} textAnchor="end">{last}</text>
    </svg>
  )
}
