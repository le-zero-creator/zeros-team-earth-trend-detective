import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n'
import type { ProfileId } from '../lib/profile'
import type { PowerMonth } from '../lib/powerSeries'

type Status = 'idle' | 'wait' | 'talk' | 'done' | 'down' | 'rate' | 'late'

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
  const [answer, setAnswer] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [months, setMonths] = useState<PowerMonth[] | null>(null)
  const [liveDown, setLiveDown] = useState(false)

  useEffect(() => {
    setQuestion(initialQuestion)
  }, [initialQuestion])

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
    if (next.length < 2 || status === 'wait' || status === 'talk') return
    setQuestion(next)
    setAnswer('')
    setStatus('wait')
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'text/plain' },
        body: JSON.stringify({ question: next, lang, profile, zone: zoneId }),
      })
      if (!res.ok || !res.body) {
        const code = await res.json().catch(() => ({ error: 'down' }))
        setStatus(code.error === 'rate' ? 'rate' : code.error === 'late' ? 'late' : 'down')
        return
      }
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let all = ''
      setStatus('talk')
      while (true) {
        const step = await reader.read()
        if (step.done) break
        all += decoder.decode(step.value, { stream: true })
        setAnswer(all)
      }
      setStatus(all.trim() ? 'done' : 'down')
    } catch {
      setStatus('down')
    }
  }

  return (
    <div className={compact ? 'ask ask--compact' : 'ask'}>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          void send(question)
        }}
      >
        <label htmlFor={compact ? 'ask-q-dock' : 'ask-q'}>{t('ask.label')}</label>
        <textarea
          id={compact ? 'ask-q-dock' : 'ask-q'}
          value={question}
          maxLength={400}
          rows={compact ? 3 : 4}
          onChange={(event) => setQuestion(event.target.value)}
        />
        <button className="cta cta--sun" type="submit" disabled={status === 'wait' || status === 'talk'}>
          {t('ask.send')}
        </button>
      </form>
      <div className="ask-chips" aria-label={t('ask.suggestions')}>
        {suggestions.map((item) => (
          <button key={item} type="button" onClick={() => void send(item)}>
            {item}
          </button>
        ))}
      </div>
      <div className="ask-answer" data-ask="answer" aria-live="polite">
        {status === 'wait' && <p>{t('ask.waiting')}</p>}
        {answer && <p>{answer}</p>}
        {status === 'down' && <p>{t('ask.down')}</p>}
        {status === 'rate' && <p>{t('ask.slow')}</p>}
        {status === 'late' && <p>{t('ask.late')}</p>}
      </div>
      <p className="note">{t('ask.note')}</p>
      {(months || liveDown) && (
        <section className="ask-live" aria-labelledby={compact ? 'live-dock' : 'live-page'}>
          <h2 id={compact ? 'live-dock' : 'live-page'}>{t('ask.liveTitle')}</h2>
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
        </section>
      )}
      {compact && (
        <Link to="/ask">{t('ask.full')}</Link>
      )}
    </div>
  )
}
