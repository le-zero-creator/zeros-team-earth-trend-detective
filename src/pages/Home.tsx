import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { SourceStrip } from '../components/Banners'
import { CountUp } from '../components/CountUp'
import { LocationsTable } from '../components/LocationsTable'
import { MeansForYou } from '../components/MeansForYou'
import { LivingEarth, type EarthHandle } from '../components/LivingEarth'
import { Picture } from '../components/Picture'
import { useI18n, type Key } from '../i18n'
import { useData } from '../lib/data'
import { SLOPE_DECIMALS, formatSigned, plainUnit } from '../lib/format'
import { investigateLink } from '../lib/params'
import { useProfile } from '../lib/profile'
import { useSpace } from '../lib/space'
import { periodLabel } from '../lib/story'
import type { Analysis, AppData, Source } from '../lib/types'

const FUTURES: { id: string; sourceId: string | null; label: Key }[] = [
  { id: 'ndvi', sourceId: 'modis_ndvi', label: 'future.ndvi' },
  { id: 'lst', sourceId: 'modis_lst', label: 'future.lst' },
  { id: 'gpm', sourceId: 'gpm_imerg', label: 'future.gpm' },
  { id: 'forest', sourceId: null, label: 'future.forest' },
  { id: 'world', sourceId: null, label: 'future.world' },
]

