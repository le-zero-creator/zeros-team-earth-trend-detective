import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Scene, type SceneName } from './Scene'
import { TrendChart } from './TrendChart'
import { useI18n, type Key } from '../i18n'
import { formatSlope } from '../lib/format'
import { useProfile, type ProfileId } from '../lib/profile'
import type { Analysis, AppData } from '../lib/types'

const PROFILES: ProfileId[] = ['farmer', 'architect', 'health', 'urban_planner', 'student']
const TOTAL = 7
const CHAPTER_SCENE: { name: SceneName; alt: Key }[] = [
  { name: 'nasa-marble-east', alt: 'scene.marble' },
  { name: 'nasa-africa-radar', alt: 'scene.radar' },
  { name: 'nasa-cameroon', alt: 'scene.cameroon' },
  { name: 'nasa-clouds', alt: 'scene.clouds' },
  { name: 'nasa-gpm', alt: 'scene.gpm' },
  { name: 'nasa-soil', alt: 'scene.soil' },
  { name: 'nasa-congo-river', alt: 'scene.river' },
]

function find(data: AppData | null, variable: string) {
  return data?.results.analyses.find(
    (item) => item.zone_id === 'cmr_yaounde' && item.variable_id === variable && item.period_id === 'p2001_2025',
  )
}

