import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { EvidenceBadge } from './EvidenceBadge'
import { senY } from '../lib/senLine'
import type { Analysis } from '../lib/types'

export function chartRows(a: Analysis) {
  const first = a.serie_annuelle[0]?.annee ?? 0
  return a.serie_annuelle.map((point) => ({
    year: point.annee,
    value: point.valeur,
    sen: senY(a.intercept, a.pente_decennie, point.annee, first),
  }))
}

/**
 * Série annuelle + droite de Sen. Pas de bande autour des points :
 * l'intervalle de confiance reste en chiffres, à côté du graphique.
 * L'animation de tracé de Recharts laisse un stroke-dasharray qui cache
 * la courbe (vu sur le site publié, Chrome headless). Les lignes sont donc dessinées d'un coup.
 */
export function TrendChart({ analysis, alt, valueName, lineName }: { analysis: Analysis; alt: string; valueName: string; lineName: string }) {
  const rows = chartRows(analysis)
  const grey = analysis.evidence_level === 'not_enough_evidence_yet'
  const span = rows.flatMap((row) => [row.value, row.sen])
  const low = Math.min(...span)
  const high = Math.max(...span)
  const pad = (high - low) * 0.25 || 1
  return (
    <div className="chart-box" role="img" aria-label={alt}>
      <div className="chart-badge">
        <EvidenceBadge level={analysis.evidence_level} direction={analysis.direction} />
      </div>
      <div aria-hidden="true" className="chart-plot">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 16, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#d3e4d4" vertical={false} />
            <XAxis dataKey="year" tick={{ fill: '#3e4c59', fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis
              domain={[low - pad, high + pad]}
              tickCount={4}
              tickFormatter={(value: number) => value.toFixed(high - low >= 80 ? 0 : high - low >= 8 ? 1 : 2)}
              tick={{ fill: '#3e4c59', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={44}
            />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              name={valueName}
              stroke="#10281c"
              strokeWidth={2.4}
              dot={{ r: 3, fill: '#10281c' }}
              isAnimationActive={false}
            />
            <Line
              type="linear"
              dataKey="sen"
              name={lineName}
              stroke={grey ? '#64748b' : '#e36414'}
              strokeWidth={2.2}
              strokeDasharray="6 5"
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
