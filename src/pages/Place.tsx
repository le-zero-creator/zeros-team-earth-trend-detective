import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { EvidenceView } from '../components/EvidenceView'
import { CountUp } from '../components/CountUp'
import { useI18n, type Key } from '../i18n'
import { useData } from '../lib/data'
import { SLOPE_DECIMALS, plainUnit } from '../lib/format'
import { ZONE_IDS } from '../lib/params'

export function Place() {
  const { t, lang } = useI18n()
  const { zoneId: raw } = useParams()
  const zoneId = raw && (ZONE_IDS as readonly string[]).includes(raw) ? raw : 'cmr_yaounde'
  const { state } = useData()
  const [open, setOpen] = useState(false)
  if (state.status !== 'ready') return <p role="status">{t('state.loading')}</p>
  const zone = state.data.zones.find((item) => item.zone_id === zoneId) ?? state.data.zones[0]
  const analysis = state.data.results.analyses.find((item) => item.zone_id === zone.zone_id && item.variable_id === 't2m_max' && item.period_id === 'p2001_2025')
  const variable = state.data.results.variables.find((item) => item.variable_id === 't2m_max')
  const source = state.data.results.meta.sources.find((item) => item.id === 'merra2')
  if (!analysis || !variable) return <p>{t('state.error.body')}</p>
  const unsure = analysis.evidence_level === 'not_enough_evidence_yet' || !analysis.significatif
  const analyses = new Map([[zone.zone_id, analysis]])
  return (
    <article className="place-page">
      <p className="kicker">{lang === 'fr' ? zone.name_fr : zone.name_en}</p>
      <h1>{t('plain.var.t2m_max')}</h1>
      <p>{t('place.lead')}</p>
      <p className="story-num">
        {unsure ? t('plain.notSure') : <CountUp value={analysis.pente_decennie} decimals={SLOPE_DECIMALS.t2m_max} lang={lang} />}{' '}
        {!unsure && plainUnit(analysis.slope_unit, lang)}
      </p>
      <p className="note">{t('means.source')}</p>
      {!zone.in_hydrobasins_congo && <p>{t('yaounde.outsideKm', { km: zone.distance_to_basin_km })}</p>}
      <button type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        {t('place.deeper')}
      </button>
      {open && (
        <EvidenceView
          analysis={analysis}
          variable={variable}
          zone={zone}
          source={source}
          zones={state.data.zones}
          analyses={analyses}
          onAct={() => {}}
        />
      )}
      <p className="note">{t(`evidence.plain.${analysis.evidence_level}` as Key)}</p>
    </article>
  )
}
