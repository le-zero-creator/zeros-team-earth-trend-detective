import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { HOME_SOURCE_IDS, SourceStrip } from '../components/Banners'
import { markerStyle } from '../components/BasinMap'
import { LocationsTable } from '../components/LocationsTable'
import en from '../i18n/en.json'
import fr from '../i18n/fr.json'
import { formatP, formatSigned, formatSlope } from '../lib/format'
import { DEFAULTS, investigateLink, safeParams } from '../lib/params'
import type { Analysis } from '../lib/types'
import { loadRealData } from './setup'

const data = loadRealData()
const pick = (zone: string, variable: string, period = 'p2001_2025') =>
  data.results.analyses.find((a) => a.zone_id === zone && a.variable_id === variable && a.period_id === period)!
const forVariable = (variable: string, period = 'p2001_2025') =>
  new Map<string, Analysis>(
    data.results.analyses
      .filter((a) => a.variable_id === variable && a.period_id === period)
      .map((a) => [a.zone_id, a]),
  )

describe('formatage des valeurs p', () => {
  it('affiche « < 0.001 » sous 0,001 et « n/a » si absent', () => {
    expect(formatP(0, 'en')).toBe('< 0.001')
    expect(formatP(0.000141, 'en')).toBe('< 0.001')
    expect(formatP(null, 'en')).toBe('n/a')
    expect(formatP(undefined, 'fr')).toBe('n/a')
  })
  it('garde 3 chiffres significatifs et localise', () => {
    expect(formatP(0.0967, 'en')).toBe('0.0967')
    expect(formatP(0.00484, 'en')).toBe('0.00484')
    expect(formatP(0.0336, 'fr')).toBe('0,0336')
    expect(formatP(0.0004, 'fr')).toBe('< 0,001')
  })
})

describe('formatage des pentes', () => {
  it('ajoute le signe et l’unité de results.json sans la modifier', () => {
    const a = pick('cmr_yaounde', 't2m_max')
    expect(formatSlope(a.pente_decennie, a.variable_id, a.slope_unit, 'en')).toBe('+0.78 °C per decade')
    const rain = pick('cmr_yaounde', 'precip')
    expect(formatSlope(rain.pente_decennie, rain.variable_id, rain.slope_unit, 'en')).toBe(
      '−119 mm per decade (annual total)',
    )
  })
  it('écrit l’humidité relative en points de pourcentage', () => {
    const a = pick('cmr_yaounde', 'rh2m')
    expect(formatSlope(a.pente_decennie, a.variable_id, a.slope_unit, 'en')).toMatch(/percentage points per decade$/)
  })
  it('distingue air et surface dans les noms de variables', () => {
    const name = (id: string) => data.results.variables.find((v) => v.variable_id === id)!.name.en
    expect(name('t2m_max')).toMatch(/air/i)
    expect(name('ts')).toMatch(/skin|surface/i)
  })
  it('localise le séparateur décimal', () => {
    expect(formatSigned(0.782, 2, 'fr')).toBe('+0,78')
  })
})

describe('tableau « All locations »', () => {
  const renderTable = (variable: string) =>
    render(
      <MemoryRouter>
        <LocationsTable zones={data.zones} analyses={forVariable(variable)} caption="test" />
      </MemoryRouter>,
    )

  it('affiche les 11 lieux avec les valeurs de results.json', () => {
    renderTable('t2m_max')
    const rows = document.querySelectorAll('tbody tr')
    expect(rows).toHaveLength(11)
    for (const row of rows) {
      const a = pick(row.getAttribute('data-zone')!, 't2m_max')
      expect(row.textContent).toContain(formatSlope(a.pente_decennie, a.variable_id, a.slope_unit, 'en'))
      expect(row.textContent).toContain(formatP(a.p_mk, 'en'))
      expect(row.querySelector('[data-evidence]')!.getAttribute('data-evidence')).toBe(a.evidence_level)
    }
  })

  it('Yaoundé t2m_max : robuste, +0.78 °C per decade', () => {
    renderTable('t2m_max')
    const row = within(document.querySelector('[data-zone="cmr_yaounde"]') as HTMLElement)
    expect(row.getByText('+0.78 °C per decade')).toBeTruthy()
    expect(row.getByText('Robust')).toBeTruthy()
  })

  it('Yaoundé pluie : « Not enough evidence yet »', () => {
    renderTable('precip')
    const row = within(document.querySelector('[data-zone="cmr_yaounde"]') as HTMLElement)
    expect(row.getByText('Not enough evidence yet')).toBeTruthy()
  })

  it('Bangui t2m_max : « Exploratory »', () => {
    renderTable('t2m_max')
    const row = within(document.querySelector('[data-zone="caf_bangui"]') as HTMLElement)
    expect(row.getByText('Exploratory')).toBeTruthy()
  })

  it('Yaoundé porte l’étiquette « outside the Congo hydrological basin (~63 km) » et un point creux', () => {
    renderTable('t2m_max')
    const row = document.querySelector('[data-zone="cmr_yaounde"]') as HTMLElement
    expect(row.textContent).toContain('outside the Congo hydrological basin (~63 km)')
    expect(row.querySelector('.zone-dot--hollow')).not.toBeNull()
    expect(document.querySelectorAll('.zone-dot--hollow')).toHaveLength(1)
  })
})

