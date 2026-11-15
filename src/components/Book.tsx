import { useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronUp, Plus, X } from 'lucide-react'
import { CountUp } from './CountUp'
import { Scene, type SceneName } from './Scene'
import { TraceChart } from './TraceChart'
import { TrendChart } from './TrendChart'
import { useI18n, type Key } from '../i18n'
import { SLOPE_DECIMALS, plainUnit } from '../lib/format'
import type { Analysis, AppData } from '../lib/types'

type Page = {
  id: string
  image: SceneName
  alt: Key
  caption?: Key
  trace?: Analysis
  more?: { title: string; body: ReactNode }
  cta?: ReactNode
  vars?: Record<string, string | number>
}

function yaoundeTrace(data: AppData | null, variable: string) {
  return data?.results.analyses.find((a) => a.zone_id === 'cmr_yaounde' && a.variable_id === variable && a.period_id === 'p2001_2025')
}

const EASE = [0.16, 0.84, 0.24, 1] as const

/**
 * The home story as a book: one big page at a time. Scrolling through the tall
 * section turns the pages (a sticky stage), so the next page is never half visible.
 */
export function Book({ data }: { data: AppData | null }) {
  const { t, lang } = useI18n()
  const heat = yaoundeTrace(data, 't2m_max')
  const air = yaoundeTrace(data, 'rh2m')
  const rain = yaoundeTrace(data, 'precip')
  const yaounde = data?.zones.find((z) => z.zone_id === 'cmr_yaounde')
  const n = data?.zones.length ?? 11
  const km = yaounde?.distance_to_basin_km ?? 63
  const chartMore = (a?: Analysis) =>
    a ? { title: t('book.chartMore'), body: <TrendChart analysis={a} alt={t('book.chartMore')} valueName={t('chart.values')} lineName={t('chart.sen')} /> } : undefined

  const pages: Page[] = [
    { id: 'earth', image: 'nasa-marble-east', alt: 'scene.marble', more: { title: t('book.1.mt'), body: <p>{t('book.1.m')}</p> } },
    {
      id: 'sat', image: 'satellite', alt: 'story.caption.sat',
      more: { title: t('book.2.mt'), body: <><p>{t('book.2.m')}</p><p><Link className="bk-link" to="/method">{t('nav.method')} →</Link></p></> },
    },
    {
      id: 'congo', image: 'nasa-congo-river', alt: 'scene.river', vars: { n },
      more: { title: t('book.3.mt'), body: <p>{t('book.3.m', { n })}</p> },
      cta: <Link className="bk-cta" to="/explore">{t('book.3.cta')} →</Link>,
    },
    {
      id: 'city', image: 'city-yaounde', alt: 'img.city', caption: 'book.cap.city', vars: { km },
      cta: <Link className="bk-cta" to="/place/cmr_yaounde">{t('story.openYaounde')} →</Link>,
    },
    { id: 'heat', image: 'story-heat', alt: 'img.heat', trace: heat, more: chartMore(heat) },
    { id: 'air', image: 'story-air', alt: 'img.air', trace: air, more: chartMore(air) },
    { id: 'rain', image: 'story-rain', alt: 'img.rain', trace: rain, more: chartMore(rain) },
    {
      id: 'you', image: 'story-you', alt: 'img.you',
      cta: (
        <button type="button" className="bk-cta" onClick={() => document.getElementById('for-you')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
          {t('book.8.cta')} ↓
        </button>
      ),
    },
  ]
  const total = pages.length
  const wrap = useRef<HTMLElement>(null)
  const [index, setIndex] = useState(0)
  const [dir, setDir] = useState(1)
  const [open, setOpen] = useState<number | null>(null)

  useEffect(() => {
    const onScroll = () => {
      const el = wrap.current
      if (!el) return
      const box = el.getBoundingClientRect()
      const scrollable = el.offsetHeight - window.innerHeight
      const progress = scrollable > 0 ? Math.min(0.9999, Math.max(0, -box.top / scrollable)) : 0
      const next = Math.floor(progress * total)
      setIndex((cur) => {
        if (cur !== next) setDir(next > cur ? 1 : -1)
        return next
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [total])

  const goTo = (i: number) => {
    const el = wrap.current
    if (!el) return
    const target = Math.max(0, Math.min(total - 1, i))
    const scrollable = el.offsetHeight - window.innerHeight
    const top = el.getBoundingClientRect().top + window.scrollY + ((target + 0.5) / total) * scrollable
    window.scrollTo({ top, behavior: 'smooth' })
  }

  const page = pages[index]
  const num = index + 1
  const unsure = page.trace ? page.trace.evidence_level === 'not_enough_evidence_yet' || !page.trace.significatif : false

  return (
    <section ref={wrap} className="bk" id="journey" aria-label={t('book.label')} style={{ ['--pages' as string]: total }}>
      <div className="bk-stage">
        <AnimatePresence mode="popLayout" initial={false} custom={dir}>
          <motion.article
            key={page.id}
            className={`bk-page bk-page--${page.id}`}
            custom={dir}
            initial={{ opacity: 0, y: dir * 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: dir * -60 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <div className="bk-media">
              <Scene name={page.image} alt={t(page.alt)} />
              {page.caption && <p className="bk-caption">{t(page.caption)}</p>}
            </div>
            <div className="bk-copy">
              <p className="bk-kicker">
                <span>{t('book.chapter', { n: num, total })}</span> · {t(`book.${num}.k` as Key)}
              </p>
              <h2 className="bk-title">{t(`book.${num}.t` as Key)}</h2>
              <p className="bk-body">{t(`book.${num}.b` as Key, page.vars)}</p>
              {page.trace && (
                <div className="bk-trace">
                  {!unsure && (
                    <p className="bk-num">
                      <CountUp value={page.trace.pente_decennie} decimals={SLOPE_DECIMALS[page.trace.variable_id] ?? 2} lang={lang} />
                      <span>{plainUnit(page.trace.slope_unit, lang)}</span>
                    </p>
                  )}
                  <TraceChart analysis={page.trace} play label={t(`book.${num}.b` as Key)} />
                  <p className={unsure ? 'bk-verdict bk-verdict--unsure' : 'bk-verdict'}>{unsure ? t('book.unsure') : t('book.sure')}</p>
                </div>
              )}
              <div className="bk-actions">
                {page.cta}
                {page.more && (
                  <button type="button" className="bk-more" onClick={() => setOpen(index)}>
                    <Plus aria-hidden="true" /> {page.more.title}
                  </button>
                )}
              </div>
            </div>
          </motion.article>
        </AnimatePresence>

        <nav className="bk-nav" aria-label={t('book.label')}>
          <button type="button" className="bk-arrow" aria-label={t('book.prev')} disabled={index === 0} onClick={() => goTo(index - 1)}>
            <ChevronUp aria-hidden="true" />
          </button>
          <ol className="bk-dots">
            {pages.map((p, i) => (
              <li key={p.id}>
                <button type="button" aria-label={t('book.goto', { n: i + 1 })} aria-current={i === index ? 'step' : undefined} onClick={() => goTo(i)} />
              </li>
            ))}
          </ol>
          <button type="button" className="bk-arrow" aria-label={t('book.next')} disabled={index === total - 1} onClick={() => goTo(index + 1)}>
            <ChevronDown aria-hidden="true" />
          </button>
        </nav>
        <div className="bk-progress" aria-hidden="true"><span style={{ transform: `scaleX(${num / total})` }} /></div>
        {index === 0 && <p className="bk-hint" aria-hidden="true">{t('book.scroll')}</p>}
      </div>

      <AnimatePresence>
        {open !== null && pages[open]?.more && (
          <motion.div className="bk-sheet-wrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(null)}>
            <motion.div
              className="bk-sheet"
              role="dialog"
              aria-modal="true"
              aria-label={pages[open].more!.title}
              initial={{ y: 40, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 30, opacity: 0 }}
              transition={{ duration: 0.45, ease: EASE }}
              onClick={(e) => e.stopPropagation()}
            >
              <button type="button" className="bk-sheet__close" aria-label={t('book.close')} onClick={() => setOpen(null)} autoFocus>
                <X aria-hidden="true" />
              </button>
              <h3>{pages[open].more!.title}</h3>
              {pages[open].more!.body}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
