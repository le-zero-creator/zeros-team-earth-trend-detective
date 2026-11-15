import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, Compass, FlaskConical, HeartPulse, Landmark, Sprout } from 'lucide-react'
import { CountUp } from './CountUp'
import { Sparkline } from './Sparkline'
import { useI18n, type Key } from '../i18n'
import { SLOPE_DECIMALS, formatSigned, plainUnit } from '../lib/format'
import { investigateLink } from '../lib/params'
import { PROFILE_IDS, useProfile, type ProfileId } from '../lib/profile'
import { pickReading } from '../lib/reading'
import type { Analysis, AppData } from '../lib/types'

const ICONS = {
  farmer: Sprout,
  architect: Building2,
  health: HeartPulse,
  urban_planner: Landmark,
  student: Compass,
  researcher: FlaskConical,
} as const

const LABELS: Record<ProfileId, Key> = {
  farmer: 'persona.farmer',
  architect: 'persona.architect',
  health: 'persona.health',
  urban_planner: 'persona.city',
  student: 'persona.explore',
  researcher: 'persona.researcher',
}

type Region = 'earth' | 'congo' | 'yaounde'

function find(data: AppData, zone: string, variable: string) {
  return data.results.analyses.find((item) => item.zone_id === zone && item.variable_id === variable && item.period_id === 'p2001_2025')
}

function impactKeys(profile: ProfileId, variable: string): Key[] {
  if (variable === 'precip') return ['means.rain.1', 'means.rain.2', 'means.rain.3']
  if (variable === 'rh2m') return ['means.air.1', 'means.air.2', 'means.air.3']
  return [`means.heat.${profile}.1`, `means.heat.${profile}.2`, `means.heat.${profile}.3`] as Key[]
}

/** Le cœur du site : un métier, une scène, trois cartes. Les chiffres viennent de results.json. */
export function MeansForYou({ data, page = false }: { data: AppData; page?: boolean }) {
  const { t, lang } = useI18n()
  const { profile, setProfile } = useProfile()
  const [region, setRegion] = useState<Region>('yaounde')
  const [variable, setVariable] = useState('t2m_max')
  const zoneId = 'cmr_yaounde'
  const analysis = find(data, zoneId, variable)
  const robustCount =
    region === 'congo'
      ? data.results.analyses.filter(
          (item) => item.variable_id === variable && item.period_id === 'p2001_2025' && item.evidence_level === 'robust' && item.significatif,
        ).length
      : 0
  const showNumber = region !== 'earth' && analysis && (variable !== 'precip' || analysis.evidence_level !== 'not_enough_evidence_yet')
  const unsure = !analysis || analysis.evidence_level === 'not_enough_evidence_yet' || !analysis.significatif
  const plain = analysis ? `${formatSigned(analysis.pente_decennie, SLOPE_DECIMALS[variable] ?? 2, lang)} ${plainUnit(analysis.slope_unit, lang)}` : ''
  const reading = analysis ? pickReading(variable, analysis, profile, lang) : null
  const observed =
    region === 'earth'
      ? t('means.earthEmpty')
      : `${t('home.story.question')}. ${unsure || variable === 'precip' ? t('plain.notSure') : plain}. ${
          variable === 't2m_max' && !unsure ? t('home.story.yes') : t('plain.notSure')
        }`

  return (
    <section className={page ? 'means means--page' : 'means'} aria-labelledby="means-title">
      <p className="kicker">{t('means.kicker')}</p>
      {page ? <h1 id="means-title">{t('means.h1')}</h1> : <h2 id="means-title">{t('means.h1')}</h2>}
      <p>{t('means.lead')}</p>
      <div className="means-regions" role="group" aria-label={t('means.region')}>
        {(['earth', 'congo', 'yaounde'] as const).map((id) => (
          <button key={id} type="button" aria-pressed={region === id} onClick={() => setRegion(id)}>
            {t(`means.${id}` as Key)}
          </button>
        ))}
      </div>
      <div className="means-people">
        {PROFILE_IDS.map((id) => {
          const Icon = ICONS[id]
          return (
            <button key={id} type="button" aria-pressed={profile === id} onClick={() => setProfile(id)}>
              <Icon aria-hidden="true" />
              {t(LABELS[id])}
            </button>
          )
        })}
      </div>
      <div className="means-stage">
        <ImpactScene analysis={analysis} region={region} unsure={unsure || variable === 'precip'} plain={plain} variable={variable} />
        <div className="means-levels">
          <article className="means-card" data-halo="true">
            <h3>{t('means.see')}</h3>
            {region === 'congo' && (
              <p>
                {t('means.basinNote')} {robustCount}
              </p>
            )}
            <p data-observed="true">{observed}</p>
            {showNumber && analysis && variable !== 'precip' && (
              <p className="means-num">
                <CountUp value={analysis.pente_decennie} decimals={SLOPE_DECIMALS[variable] ?? 2} lang={lang} /> {plainUnit(analysis.slope_unit, lang)}
              </p>
            )}
            {analysis && region !== 'earth' && <Sparkline series={analysis.serie_annuelle} color="#C4512C" label={t('means.see')} />}
            <p className="note">{t('means.source')}</p>
          </article>
          <article className="means-card" data-halo="true">
            <h3>{t('means.why')}</h3>
            <ul className="means-impacts">
              {impactKeys(profile, variable).map((key) => (
                <li key={key}>{t(key)}</li>
              ))}
            </ul>
          </article>
          <article className="means-card" data-halo="true">
            <h3>{t('means.ask')}</h3>
            <div className="means-chips">
              {reading?.questions.map((question) => (
                <Link key={question} to={`/ask?q=${encodeURIComponent(question)}&zone=${zoneId}`}>
                  {question}
                </Link>
              ))}
            </div>
            <h3>{t('means.needed')}</h3>
            <div className="means-chips means-chips--data">
              {reading?.needed.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </article>
        </div>
      </div>
      <div className="means-vars" role="group" aria-label={t('home.control.variable')}>
        {['t2m_max', 'rh2m', 'precip'].map((id) => (
          <button key={id} type="button" aria-pressed={variable === id} onClick={() => setVariable(id)}>
            {t(`plain.var.${id}` as Key)}
          </button>
        ))}
      </div>
      <p className="note">{t('means.disclaimer')}</p>
      <p className="note">{reading?.why}</p>
      {region !== 'earth' && (
        <Link to={investigateLink(zoneId, variable, 'p2001_2025')}>Open {lang === 'fr' ? 'Yaoundé' : 'Yaoundé'}</Link>
      )}
    </section>
  )
}

function ImpactScene({
  analysis,
  region,
  unsure,
  plain,
  variable,
}: {
  analysis?: Analysis
  region: Region
  unsure: boolean
  plain: string
  variable: string
}) {
  const heat = variable === 't2m_max' && !unsure && region !== 'earth' && analysis
  return (
    <figure className="means-scene" aria-hidden="true">
      <svg viewBox="0 0 280 220" className="means-draw">
        <rect x="118" y="28" width="28" height="120" rx="14" fill="none" stroke="currentColor" strokeWidth="3" />
        <circle cx="132" cy="162" r="22" fill="none" stroke="currentColor" strokeWidth="3" />
        {heat && <rect className="means-mercury" x="126" y="78" width="12" height="70" rx="6" />}
        {!heat && <text x="132" y="168" textAnchor="middle" fontSize="18">?</text>}
      </svg>
      <figcaption>{heat ? plain : region === 'earth' ? '' : unsure ? '' : plain}</figcaption>
    </figure>
  )
}
