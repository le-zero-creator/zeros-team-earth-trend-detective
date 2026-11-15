import { Scene } from '../components/Scene'
import { useData } from '../lib/data'
import { useI18n, type Key } from '../i18n'
import { Link } from 'react-router-dom'

const METHOD_KEYS = [
  'annual_aggregation',
  'p_mk',
  'p_smk',
  'p_hr',
  'rule_RM2',
  'evidence_level',
  'q_bh',
  'slope',
  'trend_line',
  'multiple_comparisons',
  'numerics',
  'software',
] as const

const CITES: Key[] = [
  'cite.mann',
  'cite.kendall',
  'cite.hirsch',
  'cite.hamed',
  'cite.sen',
  'cite.theil',
  'cite.gilbert',
  'cite.bh',
  'cite.pymk',
  'cite.power',
  'cite.hydro',
  'cite.acker',
]

const LIMITS: Key[] = [
  'method.limit1',
  'method.limit2',
  'method.limit3',
  'method.limit4',
  'method.limit5',
  'method.limit6',
  'method.limit7',
  'method.limit8',
]

/** Method, limits and next steps: same page header and same cards as the rest of the site. */
export function Method() {
  const { t, lang } = useI18n()
  const { state, retry } = useData()
  const base = import.meta.env.BASE_URL
  return (
    <article className="method">
      <header className="pg-hero">
        <Scene name="nasa-marble-east" alt={t('scene.marble')} />
        <div className="pg-hero__copy">
          <p className="kicker">{t('go.method.t')}</p>
          <h1 className="sec-display">{t('method.title')}</h1>
          <p className="sec-lead">{t('method.intro')}</p>
        </div>
      </header>
      <div className="legal-grid">
        <section className="legal-card reveal">
          <h2 className="sec-sub">{t('ai.title')}</h2>
          <p>{t('ai.code')}</p>
          <p>{t('ai.ask')}</p>
          <p>{t('ai.images')}</p>
          <p>{t('ai.numbers')}</p>
        </section>
        {state.status === 'loading' && <p role="status">{t('state.loading')}</p>}
        {state.status === 'error' && (
          <div className="legal-card error" role="alert">
            <p>{t('state.error.body')}</p>
            <button type="button" className="bk-cta" onClick={retry}>
              {t('state.error.retry')}
            </button>
          </div>
        )}
        {state.status === 'ready' && (
          <>
            <section className="legal-card reveal">
              <h2 className="sec-sub">{t('method.pathTitle')}</h2>
              <p>
                <strong>{t('method.repro')}</strong>
              </p>
              <p>{t('method.compare')}</p>
              <p>{t('method.validate')}</p>
            </section>
            <section className="legal-card reveal">
              <h2 className="sec-sub">{t('method.aiTitle')}</h2>
              <p>{t('method.aiBody')}</p>
            </section>
            <section className="legal-card legal-card--wide reveal">
              <h2 className="sec-sub">{t('method.fromFile')}</h2>
              <dl className="method-dl">
                {METHOD_KEYS.map((key) => (
                  <div key={key}>
                    <dt>{key}</dt>
                    <dd>{String((state.data.results.meta.method as Record<string, unknown>)[key] ?? '')}</dd>
                  </div>
                ))}
              </dl>
            </section>
            <section className="legal-card legal-card--wide reveal">
              <h2 className="sec-sub">{t('method.citeTitle')}</h2>
              <ul>
                {CITES.map((key) => (
                  <li key={key}>{t(key)}</li>
                ))}
              </ul>
            </section>
            <section className="legal-card legal-card--wide reveal">
              <h2 className="sec-sub">{t('method.limitsTitle')}</h2>
              <ul>
                {LIMITS.map((key) => (
                  <li key={key}>{t(key)}</li>
                ))}
              </ul>
            </section>
            <section className="legal-card reveal">
              <h2 className="sec-sub">{t('home.sources.title')}</h2>
              <ul className="source-list">
                {state.data.results.meta.sources.map((s) => (
                  <li key={s.id} data-source={s.id}>
                    <span>{s.name}</span>
                    <span className={`pill pill--${s.status}`}>{t(`status.${s.status}` as Key)}</span>
                    {s.type && <span className="note">{s.type}</span>}
                  </li>
                ))}
              </ul>
            </section>
            <section className="legal-card reveal">
              <h2 className="sec-sub">{t('method.excluded')}</h2>
              <ul>
                {(state.data.results.meta.excluded_variables as { power_code: string; name_en: string; reason_en: string; reason_fr: string }[]).map((item) => (
                  <li key={item.power_code}>
                    <strong>{item.power_code}</strong> — {item.name_en}. {lang === 'fr' ? item.reason_fr : item.reason_en}
                  </li>
                ))}
              </ul>
            </section>
            <section className="legal-card reveal">
              <h2 className="sec-sub">{t('method.nextTitle')}</h2>
              <p>{t('method.nextBody')}</p>
            </section>
            <section className="legal-card reveal">
              <h2 className="sec-sub">{t('science.download')}</h2>
              <ul>
                <li>
                  <a href={`${base}data/results.json`}>results.json</a>
                </li>
                <li>
                  <a href={`${base}data/csv/results_annual.csv`}>results_annual.csv</a>
                </li>
                <li>
                  <a href={`${base}data/csv/results_summary.csv`}>results_summary.csv</a>
                </li>
              </ul>
            </section>
          </>
        )}
      </div>
      {state.status === 'ready' && (
        <div className="pg-actions">
          <Link className="bk-cta" to={'/investigate?zone=cmr_yaounde&var=t2m_max&period=p2001_2025'}>{t('home.seeAnalysis')} →</Link>
        </div>
      )}
    </article>
  )
}
