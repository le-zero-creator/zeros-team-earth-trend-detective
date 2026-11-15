import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import {
  Building2, ChevronDown, Compass, Droplets, FlaskConical, GraduationCap, HeartPulse, Landmark, Lightbulb,
  MessageCircleQuestion, Sprout, Sun, CloudRain, Wind, ClipboardList, Zap,
} from 'lucide-react'
import { ArchitectSketch } from './ArchitectSketch'
import { CountUp } from './CountUp'
import { HomeAsk } from './HomeExtras'
import { Scene, type SceneName } from './Scene'
import { TraceChart } from './TraceChart'
import { useI18n, type Key } from '../i18n'
import { SLOPE_DECIMALS, plainUnit } from '../lib/format'
import { investigateLink } from '../lib/params'
import { PROFILE_IDS, useProfile, type ProfileId } from '../lib/profile'
import { pickReading } from '../lib/reading'
import type { AppData } from '../lib/types'

const EASE = [0.16, 0.84, 0.24, 1] as const

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

const PROFILE_PHOTO: Record<ProfileId, { name: SceneName; alt: Key }> = {
  farmer: { name: 'profile-farmer', alt: 'scene.farmer' },
  architect: { name: 'profile-architect', alt: 'scene.architect' },
  health: { name: 'profile-health', alt: 'scene.health' },
  urban_planner: { name: 'profile-city', alt: 'scene.city' },
  student: { name: 'nasa-marble-east', alt: 'scene.marble' },
  researcher: { name: 'satellite', alt: 'story.caption.sat' },
}

const SOON: { id: string; label: Key; Icon: typeof Zap }[] = [
  { id: 'teacher', label: 'you.soon.teacher', Icon: GraduationCap },
  { id: 'energy', label: 'you.soon.energy', Icon: Zap },
]

const VARS = [
  { id: 't2m_max', Icon: Sun },
  { id: 'rh2m', Icon: Wind },
  { id: 'precip', Icon: CloudRain },
] as const

function find(data: AppData, zone: string, variable: string) {
  return data.results.analyses.find((item) => item.zone_id === zone && item.variable_id === variable && item.period_id === 'p2001_2025')
}

function impactKeys(profile: ProfileId, variable: string): Key[] {
  const family = variable === 'precip' ? 'rain' : variable === 'rh2m' ? 'air' : 'heat'
  return [`means.${family}.${profile}.1`, `means.${family}.${profile}.2`, `means.${family}.${profile}.3`] as Key[]
}

/** One expandable card. Opening it shows more; empty parts honestly say "coming soon". */
function Fold({ icon, title, children, tone }: { icon: ReactNode; title: string; children: ReactNode; tone?: string }) {
  const [open, setOpen] = useState(false)
  return (
    <li className={`you-fold${open ? ' is-open' : ''}${tone ? ` you-fold--${tone}` : ''}`}>
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span className="you-fold__icon" aria-hidden="true">{icon}</span>
        <span className="you-fold__title">{title}</span>
        <ChevronDown className="you-fold__chev" aria-hidden="true" />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="you-fold__body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.42, ease: EASE }}
          >
            <div>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  )
}

