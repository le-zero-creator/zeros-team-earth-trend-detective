import { Icon } from './Icons'
import { useI18n } from '../i18n'
import { rules, pickReading } from '../lib/reading'
import { PROFILE_IDS, useProfile, type ProfileId } from '../lib/profile'
import type { Analysis } from '../lib/types'

const ICONS: Record<ProfileId, 'farmer' | 'arch' | 'health' | 'city' | 'compass' | 'flask'> = {
  farmer: 'farmer',
  architect: 'arch',
  health: 'health',
  urban_planner: 'city',
  student: 'compass',
  researcher: 'flask',
}

const LABELS = {
  farmer: 'persona.farmer',
  architect: 'persona.architect',
  health: 'persona.health',
  urban_planner: 'persona.city',
  student: 'persona.explore',
  researcher: 'persona.researcher',
} as const

/** Mêmes chiffres, questions différentes. Le texte observé est fourni par l'écran, il ne change pas avec le métier. */
export function PersonaPanel({ observed, analysis, variableId }: { observed: string; analysis: Analysis; variableId: string }) {
  const { t, lang } = useI18n()
  const { profile, setProfile } = useProfile()
  const reading = pickReading(variableId, analysis, profile, lang)
  const disclaimer = lang === 'fr' ? rules.disclaimer.fr : rules.disclaimer.en

  return (
    <section className="personas" aria-labelledby="who-title" data-profile={profile}>
      <h2 id="who-title">{t('home.who')}</h2>
      <p className="note">{t('persona.note')}</p>
      <div className="persona-row" role="group" aria-label={t('home.who')}>
        {PROFILE_IDS.map((id) => (
          <button key={id} type="button" aria-pressed={profile === id} onClick={() => setProfile(id)}>
            <Icon name={ICONS[id]} />
            {t(LABELS[id])}
          </button>
        ))}
      </div>
      <article className="reading" data-reading={reading.source}>
        <h3>{t('level.observe')}</h3>
        <p data-observed="true">{observed}</p>
        <h3>{t('level.why')}</h3>
        <p>{reading.why}</p>
        <h3>{t('level.questions')}</h3>
        {reading.questions.length > 0 ? (
          <ul>
            {reading.questions.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        ) : (
          <p>{reading.why}</p>
        )}
        {reading.needed.length > 0 && (
          <>
            <h3>{t('level.needed')}</h3>
            <ul>
              {reading.needed.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </>
        )}
        <p className="note">{disclaimer}</p>
        <p className="note">{t('trend.notCause')}</p>
      </article>
    </section>
  )
}
