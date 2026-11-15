import { readFileSync } from 'node:fs'
import { fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { AppErrorBoundary } from '../components/AppErrorBoundary'
import { AppShell } from '../components/AppShell'
import { EvidenceView } from '../components/EvidenceView'
import { chartRows } from '../components/TrendChart'
import { PersonaPanel } from '../components/PersonaPanel'
import { SoonNote } from '../components/WorldStage'
import { I18nProvider } from '../i18n'
import { formatP, formatSlope } from '../lib/format'
import { safeStep } from '../lib/params'
import { ProfileProvider } from '../lib/profile'
import { senY } from '../lib/senLine'
import { HomeStory } from '../pages/Home'
import { loadRealData } from './setup'

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children?: ReactNode }) => <div data-testid="map">{children}</div>,
  TileLayer: () => null,
  CircleMarker: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  Tooltip: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  GeoJSON: () => null,
  ZoomControl: () => null,
  useMap: () => ({
    setView() {},
    flyTo() {},
    flyToBounds() {},
    fitBounds() {},
    invalidateSize() {},
    on() {},
    off() {},
    getZoom: () => 5,
  }),
}))

const data = loadRealData()
const pick = (zone: string, variable: string, period = 'p2001_2025') =>
  data.results.analyses.find((a) => a.zone_id === zone && a.variable_id === variable && a.period_id === period)!

function wrap(node: ReactNode) {
  return render(
    <I18nProvider>
      <ProfileProvider>
        <MemoryRouter>
          {node}
        </MemoryRouter>
      </ProfileProvider>
    </I18nProvider>,
  )
}

beforeEach(() => localStorage.clear())

describe('accueil grand public', () => {
  it('montre le chiffre de chaleur et celui de l’air, pas la pente de pluie', () => {
    wrap(<HomeStory data={data} />)
    const text = document.body.textContent ?? ''
    expect(text).toContain('Is Yaoundé getting hotter?')
    expect(text).toContain('NASA data says yes.')
    expect(text).toContain('Afternoon (daily max) temperature')
    expect(text).toContain('questions for every field')
    expect(text).not.toContain('decisions for every field')
    expect(document.querySelector('[data-figure="final"]')?.textContent).toBe('+0.78')
    expect(text).toContain(formatSlope(pick('cmr_yaounde', 't2m_max').pente_decennie, 't2m_max', pick('cmr_yaounde', 't2m_max').slope_unit, 'en'))
    expect(text).toContain(formatSlope(pick('cmr_yaounde', 'rh2m').pente_decennie, 'rh2m', pick('cmr_yaounde', 'rh2m').slope_unit, 'en'))
    expect(text).not.toContain(formatSlope(pick('cmr_yaounde', 'precip').pente_decennie, 'precip', pick('cmr_yaounde', 'precip').slope_unit, 'en'))
    const links = screen.getAllByRole('link', { name: /See the full analysis/ })
    expect(links.some((link) => link.getAttribute('href') === '/investigate?zone=cmr_yaounde&var=t2m_max&period=p2001_2025')).toBe(true)
  })

  it('ne présente pas MODIS comme disponible', () => {
    wrap(<HomeStory data={data} />)
    for (const el of document.querySelectorAll('[data-future]')) {
      expect(el.textContent).not.toContain('Available')
    }
    expect(screen.getByText('MODIS LST').parentElement!.textContent).toContain('Pending')
  })
})

describe('personas et langue', () => {
  it('change les questions sans changer le chiffre', () => {
    wrap(<HomeStory data={data} />)
    const slope = formatSlope(pick('cmr_yaounde', 't2m_max').pente_decennie, 't2m_max', '°C per decade', 'en')
    expect(document.querySelector('[data-observed]')!.textContent).toContain(slope)
    fireEvent.click(screen.getByRole('button', { name: "I'm a farmer" }))
    expect(screen.getByText(/crops are most sensitive to heat/)).toBeTruthy()
    expect(document.querySelector('[data-observed]')!.textContent).toContain(slope)
    fireEvent.click(screen.getByRole('button', { name: "I'm an architect" }))
    expect(screen.getByText(/façades and roofs/)).toBeTruthy()
    expect(document.querySelector('[data-observed]')!.textContent).toContain(slope)
    expect(screen.queryByText(/crops are most sensitive to heat/)).toBeNull()
  })

  it('bascule toute l’interface en français', () => {
    wrap(
      <AppShell>
        <HomeStory data={data} />
      </AppShell>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'FR' }))
    expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(/Yaoundé devient-elle plus chaude/)
    expect(document.documentElement.lang).toBe('fr')
  })
})

