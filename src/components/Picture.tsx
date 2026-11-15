import { useI18n } from '../i18n'

/** Photo approuvée : WebP, repli JPEG, et une étiquette visible « image générée par IA ». */
export function Picture({ name, alt }: { name: 'earth-hero' | 'satellite' | 'congo-forest'; alt: string }) {
  const { t } = useI18n()
  const mark = t('photo.watermark')
  const base = import.meta.env.BASE_URL
  return (
    <span className="ai-photo">
      <picture>
        <source srcSet={`${base}img/${name}.webp`} type="image/webp" />
        <img src={`${base}img/${name}.jpg`} alt={`${alt} — ${mark}`} width={1600} height={1000} data-ai="generated" />
      </picture>
      <span className="ai-photo__mark">{mark}</span>
    </span>
  )
}
