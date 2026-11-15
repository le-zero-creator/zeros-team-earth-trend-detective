import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { AskChat } from './AskChat'
import { Scene, type SceneName } from './Scene'
import { TerraMascot, type TerraMood } from './TerraMascot'
import { useI18n, type Key } from '../i18n'
import { useProfile } from '../lib/profile'

/** Ask Terra right inside the story: one field, a big answer, small suggestions below. */
export function HomeAsk({ zoneId = 'cmr_yaounde', lat, lon, titleKey = 'homeask.t' }: { zoneId?: string; lat?: number; lon?: number; titleKey?: Key }) {
  const { t } = useI18n()
  const { profile } = useProfile()
  const [mood, setMood] = useState<TerraMood>('idle')
  return (
    <section className="hx-ask reveal" aria-labelledby="hx-ask-title">
      <div className="hx-ask__head">
        <TerraMascot mood={mood} />
        <div>
          <p className="kicker">{t('homeask.k')}</p>
          <h2 id="hx-ask-title" className="sec-title">{t(titleKey)}</h2>
          <p className="sec-lead">{t('homeask.b')}</p>
        </div>
      </div>
      <AskChat
        suggestions={[t('ask.q.heat'), t('ask.q.air'), t('ask.q.rain')]}
        profile={profile}
        zoneId={zoneId}
        lat={lat}
        lon={lon}
        onStatus={(s) => setMood(s)}
      />
    </section>
  )
}

const ROUTES: { to: string; image: SceneName; alt: Key; title: Key; body: Key }[] = [
  { to: '/explore', image: 'nasa-marble-east', alt: 'scene.marble', title: 'go.globe.t', body: 'go.globe.b' },
  { to: '/congo', image: 'nasa-congo-river', alt: 'scene.river', title: 'go.congo.t', body: 'go.congo.b' },
  { to: '/place/cmr_yaounde', image: 'city-yaounde', alt: 'img.city', title: 'go.city.t', body: 'go.city.b' },
  { to: '/method', image: 'satellite', alt: 'story.caption.sat', title: 'go.method.t', body: 'go.method.b' },
]

const NEXT: { id: string; title: Key; body: Key }[] = [
  { id: 'ndvi', title: 'future.ndvi', body: 'next.ndvi' },
  { id: 'lst', title: 'future.lst', body: 'next.lst' },
  { id: 'gpm', title: 'future.gpm', body: 'next.gpm' },
  { id: 'forest', title: 'future.forest', body: 'next.forest' },
  { id: 'world', title: 'future.world', body: 'next.world' },
]

/** End of the book: big clickable cards, then the next chapters (coming soon), each one opens. */
export function GoFurther() {
  const { t } = useI18n()
  const [open, setOpen] = useState<string | null>(null)
  return (
    <section className="hx-go" aria-labelledby="hx-go-title">
      <p className="kicker">{t('go.k')}</p>
      <h2 id="hx-go-title" className="sec-title">{t('go.t')}</h2>
      <p className="sec-lead">{t('go.b')}</p>
      <div className="hx-go__grid">
        {ROUTES.map((r) => (
          <Link key={r.to} to={r.to} className="hx-route reveal" data-halo="true">
            <Scene name={r.image} alt={t(r.alt)} />
            <span className="hx-route__text">
              <strong>{t(r.title)}</strong>
              <span>{t(r.body)}</span>
            </span>
            <ArrowRight className="hx-route__arrow" aria-hidden="true" />
          </Link>
        ))}
      </div>
      <h3 className="sec-sub">{t('next.t')}</h3>
      <ul className="hx-next">
        {NEXT.map((item) => {
          const on = open === item.id
          return (
            <li key={item.id} className={on ? 'hx-fold is-open' : 'hx-fold'}>
              <button type="button" aria-expanded={on} onClick={() => setOpen(on ? null : item.id)}>
                <span>{t(item.title)}</span>
                <span className="pill pill--pending">{t('soon.badge')}</span>
                <ChevronDown aria-hidden="true" className="hx-fold__chev" />
              </button>
              <AnimatePresence initial={false}>
                {on && (
                  <motion.div
                    className="hx-fold__body"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 0.84, 0.24, 1] }}
                  >
                    <p>{t(item.body)}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
