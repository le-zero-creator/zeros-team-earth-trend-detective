import { useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronLeft, ChevronRight, CloudRain, Sun, Wind } from 'lucide-react'
import { CountUp } from './CountUp'
import { Scene, type SceneName } from './Scene'
import { TraceChart } from './TraceChart'
import { useI18n, type Key } from '../i18n'
import { SLOPE_DECIMALS, plainUnit } from '../lib/format'
import type { Analysis, Source, Variable, Zone } from '../lib/types'

const EASE = [0.16, 0.84, 0.24, 1] as const

type Slide = { id: string; image?: SceneName; alt?: Key; kicker: string; title: string; body: ReactNode }

function isSure(a?: Analysis) {
  return Boolean(a && a.evidence_level !== 'not_enough_evidence_yet' && a.significatif)
}

/**
 * Before the chart: slides a child can follow. Where the data come from, each trace one at a time
 * (rain honestly not proven), what a trend is, then the chart plays, and only then the number.
 */
export function EvidenceSlides({
  zone, analysis, variable, source, zoneAnalyses, onDone,
}: {
  zone: Zone
  analysis: Analysis
  variable: Variable
  source?: Source
  zoneAnalyses: Analysis[]
  onDone: () => void
}) {
  const { t, lang } = useI18n()
  const [i, setI] = useState(0)
  const [dir, setDir] = useState(1)
  const box = useRef<HTMLElement>(null)
  const place = (lang === 'fr' ? zone.name_fr : zone.name_en).split('–')[0].split('—')[0].trim()
  const pick = (id: string) => zoneAnalyses.find((a) => a.variable_id === id)
  const sure = isSure(analysis)
  const traceSlide = (id: 't2m_max' | 'rh2m' | 'precip', Icon: typeof Sun, image: SceneName, alt: Key): Slide => {
    const a = pick(id)
    const ok = isSure(a)
    return {
      id, image, alt,
      kicker: t('ev.kicker.trace'),
      title: t(`ev.${id}.t` as Key),
      body: (
        <>
          <p className="ev-icon"><Icon aria-hidden="true" /></p>
          <p>{t(`ev.${id}.b` as Key)}</p>
          <p className={ok ? 'bk-verdict' : 'bk-verdict bk-verdict--unsure'}>{ok ? t('ev.verdict.sure') : t('ev.verdict.unsure')}</p>
        </>
      ),
    }
  }
  const slides: Slide[] = [
    {
      id: 'source', image: 'satellite', alt: 'story.caption.sat',
      kicker: t('ev.kicker.source'), title: t('ev.source.t'),
      body: (
        <>
          <p>{t('ev.source.b', { place })}</p>
          {source && <p className="ev-chip">{source.name}</p>}
        </>
      ),
    },
    traceSlide('t2m_max', Sun, 'story-heat', 'img.heat'),
    traceSlide('rh2m', Wind, 'story-air', 'img.air'),
    traceSlide('precip', CloudRain, 'story-rain', 'img.rain'),
    {
      id: 'trend', kicker: t('ev.kicker.trend'), title: t('ev.trend.t'),
      body: (
        <>
          <p>{t('ev.trend.b1')}</p>
          <p>{t('ev.trend.b2')}</p>
        </>
      ),
    },
    {
      id: 'chart', kicker: t('ev.kicker.chart'), title: t('ev.chart.t', { what: t(`plain.var.${variable.variable_id}` as Key) }),
      body: (
        <>
          <TraceChart analysis={analysis} play label={variable.name[lang]} />
          <p>{sure ? t('ev.chart.b') : t('ev.chart.bUnsure')}</p>
        </>
      ),
    },
    {
      id: 'verdict', kicker: t('ev.kicker.verdict'), title: sure ? t('ev.verdict.t') : t('ev.verdict.tUnsure'),
      body: (
        <>
          {sure && (
            <p className="bk-num">
              <CountUp value={analysis.pente_decennie} decimals={SLOPE_DECIMALS[analysis.variable_id] ?? 2} lang={lang} />
              <span>{plainUnit(analysis.slope_unit, lang)}</span>
            </p>
          )}
          <p>{sure ? t('ev.verdict.b', { place }) : t('ev.verdict.bUnsure')}</p>
          <p className="note">{t('ev.verdict.note', { period: analysis.period })}</p>
        </>
      ),
    },
  ]
  const total = slides.length
  const go = (n: number) => {
    const next = Math.max(0, Math.min(total - 1, n))
    setDir(next >= i ? 1 : -1)
    setI(next)
    const top = box.current?.getBoundingClientRect().top ?? 0
    if (top < 0) box.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  useEffect(() => { setI(0) }, [analysis.zone_id, analysis.variable_id, analysis.period_id])
  const s = slides[i]
  return (
    <section ref={box} className="ev" aria-roledescription="carousel" aria-label={t('ev.label')}
      onKeyDown={(e) => { if (e.key === 'ArrowRight') go(i + 1); if (e.key === 'ArrowLeft') go(i - 1) }}>
      <div className="ev-top">
        <p className="kicker">{t('ev.label')} · {place}</p>
        <button type="button" className="ev-skip" onClick={onDone}>{t('ev.skip')}</button>
      </div>
      <div className="ev-stage">
        <AnimatePresence mode="popLayout" initial={false} custom={dir}>
          <motion.article
            key={s.id}
            className={s.image ? 'ev-slide' : 'ev-slide ev-slide--wide'}
            initial={{ opacity: 0, x: dir * 70 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -70 }}
            transition={{ duration: 0.55, ease: EASE }}
            aria-live="polite"
          >
            {s.image && s.alt && <div className="ev-media"><Scene name={s.image} alt={t(s.alt)} /></div>}
            <div className="ev-copy">
              <p className="bk-kicker"><span>{i + 1} / {total}</span> · {s.kicker}</p>
              <h2 className="sec-title">{s.title}</h2>
              <div className="ev-body">{s.body}</div>
            </div>
          </motion.article>
        </AnimatePresence>
      </div>
      <div className="ev-nav">
        <button type="button" className="bk-more" onClick={() => go(i - 1)} disabled={i === 0} aria-label={t('book.prev')}>
          <ChevronLeft aria-hidden="true" />
        </button>
        <ol className="ev-dots">
          {slides.map((x, n) => (
            <li key={x.id}><button type="button" aria-label={t('book.goto', { n: n + 1 })} aria-current={n === i ? 'step' : undefined} onClick={() => go(n)} /></li>
          ))}
        </ol>
        {i < total - 1 ? (
          <button type="button" className="bk-cta" onClick={() => go(i + 1)}>
            {t('ev.next')} <ChevronRight aria-hidden="true" />
          </button>
        ) : (
          <button type="button" className="bk-cta" onClick={onDone}>{t('ev.done')} ↓</button>
        )}
      </div>
    </section>
  )
}
