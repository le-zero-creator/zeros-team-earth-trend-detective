import { TerraMascot } from '../components/TerraMascot'
import { useI18n, type Key } from '../i18n'
import { useData } from '../lib/data'

const ITEMS: { id: string; sourceId: string | null; label: Key; body: Key }[] = [
  { id: 'ndvi', sourceId: 'modis_ndvi', label: 'future.ndvi', body: 'next.ndvi' },
  { id: 'lst', sourceId: 'modis_lst', label: 'future.lst', body: 'next.lst' },
  { id: 'gpm', sourceId: 'gpm_imerg', label: 'future.gpm', body: 'next.gpm' },
  { id: 'forest', sourceId: null, label: 'future.forest', body: 'next.forest' },
  { id: 'world', sourceId: null, label: 'future.world', body: 'next.world' },
]

/** The next chapters: nothing here is available yet, and no replacement number is shown. */
export function Future() {
  const { t } = useI18n()
  const { state } = useData()
  return (
    <article className="future-page">
      <header className="pg-hero pg-hero--solo">
        <TerraMascot mood="think" />
        <div className="pg-hero__copy">
          <p className="kicker">{t('next.t')}</p>
          <h1 className="sec-display">{t('future.h1')}</h1>
          <p className="sec-lead">{t('future.lead')}</p>
        </div>
      </header>
      <ul className="legal-grid future-list">
        {ITEMS.map((item) => {
          const source = state.status === 'ready' && item.sourceId ? state.data.results.meta.sources.find((entry) => entry.id === item.sourceId) : undefined
          const status = source?.status ?? 'pending'
          return (
            <li key={item.id} className="legal-card reveal" data-future={status}>
              <h2 className="sec-sub">{t(item.label)}</h2>
              <span className={`pill pill--${status}`}>{t(`status.${status}` as Key)}</span>
              <p>{t(item.body)}</p>
            </li>
          )
        })}
      </ul>
    </article>
  )
}