describe('carte', () => {
  it('seul Yaoundé est hors du bassin et son marqueur est creux', () => {
    const outside = data.zones.filter((z) => !z.in_hydrobasins_congo)
    expect(outside.map((z) => z.zone_id)).toEqual(['cmr_yaounde'])
    expect(markerStyle(pick('cmr_yaounde', 't2m_max'), true).fillOpacity).toBe(0)
    expect(markerStyle(pick('cod_kinshasa', 't2m_max'), false).fillOpacity).toBeGreaterThan(0)
  })
  it('un résultat exploratoire est en pointillé', () => {
    expect(markerStyle(pick('caf_bangui', 't2m_max'), false).dashArray).toBeTruthy()
  })
})

describe('sources', () => {
  it('une source « pending » n’est jamais affichée « Available »', () => {
    render(<SourceStrip sources={data.results.meta.sources} />)
    const items = document.querySelectorAll('[data-source]')
    expect(items).toHaveLength(HOME_SOURCE_IDS.length)
    for (const li of items) {
      const source = data.results.meta.sources.find((s) => s.id === li.getAttribute('data-source'))!
      const shown = li.querySelector('.pill')!.textContent
      expect(shown).toBe(en[`status.${source.status}`])
      if (source.status !== 'available') expect(shown).not.toBe('Available')
    }
    expect(screen.getByText('MODIS LST').parentElement!.textContent).toContain('Pending')
  })
})

describe('textes', () => {
  it('mêmes clés en anglais et en français', () => {
    expect(Object.keys(fr).sort()).toEqual(Object.keys(en).sort())
  })
  it('la chaîne « no change » n’existe pas, hors phrase imposée', () => {
    const allowed = 'This does not mean there is no change.'
    for (const value of Object.values(en)) {
      expect(value.replace(allowed, '').toLowerCase()).not.toContain('no change')
    }
    for (const value of Object.values(fr)) {
      expect(value.toLowerCase()).not.toContain('aucun changement')
      expect(value.toLowerCase()).not.toContain('pas de changement')
    }
  })
  it('sous-titre et texte p imposés', () => {
    expect(en['app.subtitle']).toBe('A comparison of selected locations across the Congo Basin region')
    expect(en['home.pnote']).toBe(
      'A small p-value means the observed trend would be unusual if there were no underlying trend.',
    )
  })
})

describe('paramètres d’URL (liste blanche)', () => {
  it('remplace toute valeur inconnue par la valeur par défaut', () => {
    const p = safeParams(new URLSearchParams('zone=<script>&var=../etc&period=p1900'))
    expect(p).toEqual({ zone: DEFAULTS.zone, var: DEFAULTS.var, period: DEFAULTS.period })
  })
  it('garde les valeurs connues', () => {
    expect(investigateLink('caf_bangui', 'precip', 'p1981_2025')).toBe(
      '/investigate?zone=caf_bangui&var=precip&period=p1981_2025',
    )
  })
  it('la liste blanche correspond à results.json', () => {
    for (const a of data.results.analyses) {
      expect(safeParams(new URLSearchParams({ zone: a.zone_id, var: a.variable_id, period: a.period_id }))).toEqual({
        zone: a.zone_id,
        var: a.variable_id,
        period: a.period_id,
      })
    }
  })
})
