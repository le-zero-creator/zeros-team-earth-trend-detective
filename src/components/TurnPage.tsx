import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Scene, type SceneName } from './Scene'
import { useI18n, type Key } from '../i18n'

/** The book continues on the other pages: Earth → Congo Basin → Yaoundé → for you → ask Terra. */
const CHAPTERS: { to: string; image: SceneName; alt: Key; title: Key; body: Key }[] = [
  { to: '/', image: 'nasa-marble-east', alt: 'scene.marble', title: 'nav.earth', body: 'story.kicker' },
  { to: '/congo', image: 'nasa-congo-river', alt: 'scene.river', title: 'go.congo.t', body: 'go.congo.b' },
  { to: '/place/cmr_yaounde', image: 'city-yaounde', alt: 'img.city', title: 'go.city.t', body: 'go.city.b' },
  { to: '/you', image: 'story-you', alt: 'img.you', title: 'means.h1', body: 'place.toYou' },
  { to: '/ask', image: 'nasa-gulf', alt: 'scene.gulf', title: 'nav.ask', body: 'ask.kicker' },
]

/** End of a page: the previous and the next chapter, as the same big cards as the end of the home book. */
export function TurnPage({ current }: { current: string }) {
  const { t } = useI18n()
  const index = CHAPTERS.findIndex((chapter) => chapter.to === current)
  if (index < 0) return null
  const around = [
    { chapter: CHAPTERS[index - 1], label: t('turn.prev') },
    { chapter: CHAPTERS[index + 1], label: t('turn.next') },
  ].filter((item) => item.chapter)
  return (
    <nav className="hx-go pg-turn" aria-label={t('turn.k')}>
      <p className="kicker">{t('turn.k')}</p>
      <div className="hx-go__grid">
        {around.map(({ chapter, label }) => (
          <Link key={chapter.to} to={chapter.to} className="hx-route reveal" data-halo="true">
            <Scene name={chapter.image} alt={t(chapter.alt)} />
            <span className="hx-route__text">
              <span className="pg-turn__k">{label}</span>
              <strong>{t(chapter.title)}</strong>
              <span>{t(chapter.body)}</span>
            </span>
            <ArrowRight className="hx-route__arrow" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </nav>
  )
}
