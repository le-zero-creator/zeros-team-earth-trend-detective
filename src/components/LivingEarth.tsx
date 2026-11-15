import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import type { Zone } from '../lib/types'

export type EarthHandle = {
  lookAt: (lat: number, lon: number, dist: number) => void
  /** Zoom and rise for about one second, then resolve. Returns false if the globe is not ready. */
  enter: () => boolean
}

type Props = {
  hero?: boolean
  zones?: Zone[]
  selected?: string | null
  onPick?: (zoneId: string) => void
  onReady?: () => void
  onFallback?: () => void
  onEnter?: () => void
  outline?: Array<[number, number]>
}

/** Equirectangular point on a Three sphere, before any mesh rotation. */
function latLonToVector(lat: number, lon: number, radius: number) {
  const phi = ((90 - lat) * Math.PI) / 180
  const theta = ((lon + 180) * Math.PI) / 180
  return {
    x: -radius * Math.sin(phi) * Math.cos(theta),
    y: radius * Math.cos(phi),
    z: radius * Math.sin(phi) * Math.sin(theta),
  }
}

export const LivingEarth = forwardRef<EarthHandle, Props>(function LivingEarth(
  { hero = false, zones = [], selected = null, onPick, onReady, onFallback, onEnter, outline = [] },
  ref,
) {
  const root = useRef<HTMLDivElement>(null)
  const look = useRef<(lat: number, lon: number, dist: number) => void>(() => {})
  const enter = useRef<() => boolean>(() => false)
  const pick = useRef(onPick)
  const ready = useRef(onReady)
  const fallback = useRef(onFallback)
  const entered = useRef(onEnter)
  const outlineRef = useRef(outline)
  const drawOutline = useRef<(pts: Array<[number, number]>) => void>(() => {})
  pick.current = onPick
  outlineRef.current = outline
  ready.current = onReady
  fallback.current = onFallback
  entered.current = onEnter

  useImperativeHandle(ref, () => ({
    lookAt(lat, lon, dist) {
      look.current(lat, lon, dist)
    },
    enter() {
      return enter.current()
    },
  }))

  useEffect(() => {
    const node = root.current
    if (!node) return
    const reduce = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce || typeof WebGLRenderingContext === 'undefined') {
      fallback.current?.()
      return
    }

    let stopped = false
    let raf = 0
    let running = true
    const cleanups: Array<() => void> = []

    ;(async () => {
      try {
        const THREE = await import('three')
        const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js')
        if (stopped || !node) return

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
        renderer.outputColorSpace = THREE.SRGBColorSpace
        renderer.domElement.style.position = 'absolute'
        renderer.domElement.style.inset = '0'
        renderer.domElement.style.zIndex = '0'
        node.appendChild(renderer.domElement)

        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 20)
        const start = latLonToVector(hero ? 8 : 2, hero ? 17 : 18, hero ? 2.9 : 3.55)
        camera.position.set(start.x, start.y, start.z)

        const controls = new OrbitControls(camera, renderer.domElement)
        controls.enablePan = false
        controls.enableZoom = !hero
        controls.enableRotate = !hero
        controls.autoRotate = !hero
        controls.autoRotateSpeed = hero ? 0.15 : 0.35
        controls.enableDamping = true
        controls.dampingFactor = 0.08
        controls.minDistance = 1.55
        controls.maxDistance = 4.4
        controls.target.set(0, 0, 0)

        scene.add(new THREE.AmbientLight(0xc5d4e4, 0.55))
        const sun = new THREE.DirectionalLight(0xfff6ea, 2.4)
        sun.position.set(4.5, 1.6, 3.2)
        scene.add(sun)

        const stars = new THREE.BufferGeometry()
        const starPos = new Float32Array(600)
        for (let i = 0; i < starPos.length; i += 1) starPos[i] = (Math.random() - 0.5) * 16
        stars.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
        scene.add(new THREE.Points(stars, new THREE.PointsMaterial({ color: 0xd7e4ee, size: 0.015, transparent: true, opacity: 0.7 })))

        const loader = new THREE.TextureLoader()
        const map = await loader.loadAsync(`${import.meta.env.BASE_URL}img/blue-marble.jpg`)
        if (stopped) return
        map.colorSpace = THREE.SRGBColorSpace
        map.anisotropy = 4

        const earth = new THREE.Mesh(
          new THREE.SphereGeometry(1, 64, 64),
          new THREE.MeshPhongMaterial({ map, specular: new THREE.Color('#1a3344'), shininess: 12 }),
        )
        scene.add(earth)
        let basinLine: { geometry: { dispose: () => void } } | null = null
        drawOutline.current = (pts) => {
          if (basinLine) {
            earth.remove(basinLine as never)
            basinLine.geometry.dispose()
            basinLine = null
          }
          if (pts.length < 3) return
          const vectors = pts.map(([lon, lat]) => {
            const p = latLonToVector(lat, lon, 1.015)
            return new THREE.Vector3(p.x, p.y, p.z)
          })
          vectors.push(vectors[0].clone())
          const geometry = new THREE.BufferGeometry().setFromPoints(vectors)
          const material = new THREE.LineBasicMaterial({ color: 0xf6d7b8, transparent: true, opacity: 0.95 })
          const line = new THREE.Line(geometry, material)
          earth.add(line)
          basinLine = line
        }
        drawOutline.current(outlineRef.current)

        const glow = new THREE.Mesh(
          new THREE.SphereGeometry(1.07, 64, 64),
          new THREE.ShaderMaterial({
            transparent: true,
            side: THREE.BackSide,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            vertexShader: 'varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
            fragmentShader: 'varying vec3 vN; void main(){ float f = pow(0.68 - dot(vN, vec3(0.0, 0.0, 1.0)), 2.4); gl_FragColor = vec4(0.45, 0.7, 1.0, 0.9) * f; }',
          }),
        )
        scene.add(glow)

        let goal: { x: number; y: number; z: number } | null = null
        let flight: { origin: InstanceType<typeof THREE.Vector3>; dest: InstanceType<typeof THREE.Vector3>; t0: number } | null = null
        look.current = (lat, lon, dist) => {
          goal = latLonToVector(lat, lon, dist)
          controls.autoRotate = false
        }
        enter.current = () => {
          if (flight) return true
          const dest = camera.position.clone().multiplyScalar(0.62)
          dest.y += 0.4
          flight = { origin: camera.position.clone(), dest, t0: performance.now() }
          controls.autoRotate = false
          controls.enabled = false
          return true
        }
        controls.addEventListener('start', () => {
          goal = null
          controls.autoRotate = false
        })
        controls.addEventListener('end', () => {
          if (hero && !goal) controls.autoRotate = true
        })

        const placeHero = () => {
          if (!hero) {
            earth.position.set(0, 0, 0)
            glow.position.set(0, 0, 0)
            return
          }
          camera.lookAt(0, 0, 0)
          camera.updateMatrixWorld()
          const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion)
          const up = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion)
          const narrow = node.clientWidth < 800
          const shift = narrow
            ? up.clone().multiplyScalar(-0.55)
            : right.clone().multiplyScalar(0.88).add(up.clone().multiplyScalar(-0.12))
          earth.position.copy(shift)
          glow.position.copy(shift)
        }
        const resize = () => {
          const w = node.clientWidth || 1
          const h = node.clientHeight || 1
          camera.aspect = w / h
          camera.updateProjectionMatrix()
          renderer.setSize(w, h, false)
          placeHero()
        }
        resize()
        const observer = new ResizeObserver(resize)
        observer.observe(node)

        const seen = new IntersectionObserver(([entry]) => {
          running = Boolean(entry?.isIntersecting) && document.visibilityState !== 'hidden'
          if (running) wake()
        })
        seen.observe(node)
        const onVis = () => {
          running = document.visibilityState !== 'hidden'
          if (running) wake()
        }
        document.addEventListener('visibilitychange', onVis)

        const placePins = () => {
          const width = node.clientWidth
          const height = node.clientHeight
          const cam = camera.position.clone().normalize()
          for (const pin of node.querySelectorAll<HTMLButtonElement>('[data-zone]')) {
            const lat = Number(pin.dataset.lat)
            const lon = Number(pin.dataset.lon)
            const local = latLonToVector(lat, lon, 1.02)
            const world = new THREE.Vector3(local.x, local.y, local.z).applyMatrix4(earth.matrixWorld)
            const facing = world.clone().normalize().dot(cam) > 0.12
            const projected = world.project(camera)
            pin.style.transform = `translate(-50%, -50%) translate(${(projected.x * 0.5 + 0.5) * width}px, ${(-projected.y * 0.5 + 0.5) * height}px)`
            pin.hidden = !facing
          }
        }

        const loop = () => {
          if (stopped) return
          if (!running) {
            raf = 0
            return
          }
          raf = window.requestAnimationFrame(loop)
          if (hero && !flight) earth.rotation.y += 0.0011
          if (flight) {
            const k = Math.min(1, (performance.now() - flight.t0) / 1000)
            const eased = 1 - (1 - k) ** 3
            camera.position.lerpVectors(flight.origin, flight.dest, eased)
            if (k >= 1) {
              flight = null
              entered.current?.()
            }
          } else if (goal) {
            camera.position.lerp(new THREE.Vector3(goal.x, goal.y, goal.z), 0.08)
            if (camera.position.distanceTo(new THREE.Vector3(goal.x, goal.y, goal.z)) < 0.02) {
              camera.position.set(goal.x, goal.y, goal.z)
              goal = null
              if (!hero) controls.autoRotate = true
            }
          }
          controls.update()
          placePins()
          renderer.render(scene, camera)
        }
        const wake = () => {
          if (!raf && !stopped && running) raf = window.requestAnimationFrame(loop)
        }

        cleanups.push(() => {
          observer.disconnect()
          seen.disconnect()
          document.removeEventListener('visibilitychange', onVis)
          controls.dispose()
          map.dispose()
          renderer.dispose()
          renderer.domElement.remove()
        })

        node.dataset.earth = 'ready'
        ready.current?.()
        wake()
      } catch {
        fallback.current?.()
      }
    })()

    return () => {
      stopped = true
      window.cancelAnimationFrame(raf)
      look.current = () => {}
      enter.current = () => false
      cleanups.forEach((fn) => fn())
    }
  }, [hero])

  useEffect(() => {
    drawOutline.current(outline)
  }, [outline])

  return (
    <div ref={root} className={hero ? 'earth-view' : 'earth-view earth-view--stage'}>
      {!hero &&
        zones.map((zone) => (
          <button
            key={zone.zone_id}
            type="button"
            className={
              selected === zone.zone_id || (selected === 'basin' && zone.in_hydrobasins_congo)
                ? 'earth-pin is-on'
                : zone.in_hydrobasins_congo
                  ? 'earth-pin'
                  : 'earth-pin is-hollow'
            }
            data-zone={zone.zone_id}
            data-lat={zone.lat}
            data-lon={zone.lon}
            aria-pressed={selected === zone.zone_id}
            onClick={() => pick.current?.(zone.zone_id)}
          >
            <span>{zone.name_en}</span>
          </button>
        ))}
    </div>
  )
})
