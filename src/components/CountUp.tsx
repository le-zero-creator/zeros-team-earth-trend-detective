import { useEffect, useState } from 'react'
import { formatSigned } from '../lib/format'
import type { Lang } from '../lib/types'

function reducedMotion(): boolean {
  if (typeof window.matchMedia !== 'function') return true
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Anime l'affichage d'un nombre déjà publié. La valeur finale est le formatage exact, pas un nouveau calcul. */
export function CountUp({ value, decimals, lang }: { value: number; decimals: number; lang: Lang }) {
  const [shown, setShown] = useState(value)
  useEffect(() => {
    if (reducedMotion()) {
      setShown(value)
      return
    }
    let frame = 0
    const t0 = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / 800)
      const eased = 1 - (1 - p) ** 3
      setShown(p === 1 ? value : value * eased)
      if (p < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value])
  return <>{formatSigned(shown, decimals, lang)}</>
}
