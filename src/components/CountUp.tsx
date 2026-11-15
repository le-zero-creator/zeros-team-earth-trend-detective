import { useEffect, useState } from 'react'
import { formatSigned } from '../lib/format'
import type { Lang } from '../lib/types'

function reducedMotion(): boolean {
  if (typeof window.matchMedia !== 'function') return true
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Le premier affichage est déjà le nombre publié.
 * Si le mouvement est autorisé, un court décompte se termine sur cette même chaîne formatée.
 */
export function CountUp({ value, decimals, lang }: { value: number; decimals: number; lang: Lang }) {
  const exact = formatSigned(value, decimals, lang)
  const [text, setText] = useState(exact)

  useEffect(() => {
    setText(exact)
    if (reducedMotion()) return
    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 650)
      if (p >= 1) {
        setText(exact)
        return
      }
      setText(formatSigned(value * (1 - (1 - p) ** 3), decimals, lang))
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    const cap = window.setTimeout(() => setText(exact), 800)
    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(cap)
      setText(exact)
    }
  }, [exact, value, decimals, lang])

  return <span data-figure="final">{text}</span>
}
