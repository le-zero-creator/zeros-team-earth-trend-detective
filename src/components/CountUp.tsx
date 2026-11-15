import { useEffect, useRef, useState } from 'react'
import { formatSigned } from '../lib/format'
import type { Lang } from '../lib/types'

function reducedMotion(): boolean {
  if (typeof window.matchMedia !== 'function') return true
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Le premier affichage est déjà le nombre publié.
 * S'il entre dans l'écran et que le mouvement est permis, un décompte de 1,3 s
 * part de 60 % de la valeur et atterrit sur le chiffre publié.
 */
export function CountUp({ value, decimals, lang }: { value: number; decimals: number; lang: Lang }) {
  const exact = formatSigned(value, decimals, lang)
  const [text, setText] = useState(exact)
  const node = useRef<HTMLSpanElement>(null)
  const seen = useRef(false)

  useEffect(() => {
    setText(exact)
    if (reducedMotion() || seen.current || typeof IntersectionObserver !== 'function') return
    const el = node.current
    if (!el) return
    let frame = 0
    let timer = 0
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.6 || seen.current) return
        seen.current = true
        io.disconnect()
        timer = window.setTimeout(() => {
          const start = performance.now()
          const tick = (now: number) => {
            const k = Math.min(1, (now - start) / 1300)
            const eased = 1 - (1 - k) ** 3
            const shown = value * (0.6 + 0.4 * eased)
            setText(k >= 1 ? exact : formatSigned(shown, decimals, lang))
            if (k < 1) frame = requestAnimationFrame(tick)
          }
          frame = requestAnimationFrame(tick)
        }, 250)
      },
      { threshold: 0.6 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      window.clearTimeout(timer)
      cancelAnimationFrame(frame)
      setText(exact)
    }
  }, [exact, value, decimals, lang])

  return (
    <span ref={node} data-figure="final">
      {text}
    </span>
  )
}
