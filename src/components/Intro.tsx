import { useEffect, useState } from 'react'
import { useI18n } from '../i18n'

const KEY = 'td.intro'

function skipIntro(): boolean {
  try {
    if (sessionStorage.getItem(KEY) === '1') return true
  } catch {
    return true
  }
  if (typeof window.matchMedia !== 'function') return true
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function finishIntro() {
  try {
    sessionStorage.setItem(KEY, '1')
  } catch {
    /* la session peut refuser l'écriture : l'intro ne bloque pas */
  }
  document.documentElement.setAttribute('data-intro', 'done')
}

/** Écran d'ouverture. Il ne retient jamais la page : 3 s maximum, ou rien si le mouvement est réduit. */
export function Intro() {
  const { t } = useI18n()
  const [on, setOn] = useState(false)

  useEffect(() => {
    if (skipIntro()) {
      finishIntro()
      return
    }
    setOn(true)
    const cap = window.setTimeout(() => {
      finishIntro()
      setOn(false)
    }, 3000)
    return () => window.clearTimeout(cap)
  }, [])

  if (!on) return null

  const close = () => {
    finishIntro()
    setOn(false)
  }

  return (
    <div className="intro" role="dialog" aria-label={t('intro.title')}>
      <button type="button" className="intro-skip" onClick={close}>
        {t('intro.skip')}
      </button>
      <div className="intro-stage">
        <div className="intro-glow" aria-hidden="true" />
        <svg className="intro-mark" viewBox="0 0 200 200" aria-hidden="true">
          <circle className="intro-stroke" cx="100" cy="100" r="72" pathLength={1} />
          <ellipse className="intro-stroke" cx="100" cy="100" rx="30" ry="72" pathLength={1} />
          <path className="intro-stroke" d="M28 100h144" pathLength={1} />
        </svg>
        <p className="intro-kicker">{t('intro.kicker')}</p>
        <p className="intro-title">{t('intro.title')}</p>
      </div>
    </div>
  )
}
