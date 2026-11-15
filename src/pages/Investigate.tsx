import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { BasinMap } from '../components/BasinMap'
import { Scene, type SceneName } from '../components/Scene'
import { EvidenceView } from '../components/EvidenceView'
import { EvidenceSlides } from '../components/EvidenceSlides'
import { PersonaPanel } from '../components/PersonaPanel'
import { SoonNote } from '../components/WorldStage'
import { useI18n, type Key } from '../i18n'
import { useData } from '../lib/data'
import { formatSlope } from '../lib/format'
import { STEP_IDS, investigateLink, safeParams, safeStep, type StepId } from '../lib/params'
import { COMING_REGIONS, periodLabel } from '../lib/story'
import type { Analysis, Source, Variable, Zone } from '../lib/types'

function investigateScene(step: string, variable: string): SceneName {
  if (step === 'place') return 'nasa-africa-radar'
  if (step === 'clues') return 'nasa-gulf'
  if (step === 'act') return 'nasa-soil'
  if (variable === 'rh2m') return 'nasa-clouds'
  if (variable === 'precip') return 'nasa-gpm'
  if (variable === 't2m_max' || variable === 't2m' || variable === 'ts' || variable === 't2m_min') return 'nasa-cameroon'
  return 'nasa-congo-river'
}

function investigateAlt(step: string, variable: string): Key {
  if (step === 'place') return 'scene.radar'
  if (step === 'clues') return 'scene.gulf'
  if (step === 'act') return 'scene.soil'
  if (variable === 'rh2m') return 'scene.clouds'
  if (variable === 'precip') return 'scene.gpm'
  if (variable === 't2m_max' || variable === 't2m' || variable === 'ts' || variable === 't2m_min') return 'scene.cameroon'
  return 'scene.river'
}

export function Investigate() {
  const { t } = useI18n()
  const { state, retry } = useData()
  const [params] = useSearchParams()
  const safe = safeParams(params)
  const step = safeStep(params.get('step'))
  const navigate = useNavigate()

  function go(next: { zone?: string; var?: string; period?: string; step?: StepId }) {
    const zone = next.zone ?? safe.zone
    const variable = next.var ?? safe.var
    const period = next.period ?? safe.period
    const nextStep = next.step ?? step
    const base = investigateLink(zone, variable, period)
    navigate(nextStep === 'evidence' ? base : `${base}&step=${nextStep}`)
  }

  const index = STEP_IDS.indexOf(step)

  return (
    <div className="investigate">
      <Scene name={investigateScene(step, safe.var)} alt={t(investigateAlt(step, safe.var))} />
      <nav className="stepper" aria-label={t('step.nav')}>
        {STEP_IDS.map((id) => (
          <button key={id} type="button" aria-current={id === step ? 'step' : undefined} onClick={() => go({ step: id })}>
            {t(`step.${id}` as Key)}
          </button>
        ))}
      </nav>
      {state.status === 'loading' && (
        <div className="card skeleton" role="status">
          <p className="skeleton__text">{t('state.loading')}</p>
        </div>
      )}
      {state.status === 'error' && (
        <div className="card error" role="alert">
          <h2>{t('state.error.title')}</h2>
          <p>{t('state.error.body')}</p>
          <button type="button" className="cta" onClick={retry}>
            {t('state.error.retry')}
          </button>
        </div>
      )}
      {state.status === 'ready' && (
        <InvestigateStep
          dataZones={state.data.zones}
          boundary={state.data.boundary}
          analyses={state.data.results.analyses}
          variables={state.data.results.variables}
          sources={state.data.results.meta.sources}
          zoneId={safe.zone}
          variableId={safe.var}
          periodId={safe.period}
          step={step}
          onGo={go}
        />
      )}
      <div className="step-nav">
        {index > 0 && (
          <button type="button" onClick={() => go({ step: STEP_IDS[index - 1] })}>
            {t('step.back')}
          </button>
        )}
        {index < STEP_IDS.length - 1 && (
          <button type="button" className="cta" onClick={() => go({ step: STEP_IDS[index + 1] })}>
            {t('step.next')}
          </button>
        )}
        <Link to="/">{t('soon.back')}</Link>
      </div>
    </div>
  )
}

