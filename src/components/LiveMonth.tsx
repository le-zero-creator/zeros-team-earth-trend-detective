import { useEffect, useState } from 'react'
import { useI18n } from '../i18n'
import { formatNumber } from '../lib/format'
import type { PowerMonth } from '../lib/powerSeries'

const MONTH = /^\d{4}-\d{2}$/

/**
 * Latest NASA POWER month for one point of the world, read live through /api/power.
 * Display only: the three values are copied as NASA sends them. No slope, no mean, no test.
 */
export function LiveMonth({ lat, lon }: { lat: number; lon: number }) {
  const { t, lang } = useI18n()
  const [state, setState] = useState<'wait' | 'down' | PowerMonth>('wait')

  useEffect(() => {
    setState('wait')
    const ctrl = new AbortController()
    const params = new URLSearchParams({ lat: String(lat), lon: String(lon), start: '2025', end: '2026' })
    fetch(`/api/power?${params}`, { signal: ctrl.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error('down')
        return res.json() as Promise<{ months?: PowerMonth[] }>
      })
      .then((body) => {
        const last = Array.isArray(body.months) ? body.months[body.months.length - 1] : undefined
        setState(last && typeof last.month === 'string' && MONTH.test(last.month) ? last : 'down')
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setState('down')
      })
    return () => ctrl.abort()
  }, [lat, lon])

  const show = (value: number | null, decimals: number) =>
    typeof value === 'number' && Number.isFinite(value) ? formatNumber(value, decimals, lang) : 'n/a'

  return (
    <div className="live-month" data-live={typeof state === 'string' ? state : 'ready'}>
      <p className="live-month__k">{t('ask.liveTitle')}</p>
      {state === 'wait' && <p className="note">{t('live.wait')}</p>}
      {state === 'down' && <p className="note">{t('ask.liveDown')}</p>}
      {typeof state === 'object' && (
        <>
          <dl className="live-month__grid">
            <div>
              <dt>{t('live.tmax')}</dt>
              <dd>{show(state.t2m_max, 1)} °C</dd>
            </div>
            <div>
              <dt>{t('live.rh')}</dt>
              <dd>{show(state.rh2m, 0)} %</dd>
            </div>
            <div>
              <dt>{t('live.rain')}</dt>
              <dd>{show(state.precip_mm_per_day, 1)} <small>{t('live.perDay')}</small></dd>
            </div>
          </dl>
          <p className="note">{t('live.month', { month: state.month })} {t('ask.liveNote')}</p>
        </>
      )}
    </div>
  )
}