describe('écran de preuves', () => {
  const zone = data.zones.find((z) => z.zone_id === 'cmr_yaounde')!
  const variable = (id: string) => data.results.variables.find((v) => v.variable_id === id)!
  const source = data.results.meta.sources.find((s) => s.id === 'merra2')

  it('affiche pente, intervalle, p et les 5 étapes pour Yaoundé', () => {
    const a = pick('cmr_yaounde', 't2m_max')
    wrap(
      <EvidenceView
        analysis={a}
        variable={variable('t2m_max')}
        zone={zone}
        source={source}
        zones={data.zones}
        analyses={new Map([[a.zone_id, a]])}
        onAct={() => {}}
      />,
    )
    const text = document.body.textContent ?? ''
    expect(text).toContain(formatSlope(a.pente_decennie, a.variable_id, a.slope_unit, 'en'))
    expect(text).toContain('0.45')
    expect(text).toContain('1.30')
    expect(text).toContain(formatP(a.p_mk, 'en'))
    expect(text).toContain(formatP(a.p_hr, 'en'))
    expect(text).toContain(formatP(a.q_bh, 'en'))
    expect(text).toContain('Robust')
    expect(document.querySelectorAll('.acker li')).toHaveLength(5)
    expect(text).not.toContain('uncertainty band is drawn around')
  })

  it('dit « pas encore assez de preuves » pour la pluie, avec la pente publiée', () => {
    const a = pick('cmr_yaounde', 'precip')
    wrap(
      <EvidenceView
        analysis={a}
        variable={variable('precip')}
        zone={zone}
        source={source}
        zones={data.zones}
        analyses={new Map([[a.zone_id, a]])}
        onAct={() => {}}
      />,
    )
    expect(screen.getAllByText('Not enough evidence yet').length).toBeGreaterThan(0)
    expect(document.body.textContent).toContain(formatSlope(a.pente_decennie, a.variable_id, a.slope_unit, 'en'))
    expect(document.body.textContent).toContain(formatP(a.p_mk, 'en'))
  })

  it('la droite affichée suit la formule autorisée', () => {
    const a = pick('cmr_yaounde', 't2m_max')
    const row = chartRows(a)[4]
    expect(row.sen).toBeCloseTo(senY(a.intercept, a.pente_decennie, row.year, a.serie_annuelle[0].annee), 8)
  })
})

describe('ailleurs sur Terre', () => {
  it('annonce bientôt, sans chiffre inventé', () => {
    wrap(<SoonNote label="Amazon Basin" />)
    const text = document.body.textContent ?? ''
    expect(text).toContain('Coming soon')
    expect(text).toContain('Amazon Basin')
    expect(text).not.toMatch(/°C|mm per decade/)
  })

  it('rejette une étape inconnue', () => {
    expect(safeStep('nope')).toBe('evidence')
    expect(safeStep('place')).toBe('place')
  })
})

describe('démarrage sur un téléphone', () => {
  it('affiche un texte de chargement dans la page, avant le JavaScript', () => {
    const html = readFileSync('index.html', 'utf8')
    expect(html).toContain('Loading Trend Detective')
    expect(html).toContain('boot.js')
  })

  it('remplace un plantage par une phrase lisible, sans détail interne', () => {
    function Boom(): ReactNode {
      throw new Error('secret stack trace')
    }
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <AppErrorBoundary>
        <Boom />
      </AppErrorBoundary>,
    )
    expect(screen.getByRole('alert').textContent).toContain('hit a problem')
    expect(document.body.textContent).not.toContain('secret stack')
    spy.mockRestore()
  })
})

describe('panneau métier isolé', () => {
  it('garde la même observation', () => {
    const a = pick('cmr_yaounde', 't2m_max')
    wrap(<PersonaPanel observed="SAME FIGURE" analysis={a} variableId="t2m_max" />)
    fireEvent.click(screen.getByRole('button', { name: 'I work in health' }))
    expect(document.querySelector('[data-observed]')!.textContent).toBe('SAME FIGURE')
    expect(screen.getByText(/heat stress/)).toBeTruthy()
  })
})
