import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CountUp } from '../components/CountUp'
import { TerraMascot } from '../components/TerraMascot'
import { SLOPE_DECIMALS, plainUnit } from '../lib/format'
import { useI18n } from '../i18n'
import { useData } from '../lib/data'
import { PROFILE_IDS, useProfile, type ProfileId } from '../lib/profile'
import { pickReading } from '../lib/reading'
import { useSpace } from '../lib/space'
import type { Key } from '../i18n'

const LABELS: Record<ProfileId, Key> = {
  farmer: 'persona.farmer',
  architect: 'persona.architect',
  health: 'persona.health',
  urban_planner: 'persona.city',
  student: 'persona.explore',
  researcher: 'persona.researcher',
}

export function Space() {
  const { t, lang } = useI18n()
  const { state } = useData()
  const { profile, setProfile } = useProfile()
  const { name, place, save } = useSpace()
  const heat = state.status === 'ready'
    ? state.data.results.analyses.find((item) => item.zone_id === 'cmr_yaounde' && item.variable_id === 't2m_max' && item.period_id === 'p2001_2025')
    : undefined
  const reading = heat ? pickReading('t2m_max', heat, profile, lang) : null
  const [draft, setDraft] = useState(name)
  const [zone, setZone] = useState(place)
  const [saved, setSaved] = useState(false)
  return (
    <article className="space-page">
      <header className="pg-hero pg-hero--solo">
        <TerraMascot mood={name ? 'happy' : 'idle'} />
        <div className="pg-hero__copy">
          <p className="kicker">{t('space.k')}</p>
          <h1 className="sec-display">{name ? t('space.hello', { name }) : t('space.h1')}</h1>
          <p className="sec-lead">{t('space.lead')}</p>
        </div>
      </header>
      <div className="space-grid">
        <form
          className="legal-card space-form"
          onSubmit={(event) => {
            event.preventDefault()
            save(draft, zone)
            setSaved(true)
            window.setTimeout(() => setSaved(false), 2500)
          }}
        >
          <h2 className="sec-sub">{t('space.card')}</h2>
          <label>
            {t('space.name')}
            <input value={draft} maxLength={40} onChange={(event) => setDraft(event.target.value)} />
          </label>
          <label>
            {t('space.place')}
            <select value={zone} onChange={(event) => setZone(event.target.value)}>
              {state.status === 'ready' &&
                state.data.zones.map((item) => (
                  <option key={item.zone_id} value={item.zone_id}>
                    {lang === 'fr' ? item.name_fr : item.name_en}
                  </option>
                ))}
            </select>
          </label>
          <p className="space-label">{t('you.pick')}</p>
          <div className="space-chips">
            {PROFILE_IDS.map((id) => (
              <button key={id} type="button" aria-pressed={profile === id} onClick={() => setProfile(id)}>
                {t(LABELS[id])}
              </button>
            ))}
          </div>
          <button className="bk-cta" type="submit">{saved ? t('space.saved') : t('space.save')}</button>
          <p className="note">{t('legal.local')}</p>
        </form>
        {heat && reading && (
          <section className="legal-card space-reading" data-observed="space">
            <p className="you-observed__k">{t('space.see')}</p>
            <p className="bk-num">
              <CountUp value={heat.pente_decennie} decimals={SLOPE_DECIMALS.t2m_max} lang={lang} />
              <span>{plainUnit(heat.slope_unit, lang)}</span>
            </p>
            <h2 className="sec-sub">{t('space.why')}</h2>
            <p>{reading.why}</p>
            <h2 className="sec-sub">{t('space.ask')}</h2>
            <ul className="space-qs">
              {reading.questions.map((item) => (
                <li key={item}><Link to={`/ask?q=${encodeURIComponent(item)}`}>{item} →</Link></li>
              ))}
            </ul>
            <p className="note">{t('ask.source')} {heat.period}.</p>
          </section>
        )}
      </div>
    </article>
  )
}
