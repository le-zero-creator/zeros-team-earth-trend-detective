import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { SourceStrip } from '../components/Banners'
import { LocationsTable } from '../components/LocationsTable'
import { MeansForYou } from '../components/MeansForYou'
import { Book } from '../components/Book'
import { GoFurther, HomeAsk } from '../components/HomeExtras'
import { LivingEarth, type EarthHandle } from '../components/LivingEarth'
import { Picture } from '../components/Picture'
import { useI18n } from '../i18n'
import { useData } from '../lib/data'
import { useSpace } from '../lib/space'
import { periodLabel } from '../lib/story'
import type { Analysis, AppData, Source } from '../lib/types'



function findAnalysis(data: AppData, zone: string, variable: string) {
  return data.results.analyses.find((item) => item.zone_id === zone && item.variable_id === variable && item.period_id === 'p2001_2025')
}

export function Home() {
  const { state } = useData()
  return (
    <div className="home home--story">
      <HomeStory data={state.status === 'ready' ? state.data : null} />
    </div>
  )
}

export function HomeStory({ data }: { data: AppData | null }) {
  const { t } = useI18n()
  const { name } = useSpace()
  const hot = data ? findAnalysis(data, 'cmr_yaounde', 't2m_max') : undefined
  const yaounde = data?.zones.find((zone) => zone.zone_id === 'cmr_yaounde')
  const mapAnalyses = new Map<string, Analysis>(
    (data?.results.analyses ?? []).filter((item) => item.variable_id === 't2m_max' && item.period_id === 'p2001_2025').map((item) => [item.zone_id, item]),
  )
  const earth = useRef<EarthHandle>(null)
  const [globe, setGlobe] = useState<boolean | null>(null)
  const navigate = useNavigate()
  const goExplore = () => navigate('/explore')


  return (
    <>
      <section className="story-hero">
        {globe === false && <Picture name="earth-hero" alt={t('story.caption.earth')} />}
        <LivingEarth ref={earth} hero onReady={() => setGlobe(true)} onFallback={() => setGlobe(false)} onEnter={goExplore} />
        <button
          type="button"
          className="enter-earth"
          aria-label={t('home.explore')}
          onClick={() => {
            if (!earth.current?.enter()) goExplore()
          }}
        >
          <span>{t('home.explore')}</span>
        </button>
        <div className="story-hero__copy">
          <p className="kicker">{t('story.kicker')}</p>
          {name && <p>{t('space.hello', { name })}</p>}
          <h1 id="hero-title">{t('story.h1')}</h1>
          <p className="story-hero__lead">{t('story.lead')}</p>
          <div className="story-hero__ctas">
            <button
              type="button"
              className="cta cta--sun"
              onClick={() => document.getElementById('journey')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            >
              {t('story.openGlobe')} ↓
            </button>
            <Link className="cta cta--glass" to="/explore">{t('home.explore')} →</Link>
          </div>
        </div>
        <p className="glass-caption">{globe === false ? `${t('story.caption.earth')} ${t('photo.credit')}` : t('globe.credit')}</p>
      </section>

      <Book data={data} />
      {data ? <MeansForYou data={data} /> : <p className="story-skeleton" role="status">{t('state.loading')}</p>}
      <HomeAsk />
      <GoFurther />

      {yaounde && <p className="callout">{t('yaounde.short', { km: yaounde.distance_to_basin_km })}</p>}

      {data && hot && yaounde && <>
      <details className="science-fold">
        <summary>{t('place.deeper')}</summary>
        <p>{t('app.subtitle')}</p>
        <p>{t('home.pnote')}</p>
        <p>{t('yaounde.forest', { km: yaounde.distance_to_basin_km })}</p>
        <LocationsTable
          zones={data.zones}
          analyses={mapAnalyses}
          caption={t('home.table.caption', { variable: t('home.card.heat.title'), period: periodLabel(hot.period), unit: hot.slope_unit })}
        />
        <SourceStrip sources={data.results.meta.sources as Source[]} />
      </details>
      </>}
    </>
  )
}

