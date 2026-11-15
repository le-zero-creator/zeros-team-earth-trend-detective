import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Apparitions au défilement, et halo de la souris sur les cartes de données et la barre. */
export function Motion() {
  const { pathname } = useLocation()
  useEffect(() => {
    const media = (query: string) => typeof window.matchMedia === 'function' && window.matchMedia(query).matches
    const reduce = media('(prefers-reduced-motion: reduce)')
    const fine = media('(hover: hover) and (pointer: fine)')
    const nodes = document.querySelectorAll('.reveal')
    let io: IntersectionObserver | null = null
    if (reduce || typeof IntersectionObserver !== 'function') {
      nodes.forEach((node) => node.classList.add('is-in'))
    } else {
      const watch = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return
            entry.target.classList.add('is-in')
            watch.unobserve(entry.target)
          })
        },
        { threshold: 0.12 },
      )
      io = watch
      nodes.forEach((node) => watch.observe(node))
    }
    if (reduce || !fine) return () => io?.disconnect()
    const move = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      const card = (event.target as Element | null)?.closest?.('[data-halo]')
      if (!card) return
      const box = card.getBoundingClientRect()
      ;(card as HTMLElement).style.setProperty('--gx', `${event.clientX - box.left}px`)
      ;(card as HTMLElement).style.setProperty('--gy', `${event.clientY - box.top}px`)
    }
    document.addEventListener('pointermove', move, { passive: true })
    return () => {
      io?.disconnect()
      document.removeEventListener('pointermove', move)
    }
  }, [pathname])
  return null
}
