import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LiveMonth } from '../components/LiveMonth'
import { I18nProvider } from '../i18n'

function answer(body: unknown, ok = true) {
  vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok, json: () => Promise.resolve(body) })))
}

afterEach(() => vi.unstubAllGlobals())

describe('dernier mois NASA en direct', () => {
  it('recopie le dernier mois tel quel, avec ses unités, sans rien calculer', async () => {
    answer({
      months: [
        { month: '2026-08', t2m_max: 41.33, rh2m: 44.51, precip_mm_per_day: 1.29 },
        { month: '2026-09', t2m_max: 41.71, rh2m: 37, precip_mm_per_day: 0.44 },
      ],
    })
    const { container } = render(<I18nProvider><LiveMonth lat={16} lon={8} /></I18nProvider>)
    await waitFor(() => expect(container.querySelector('[data-live="ready"]')).not.toBeNull())
    const text = container.textContent ?? ''
    expect(text).toContain('41.7 °C')
    expect(text).toContain('37 %')
    expect(text).toContain('0.4 mm per day')
    expect(text).toContain('2026-09')
    expect(text).not.toContain('2026-08')
    expect(screen.getByText('Live NASA data, not yet analysed by our tests')).toBeTruthy()
  })

  it('écrit « n/a » pour une valeur absente', async () => {
    answer({ months: [{ month: '2026-09', t2m_max: null, rh2m: 37, precip_mm_per_day: null }] })
    const { container } = render(<I18nProvider><LiveMonth lat={16} lon={8} /></I18nProvider>)
    await waitFor(() => expect(container.querySelector('[data-live="ready"]')).not.toBeNull())
    expect(container.textContent).toContain('n/a °C')
    expect(container.textContent).toContain('n/a mm per day')
  })

  it('dit que la lecture est indisponible si le serveur ne répond pas ou renvoie autre chose', async () => {
    answer({ error: 'down' }, false)
    const first = render(<I18nProvider><LiveMonth lat={16} lon={8} /></I18nProvider>)
    await waitFor(() => expect(first.container.querySelector('[data-live="down"]')).not.toBeNull())
    first.unmount()
    answer({ months: [{ month: '<script>', t2m_max: 1, rh2m: 1, precip_mm_per_day: 1 }] })
    const second = render(<I18nProvider><LiveMonth lat={16} lon={8} /></I18nProvider>)
    await waitFor(() => expect(second.container.querySelector('[data-live="down"]')).not.toBeNull())
  })
})
