import { Link } from 'react-router-dom'
import { useI18n } from '../i18n'

/** Écran provisoire, le temps que l'accueil soit validé. */
export function ComingNext() {
  const { t } = useI18n()
  return (
    <div className="simple card">
      <h1>{t('soon.title')}</h1>
      <p>{t('soon.body')}</p>
      <Link className="cta" to="/">
        {t('soon.back')}
      </Link>
    </div>
  )
}

export function NotFound() {
  const { t } = useI18n()
  return (
    <div className="simple card">
      <h1>{t('notfound.title')}</h1>
      <p>{t('notfound.body')}</p>
      <Link className="cta" to="/">
        {t('soon.back')}
      </Link>
    </div>
  )
}
