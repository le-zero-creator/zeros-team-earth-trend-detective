import { useI18n, type Key } from '../i18n'
import { useData } from '../lib/data'

const ITEMS: { id: string; sourceId: string | null; label: Key }[] = [
  { id: 'ndvi', sourceId: 'modis_ndvi', label: 'future.ndvi' },
  { id: 'lst', sourceId: 'modis_lst', label: 'future.lst' },
  { id: 'gpm', sourceId: 'gpm_imerg', label: 'future.gpm' },
  { id: 'forest', sourceId: null, label: 'future.forest' },
  { id: 'world', sourceId: null, label: 'future.world' },
]

export function Future() {
  const { t } = useI18n()
  const { state } = useData()
  return (
    <article className="future-page">
      <h1>{t('future.h1')}</h1>
      <p>{t('future.lead')}</p>
      <ul>
        {ITEMS.map((item) => {
          const source = state.status === 'ready' && item.sourceId ? state.data.results.meta.sources.find((entry) => entry.id === item.sourceId) : undefined
          const status = source?.status ?? 'pending'
          return (
            <li key={item.id} data-future={status}>
              {t(item.label)} <span className={`pill pill--${status}`}>{t(`status.${status}` as Key)}</span>
            </li>
          )
        })}
      </ul>
    </article>
  )
}
