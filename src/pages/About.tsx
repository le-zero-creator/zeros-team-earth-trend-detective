import { useI18n } from '../i18n'

export function About() {
  const { t } = useI18n()
  return (
    <article className="about">
      <h1>{t('about.title')}</h1>
      <p>{t('about.team')}</p>
      <ul>
        <li>{t('about.ludovic')}</li>
        <li>{t('about.france')}</li>
        <li>{t('about.alain')}</li>
        <li>{t('about.noel')}</li>
        <li>{t('about.kevin')}</li>
      </ul>
      <p>{t('cite.power')}</p>
      <p>{t('cite.hydro')}</p>
      <p>{t('footer.map')}</p>
      <p>{t('about.privacy')}</p>
      <p>{t('about.licenseBody')}</p>
    </article>
  )
}
