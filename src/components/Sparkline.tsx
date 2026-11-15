/** Tracé des valeurs annuelles publiées. Le cadrage min/max ne sert qu'à dessiner, il n'est pas affiché. */
export function Sparkline({
  series,
  color,
  label,
}: {
  series: { annee: number; valeur: number }[]
  color: string
  label: string
}) {
  if (series.length < 2) return null
  const w = 168
  const h = 44
  const pad = 3
  const vals = series.map((s) => s.valeur)
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const span = max - min || 1
  const d = series
    .map((s, i) => {
      const x = pad + (i / (series.length - 1)) * (w - pad * 2)
      const y = h - pad - ((s.valeur - min) / span) * (h - pad * 2)
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')
  return (
    <svg className="spark" viewBox={`0 0 ${w} ${h}`} role="img" aria-label={label}>
      <path className="spark-draw" pathLength={1} d={d} fill="none" stroke={color} strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}