/** The heart of the site: pick a point of view, then read the same numbers with its questions. */
export function MeansForYou({ data, page = false }: { data: AppData; page?: boolean }) {
  const { t, lang } = useI18n()
  const { profile, setProfile } = useProfile()
  const [variable, setVariable] = useState<string>('t2m_max')
  const [soon, setSoon] = useState<string | null>(null)
  const zoneId = 'cmr_yaounde'
  const analysis = find(data, zoneId, variable)
  const unsure = !analysis || analysis.evidence_level === 'not_enough_evidence_yet' || !analysis.significatif
  const reading = analysis ? pickReading(variable, analysis, profile, lang) : null
  const photo = PROFILE_PHOTO[profile]
  const Icon = ICONS[profile]

  return (
    <section id="for-you" className={page ? 'you you--page' : 'you'} aria-labelledby="means-title">
      <div className="you-inner">
        <p className="kicker">{t('you.k')}</p>
        {page ? <h1 id="means-title" className="sec-display">{t('means.h1')}</h1> : <h2 id="means-title" className="sec-display">{t('means.h1')}</h2>}
        <p className="sec-lead">{t('you.lead')}</p>

        <p className="you-step"><span>1</span>{t('you.pick')}</p>
        <ul className="you-cards" aria-label={t('you.pick')}>
          {PROFILE_IDS.map((id) => {
            const PIcon = ICONS[id]
            const on = profile === id && !soon
            return (
              <li key={id}>
                <button type="button" className={on ? 'you-card is-on' : 'you-card'} aria-pressed={on} onClick={() => { setProfile(id); setSoon(null) }}>
                  <Scene name={PROFILE_PHOTO[id].name} alt={t(PROFILE_PHOTO[id].alt)} />
                  <span className="you-card__label"><PIcon aria-hidden="true" />{t(LABELS[id])}</span>
                </button>
              </li>
            )
          })}
          {SOON.map(({ id, label, Icon: SIcon }) => (
            <li key={id}>
              <button type="button" className={soon === id ? 'you-card you-card--soon is-on' : 'you-card you-card--soon'} aria-pressed={soon === id} onClick={() => setSoon(id)}>
                <span className="you-card__soonart" aria-hidden="true"><SIcon /></span>
                <span className="you-card__label"><SIcon aria-hidden="true" />{t(label)} <em className="pill pill--pending">{t('soon.badge')}</em></span>
              </button>
            </li>
          ))}
        </ul>

        <AnimatePresence mode="wait">
          {soon ? (
            <motion.div key="soon" className="you-panel you-panel--soon" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.5, ease: EASE }}>
              <h3 className="sec-sub">{t('soon.badge')}</h3>
              <p className="sec-lead">{t('you.soon.body')}</p>
            </motion.div>
          ) : (
            <motion.div
              key={`${profile}-${variable}`}
              className="you-panel"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <div className="you-panel__media">
                <Scene name={photo.name} alt={t(photo.alt)} />
                <p className="you-panel__who"><Icon aria-hidden="true" /> {t(LABELS[profile])}</p>
              </div>
              <div className="you-panel__body">
                <p className="you-step"><span>2</span>{t('you.trace')}</p>
                <div className="you-vars" role="group" aria-label={t('you.trace')}>
                  {VARS.map(({ id, Icon: VIcon }) => (
                    <button key={id} type="button" aria-pressed={variable === id} onClick={() => setVariable(id)}>
                      <VIcon aria-hidden="true" /> {t(`plain.var.${id}` as Key)}
                    </button>
                  ))}
                </div>
                {analysis && (
                  <div className="you-observed" data-observed="true">
                    <p className="you-observed__k">{t('you.seen')}</p>
                    {!unsure ? (
                      <p className="bk-num">
                        <CountUp value={analysis.pente_decennie} decimals={SLOPE_DECIMALS[variable] ?? 2} lang={lang} />
                        <span>{plainUnit(analysis.slope_unit, lang)}</span>
                      </p>
                    ) : (
                      <p className="you-observed__unsure">{t('book.7.t')}</p>
                    )}
                    <TraceChart analysis={analysis} play label={t(`plain.var.${variable}` as Key)} />
                    <p className={unsure ? 'bk-verdict bk-verdict--unsure' : 'bk-verdict'}>{unsure ? t('book.unsure') : t('book.sure')}</p>
                    <p className="note">{t('you.why.here')}</p>
                  </div>
                )}
              </div>

              {profile === 'architect' && <ArchitectSketch variable={variable} points={impactKeys(profile, variable).map((key) => t(key))} />}

              <div className="you-groups">
                <div className="you-group">
                  <h3 className="sec-sub"><Lightbulb aria-hidden="true" /> {t('means.why')}</h3>
                  <ul className="you-folds">
                    {impactKeys(profile, variable).map((key) => (
                      <Fold key={key} icon={<Lightbulb />} title={t(key)} tone="why">
                        <p>{reading?.why}</p>
                        <p className="you-soon">{t('you.more.soon')}</p>
                      </Fold>
                    ))}
                  </ul>
                </div>
                <div className="you-group">
                  <h3 className="sec-sub"><MessageCircleQuestion aria-hidden="true" /> {t('means.ask')}</h3>
                  <ul className="you-folds">
                    {reading?.questions.map((question) => (
                      <Fold key={question} icon={<MessageCircleQuestion />} title={question} tone="ask">
                        <p>{t('you.ask.body')}</p>
                        <Link className="bk-cta" to={`/ask?q=${encodeURIComponent(question)}&zone=${zoneId}`}>{t('you.ask.cta')} →</Link>
                      </Fold>
                    ))}
                  </ul>
                </div>
                <div className="you-group">
                  <h3 className="sec-sub"><ClipboardList aria-hidden="true" /> {t('means.needed')}</h3>
                  <ul className="you-folds">
                    {reading?.needed.map((item) => (
                      <Fold key={item} icon={<Droplets />} title={item} tone="need">
                        <p>{t('you.need.body')}</p>
                        <p className="you-soon">{t('soon.badge')}</p>
                      </Fold>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="note you-disclaimer">{t('means.disclaimer')} {t('means.source')}</p>
        <div className="you-end">
          <Link className="bk-cta" to={investigateLink(zoneId, variable, 'p2001_2025')}>{t('story.openYaounde')} →</Link>
        </div>
      </div>
      {page && <HomeAsk titleKey="homeask.t.you" />}
    </section>
  )
}
