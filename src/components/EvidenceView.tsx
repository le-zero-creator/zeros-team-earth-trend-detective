import { Link } from 'react-router-dom'
import { ExploratoryBanner } from './Banners'
import { EvidenceBadge } from './EvidenceBadge'
import { LocationsTable } from './LocationsTable'
import { TrendChart } from './TrendChart'
import { useI18n, type Key } from '../i18n'
import { SLOPE_DECIMALS, formatNumber, formatP, formatSigned, formatSlope } from '../lib/format'
import { periodLabel } from '../lib/story'
import type { Analysis, Source, Variable, Zone } from '../lib/types'

const MONTHS: Key[] = ['month.1', 'month.2', 'month.3', 'month.4', 'month.5', 'month.6', 'month.7', 'month.8', 'month.9', 'month.10', 'month.11', 'month.12']

const ACKER: Key[] = ['acker.series', 'acker.plot', 'acker.trend', 'acker.test', 'acker.meaning']

export function EvidenceView({
  analysis,
  variable,
  zone,
  source,
  zones,
  analyses,
  onAct,
}: {
  analysis: Analysis
  variable: Variable
  zone: Zone
  source?: Source
  zones: Zone[]
  analyses: Map<string, Analysis>
  onAct: () => void
}) {
  const { t, lang } = useI18n()
  const place = lang === 'fr' ? zone.name_fr : zone.name_en
  const decimals = SLOPE_DECIMALS[analysis.variable_id] ?? 2
  const slope = formatSlope(analysis.pente_decennie, analysis.variable_id, analysis.slope_unit, lang)
  const lo = formatNumber(analysis.pente_decennie_ic95[0], decimals, lang)
  const hi = formatNumber(analysis.pente_decennie_ic95[1], decimals, lang)
  const period = periodLabel(analysis.period)
  const what = variable.name[lang]
  const unsure = analysis.evidence_level === 'not_enough_evidence_yet' || !analysis.significatif
  const observed = unsure
    ? t('observe.unsure', { place, what, period })
    : t('observe.sig', { place, what, slope, period, level: t(`evidence.plain.${analysis.evidence_level}` as Key) })
  const months = analysis.serie_mensuelle_moyenne
  const maxMonth = Math.max(...months.map((n) => Math.abs(n))) || 1
  const hr = analysis.hr_vs_mk ? t(analysis.hr_vs_mk === 'confirms' ? 'hr.confirms' : 'hr.contradicts') : t('hr.none')

  return (
    <div className="evidence">
      <p className="place-kicker">{place}</p>
      <h2>{what}</h2>
      <p className="note">
        {period} · {t(`evidence.plain.${analysis.evidence_level}` as Key)} · {analysis.n_years} {t('science.years')}
      </p>
      <p className="lead-obs">{observed}</p>
      <div className="verdict-row">
        <EvidenceBadge level={analysis.evidence_level} direction={analysis.direction} />
        <p className={`big-slope${unsure ? ' is-quiet' : ''}`} aria-live="polite">
          {slope}
        </p>
      </div>
      <p>
        <span className="label">{t('science.ciLabel')}</span> {lo} {t('science.to')} {hi} {analysis.slope_unit}
      </p>
      <p className="note">{t('science.ic')}</p>
      <p>
        <span className="label">{t('science.recordLabel')}</span>{' '}
        {formatSigned(analysis.variation_totale, decimals, lang)} {analysis.unit}
      </p>

      <TrendChart
        analysis={analysis}
        valueName={t('chart.values')}
        lineName={t('chart.sen')}
        alt={t('science.chartAlt', { what, place, period, level: t(`evidence.${analysis.evidence_level}`) })}
      />
      <p className="note">{t('chart.verdict')}</p>
      {analysis.warnings.includes('long_period_solar_source_change_to_verify') && <p className="warning">{t('home.solarWarning')}</p>}

      <section id="tests" aria-labelledby="tests-title">
        <h3 id="tests-title">{t('science.title')}</h3>
        <ExploratoryBanner />
        <p>{t('science.pLong')}</p>
        <p>{t('home.pnote')}</p>
        <table className="tests">
          <caption>{t('science.tests')}</caption>
          <thead>
            <tr>
              <th scope="col">{t('science.col.test')}</th>
              <th scope="col">{t('science.col.value')}</th>
              <th scope="col">{t('science.col.role')}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">{t('science.mkName')}</th>
              <td className="mono">{formatP(analysis.p_mk, lang)}</td>
              <td>{t('science.mkRole')}</td>
            </tr>
            <tr>
              <th scope="row">{t('science.smkName')}</th>
              <td className="mono">{formatP(analysis.p_smk, lang)}</td>
              <td>{t('science.smkRole')}</td>
            </tr>
            <tr>
              <th scope="row">{t('science.hrName')}</th>
              <td className="mono">{formatP(analysis.p_hr, lang)}</td>
              <td>
                {t('science.hr')} {hr}
              </td>
            </tr>
            <tr>
              <th scope="row">{t('science.qName')}</th>
              <td className="mono">{formatP(analysis.q_bh, lang)}</td>
              <td>{t('science.qRole')}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section aria-labelledby="acker-title">
        <h3 id="acker-title">{t('acker.title')}</h3>
        <p className="note">{t('acker.cite')}</p>
        <ol className="acker">
          {ACKER.map((key) => (
            <li key={key}>
              <span className="acker__check" aria-hidden="true">
                ✓
              </span>
              {t(key)}
            </li>
          ))}
        </ol>
        <button type="button" className="textlink" onClick={onAct}>
          {t('acker.open')}
        </button>
      </section>

      <section aria-labelledby="months-title">
        <h3 id="months-title">{t('science.months')}</h3>
        <ul className="months">
          {months.map((value, i) => (
            <li key={MONTHS[i]}>
              <span>{t(MONTHS[i])}</span>
              <span className="months__bar" style={{ width: `${Math.max(8, (Math.abs(value) / maxMonth) * 100)}%` }} />
              <span className="mono">{formatNumber(value, Math.min(decimals, 2), lang)}</span>
            </li>
          ))}
        </ul>
      </section>

      {source && (
        <section aria-labelledby="source-title">
          <h3 id="source-title">{t('science.source')}</h3>
          <p>{source.name}</p>
          <p>
            <span className={`pill pill--${source.status}`}>{t(`status.${source.status}` as Key)}</span>
          </p>
          {source.type && (
            <p>
              <span className="label">{t('science.type')}</span> {t(`sourceType.${source.id}` as Key)}
            </p>
          )}
          {source.resolution && (
            <p>
              <span className="label">{t('science.resolution')}</span> {source.resolution}
            </p>
          )}
          {source.accessed && (
            <p>
              <span className="label">{t('science.accessed')}</span> {source.accessed}
            </p>
          )}
          {source.url && (
            <p>
              <a href={source.url} target="_blank" rel="noopener noreferrer">
                {source.url}
              </a>
            </p>
          )}
        </section>
      )}

      {!zone.in_hydrobasins_congo && (
        <p className="callout">
          {t('yaounde.forest', { km: zone.distance_to_basin_km })} {t('yaounde.scale')}
        </p>
      )}

      <section aria-labelledby="compare-title">
        <h3 id="compare-title">{t('home.notSame')}</h3>
        <LocationsTable
          zones={zones}
          analyses={analyses}
          caption={t('home.table.caption', { variable: what, period, unit: analysis.slope_unit })}
        />
      </section>

      <section aria-labelledby="cant-title">
        <h3 id="cant-title">{t('science.cantTitle')}</h3>
        <ul>
          <li>{t('science.cant1')}</li>
          <li>{t('science.cant2')}</li>
          <li>{t('science.cant3')}</li>
          <li>{t('science.cant4')}</li>
        </ul>
      </section>

      <p>
        <a href={`${import.meta.env.BASE_URL}data/csv/results_summary.csv`}>{t('science.download')}</a>
      </p>
      <p>
        <Link to="/method">{t('nav.method')}</Link>
      </p>
    </div>
  )
}
