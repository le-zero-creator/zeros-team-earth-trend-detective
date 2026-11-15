import { Link } from 'react-router-dom'
import { TerraMascot } from '../components/TerraMascot'
import { useI18n } from '../i18n'

/** Écran provisoire, le temps que l'accueil soit validé. */
export function ComingNext() {
  const { t } = useI18n()
  return (
    <article className="simple-page">
      <header className="pg-hero pg-hero--solo">
        <TerraMascot mood="think" />
        <div className="pg-hero__copy">
          <h1 className="sec-display">{t('soon.title')}</h1>
          <p className="sec-lead">{t('soon.body')}</p>
          <Link className="bk-cta" to="/">
            {t('soon.back')}
          </Link>
        </div>
      </header>
    </article>
  )
}

export function NotFound() {
  const { t } = useI18n()
  return (
    <article className="simple-page">
      <header className="pg-hero pg-hero--solo">
        <TerraMascot />
        <div className="pg-hero__copy">
          <h1 className="sec-display">{t('notfound.title')}</h1>
          <p className="sec-lead">{t('notfound.body')}</p>
          <Link className="bk-cta" to="/">
            {t('soon.back')}
          </Link>
        </div>
      </header>
    </article>
  )
}
