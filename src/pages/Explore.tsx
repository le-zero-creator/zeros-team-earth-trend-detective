import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EarthGlobe, type FlyTarget } from '../components/EarthGlobe'
import { Picture } from '../components/Picture'
import { useI18n } from '../i18n'
import { useData } from '../lib/data'
import { investigateLink } from '../lib/params'

export function Explore() {
  const { t } = useI18n()
  const { state } = useData()
  const navigate = useNavigate()
  const [target, setTarget] = useState<FlyTarget>(null)
  return (
    <article className="explore">
      <header className="explore__copy">
        <h1>{t('globe.h1')}</h1>
        <p>{t('globe.lead')}</p>
        <button type="button" onClick={() => setTarget({ lon: 18, lat: 0, zoom: 3.2 })}>{t('globe.flyCongo')}</button>
        <button type="button" onClick={() => setTarget({ lon: 11.52, lat: 3.87, zoom: 6 })}>{t('globe.flyCity')}</button>
        <p className="note">{t('globe.credit')}</p>
      </header>
      <div className="explore__stage">
        {state.status === 'ready' ? (
          <EarthGlobe zones={state.data.zones} target={target} onPick={(zoneId) => navigate(investigateLink(zoneId, 't2m_max', 'p2001_2025'))} />
        ) : (
          <>
            <Picture name="earth-hero" alt={t('story.caption.earth')} />
            <p role="status">{t('state.loading')}</p>
          </>
        )}
      </div>
    </article>
  )
}
