import { MeansForYou } from '../components/MeansForYou'
import { useI18n } from '../i18n'
import { useData } from '../lib/data'

export function Means() {
  const { t } = useI18n()
  const { state } = useData()
  if (state.status !== 'ready') return <p role="status">{t('state.loading')}</p>
  return (
    <article>
      <MeansForYou data={state.data} page />
    </article>
  )
}
