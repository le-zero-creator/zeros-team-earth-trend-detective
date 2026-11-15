import { fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { AskDock } from '../components/AskDock'
import { AskChat } from '../components/AskChat'
import { I18nProvider } from '../i18n'
import { buildFacts } from '../lib/askFacts'
import { parseAsk } from '../lib/askRequest'
import { parsePowerPayload, readCoord } from '../lib/powerSeries'
import { loadRealData } from './setup'

function wrap(node: ReactNode) {
  return render(
    <I18nProvider>
      <MemoryRouter>
        {node}
      </MemoryRouter>
    </I18nProvider>,
  )
}

describe('faits pour Ask Terra', () => {
  it('recopie la pente publiée de Yaoundé et ne dit pas « no change »', () => {
    const text = buildFacts(loadRealData())
    expect(text).toContain('+0.78 °C per decade')
    expect(text).toContain('−119 mm per decade (annual total)')
    expect(text).toContain('cmr_yaounde | t2m_max')
    expect(text).toContain('evidence not_enough_evidence_yet')
    expect(text.toLowerCase()).not.toContain('no change')
  })

  it('refuse une question vide, un lieu inconnu et un script', () => {
    expect(parseAsk({ question: 'Hi', lang: 'fr', profile: 'nope', zone: '../etc' })).toEqual({
      question: 'Hi',
      lang: 'fr',
      profile: 'student',
      zone: '',
    })
    expect(parseAsk({ question: ' ' })).toBeNull()
    expect(parseAsk({ question: 'x'.repeat(401) })).toBeNull()
  })
})

describe('mois NASA POWER', () => {
  it('garde les mois et écarte le cumul annuel', () => {
    const rows = parsePowerPayload({
      properties: {
        parameter: {
          T2M_MAX: { '202511': 33.126, ANN: 30 },
          RH2M: { '202511': 70.2 },
          PRECTOTCORR: { '202511': -999 },
        },
      },
    })
    expect(rows).toEqual([{ month: '2025-11', t2m_max: 33.13, rh2m: 70.2, precip_mm_per_day: null }])
    expect(readCoord('3.87', 'lat')).toBe(3.87)
    expect(readCoord('11.52111', 'lon')).toBeNull()
    expect(readCoord('<script>', 'lat')).toBeNull()
  })
})

describe('fenêtre Ask Terra', () => {
  it('montre le bouton flottant et une réponse en flux', async () => {
    const encoder = new TextEncoder()
    const fetchMock = vi.fn(async () => {
      return new Response(
        new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode('Afternoons '))
            controller.enqueue(encoder.encode('can be hotter.'))
            controller.close()
          },
        }),
        { status: 200, headers: { 'content-type': 'text/plain' } },
      )
    })
    vi.stubGlobal('fetch', fetchMock)
    wrap(
      <>
        <AskDock />
        <AskChat
          suggestions={['Are afternoons getting hotter in Yaoundé?']}
          profile="student"
          zoneId="cmr_yaounde"
          initialQuestion="Are afternoons getting hotter in Yaoundé?"
        />
      </>,
    )
    expect(screen.getByRole('button', { name: 'Ask Terra' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Ask this question' }))
    expect(await screen.findByText('Afternoons can be hotter.')).toBeTruthy()
    const calls = fetchMock.mock.calls as unknown as [string, RequestInit][]
    const body = JSON.parse(String(calls[0][1].body)) as { zone: string; question: string }
    expect(body.zone).toBe('cmr_yaounde')
    expect(body.question).toContain('Yaoundé')
    vi.unstubAllGlobals()
  })
})
