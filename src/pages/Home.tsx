import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ExploratoryBanner, SourceStrip } from '../components/Banners'
import { BasinMap, MapLegend } from '../components/BasinMap'
import { LocationsTable } from '../components/LocationsTable'
import { useI18n, type Key } from '../i18n'
import { useData } from '../lib/data'
import { DEFAULTS, investigateLink, PERIOD_IDS } from '../lib/params'
import type { Analysis, AppData } from '../lib/types'

const QUESTIONS: { title: Key; hint: Key; variable: string }[] = [
  { title: 'home.q1.title', hint: 'home.q1.hint', variable: 't2m_max' },
  { title: 'home.q2.title', hint: 'home.q2.hint', variable: 'rh2m' },
  { title: 'home.q3.title', hint: 'home.q3.hint', variable: 'precip' },
]

function Hero() {
  const { t } = useI18n()
  return (
    <section className="hero" aria-labelledby="hero-title">
      <p className="eyebrow">NASA Space Apps Challenge 2026 · Earth System Trend Detective</p>
      <h1 id="hero-title">{t('home.hero.title')}</h1>
      <p className="hero__subtitle">{t('app.subtitle')}</p>
      <p className="hero__lead">{t('home.hero.lead')}</p>
      <Link className="cta" to="/investigate">
        {t('home.hero.cta')} <span aria-hidden="true">→</span>
      </Link>
      <h2 className="questions__title">{t('home.questions.title')}</h2>
      <ul className="questions">
        {QUESTIONS.map((q) => (
          <li key={q.variable}>
            <Link className="question" to={investigateLink(DEFAULTS.zone, q.variable, DEFAULTS.period)}>
              <span className="question__title">{t(q.title)}</span>
              <span className="question__hint">{t(q.hint)}</span>
              <span className="question__arrow" aria-hidden="true">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Explorer({ data }: { data: AppData }) {
  const { t, lang } = useI18n()
  const navigate = useNavigate()
  const [variableId, setVariableId] = useState<string>(DEFAULTS.var)
  const [periodId, setPeriodId] = useState<string>(DEFAULTS.period)

  const variable = data.results.variables.find((v) => v.variable_id === variableId)
  const analyses = useMemo(() => {
    const map = new Map<string, Analysis>()
    for (const a of data.results.analyses) {
      if (a.variable_id === variableId && a.period_id === periodId) map.set(a.zone_id, a)
    }
    return map
  }, [data, variableId, periodId])

  const first = analyses.values().next().value as Analysis | undefined
  const period = (first?.period ?? '').replace('-', '–')
  const variableName = variable?.name[lang] ?? ''
  const hasWarning = [...analyses.values()].some((a) => a.warnings.length > 0)
  const hasNee = [...analyses.values()].some((a) => a.evidence_level === 'not_enough_evidence_yet')

  return (
    <>
      <section className="mapcard card" aria-labelledby="map-title">
        <h2 id="map-title">{t('home.map.title')}</h2>
        <div className="controls">
          <label>
            <span>{t('home.control.variable')}</span>
            <select value={variableId} onChange={(e) => setVariableId(e.target.value)}>
              {data.results.variables.map((v) => (
                <option key={v.variable_id} value={v.variable_id}>
                  {v.name[lang]}
                </option>
              ))}
            </select>
          </label>
          <fieldset className="segmented">
            <legend>{t('home.control.period')}</legend>
            {PERIOD_IDS.map((id) => (
              <label key={id} className={periodId === id ? 'is-on' : undefined}>
                <input type="radio" name="period" value={id} checked={periodId === id} onChange={() => setPeriodId(id)} />
                {id.slice(1).replace('_', '–')}
                {id === 'p1981_2025' && <small> ({t('home.period.long')})</small>}
              </label>
            ))}
          </fieldset>
        </div>
        <BasinMap
          zones={data.zones}
          boundary={data.boundary}
          analyses={analyses}
          alt={t('home.map.alt', { n: analyses.size, variable: variableName, period })}
          onSelect={(zone) => navigate(investigateLink(zone, variableId, periodId))}
        />
        <MapLegend />
        <p className="note">{t('home.map.note')}</p>
      </section>

      <section className="tablecard card" aria-labelledby="table-title">
        <h2 id="table-title">{t('home.table.title')}</h2>
        <ExploratoryBanner />
        {hasWarning && <p className="warning">{t('home.solarWarning')}</p>}
        <LocationsTable
          zones={data.zones}
          analyses={analyses}
          caption={t('home.table.caption', { variable: variableName, period, unit: first?.slope_unit ?? '' })}
        />
        <p className="note">{t('home.pnote')}</p>
        {hasNee && (
          <p className="note">
            <strong>≈ {t('evidence.not_enough_evidence_yet')}.</strong> {t('evidence.neeNote')}
          </p>
        )}
      </section>

      <SourceStrip sources={data.results.meta.sources} />
    </>
  )
}

export function Home() {
  const { t } = useI18n()
  const { state, retry } = useData()
  return (
    <div className="home">
      <Hero />
      {state.status === 'loading' && (
        <div className="card skeleton" role="status">
          <span className="sr-only">{t('state.loading')}</span>
        </div>
      )}
      {state.status === 'error' && (
        <div className="card error" role="alert">
          <h2>{t('state.error.title')}</h2>
          <p>{t('state.error.body')}</p>
          <button type="button" className="cta" onClick={retry}>
            {t('state.error.retry')}
          </button>{' '}
          <Link to="/method">{t('state.error.method')}</Link>
        </div>
      )}
      {state.status === 'ready' && <Explorer data={state.data} />}
    </div>
  )
}
