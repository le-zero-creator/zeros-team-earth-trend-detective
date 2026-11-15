import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { SourceStrip } from '../components/Banners'
import { CountUp } from '../components/CountUp'
import { Icon } from '../components/Icons'
import { LocationsTable } from '../components/LocationsTable'
import { PersonaPanel } from '../components/PersonaPanel'
import { Sparkline } from '../components/Sparkline'
import { WorldStage } from '../components/WorldStage'
import { useI18n, type Key } from '../i18n'
import { useData } from '../lib/data'
import { SLOPE_DECIMALS, formatSlope } from '../lib/format'
import { investigateLink } from '../lib/params'
import { periodLabel } from '../lib/story'
import type { Analysis, AppData, Source } from '../lib/types'

const FUTURES: { id: string; sourceId: string | null; label: Key }[] = [
  { id: 'ndvi', sourceId: 'modis_ndvi', label: 'future.ndvi' },
  { id: 'lst', sourceId: 'modis_lst', label: 'future.lst' },
  { id: 'gpm', sourceId: 'gpm_imerg', label: 'future.gpm' },
  { id: 'forest', sourceId: null, label: 'future.forest' },
  { id: 'world', sourceId: null, label: 'future.world' },
]

function findAnalysis(data: AppData, zone: string, variable: string, period = 'p2001_2025') {
  return data.results.analyses.find((a) => a.zone_id === zone && a.variable_id === variable && a.period_id === period)
}

export function Home() {
  const { t } = useI18n()
  const { state, retry } = useData()
  return (
    <div className="home home--story">
      {state.status === 'loading' && (
        <div className="card skeleton" role="status">
          <p className="skeleton__text">{t('state.loading')}</p>
        </div>
      )}
      {state.status === 'error' && (
        <div className="card error" role="alert">
          <h2>{t('state.error.title')}</h2>
          <p>{t('state.error.body')}</p>
          <button type="button" className="cta" onClick={retry}>
            {t('state.error.retry')}
          </button>{' '}
          <Link to="/method">{t('state.error.method')}</Link>
        </div>
      )}
      {state.status === 'ready' && <HomeStory data={state.data} />}
    </div>
  )
}

