import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Apparitions au défilement, et halo de la souris sur les cartes de données et la barre. */
export function Motion() {
  const { pathname } = useLocation()
  useEffect(() => {
    const media = (query: string) => typeof window.matchMedia === 'function' && window.matchMedia(query).matches
    const reduce = media('(prefers-reduced-motion: reduce)')
    const fine = media('(hover: hover) and (pointer: fine)')
    const seen = new WeakSet<Element>()
    let io: IntersectionObserver | null = null
    if (!reduce && typeof IntersectionObserver === 'function') {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return
            entry.target.classList.add('is-in')
            io?.unobserve(entry.target)
          })
        },
        { threshold: 0.08 },
      )
    }
    const mark = (node: Element, kind: string) => {
      if (seen.has(node) || node.closest('.story-hero, .explore-screen, .intro')) return
      seen.add(node)
      const index = node.parentElement ? Array.prototype.indexOf.call(node.parentElement.children, node) : 0
      ;(node as HTMLElement).style.setProperty('--motion-delay', `${Math.min(Math.max(index, 0), 5) * 80}ms`)
      node.classList.add('motion-item', kind)
      if (io) io.observe(node)
      else node.classList.add('is-in')
    }
    const scan = () => {
      document.querySelectorAll('.reveal, .means-card, .card, .glass, .journey-card, .ask-panel, .chart-box').forEach((node) => mark(node, 'motion-card'))
      document.querySelectorAll('main h1, main h2, main h3, main p').forEach((node) => mark(node, 'motion-line'))
      document.querySelectorAll('main img, .ai-photo').forEach((node) => mark(node, 'motion-media'))
      document.querySelectorAll('main svg.icon, main .means-people svg, main .accent-icon').forEach((node) => mark(node, 'motion-icon'))
    }
    const onVis = () => document.documentElement.toggleAttribute('data-paused', document.hidden)
    document.addEventListener('visibilitychange', onVis)
    onVis()
    scan()
    const changes = new MutationObserver(scan)
    changes.observe(document.body, { childList: true, subtree: true })
    if (reduce || !fine) {
      return () => {
        io?.disconnect()
        changes.disconnect()
        document.removeEventListener('visibilitychange', onVis)
      }
    }
    const move = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      const card = (event.target as Element | null)?.closest?.('.motion-card, [data-halo]')
      if (!card) return
      const box = card.getBoundingClientRect()
      ;(card as HTMLElement).style.setProperty('--gx', `${event.clientX - box.left}px`)
      ;(card as HTMLElement).style.setProperty('--gy', `${event.clientY - box.top}px`)
    }
    document.addEventListener('pointermove', move, { passive: true })
    return () => {
      io?.disconnect()
      changes.disconnect()
      document.removeEventListener('pointermove', move)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [pathname])
  return null
}
