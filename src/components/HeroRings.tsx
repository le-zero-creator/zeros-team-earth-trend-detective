import { useEffect, useRef } from 'react'

/** Orbit rings drawn close to the planet (unit radius = planet radius). */
const RINGS = [
  { rx: 1.16, ry: 0.3, tilt: -16, width: 0.012, opacity: 0.75, sats: [{ speed: 0.16, phase: 0.2 }, { speed: 0.16, phase: 3.4 }] },
  { rx: 1.28, ry: 0.4, tilt: 10, width: 0.008, opacity: 0.5, sats: [{ speed: -0.11, phase: 1.3 }] },
  { rx: 1.4, ry: 0.22, tilt: -4, width: 0.006, opacity: 0.38, sats: [{ speed: 0.08, phase: 4.6 }, { speed: -0.13, phase: 2.2 }] },
]

function arc(rx: number, ry: number, front: boolean) {
  // Back half = upper half (y < 0) in the ring's frame, front half = lower half.
  return front ? `M ${-rx} 0 A ${rx} ${ry} 0 0 0 ${rx} 0` : `M ${-rx} 0 A ${rx} ${ry} 0 0 1 ${rx} 0`
}

/**
 * Thin elegant rings hugging the planet, with small glowing satellites.
 * The back half of each ring passes behind the Earth; satellites hide when they are behind it.
 * Some satellites go the other way. Reduced motion: still picture.
 */
export function HeroRings() {
  const svg = useRef<SVGSVGElement>(null)
  useEffect(() => {
    const root = svg.current
    if (!root) return
    const reduce = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dots = [...root.querySelectorAll<SVGCircleElement>('[data-sat]')]
    let raf = 0
    const start = performance.now()
    const draw = (now: number) => {
      const time = reduce ? 0 : (now - start) / 1000
      for (const dot of dots) {
        const ring = RINGS[Number(dot.dataset.ring)]
        const sat = ring.sats[Number(dot.dataset.sat)]
        const a = sat.phase + time * sat.speed * Math.PI * 2 * 0.25
        const lx = ring.rx * Math.cos(a)
        const ly = ring.ry * Math.sin(a)
        const r = (ring.tilt * Math.PI) / 180
        const x = lx * Math.cos(r) - ly * Math.sin(r)
        const y = lx * Math.sin(r) + ly * Math.cos(r)
        const behind = ly < 0 && x * x + y * y < 1
        dot.setAttribute('cx', x.toFixed(4))
        dot.setAttribute('cy', y.toFixed(4))
        dot.style.opacity = behind ? '0' : '1'
      }
      if (!reduce && !document.hidden) raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    const onVis = () => { if (!document.hidden && !reduce) { cancelAnimationFrame(raf); raf = requestAnimationFrame(draw) } }
    document.addEventListener('visibilitychange', onVis)
    return () => { cancelAnimationFrame(raf); document.removeEventListener('visibilitychange', onVis) }
  }, [])
  return (
    <svg ref={svg} className="hero-rings" viewBox="-1.6 -1.6 3.2 3.2" aria-hidden="true">
      <defs>
        <mask id="ring-hole" maskUnits="userSpaceOnUse" x="-1.6" y="-1.6" width="3.2" height="3.2">
          <rect x="-1.6" y="-1.6" width="3.2" height="3.2" fill="#fff" />
          <circle cx="0" cy="0" r="1.005" fill="#000" />
        </mask>
        <linearGradient id="ring-fade" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0.15" />
          <stop offset="0.5" stopColor="#ffe3c4" stopOpacity="1" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.15" />
        </linearGradient>
        <radialGradient id="sat-glow">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.45" stopColor="#ffd29c" />
          <stop offset="1" stopColor="#ffd29c" stopOpacity="0" />
        </radialGradient>
      </defs>
      {RINGS.map((ring, i) => (
        <g key={i} transform={`rotate(${ring.tilt})`} opacity={ring.opacity} className="hero-rings__ring" style={{ ['--i' as string]: i }}>
          <path d={arc(ring.rx, ring.ry, false)} fill="none" stroke="url(#ring-fade)" strokeWidth={ring.width} mask="url(#ring-hole)" pathLength={1} />
          <path d={arc(ring.rx, ring.ry, true)} fill="none" stroke="url(#ring-fade)" strokeWidth={ring.width * 1.3} pathLength={1} />
        </g>
      ))}
      {RINGS.flatMap((ring, i) => ring.sats.map((_, j) => (
        <circle key={`${i}-${j}`} data-ring={i} data-sat={j} r={i === 0 ? 0.03 : 0.024} fill="url(#sat-glow)" className="hero-rings__sat" />
      )))}
    </svg>
  )
}
