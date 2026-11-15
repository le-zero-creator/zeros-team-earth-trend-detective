import { useState } from 'react'
import { useI18n } from '../i18n'
import { useData } from '../lib/data'
import { formatSlope } from '../lib/format'
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
  return (
    <article className="space-page">
      <h1>{t('space.h1')}</h1>
      <p>{t('space.lead')}</p>
      {name && <p>{t('space.hello', { name })}</p>}
      <form
        onSubmit={(event) => {
          event.preventDefault()
          save(draft, zone)
        }}
      >
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
        <fieldset className="profile-grid">
          <legend>{t('journey.q.you')}</legend>
          {PROFILE_IDS.map((id) => (
            <button key={id} type="button" aria-pressed={profile === id} onClick={() => setProfile(id)}>
              {t(LABELS[id])}
            </button>
          ))}
        </fieldset>
        {heat && reading && (
          <div className="profile-reading" data-observed="space">
            <h2>{t('space.see')}</h2>
            <p className="story-num">{formatSlope(heat.pente_decennie, heat.variable_id, heat.slope_unit, lang)}</p>
            <h2>{t('space.why')}</h2>
            <p>{reading.why}</p>
            <h2>{t('space.ask')}</h2>
            <ul>
              {reading.questions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="note">{t('ask.source')} {heat.period}. {t('journey.reveal.you')}</p>
          </div>
        )}
        <button className="cta cta--sun" type="submit">{t('space.save')}</button>
      </form>
    </article>
  )
}
