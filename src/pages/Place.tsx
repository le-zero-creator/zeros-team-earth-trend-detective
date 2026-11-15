import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { CloudRain, Sun, Wind } from 'lucide-react'
import { EvidenceView } from '../components/EvidenceView'
import { CountUp } from '../components/CountUp'
import { HomeAsk } from '../components/HomeExtras'
import { Scene } from '../components/Scene'
import { TraceChart } from '../components/TraceChart'
import { useI18n, type Key } from '../i18n'
import { useData } from '../lib/data'
import { SLOPE_DECIMALS, plainUnit } from '../lib/format'
import { ZONE_IDS, investigateLink } from '../lib/params'

const TRACES = [
  { id: 't2m_max', Icon: Sun },
  { id: 'rh2m', Icon: Wind },
  { id: 'precip', Icon: CloudRain },
] as const

/** One place, read in plain words: three traces, each with its proof, then Ask Terra. */
export function Place() {
  const { t, lang } = useI18n()
  const { zoneId: raw } = useParams()
  const zoneId = raw && (ZONE_IDS as readonly string[]).includes(raw) ? raw : 'cmr_yaounde'
  const { state } = useData()
  const [open, setOpen] = useState(false)
  if (state.status !== 'ready') return <p role="status">{t('state.loading')}</p>
  const zone = state.data.zones.find((item) => item.zone_id === zoneId) ?? state.data.zones[0]
  const pick = (v: string) => state.data.results.analyses.find((a) => a.zone_id === zone.zone_id && a.variable_id === v && a.period_id === 'p2001_2025')
  const heat = pick('t2m_max')
  const variable = state.data.results.variables.find((item) => item.variable_id === 't2m_max')
  const source = state.data.results.meta.sources.find((item) => item.id === 'merra2')
  const name = (lang === 'fr' ? zone.name_fr : zone.name_en).split('–')[0].split('—')[0].split('(')[0].trim()
  return (
    <article className="place-page">
      <header className="pg-hero">
        <Scene name={zone.zone_id === 'cmr_yaounde' ? 'city-yaounde' : 'nasa-congo-river'} alt={zone.zone_id === 'cmr_yaounde' ? t('img.city') : t('scene.river')} />
        <div className="pg-hero__copy">
          <p className="kicker">{t('place.k')}</p>
          <h1 className="sec-display">{t('place.t', { place: name })}</h1>
          <p className="sec-lead">{zone.zone_id === 'cmr_yaounde' ? t('place.b') : t('place.bAny')}</p>
          {!zone.in_hydrobasins_congo && <p className="pg-chip">{t('yaounde.outsideKm', { km: zone.distance_to_basin_km })}</p>}
        </div>
      </header>

      <h2 className="sec-title pg-h2">{t('place.traces')}</h2>
      <ul className="pg-traces">
        {TRACES.map(({ id, Icon }, n) => {
          const a = pick(id)
          if (!a) return null
          const sure = a.evidence_level !== 'not_enough_evidence_yet' && a.significatif
          return (
            <li key={id} className="pg-trace reveal" style={{ ['--d' as string]: `${n * 90}ms` }}>
              <p className="pg-trace__k"><Icon aria-hidden="true" /> {t('place.traceN', { n: n + 1 })}</p>
              <h3>{t(`plain.var.${id}` as Key)}</h3>
              {sure ? (
                <p className="bk-num">
                  <CountUp value={a.pente_decennie} decimals={SLOPE_DECIMALS[id] ?? 2} lang={lang} />
                  <span>{plainUnit(a.slope_unit, lang)}</span>
                </p>
              ) : (
                <p className="pg-trace__unsure">{t('place.notProven')}</p>
              )}
              <TraceChart analysis={a} play label={t(`plain.var.${id}` as Key)} />
              <p className={sure ? 'bk-verdict' : 'bk-verdict bk-verdict--unsure'}>{sure ? t('book.sure') : t('book.unsure')}</p>
              <Link className="pg-trace__link" to={investigateLink(zone.zone_id, id, 'p2001_2025')}>{t('place.proof')} →</Link>
            </li>
          )
        })}
      </ul>
      <p className="note">{t('ev.verdict.note', { period: '2001–2025' })}</p>

      <HomeAsk zoneId={zone.zone_id} lat={zone.lat} lon={zone.lon} titleKey="homeask.t.city" />

      <div className="pg-actions">
        <Link className="bk-cta" to="/you">{t('place.toYou')} →</Link>
        <button type="button" className="bk-more" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
          {t('place.deeper')}
        </button>
      </div>
      <AnimatePresence initial={false}>
        {open && heat && variable && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.45, ease: [0.16, 0.84, 0.24, 1] }}>
            <EvidenceView
              analysis={heat}
              variable={variable}
              zone={zone}
              source={source}
              zones={state.data.zones}
              analyses={new Map([[zone.zone_id, heat]])}
              onAct={() => {}}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  )
}
