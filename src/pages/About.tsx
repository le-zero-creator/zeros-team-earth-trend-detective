import { Scene } from '../components/Scene'
import { useI18n } from '../i18n'

/** Mentions & credits: team, data credits, not an official NASA site, no tracking. */
export function About() {
  const { t } = useI18n()
  const blocks: { title: string; lines: string[] }[] = [
    { title: t('legal.team'), lines: [t('about.team'), t('about.ludovic'), t('about.france'), t('about.alain'), t('about.noel'), t('about.kevin')] },
    { title: t('legal.official'), lines: [t('legal.officialBody')] },
    { title: t('legal.data'), lines: [t('cite.power'), t('cite.hydro'), t('footer.map')] },
    { title: t('ai.title'), lines: [t('ai.code'), t('ai.ask'), t('ai.images'), t('ai.numbers')] },
    { title: t('legal.privacy'), lines: [t('about.privacy'), t('legal.local')] },
    { title: t('legal.license'), lines: [t('about.licenseBody')] },
  ]
  return (
    <article className="about">
      <header className="pg-hero">
        <Scene name="nasa-congo-river" alt={t('scene.river')} />
        <div className="pg-hero__copy">
          <p className="kicker">{t('legal.k')}</p>
          <h1 className="sec-display">{t('about.title')}</h1>
          <p className="sec-lead">{t('legal.lead')}</p>
        </div>
      </header>
      <div className="legal-grid">
        {blocks.map((b) => (
          <section key={b.title} className="legal-card reveal">
            <h2 className="sec-sub">{b.title}</h2>
            {b.lines.map((line) => <p key={line}>{line}</p>)}
          </section>
        ))}
      </div>
    </article>
  )
}