function InvestigateStep({
  dataZones,
  boundary,
  analyses,
  variables,
  sources,
  zoneId,
  variableId,
  periodId,
  step,
  onGo,
}: {
  dataZones: Zone[]
  boundary: GeoJSON.FeatureCollection
  analyses: Analysis[]
  variables: Variable[]
  sources: Source[]
  zoneId: string
  variableId: string
  periodId: string
  step: StepId
  onGo: (next: { zone?: string; var?: string; period?: string; step?: StepId }) => void
}) {
  const { t, lang } = useI18n()
  const zone = dataZones.find((z) => z.zone_id === zoneId) ?? dataZones[0]
  const variable = variables.find((v) => v.variable_id === variableId) ?? variables[0]
  const analysis = analyses.find((a) => a.zone_id === zone.zone_id && a.variable_id === variable.variable_id && a.period_id === periodId)
  const forVariable = useMemo(
    () =>
      new Map<string, Analysis>(
        analyses.filter((a) => a.variable_id === variable.variable_id && a.period_id === periodId).map((a) => [a.zone_id, a]),
      ),
    [analyses, variable.variable_id, periodId],
  )
  const [soonPlace, setSoonPlace] = useState<string | null>(null)
  const place = lang === 'fr' ? zone.name_fr : zone.name_en
  const period = analysis ? periodLabel(analysis.period) : periodId
  const unsure = !analysis || analysis.evidence_level === 'not_enough_evidence_yet' || !analysis.significatif
  const observed =
    analysis &&
    (unsure
      ? t('observe.unsure', { place, what: variable.name[lang], period })
      : t('observe.sig', {
          place,
          what: variable.name[lang],
          slope: formatSlope(analysis.pente_decennie, analysis.variable_id, analysis.slope_unit, lang),
          period,
          level: t(`evidence.plain.${analysis.evidence_level}` as Key),
        }))

  return (
    <div className="step-panel">
      {step === 'place' && (
        <section aria-labelledby="place-title">
          <h1 id="place-title">{t('step.place')}</h1>
          <p className="note">{t('home.map.note')}</p>
          <BasinMap
            zones={dataZones}
            boundary={boundary}
            analyses={forVariable}
            alt={t('home.map.alt', { n: forVariable.size, variable: variable.name[lang], period })}
            onSelect={(id) => onGo({ zone: id, step: 'clues' })}
          />
          <ul className="place-list">
            {dataZones.map((z) => {
              const name = lang === 'fr' ? z.name_fr : z.name_en
              return (
                <li key={z.zone_id}>
                  <button type="button" aria-pressed={z.zone_id === zone.zone_id} onClick={() => onGo({ zone: z.zone_id, step: 'clues' })}>
                    <span className={z.in_hydrobasins_congo ? 'zone-dot' : 'zone-dot zone-dot--hollow'} aria-hidden="true" />
                    {name}
                    {!z.in_hydrobasins_congo && <small className="outside">{t('yaounde.outsideKm', { km: z.distance_to_basin_km })}</small>}
                  </button>
                </li>
              )
            })}
          </ul>
          <h2>{t('future.world')}</h2>
          <ul className="place-list">
            {COMING_REGIONS.map((r) => (
              <li key={r.id}>
                <button type="button" className="is-soon" title={t('soon.tip')} onClick={() => setSoonPlace(t(`region.${r.id}` as Key))}>
                  {t(`region.${r.id}` as Key)}
                  <span className="soon-badge">{t('soon.badge')}</span>
                </button>
              </li>
            ))}
          </ul>
          {soonPlace && <SoonNote label={soonPlace} />}
        </section>
      )}

      {step === 'clues' && (
        <section aria-labelledby="clue-title">
          <h1 id="clue-title">{place.split('–')[0].split('—')[0].trim()}</h1>
          <p>{t('clue.pick')}</p>
          <fieldset className="segmented">
            <legend>{t('science.period')}</legend>
            {(['p2001_2025', 'p1981_2025'] as const).map((id) => (
              <label key={id} className={periodId === id ? 'is-on' : undefined}>
                <input type="radio" name="period" checked={periodId === id} onChange={() => onGo({ period: id })} />
                {id.slice(1).replace('_', '–')}
              </label>
            ))}
          </fieldset>
          <ul className="clue-grid">
            {variables.map((v) => {
              return (
                <li key={v.variable_id}>
                  <button type="button" className="clue" aria-pressed={v.variable_id === variable.variable_id} onClick={() => onGo({ var: v.variable_id, step: 'evidence' })}>
                    <strong>{t(`plain.var.${v.variable_id}` as Key)}</strong>
                  </button>
                </li>
              )
            })}
          </ul>
          <h2>{t('clue.pendingTitle')}</h2>
          <ul className="future-row">
            {(['modis_ndvi', 'modis_lst', 'gpm_imerg'] as const).map((id) => {
              const source = sources.find((s) => s.id === id)
              return (
                <li key={id}>
                  <button type="button" className="chip chip--soon" data-future={source?.status ?? 'pending'} title={t('soon.tip')} onClick={() => setSoonPlace(source?.name ?? id)}>
                    {source?.name}
                    <span className="pill pill--pending">{t('status.pending')}</span>
                  </button>
                </li>
              )
            })}
          </ul>
          {soonPlace && <SoonNote label={soonPlace} />}
        </section>
      )}

      {step === 'evidence' && analysis && (
        <section aria-labelledby="evidence-title">
          <h1 id="evidence-title" className="sec-display ev-h1">
            {place.split('–')[0].split('—')[0].trim()}
          </h1>
          <EvidenceSlides
            zone={zone}
            analysis={analysis}
            variable={variable}
            source={sources.find((s) => s.id === analysis.source_id)}
            zoneAnalyses={analyses.filter((a) => a.zone_id === zone.zone_id && a.period_id === periodId)}
            onDone={() => document.getElementById('ev-details')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          />
          <h2 id="ev-details" className="sec-title ev-details-title">{t('ev.details')}</h2>
          <div className="chart-controls">
            <label>
              {t('ask.place')}
              <select value={zone.zone_id} onChange={(event) => onGo({ zone: event.target.value })}>
                {dataZones.map((item) => (
                  <option key={item.zone_id} value={item.zone_id}>
                    {lang === 'fr' ? item.name_fr : item.name_en}
                  </option>
                ))}
              </select>
            </label>
            <fieldset className="segmented">
              <legend>{t('science.period')}</legend>
              {(['p2001_2025', 'p1981_2025'] as const).map((id) => (
                <label key={id} className={periodId === id ? 'is-on' : undefined}>
                  <input type="radio" name="evidence-period" checked={periodId === id} onChange={() => onGo({ period: id })} />
                  {id.slice(1).replace('_', '–')}
                </label>
              ))}
            </fieldset>
            <div className="globe-layers" role="group" aria-label={t('globe.layers')}>
              {variables.map((item) => (
                <button key={item.variable_id} type="button" aria-pressed={item.variable_id === variable.variable_id} onClick={() => onGo({ var: item.variable_id })}>
                  {t(`plain.var.${item.variable_id}` as Key)}
                </button>
              ))}
            </div>
          </div>
          <EvidenceView
            analysis={analysis}
            variable={variable}
            zone={zone}
            source={sources.find((s) => s.id === analysis.source_id)}
            zones={dataZones}
            analyses={forVariable}
            onAct={() => onGo({ step: 'act' })}
          />
        </section>
      )}

      {step === 'act' && analysis && observed && (
        <section aria-labelledby="act-title">
          <h1 id="act-title">{place}</h1>
          <p className="note">{variable.name[lang]}</p>
          <PersonaPanel observed={observed} analysis={analysis} variableId={variable.variable_id} />
          <section aria-labelledby="cant-title">
            <h2 id="cant-title">{t('science.cantTitle')}</h2>
            <ul>
              <li>{t('science.cant1')}</li>
              <li>{t('science.cant2')}</li>
              <li>{t('science.cant3')}</li>
              <li>{t('science.cant4')}</li>
            </ul>
          </section>
        </section>
      )}
    </div>
  )
}
