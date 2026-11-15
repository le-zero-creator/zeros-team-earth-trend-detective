import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { CountUp } from '../components/CountUp'
import { EvidenceBadge } from '../components/EvidenceBadge'
import { Scene } from '../components/Scene'
import { TraceChart } from '../components/TraceChart'
import { TurnPage } from '../components/TurnPage'
import { useI18n } from '../i18n'
import { useData } from '../lib/data'
import { SLOPE_DECIMALS, plainUnit } from '../lib/format'
import { investigateLink } from '../lib/params'

/** Chapter 3 as a page: the eleven places, one card each, same cards as the Yaoundé page. */
export function Region() {
  const { t, lang } = useI18n()
  const { state } = useData()
  return (
    <article className="region-page">
      <header className="pg-hero">
        <Scene name="congo-forest" alt={t('story.caption.forest')} />
        <div className="pg-hero__copy">
          <p className="kicker">{t('region.k')}</p>
          <h1 className="sec-display">{t('region.h1')}</h1>
          <p className="sec-lead">{t('region.story')}</p>
          <p className="note">{t('region.lead')} {t('app.subtitle')}</p>
        </div>
      </header>

      {state.status !== 'ready' && <p role="status">{t('state.loading')}</p>}
      {state.status === 'ready' && (
        <>
          <h2 className="sec-title pg-h2">{t('region.traces')}</h2>
          <ul className="pg-traces">
            {state.data.zones.map((zone, n) => {
              const a = state.data.results.analyses.find(
                (item) => item.zone_id === zone.zone_id && item.variable_id === 't2m_max' && item.period_id === 'p2001_2025',
              )
              if (!a) return null
              const name = lang === 'fr' ? zone.name_fr : zone.name_en
              const sure = a.evidence_level !== 'not_enough_evidence_yet' && a.significatif
              return (
                <li key={zone.zone_id} className="pg-trace reveal" data-zone={zone.zone_id} style={{ ['--d' as string]: `${(n % 3) * 90}ms` }}>
                  <p className="pg-trace__k"><MapPin aria-hidden="true" /> {zone.country}</p>
                  <h3>{name}</h3>
                  {sure ? (
                    <p className="bk-num">
                      <CountUp value={a.pente_decennie} decimals={SLOPE_DECIMALS.t2m_max} lang={lang} />
                      <span>{plainUnit(a.slope_unit, lang)}</span>
                    </p>
                  ) : (
                    <p className="pg-trace__unsure">{t('place.notProven')}</p>
                  )}
                  <TraceChart analysis={a} play label={name} />
                  <EvidenceBadge level={a.evidence_level} direction={a.direction} />
                  {!zone.in_hydrobasins_congo && <p className="note">{t('yaounde.outsideKm', { km: zone.distance_to_basin_km })}</p>}
                  <Link className="pg-trace__link" to={investigateLink(zone.zone_id, 't2m_max', 'p2001_2025')}>{t('globe.investigate')} →</Link>
                </li>
              )
            })}
          </ul>
          <p className="note">{t('ev.verdict.note', { period: '2001–2025' })}</p>
          <div className="pg-actions">
            <Link className="bk-cta" to="/place/cmr_yaounde">{t('story.openYaounde')} →</Link>
            <Link className="bk-more" to="/explore">{t('region.globe')}</Link>
          </div>
        </>
      )}
      <TurnPage current="/congo" />
    </article>
  )
}
