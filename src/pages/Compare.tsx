import { Link } from 'react-router-dom'
import { SoonNote } from '../components/WorldStage'
import { useI18n } from '../i18n'
import { investigateLink } from '../lib/params'

export function Compare() {
  const { t } = useI18n()
  return (
    <article className="compare-page">
      <h1>{t('home.compareTitle')}</h1>
      <SoonNote label={t('future.world')} />
      <p>{t('home.compareBody')}</p>
      <p>
        <Link className="cta" to={investigateLink('cmr_yaounde', 't2m_max', 'p2001_2025')}>
          {t('home.notSame')}
        </Link>
      </p>
    </article>
  )
}
