import { Link } from 'react-router-dom'
import { Picture } from '../components/Picture'
import { useI18n } from '../i18n'
import { useData } from '../lib/data'
import { investigateLink } from '../lib/params'

export function Region() {
  const { t, lang } = useI18n()
  const { state } = useData()
  return (
    <article className="region-page">
      <header className="region-hero">
        <Picture name="congo-forest" alt={t('story.caption.forest')} />
        <div>
          <h1>{t('region.h1')}</h1>
          <p>{t('region.lead')}</p>
          <p className="note">{t('app.subtitle')}</p>
        </div>
      </header>
      {state.status === 'ready' && (
        <ul className="region-list">
          {state.data.zones.map((zone) => (
            <li key={zone.zone_id}>
              <Link to={investigateLink(zone.zone_id, 't2m_max', 'p2001_2025')}>
                <strong>{lang === 'fr' ? zone.name_fr : zone.name_en}</strong>
                <span>{zone.country}</span>
                {!zone.in_hydrobasins_congo && <span>{t('yaounde.outsideKm', { km: zone.distance_to_basin_km })}</span>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}
