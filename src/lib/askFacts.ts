import { formatP, formatSlope } from './format'
import type { Results, Zone } from './types'

/**
 * Résumé textuel de results.json pour Ask Terra.
 * Chaque nombre est recopié par le formateur existant. Rien n'est recalculé.
 */
export function buildFacts(input: { results: Results; zones: Zone[] }): string {
  const { results, zones } = input
  const lines: string[] = []
  lines.push(`SCOPE_EN: ${results.meta.scope_en}`)
  lines.push(`SCOPE_FR: ${results.meta.scope_fr}`)
  lines.push('Eleven selected places are not the average of the Congo Basin.')
  lines.push('Air temperature variables (t2m, t2m_max, t2m_min) are not skin temperature (ts).')
  lines.push('A non-significant result is labelled not enough evidence yet.')
  lines.push('Say "reproduced", never "validated". MODIS, GPM and other pending sources are not available.')
  for (const zone of zones) {
    lines.push(
      [
        `PLACE ${zone.zone_id}`,
        zone.name_en,
        zone.country,
        `lat ${zone.lat}`,
        `lon ${zone.lon}`,
        `in_hydrobasins_congo ${zone.in_hydrobasins_congo}`,
        `distance_to_basin_km ${zone.distance_to_basin_km}`,
        zone.note_en,
      ].join(' | '),
    )
  }
  for (const source of results.meta.sources) {
    lines.push(`SOURCE ${source.id} | ${source.name} | status ${source.status}`)
  }
  const names = new Map(results.variables.map((variable) => [variable.variable_id, variable.name.en]))
  for (const analysis of results.analyses) {
    lines.push(
      [
        analysis.zone_id,
        analysis.variable_id,
        names.get(analysis.variable_id) ?? analysis.variable_id,
        analysis.period,
        formatSlope(analysis.pente_decennie, analysis.variable_id, analysis.slope_unit, 'en'),
        `evidence ${analysis.evidence_level}`,
        analysis.direction,
        analysis.significatif ? 'significant' : 'not_significant',
        `p_mk ${formatP(analysis.p_mk, 'en')}`,
        `p_smk ${formatP(analysis.p_smk, 'en')}`,
        `p_hr ${formatP(analysis.p_hr, 'en')}`,
        `q_bh ${formatP(analysis.q_bh, 'en')}`,
        `n_years ${analysis.n_years}`,
      ].join(' | '),
    )
  }
  return lines.join('\n')
}
