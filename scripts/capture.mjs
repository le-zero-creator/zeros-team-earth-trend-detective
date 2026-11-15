// Captures d'écran pleine page à 375 px et 1440 px, avec le Chrome déjà installé (aucune dépendance).
// Usage : npm run build && npm run preview   puis   node scripts/capture.mjs home=/ [nom=/route ...]
// Affiche aussi : erreurs de console, débordement horizontal, et les hôtes contactés (preuve « aucun tiers »).
import { spawn } from 'node:child_process'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const BASE = process.env.CAPTURE_BASE ?? 'http://localhost:4173/zeros-team-earth-trend-detective/'
const OUT = 'docs/captures'
const PORT = 9333
const CHROME = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
].find((p) => p && existsSync(p))
const SIZES = [
  { width: 375, height: 812, scale: 2, mobile: true },
  { width: 1440, height: 900, scale: 1, mobile: false },
]
const pages = process.argv.slice(2).map((arg) => {
  const eq = arg.indexOf('=')
  const name = eq === -1 ? arg : arg.slice(0, eq)
  const route = eq === -1 ? '/' : arg.slice(eq + 1)
  return { name, route }
})
if (!CHROME || pages.length === 0) {
  console.error('Chrome introuvable ou aucune page demandée (ex. : node scripts/capture.mjs home=/)')
  process.exit(1)
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const profile = mkdtempSync(join(tmpdir(), 'td-capture-'))
const chrome = spawn(CHROME, [
  '--headless=new',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`,
  '--no-first-run',
  '--hide-scrollbars',
  'about:blank',
])

async function connect() {
  for (let i = 0; i < 50; i++) {
    try {
      const info = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json()
      const ws = new WebSocket(info.webSocketDebuggerUrl)
      await new Promise((ok, ko) => {
        ws.onopen = ok
        ws.onerror = ko
      })
      return ws
    } catch {
      await sleep(200)
    }
  }
  throw new Error('Chrome ne répond pas')
}

let failed = false
try {
  const ws = await connect()
  let id = 0
  const pending = new Map()
  const events = []
  ws.onmessage = (m) => {
    const msg = JSON.parse(m.data)
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg)
      pending.delete(msg.id)
    } else if (msg.method) events.push(msg)
  }
  const send = (method, params = {}, sessionId) =>
    new Promise((resolve, reject) => {
      const n = ++id
      pending.set(n, (msg) => (msg.error ? reject(new Error(`${method}: ${msg.error.message}`)) : resolve(msg.result)))
      ws.send(JSON.stringify({ id: n, method, params, sessionId }))
    })

  mkdirSync(OUT, { recursive: true })
  for (const page of pages) {
    for (const size of SIZES) {
      events.length = 0
      const { targetId } = await send('Target.createTarget', { url: 'about:blank' })
      const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true })
      const cmd = (method, params) => send(method, params, sessionId)
      const metrics = { width: size.width, height: size.height, deviceScaleFactor: size.scale, mobile: size.mobile }
      await cmd('Page.enable')
      await cmd('Runtime.enable')
      await cmd('Log.enable')
      await cmd('Network.enable')
      await cmd('Emulation.setDeviceMetricsOverride', metrics)
      await cmd('Page.navigate', { url: `${BASE}#${page.route}` })

      const evaluate = async (expression) =>
        (await cmd('Runtime.evaluate', { expression, returnByValue: true })).result.value
      // Attend la fin du chargement (plus de squelette), puis laisse le temps aux tuiles de la carte.
      for (let i = 0; i < 60; i++) {
        if (await evaluate(`document.readyState === 'complete' && !!document.querySelector('main') && !document.querySelector('.skeleton')`)) break
        await sleep(250)
      }
      await sleep(3500)

      const overflow = await evaluate('document.documentElement.scrollWidth - window.innerWidth')
      const height = await evaluate('document.documentElement.scrollHeight')
      await cmd('Emulation.setDeviceMetricsOverride', { ...metrics, height })
      await sleep(1500)
      const shot = await cmd('Page.captureScreenshot', { format: 'png' })
      const file = join(OUT, `${page.name}-${size.width}.png`)
      writeFileSync(file, Buffer.from(shot.data, 'base64'))

      const mine = events.filter((e) => e.sessionId === sessionId)
      const errors = mine.flatMap((e) => {
        if (e.method === 'Runtime.exceptionThrown') return [e.params.exceptionDetails.text]
        if (e.method === 'Runtime.consoleAPICalled' && e.params.type === 'error')
          return [e.params.args.map((a) => a.value ?? a.description).join(' ')]
        if (e.method === 'Log.entryAdded' && e.params.entry.level === 'error') return [e.params.entry.text]
        return []
      })
      const hosts = [
        ...new Set(
          mine
            .filter((e) => e.method === 'Network.requestWillBeSent' && e.params.request.url.startsWith('http'))
            .map((e) => new URL(e.params.request.url).host),
        ),
      ]
      if (errors.length || overflow > 0) failed = true
      console.log(
        `${file} · ${size.width}×${height} · débordement horizontal : ${overflow > 0 ? `${overflow} px` : 'aucun'} · erreurs console : ${errors.length} · hôtes : ${hosts.join(', ')}`,
      )
      for (const e of errors) console.log(`  erreur : ${e}`)
      await send('Target.closeTarget', { targetId })
    }
  }
  ws.close()
} finally {
  chrome.kill()
  await sleep(500)
  try {
    rmSync(profile, { recursive: true, force: true })
  } catch {
    /* profil temporaire encore verrouillé : sans conséquence */
  }
}
process.exit(failed ? 1 : 0)
