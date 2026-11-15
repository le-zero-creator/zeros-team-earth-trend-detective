import { Link } from 'react-router-dom'
import { TerraMascot } from '../components/TerraMascot'
import { SoonNote } from '../components/WorldStage'
import { useI18n } from '../i18n'
import { investigateLink } from '../lib/params'

export function Compare() {
  const { t } = useI18n()
  return (
    <article className="compare-page">
      <header className="pg-hero pg-hero--solo">
        <TerraMascot />
        <div className="pg-hero__copy">
          <p className="kicker">{t('soon.badge')}</p>
          <h1 className="sec-display">{t('home.compareTitle')}</h1>
          <p className="sec-lead">{t('home.compareBody')}</p>
        </div>
      </header>
      <SoonNote label={t('future.world')} />
      <div className="pg-actions">
        <Link className="bk-cta" to={investigateLink('cmr_yaounde', 't2m_max', 'p2001_2025')}>
          {t('home.notSame')} →
        </Link>
      </div>
    </article>
  )
}
