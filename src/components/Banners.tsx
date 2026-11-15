import { useI18n, type Key } from '../i18n'
import type { Source } from '../lib/types'

export function ExploratoryBanner() {
  const { t } = useI18n()
  return (
    <p className="banner-exploratory" role="note">
      <span aria-hidden="true">◐</span> {t('banner.exploratory')}
    </p>
  )
}

/** Sources montrées sur l'accueil. GIBS (V2, non affichée dans l'appli) est volontairement absente. */
export const HOME_SOURCE_IDS = ['merra2', 'ceres', 'modis_lst', 'modis_ndvi', 'gpm_imerg', 'hydrosheds']

/** Bandeau des sources : le statut vient toujours de results.json (meta.sources[].status). */
export function SourceStrip({ sources }: { sources: Source[] }) {
  const { t } = useI18n()
  const shown = HOME_SOURCE_IDS.flatMap((id) => sources.filter((s) => s.id === id))
  return (
    <section className="sources" aria-labelledby="sources-title">
      <h2 id="sources-title" className="sources__title">
        {t('home.sources.title')}
      </h2>
      <ul>
        {shown.map((s) => (
          <li key={s.id} data-source={s.id} data-status={s.status} title={s.name}>
            <span>{t(`source.${s.id}` as Key)}</span>
            <span className={`pill pill--${s.status}`}>{t(`status.${s.status}`)}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