export function HomeStory({ data }: { data: AppData }) {
  const { t, lang } = useI18n()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const stage = params.get('stage')
  const hot = findAnalysis(data, 'cmr_yaounde', 't2m_max')!
  const air = findAnalysis(data, 'cmr_yaounde', 'rh2m')!
  const rain = findAnalysis(data, 'cmr_yaounde', 'precip')!
  const yaounde = data.zones.find((z) => z.zone_id === 'cmr_yaounde')!
  const yes = hot.evidence_level === 'robust' && hot.significatif && hot.direction === 'increasing'
  const period = periodLabel(hot.period)
  const hotSlope = formatSlope(hot.pente_decennie, hot.variable_id, hot.slope_unit, lang)
  const airSlope = formatSlope(air.pente_decennie, air.variable_id, air.slope_unit, lang)
  const heatLink = investigateLink('cmr_yaounde', 't2m_max', 'p2001_2025')
  const mapAnalyses = new Map<string, Analysis>(
    data.results.analyses.filter((a) => a.variable_id === 't2m_max' && a.period_id === 'p2001_2025').map((a) => [a.zone_id, a]),
  )
  const observed = t('observe.sig', {
    place: 'Yaoundé',
    what: t('home.card.heat.title'),
    slope: hotSlope,
    period,
    level: t(`evidence.plain.${hot.evidence_level}` as Key),
  })

  return (
    <>
      <section className="band" aria-labelledby="hero-title">
        <div className="band__copy">
          <p className="band__lead">{t('home.lead')}</p>
          <h1 id="hero-title">{t('home.story.question')}</h1>
          <p className="band__yes">{yes ? t('home.story.yes') : t('home.story.careful')}</p>
          <p className="hero-numline">
            <span className="hero-num">
              <CountUp value={hot.pente_decennie} decimals={SLOPE_DECIMALS.t2m_max} lang={lang} />
            </span>{' '}
            <span className="hero-unit">{hot.slope_unit}</span>
          </p>
          <p className="band__meta">
            {period} · {t('evidence.plain.robust')} · {t('app.subtitle')}
          </p>
          <p className="band__tag">{t('home.tagline')}</p>
          <Link className="cta cta--sun" to={heatLink}>
            {t('home.seeAnalysis')}
          </Link>
        </div>
      </section>

      <ul className="story-cards">
        <li>
          <Link className="story-card story-card--heat" to={heatLink}>
            <Icon name="sun" />
            <span className="story-card__title">{t('home.card.heat.title')}</span>
            <span>{t('home.card.heat.sentence')}</span>
            <strong>{hotSlope}</strong>
            <Sparkline series={hot.serie_annuelle} color="#e36414" label={t('home.card.heat.title')} />
            <span className="textlink">{t('home.seeAnalysis')}</span>
          </Link>
        </li>
        <li>
          <Link className="story-card story-card--air" to={investigateLink('cmr_yaounde', 'rh2m', 'p2001_2025')}>
            <Icon name="drop" />
            <span className="story-card__title">{t('home.card.air.title')}</span>
            <span>{t('home.card.air.sentence')}</span>
            <strong>{airSlope}</strong>
            <Sparkline series={air.serie_annuelle} color="#8a4b2a" label={t('home.card.air.title')} />
            <span className="textlink">{t('home.seeAnalysis')}</span>
          </Link>
        </li>
        <li>
          <Link className="story-card story-card--rain" to={investigateLink('cmr_yaounde', 'precip', 'p2001_2025')}>
            <Icon name="cloud" />
            <span className="story-card__title">{t('home.card.rain.title')}</span>
            <span>{t('home.card.rain.sentence')}</span>
            <strong>{t('evidence.not_enough_evidence_yet')}</strong>
            <Sparkline series={rain.serie_annuelle} color="#64748b" label={t('home.card.rain.title')} />
            <span className="note">{t('evidence.neeNote')}</span>
            <span className="textlink">{t('home.seeAnalysis')}</span>
          </Link>
        </li>
      </ul>

      <p className="callout">{t('yaounde.forest', { km: yaounde.distance_to_basin_km })}</p>

      <WorldStage
        zones={data.zones}
        boundary={data.boundary}
        analyses={mapAnalyses}
        variableId="t2m_max"
        initial={stage === 'earth' ? 'earth' : stage === 'soon' ? 'soon' : 'enter'}
        onSelect={(zone) => navigate(investigateLink(zone, 't2m_max', 'p2001_2025'))}
      />

      <section className="future" aria-labelledby="future-title">
        <h2 id="future-title">{t('future.title')}</h2>
        <ul className="future-row">
          {data.results.variables.map((v) => (
            <li key={v.variable_id}>
              <Link className="chip" to={investigateLink('cmr_yaounde', v.variable_id, 'p2001_2025')}>
                {v.name[lang]}
                <span className="pill pill--available">{t('status.available')}</span>
              </Link>
            </li>
          ))}
          {FUTURES.map((item) => {
            const source = item.sourceId ? data.results.meta.sources.find((s) => s.id === item.sourceId) : undefined
            const status = source?.status ?? 'coming'
            return (
              <li key={item.id}>
                <button type="button" className="chip chip--soon" data-future={status} title={t('soon.tip')} onClick={() => navigate('/?stage=soon')}>
                  {t(item.label)}
                  <span className={`pill pill--${status === 'coming' ? 'pending' : status}`}>
                    {status === 'coming' ? t('soon.badge') : t(`status.${status}` as Key)}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="compare-teaser">
        <h2>{t('home.compareTitle')}</h2>
        <p>{t('home.compareBody')}</p>
        <Link className="textlink" to="/compare">
          {t('home.compareCta')}
        </Link>
      </section>

      <p className="pull">{t('home.visible')}</p>
      <p className="pull">{t('home.oneearth')}</p>
      <PersonaPanel observed={observed} analysis={hot} variableId="t2m_max" />
      <p className="note">{t('home.whoNote')}</p>

      <section className="tablecard card" aria-labelledby="table-title">
        <h2 id="table-title">{t('home.notSame')}</h2>
        <LocationsTable zones={data.zones} analyses={mapAnalyses} caption={t('home.table.caption', { variable: t('home.card.heat.title'), period, unit: hot.slope_unit })} />
        <p className="note">{t('home.pnote')}</p>
      </section>

      <SourceStrip sources={data.results.meta.sources as Source[]} />
    </>
  )
}
