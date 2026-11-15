import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AskChat } from '../components/AskChat'
import { Scene } from '../components/Scene'
import { useI18n, type Key } from '../i18n'
import { useData } from '../lib/data'
import { SLOPE_DECIMALS, formatSigned, plainUnit } from '../lib/format'
import { ZONE_IDS } from '../lib/params'
import { useProfile } from '../lib/profile'
import { pickReading } from '../lib/reading'

const STATIC: Key[] = ['ask.q.heat', 'ask.q.air', 'ask.q.rain', 'ask.q.basin']

export function Ask() {
  const { t, lang } = useI18n()
  const { profile } = useProfile()
  const { state } = useData()
  const [params, setParams] = useSearchParams()
  const requested = params.get('zone')
  const zoneId = requested && (ZONE_IDS as readonly string[]).includes(requested) ? requested : 'cmr_yaounde'
  const preset = params.get('q') ?? ''

  const ready = state.status === 'ready' ? state.data : null
  const zone = ready?.zones.find((item) => item.zone_id === zoneId)
  const analysis = ready?.results.analyses.find(
    (item) => item.zone_id === zoneId && item.variable_id === 't2m_max' && item.period_id === 'p2001_2025',
  )
  const suggestions = useMemo(() => {
    const base = STATIC.map((key) => t(key))
    if (!analysis) return base
    return [...base, ...pickReading('t2m_max', analysis, profile, lang).questions.slice(0, 2)]
  }, [analysis, profile, lang, t])

  const figure =
    analysis && zone
      ? `${formatSigned(analysis.pente_decennie, SLOPE_DECIMALS.t2m_max, lang)} ${plainUnit(analysis.slope_unit, lang)}`
      : ''

  return (
    <article className="ask-page">
      <header className="ask-page__intro">
        <Scene name="nasa-gulf" alt={t('scene.gulf')} />
        <p className="kicker">{t('ask.kicker')}</p>
        <h1>{t('ask.title')}</h1>
        <p>{t('ask.lead')}</p>
      </header>
      <div className="ask-page__grid">
        <section aria-labelledby="ask-title">
          <h2 id="ask-title" className="visually-hidden">
            {t('ask.label')}
          </h2>
          {ready && zone && (
            <label className="ask-place">
              {t('ask.place')}
              <select
                value={zoneId}
                onChange={(event) => {
                  const next = new URLSearchParams(params)
                  next.set('zone', event.target.value)
                  setParams(next)
                }}
              >
                {ready.zones.map((item) => (
                  <option key={item.zone_id} value={item.zone_id}>
                    {lang === 'fr' ? item.name_fr : item.name_en}
                  </option>
                ))}
              </select>
            </label>
          )}
          {state.status === 'loading' && <p role="status">{t('state.loading')}</p>}
          {state.status === 'error' && <p role="alert">{t('state.error.body')}</p>}
          {zone && (
            <AskChat
              suggestions={suggestions}
              profile={profile}
              zoneId={zone.zone_id}
              lat={zone.lat}
              lon={zone.lon}
              initialQuestion={preset}
            />
          )}
        </section>
        <aside className="ask-side">
          {analysis && zone && (
            <p data-observed="true">
              {lang === 'fr' ? zone.name_fr : zone.name_en}. {t('plain.var.t2m_max')}. {figure}.{' '}
              {analysis.evidence_level === 'not_enough_evidence_yet' || !analysis.significatif
                ? t('plain.notSure')
                : t(`evidence.plain.${analysis.evidence_level}` as Key)}
              . {t('ask.source')}
            </p>
          )}
          <p className="note">{t('ask.note')}</p>
        </aside>
      </div>
    </article>
  )
}