const STEPS = [
  { id: 'earth', image: 'earth-hero' as const, title: 'story.step.earth' as Key, caption: 'story.caption.earth' as Key },
  { id: 'sat', image: 'satellite' as const, title: 'story.step.sat' as Key, caption: 'story.caption.sat' as Key },
  { id: 'forest', image: 'congo-forest' as const, title: 'story.step.forest' as Key, caption: 'story.caption.forest' as Key },
  { id: 'city', image: null, title: 'story.step.city' as Key, caption: 'story.caption.earth' as Key },
]

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
  const { t, lang, setLang } = useI18n()
  const { profile } = useProfile()
  const { name } = useSpace()
  const [welcome, setWelcome] = useState(0)
  const [step, setStep] = useState(0)
  const hot = data ? findAnalysis(data, 'cmr_yaounde', 't2m_max') : undefined
  const air = data ? findAnalysis(data, 'cmr_yaounde', 'rh2m') : undefined
  const yaounde = data?.zones.find((zone) => zone.zone_id === 'cmr_yaounde')
  const yes = Boolean(hot && hot.evidence_level === 'robust' && hot.significatif && hot.direction === 'increasing')
  const airPlain = air ? `${formatSigned(air.pente_decennie, SLOPE_DECIMALS.rh2m, lang)} ${plainUnit(air.slope_unit, lang)}` : ''
  const heatLink = investigateLink('cmr_yaounde', 't2m_max', 'p2001_2025')
  const mapAnalyses = new Map<string, Analysis>(
    (data?.results.analyses ?? []).filter((item) => item.variable_id === 't2m_max' && item.period_id === 'p2001_2025').map((item) => [item.zone_id, item]),
  )
  const frame = STEPS[step]
  const earth = useRef<EarthHandle>(null)
  const [globe, setGlobe] = useState(false)

  useEffect(() => {
    const reduce = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    let frameId = 0
    const onScroll = () => {
      window.cancelAnimationFrame(frameId)
      frameId = window.requestAnimationFrame(() => {
        const t = Math.min(1, window.scrollY / (window.innerHeight * 1.8))
        if (t < 0.34) earth.current?.lookAt(12, 18, 2.9)
        else if (t < 0.68) earth.current?.lookAt(1, 20, 2.15)
        else earth.current?.lookAt(3.87, 11.52, 1.72)
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.cancelAnimationFrame(frameId)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  useEffect(() => {
    try {
      if (sessionStorage.getItem('td.welcome') === '1') setWelcome(5)
    } catch {
      setWelcome(5)
    }
  }, [])

  useEffect(() => {
    if (typeof IntersectionObserver !== 'function') return
    const nodes = STEPS.map((item) => document.getElementById(`step-${item.id}`)).filter((node): node is HTMLElement => Boolean(node))
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        const index = nodes.findIndex((node) => node === visible?.target)
        if (index >= 0) setStep(index)
      },
      { threshold: 0.55 },
    )
    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [])

  return (
    <>
      {welcome < 5 && (
        <div className="welcome" role="dialog" aria-label={t('welcome.lang')}>
          <div className="welcome-card">
            {welcome === 0 ? (
              <>
                <h2>{t('welcome.lang')}</h2>
                <p>{t('story.lead')}</p>
                <div className="welcome-actions">
                  <button type="button" onClick={() => { setLang('en'); setWelcome(1) }}>English</button>
                  <button type="button" onClick={() => { setLang('fr'); setWelcome(1) }}>Français</button>
                </div>
              </>
            ) : (
              <>
                <h2>{t(`welcome.${welcome}` as Key)}</h2>
                <div className="welcome-actions">
                  <button
                    type="button"
                    onClick={() => {
                      const next = welcome + 1
                      setWelcome(next)
                      if (next >= 5) {
                        try { sessionStorage.setItem('td.welcome', '1') } catch { /* reste ouvert cette fois */ }
                      }
                    }}
                  >
                    {welcome === 4 ? t('welcome.done') : t('welcome.next')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setWelcome(5)
                      try { sessionStorage.setItem('td.welcome', '1') } catch { /* reste ouvert cette fois */ }
                    }}
                  >
                    {t('tour.skip')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <section className="story-hero">
        {!globe && <Picture name="earth-hero" alt={t('story.caption.earth')} />}
        <LivingEarth ref={earth} hero onReady={() => setGlobe(true)} onFallback={() => setGlobe(false)} />
        <div className="story-hero__copy">
          <p className="kicker">{t('story.kicker')}</p>
          {name && <p>{t('space.hello', { name })}</p>}
          <h1 id="hero-title">{t('story.h1')}</h1>
          <p>{t('story.lead')}</p>
          <p>{t(`means.hero.${profile}` as Key)}</p>
          <p>
            <Link className="cta cta--sun" to="/explore">{t('story.openGlobe')}</Link>
          </p>
        </div>
        <p className="glass-caption">{globe ? t('globe.credit') : `${t('story.caption.earth')} ${t('photo.credit')}`}</p>
      </section>

      <nav className="scale-nav" aria-label={t('story.kicker')}>
        <a href="#step-earth">{t('means.earth')}</a>
        <a href="#step-forest">{t('means.congo')}</a>
        <a href="#step-city">{t('means.yaounde')}</a>
      </nav>
      <section className="scrolly reveal" aria-label={t('story.kicker')}>
        <div className="scrolly__steps">
          {STEPS.map((item) => (
            <article key={item.id} className="scrolly__step" id={`step-${item.id}`}>
              <h2>{item.id === 'city' ? t('home.story.question') : t(item.title)}</h2>
              <p>{t(item.title)}</p>
              {item.id === 'city' && hot && (
                <>
                  <p className="story-num">
                    <CountUp value={hot.pente_decennie} decimals={SLOPE_DECIMALS.t2m_max} lang={lang} /> {plainUnit(hot.slope_unit, lang)}
                  </p>
                  <p className="band__yes">{yes ? t('home.story.yes') : t('plain.notSure')}</p>
                  <p>{airPlain}</p>
                  <p className="note">{t('means.source')}</p>
                  <CitySketch />
                  <Link to={heatLink}>Open Yaoundé</Link>
                </>
              )}
              {item.id === 'city' && !hot && <p className="story-skeleton" role="status">{t('state.loading')}</p>}
            </article>
          ))}
        </div>
        <figure className="scrolly__visual">
          {frame.image ? <Picture name={frame.image} alt={t(frame.caption)} /> : <CitySketch />}
          <figcaption className="glass-caption">{frame.image ? t(frame.caption) : t('home.story.question')}</figcaption>
        </figure>
      </section>

      {data ? <MeansForYou data={data} /> : <p className="story-skeleton" role="status">{t('state.loading')}</p>}

      <section className="how reveal" aria-labelledby="how-title">
        <h2 id="how-title">{t('how.h1')}</h2>
        <svg className="flow-line" viewBox="0 0 640 28" aria-hidden="true">
          <path d="M8 14 H632" />
          <circle cx="8" cy="14" r="4" />
        </svg>
        <ol>
          <li><Picture name="satellite" alt={t('story.caption.sat')} /><span>{t('how.1')}</span></li>
          <li><span>{t('how.2')}</span></li>
          <li><span>{t('how.3')}</span></li>
          <li><Picture name="congo-forest" alt={t('story.caption.forest')} /><span>{t('how.4')}</span></li>
        </ol>
      </section>

      <p>
        <Link to="/congo">{t('story.openCongo')}</Link>
      </p>
      {yaounde && <p className="callout">{t('yaounde.short', { km: yaounde.distance_to_basin_km })}</p>}

      {data && hot && yaounde && <>
      <section className="future" aria-labelledby="future-title">
        <h2 id="future-title">{t('future.title')}</h2>
        <ul className="future-row">
          {FUTURES.map((item) => {
            const source = item.sourceId ? data.results.meta.sources.find((entry) => entry.id === item.sourceId) : undefined
            const status = source?.status ?? 'coming'
            return (
              <li key={item.id}>
                <span className="chip chip--soon" data-future={status}>
                  {t(item.label)}
                  <span className={`pill pill--${status === 'coming' ? 'pending' : status}`}>
                    {status === 'coming' ? t('soon.badge') : t(`status.${status}` as Key)}
                  </span>
                </span>
              </li>
            )
          })}
        </ul>
      </section>

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

function CitySketch() {
  return (
    <svg className="city-sketch" viewBox="0 0 320 180" role="img" aria-label="Yaoundé">
      <path className="draw-line" d="M20 140 H300" />
      <path className="draw-line" d="M60 140 V70 H110 V140" />
      <path className="draw-line" d="M140 140 V40 H210 V140" />
      <path className="draw-line" d="M230 140 V90 H280 V140" />
      <circle className="draw-line" cx="250" cy="36" r="16" />
    </svg>
  )
}
