import { useEffect, useRef } from 'react'

type Dot = { lat: number; lon: number; hot: number }

/** Points de latitude et de longitude. L'Afrique centrale est un peu plus lumineuse. */
function buildDots(): Dot[] {
  const dots: Dot[] = []
  for (let lat = -78; lat <= 78; lat += 11) {
    for (let lon = 0; lon < 360; lon += 11) {
      const basin = lat > -14 && lat < 10 && lon > 8 && lon < 32
      dots.push({ lat: (lat * Math.PI) / 180, lon: (lon * Math.PI) / 180, hot: basin ? 1 : 0.34 })
    }
  }
  return dots
}

const DOTS = buildDots()

/**
 * Globe en points, inspiré d'un fond filaire : visible seulement, 50 images/s,
 * densité d'écran plafonnée, image fixe si le mouvement est réduit.
 * Le pointeur incline le globe ; un doigt laisse tourner tout seul.
 */
export function WireField() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const parent = canvas?.parentElement
    if (!canvas || !parent) return
    const surface = canvas
    const host = parent
    let pen: CanvasRenderingContext2D | null = null
    try {
      pen = surface.getContext('2d')
    } catch {
      return
    }
    if (!pen) return
    const drawPen = pen
    const media = (query: string) => typeof window.matchMedia === 'function' && window.matchMedia(query).matches
    const reduce = media('(prefers-reduced-motion: reduce)')
    const fine = media('(hover: hover) and (pointer: fine)')
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    let w = 1
    let h = 1
    let ry = 0.6
    let rx = -0.22
    let targetRx = rx
    let visible = false
    let raf = 0
    let last = 0
    const turn = (Math.PI * 2) / 75

    function resize() {
      const box = host.getBoundingClientRect()
      w = Math.max(1, box.width)
      h = Math.max(1, box.height)
      surface.width = Math.round(w * dpr)
      surface.height = Math.round(h * dpr)
      drawPen.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function paint() {
      drawPen.clearRect(0, 0, w, h)
      const radius = Math.min(w, h) * 0.46
      const cx = w * 0.58
      const cy = h * 0.5
      const cosR = Math.cos(rx)
      const sinR = Math.sin(rx)
      drawPen.lineWidth = 0.7
      let prev: { x: number; y: number; front: boolean } | null = null
      let prevLat = 0
      for (const dot of DOTS) {
        const x0 = Math.cos(dot.lat) * Math.sin(dot.lon + ry)
        const y0 = Math.sin(dot.lat)
        const z0 = Math.cos(dot.lat) * Math.cos(dot.lon + ry)
        const y2 = y0 * cosR - z0 * sinR
        const z2 = y0 * sinR + z0 * cosR
        const front = z2 > -0.05
        const x = cx + x0 * radius
        const y = cy - y2 * radius
        if (prev && prev.front && front && Math.abs(dot.lat - prevLat) < 0.01) {
          drawPen.strokeStyle = dot.hot > 0.8 ? 'rgba(196,81,44,0.45)' : 'rgba(196,81,44,0.16)'
          drawPen.beginPath()
          drawPen.moveTo(prev.x, prev.y)
          drawPen.lineTo(x, y)
          drawPen.stroke()
        }
        if (front) {
          drawPen.fillStyle = dot.hot > 0.8 ? 'rgba(196,81,44,0.9)' : 'rgba(196,81,44,0.32)'
          drawPen.beginPath()
          drawPen.arc(x, y, dot.hot > 0.8 ? 1.7 : 1, 0, Math.PI * 2)
          drawPen.fill()
        }
        prev = { x, y, front }
        prevLat = dot.lat
      }
    }

    function frame(now: number) {
      if (!visible || document.hidden) {
        raf = 0
        return
      }
      raf = window.requestAnimationFrame(frame)
      if (now - last < 19) return
      const dt = last ? Math.min(0.08, (now - last) / 1000) : 0
      last = now
      ry += turn * dt
      const k = 1 - (1 - 0.08) ** (dt * 60)
      rx += (targetRx - rx) * k
      paint()
    }

    function start() {
      if (reduce || raf || !visible || document.hidden) return
      last = 0
      raf = window.requestAnimationFrame(frame)
    }

    resize()
    paint()
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) start()
    })
    io.observe(parent)
    const ro = new ResizeObserver(() => {
      resize()
      paint()
    })
    ro.observe(parent)
    const onMove = (event: PointerEvent) => {
      if (!fine || event.pointerType === 'touch') return
      const box = host.getBoundingClientRect()
      const py = (event.clientY - box.top) / Math.max(1, box.height) - 0.5
      targetRx = -0.22 + py * 0.4
    }
    const onHide = () => {
      if (!document.hidden) start()
    }
    if (fine) window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('visibilitychange', onHide)
    return () => {
      window.cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('visibilitychange', onHide)
    }
  }, [])

  return <canvas ref={ref} className="wire-field" aria-hidden="true" />
}
