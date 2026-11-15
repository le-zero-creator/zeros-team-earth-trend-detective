import { useI18n } from '../i18n'

const AI = new Set(['earth-hero', 'satellite', 'congo-forest', 'profile-farmer', 'profile-architect', 'profile-health', 'profile-city'])

export type SceneName =
  | 'earth-hero'
  | 'satellite'
  | 'congo-forest'
  | 'nasa-marble-east'
  | 'nasa-africa-radar'
  | 'nasa-congo-river'
  | 'nasa-cameroon'
  | 'nasa-gulf'
  | 'nasa-soil'
  | 'nasa-clouds'
  | 'nasa-gpm'
  | 'profile-farmer'
  | 'profile-architect'
  | 'profile-health'
  | 'profile-city'

/** Large rounded photo. AI pictures keep their watermark. NASA pictures are public domain. */
export function Scene({ name, alt }: { name: SceneName; alt: string }) {
  const { t } = useI18n()
  const base = import.meta.env.BASE_URL
  const ai = AI.has(name)
  const mark = t('photo.watermark')
  return (
    <figure className={ai ? 'scene scene--ai ai-photo' : 'scene'}>
      <picture>
        <source srcSet={`${base}img/${name}.webp`} type="image/webp" />
        <img src={`${base}img/${name}.jpg`} alt={ai ? `${alt} — ${mark}` : alt} width={1400} height={900} data-ai={ai ? 'generated' : undefined} />
      </picture>
      {ai ? <span className="ai-photo__mark">{mark}</span> : <figcaption className="scene__credit">{t('photo.nasa')}</figcaption>}
    </figure>
  )
}
