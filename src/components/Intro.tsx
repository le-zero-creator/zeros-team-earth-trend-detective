import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { LogoMark } from './Logo'
import { TerraMascot } from './TerraMascot'
import { useI18n, type Key } from '../i18n'

const KEY = 'td.intro'
const STEPS = 4
const EASE = [0.16, 0.84, 0.24, 1] as const

function seen(): boolean {
  try {
    return sessionStorage.getItem(KEY) === '1'
  } catch {
    return true
  }
}

function finish() {
  try {
    sessionStorage.setItem(KEY, '1')
  } catch {
    /* the session may refuse: the intro never blocks the page */
  }
  document.documentElement.setAttribute('data-intro', 'done')
}

/** Ask the intro to play again (header "guide" button). */
export function replayIntro() {
  window.dispatchEvent(new Event('td:intro'))
}

/**
 * Same opening on every device: the mark draws itself (a short loading scene),
 * then a 4-card story told by Terra. Passable at any time, once per session, replayable.
 * Reduced motion: same content, fades only.
 */
export function Intro() {
  const { t, lang, setLang } = useI18n()
  const [phase, setPhase] = useState<number | null>(null)

  useEffect(() => {
    if (!seen()) setPhase(0)
    else finish()
    const replay = () => setPhase(1)
    window.addEventListener('td:intro', replay)
    return () => window.removeEventListener('td:intro', replay)
  }, [])

  useEffect(() => {
    if (phase !== 0) return
    const timer = window.setTimeout(() => setPhase(1), 2300)
    return () => window.clearTimeout(timer)
  }, [phase])

  useEffect(() => {
    if (phase === null) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const close = () => {
    finish()
    setPhase(null)
  }

  return (
    <AnimatePresence>
      {phase !== null && (
        <motion.div
          className="intro"
          role="dialog"
          aria-modal="true"
          aria-label={t('intro.title')}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <div className="intro-stars" aria-hidden="true" />
          <button type="button" className="intro-skip" onClick={close}>{t('intro.skip')}</button>
          <AnimatePresence mode="wait">
            {phase === 0 ? (
              <motion.div key="logo" className="intro-stage" exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.4 }}>
                <LogoMark className="intro-logo" />
                <p className="intro-kicker">{t('intro.kicker')}</p>
                <p className="intro-title">Terra <span>Trace</span></p>
                <span className="intro-bar" aria-hidden="true"><span /></span>
              </motion.div>
            ) : (
              <motion.div
                key={`card-${phase}`}
                className="intro-card"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.5, ease: EASE }}
              >
                <div className="intro-card__head">
                  <TerraMascot mood={phase === STEPS ? 'happy' : 'idle'} />
                  <p className="intro-card__who">{t('tuto.terra')}</p>
                </div>
                <p className="bk-kicker">{t('tuto.step', { n: phase, total: STEPS })}</p>
                <h2 className="intro-card__title">{t(`tuto.${phase}.t` as Key)}</h2>
                <p className="intro-card__body">{t(`tuto.${phase}.b` as Key)}</p>
                {phase === 1 && (
                  <div className="intro-lang" role="group" aria-label={t('lang.label')}>
                    <button type="button" aria-pressed={lang === 'fr'} onClick={() => setLang('fr')}>Français</button>
                    <button type="button" aria-pressed={lang === 'en'} onClick={() => setLang('en')}>English</button>
                  </div>
                )}
                <div className="intro-card__nav">
                  <ol className="ev-dots" aria-hidden="true">
                    {Array.from({ length: STEPS }, (_, n) => <li key={n}><button type="button" tabIndex={-1} aria-current={n + 1 === phase ? 'step' : undefined} onClick={() => setPhase(n + 1)} /></li>)}
                  </ol>
                  <button type="button" className="bk-cta" autoFocus onClick={() => (phase >= STEPS ? close() : setPhase(phase + 1))}>
                    {phase >= STEPS ? t('tuto.start') : t('ev.next')}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
