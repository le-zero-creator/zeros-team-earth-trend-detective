import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n'
import type { ProfileId } from '../lib/profile'
import type { PowerMonth } from '../lib/powerSeries'

type Status = 'wait' | 'talk' | 'done' | 'down' | 'rate' | 'late'

type Turn = {
  id: number
  question: string
  answer: string
  status: Status
}

export function AskChat({
  suggestions,
  profile,
  zoneId,
  lat,
  lon,
  initialQuestion = '',
  compact = false,
}: {
  suggestions: string[]
  profile: ProfileId
  zoneId: string
  lat?: number
  lon?: number
  initialQuestion?: string
  compact?: boolean
}) {
  const { t, lang } = useI18n()
  const [question, setQuestion] = useState(initialQuestion)
  const [turns, setTurns] = useState<Turn[]>([])
  const [busy, setBusy] = useState(false)
  const [months, setMonths] = useState<PowerMonth[] | null>(null)
  const [liveDown, setLiveDown] = useState(false)
  const last = useRef<HTMLDivElement>(null)
  const field = compact ? 'ask-q-dock' : 'ask-q'

  useEffect(() => {
    setQuestion(initialQuestion)
  }, [initialQuestion])

  useEffect(() => {
    last.current?.scrollIntoView?.({ block: 'nearest' })
  }, [turns])

  useEffect(() => {
    if (lat === undefined || lon === undefined) return
    const ctrl = new AbortController()
    const params = new URLSearchParams({ lat: String(lat), lon: String(lon), start: '2025', end: '2026' })
    fetch(`/api/power?${params}`, { signal: ctrl.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error('down')
        return res.json() as Promise<{ months?: PowerMonth[] }>
      })
      .then((body) => {
        setMonths(Array.isArray(body.months) ? body.months : [])
        setLiveDown(false)
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setLiveDown(true)
      })
    return () => ctrl.abort()
  }, [lat, lon])

  async function send(text: string) {
    const next = text.trim()
    if (next.length < 2 || busy) return
    const id = Date.now()
    setQuestion(next)
    setBusy(true)
    setTurns((list) => [...list, { id, question: next, answer: '', status: 'wait' }])
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'text/plain' },
        body: JSON.stringify({ question: next, lang, profile, zone: zoneId }),
      })
      if (!res.ok || !res.body) {
        const code = await res.json().catch(() => ({ error: 'down' }))
        const status: Status = code.error === 'rate' ? 'rate' : code.error === 'late' ? 'late' : 'down'
        setTurns((list) => list.map((turn) => (turn.id === id ? { ...turn, status } : turn)))
        return
      }
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let all = ''
      setTurns((list) => list.map((turn) => (turn.id === id ? { ...turn, status: 'talk' } : turn)))
      while (true) {
        const step = await reader.read()
        if (step.done) break
        all += decoder.decode(step.value, { stream: true })
        const shown = all
        setTurns((list) => list.map((turn) => (turn.id === id ? { ...turn, answer: shown, status: 'talk' } : turn)))
      }
      const final = all.trim()
      setTurns((list) => list.map((turn) => (turn.id === id ? { ...turn, answer: final, status: final ? 'done' : 'down' } : turn)))
    } catch {
      setTurns((list) => list.map((turn) => (turn.id === id ? { ...turn, status: 'down' } : turn)))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={compact ? 'ask ask--compact' : 'ask'}>
      <p className="ask-here">{t('ask.here')}</p>
      {suggestions.length > 0 && (
        <div className="ask-chips" aria-label={t('ask.suggestions')}>
          {suggestions.map((item) => (
            <button key={item} type="button" onClick={() => void send(item)}>
              {item}
            </button>
          ))}
        </div>
      )}
      <div className="chat" data-ask="thread">
        {turns.map((turn, index) => (
          <div key={turn.id} className="chat-turn" ref={index === turns.length - 1 ? last : undefined} data-ask="answer">
            <p className="bubble bubble--you">{turn.question}</p>
            <div className="bubble bubble--terra">
              {!turn.answer && (turn.status === 'wait' || turn.status === 'talk') && (
                <span className="dots" aria-label={t('ask.waiting')}>
                  <i />
                  <i />
                  <i />
                </span>
              )}
              {turn.answer && <p>{turn.answer}</p>}
              {turn.status === 'down' && <p>{t('ask.down')}</p>}
              {turn.status === 'rate' && <p>{t('ask.slow')}</p>}
              {turn.status === 'late' && <p>{t('ask.late')}</p>}
            </div>
          </div>
        ))}
      </div>
      <form
        className="ask-form"
        onSubmit={(event) => {
          event.preventDefault()
          void send(question)
        }}
      >
        <label className="visually-hidden" htmlFor={field}>
          {t('ask.label')}
        </label>
        <textarea id={field} value={question} maxLength={400} rows={2} onChange={(event) => setQuestion(event.target.value)} />
        <button className="cta cta--sun" type="submit" disabled={busy}>
          {t('ask.send')}
        </button>
      </form>
      <p className="note">{t('ask.note')}</p>
      {(months || liveDown) && (
        <details className="ask-live">
          <summary>{t('ask.liveTitle')}</summary>
          <p className="note">{t('ask.liveNote')}</p>
          {liveDown && <p>{t('ask.liveDown')}</p>}
          {months && months.length > 0 && (
            <table>
              <caption>{t('ask.source')}</caption>
              <thead>
                <tr>
                  <th scope="col">{t('ask.month')}</th>
                  <th scope="col">T2M_MAX</th>
                  <th scope="col">RH2M</th>
                  <th scope="col">PRECTOTCORR</th>
                </tr>
              </thead>
              <tbody>
                {months.map((row) => (
                  <tr key={row.month}>
                    <td>{row.month}</td>
                    <td>{row.t2m_max ?? 'n/a'}</td>
                    <td>{row.rh2m ?? 'n/a'}</td>
                    <td>{row.precip_mm_per_day ?? 'n/a'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </details>
      )}
      {compact && <Link to="/ask">{t('ask.full')}</Link>}
    </div>
  )
}