export function Journey({ data }: { data: AppData | null }) {
  const { t, lang } = useI18n()
  const { setProfile } = useProfile()
  const [open, setOpen] = useState(0)
  const [picks, setPicks] = useState<Record<number, string>>({})
  const heat = find(data, 't2m_max')
  const air = find(data, 'rh2m')
  const rain = find(data, 'precip')
  const yaounde = data?.zones.find((zone) => zone.zone_id === 'cmr_yaounde')

  function choose(index: number, value: string) {
    setPicks((current) => ({ ...current, [index]: value }))
    if (index === 5 && (PROFILES as string[]).includes(value)) setProfile(value as ProfileId)
  }

  function next(index: number) {
    const target = Math.min(TOTAL - 1, index + 1)
    setOpen(target)
    window.setTimeout(() => document.getElementById(`chapter-${target}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30)
  }

  return (
    <section className="journey" id="journey" aria-label={t('journey.label')}>
      <Chapter
        index={0}
        open={open}
        pick={picks[0]}
        title={t('journey.q.earth')}
        choices={[
          ['earth', t('journey.opt.earth')],
          ['forest', t('journey.opt.forest')],
          ['city', t('journey.opt.city')],
        ]}
        correct="earth"
        reveal={<p>{t('journey.reveal.earth')}</p>}
        scene={CHAPTER_SCENE[0]}
        onChoose={choose}
        onNext={next}
        t={t}
      />
      <Chapter
        index={1}
        open={open}
        pick={picks[1]}
        title={t('journey.q.basin')}
        choices={[
          ['yes', t('journey.opt.yes')],
          ['no', t('journey.opt.no')],
          ['unsure', t('journey.opt.unsure')],
        ]}
        correct="no"
        reveal={<p>{t('journey.reveal.basin', { km: yaounde?.distance_to_basin_km ?? '' })}</p>}
        scene={CHAPTER_SCENE[1]}
        onChoose={choose}
        onNext={next}
        t={t}
      />
      <Chapter
        index={2}
        open={open}
        pick={picks[2]}
        title={t('journey.q.heat')}
        choices={[
          ['yes', t('journey.opt.yes')],
          ['no', t('journey.opt.no')],
          ['unsure', t('journey.opt.unsure')],
        ]}
        correct="yes"
        reveal={heat && <Reveal analysis={heat} lang={lang} sure />}
        scene={CHAPTER_SCENE[2]}
        onChoose={choose}
        onNext={next}
        t={t}
      />
      <Chapter
        index={3}
        open={open}
        pick={picks[3]}
        title={t('journey.q.air')}
        choices={[
          ['drier', t('journey.opt.drier')],
          ['wetter', t('journey.opt.wetter')],
          ['unsure', t('journey.opt.unsure')],
        ]}
        correct="drier"
        reveal={air && <Reveal analysis={air} lang={lang} sure />}
        scene={CHAPTER_SCENE[3]}
        onChoose={choose}
        onNext={next}
        t={t}
      />
      <Chapter
        index={4}
        open={open}
        pick={picks[4]}
        title={t('journey.q.rain')}
        choices={[
          ['yes', t('journey.opt.yes')],
          ['no', t('journey.opt.no')],
          ['unsure', t('journey.opt.unsure')],
        ]}
        correct="unsure"
        reveal={rain && <Reveal analysis={rain} lang={lang} sure={false} />}
        scene={CHAPTER_SCENE[4]}
        onChoose={choose}
        onNext={next}
        t={t}
      />
      <Chapter
        index={5}
        open={open}
        pick={picks[5]}
        title={t('journey.q.you')}
        choices={PROFILES.map((id) => [id, t(`persona.${id === 'urban_planner' ? 'city' : id === 'student' ? 'explore' : id}` as Key)])}
        correct=""
        reveal={<p>{t('journey.reveal.you')}</p>}
        scene={CHAPTER_SCENE[5]}
        onChoose={choose}
        onNext={next}
        t={t}
      />
      {open >= 6 && (
        <article className="journey-card" id="chapter-6">
          <Scene name={CHAPTER_SCENE[6].name} alt={t(CHAPTER_SCENE[6].alt)} />
          <p className="journey-progress">{t('journey.progress', { n: 7, total: TOTAL })}</p>
          <h2>{t('journey.q.ask')}</h2>
          <div className="journey-choices">
            {(['ask.q.heat', 'ask.q.air', 'ask.q.rain'] as const).map((key) => (
              <Link key={key} to={`/ask?q=${encodeURIComponent(t(key))}`}>{t(key)}</Link>
            ))}
          </div>
        </article>
      )}
    </section>
  )
}

function Reveal({ analysis, lang, sure }: { analysis: Analysis; lang: 'en' | 'fr'; sure: boolean }) {
  const { t } = useI18n()
  const slope = formatSlope(analysis.pente_decennie, analysis.variable_id, analysis.slope_unit, lang)
  return (
    <div className="journey-reveal">
      <p className="story-num">{slope}</p>
      <p>{sure ? t('evidence.plain.robust') : t('evidence.plain.not_enough_evidence_yet')}</p>
      <TrendChart analysis={analysis} alt={slope} valueName={t('chart.values')} lineName={t('chart.sen')} />
      <p className="note">{t('ask.source')} {analysis.period}.</p>
    </div>
  )
}

function Chapter({
  index,
  open,
  pick,
  title,
  choices,
  correct,
  reveal,
  scene,
  onChoose,
  onNext,
  t,
}: {
  index: number
  open: number
  pick?: string
  title: string
  choices: Array<[string, string]>
  correct: string
  reveal: ReactNode
  scene: { name: SceneName; alt: Key }
  onChoose: (index: number, value: string) => void
  onNext: (index: number) => void
  t: (key: Key, vars?: Record<string, string | number>) => string
}) {
  if (index > open) return null
  const right = Boolean(pick) && (correct === '' || pick === correct)
  return (
    <article className="journey-card" id={`chapter-${index}`}>
      <Scene name={scene.name} alt={t(scene.alt)} />
      <p className="journey-progress">{t('journey.progress', { n: index + 1, total: TOTAL })}</p>
      <h2>{title}</h2>
      <div className="journey-choices">
        {choices.map(([id, label]) => (
          <button key={id} type="button" aria-pressed={pick === id} onClick={() => onChoose(index, id)}>
            {label}
          </button>
        ))}
      </div>
      {pick && (
        <div className="journey-answer">
          <p>{right ? t('journey.right') : t('journey.learn')}</p>
          {reveal}
          {index < 6 && (
            <button type="button" className="cta cta--sun" onClick={() => onNext(index)}>
              {t('journey.next')}
            </button>
          )}
        </div>
      )}
    </article>
  )
}
