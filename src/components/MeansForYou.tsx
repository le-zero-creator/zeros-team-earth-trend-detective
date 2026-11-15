import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, Compass, FlaskConical, HeartPulse, Landmark, Sprout } from 'lucide-react'
import { CountUp } from './CountUp'
import { Scene, type SceneName } from './Scene'
import { Sparkline } from './Sparkline'
import { useI18n, type Key } from '../i18n'
import { SLOPE_DECIMALS, formatSigned, plainUnit } from '../lib/format'
import { investigateLink } from '../lib/params'
import { PROFILE_IDS, useProfile, type ProfileId } from '../lib/profile'
import { pickReading } from '../lib/reading'
import type { AppData } from '../lib/types'

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
  const family = variable === 'precip' ? 'rain' : variable === 'rh2m' ? 'air' : 'heat'
  return [`means.${family}.${profile}.1`, `means.${family}.${profile}.2`, `means.${family}.${profile}.3`] as Key[]
}

const PROFILE_PHOTO: Record<ProfileId, { name: SceneName; alt: Key }> = {
  farmer: { name: 'profile-farmer', alt: 'scene.farmer' },
  architect: { name: 'profile-architect', alt: 'scene.architect' },
  health: { name: 'profile-health', alt: 'scene.health' },
  urban_planner: { name: 'profile-city', alt: 'scene.city' },
  student: { name: 'congo-forest', alt: 'story.caption.forest' },
  researcher: { name: 'nasa-gpm', alt: 'scene.gpm' },
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

  const photo = region === 'earth' ? { name: 'nasa-marble-east' as const, alt: 'scene.marble' as const } : region === 'congo' ? { name: 'nasa-congo-river' as const, alt: 'scene.river' as const } : PROFILE_PHOTO[profile]
  return (
    <section id="for-you" className={page ? 'means means-band means--page' : 'means means-band'} aria-labelledby="means-title">
      <p className="kicker">{t('means.kicker')}</p>
      {page ? <h1 id="means-title">{t('means.h1')}</h1> : <h2 id="means-title">{t('means.h1')}</h2>}
      <p className="means-lead">{t('means.lead')}</p>
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
      <div className="means-vars" role="group" aria-label={t('home.control.variable')}>
        {(['t2m_max', 'rh2m', 'precip'] as const).map((id) => (
          <button key={id} type="button" aria-pressed={variable === id} onClick={() => setVariable(id)}>
            {t(`plain.var.${id}` as Key)}
          </button>
        ))}
      </div>
      <div className="means-swap" key={`${profile}-${region}-${variable}`}>
      <div className="means-layout">
        <Scene name={photo.name} alt={t(photo.alt)} />
        <article className="means-result" data-halo="true">
          <h3>{t('means.see')}</h3>
          {region === 'congo' && (
            <p className="means-secondary">
              {t('means.basinNote')} {robustCount}
            </p>
          )}
          <p className="means-secondary" data-observed="true">{observed}</p>
          {showNumber && analysis && variable !== 'precip' && (
            <p className="means-num">
              <CountUp value={analysis.pente_decennie} decimals={SLOPE_DECIMALS[variable] ?? 2} lang={lang} />
              <span>{plainUnit(analysis.slope_unit, lang)}</span>
            </p>
          )}
          {analysis && region !== 'earth' && <Sparkline series={analysis.serie_annuelle} color="#C4512C" label={t('means.see')} />}
          <p className="note">{t('means.source')}</p>
        </article>
      </div>
      <div className="means-secondary-grid">
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
      <p className="note">{t('means.disclaimer')}</p>
      {region !== 'earth' && (
        <Link className="cta cta--sun" to={investigateLink(zoneId, variable, 'p2001_2025')}>{t('story.openYaounde')}</Link>
      )}
    </section>
  )
}

