import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n, type Key } from '../i18n'
import { formatP, formatSlope } from '../lib/format'
import { investigateLink } from '../lib/params'
import type { Analysis, EvidenceLevel, Zone } from '../lib/types'
import { EvidenceBadge } from './EvidenceBadge'

type SortKey = 'location' | 'trend' | 'p' | 'evidence'
const RANK: Record<EvidenceLevel, number> = { robust: 0, exploratory: 1, not_enough_evidence_yet: 2 }
const COLUMNS: { key: SortKey; label: Key }[] = [
  { key: 'location', label: 'home.table.location' },
  { key: 'trend', label: 'home.table.trend' },
  { key: 'p', label: 'home.table.p' },
  { key: 'evidence', label: 'home.table.evidence' },
]

interface Props {
  zones: Zone[]
  analyses: Map<string, Analysis>
  caption: string
}

export function LocationsTable({ zones, analyses, caption }: Props) {
  const { t, lang } = useI18n()
  const [sort, setSort] = useState<{ key: SortKey; asc: boolean } | null>(null)

  const rows = useMemo(() => {
    const list = zones.flatMap((z) => {
      const a = analyses.get(z.zone_id)
      return a ? [{ z, a, name: lang === 'fr' ? z.name_fr : z.name_en }] : []
    })
    if (!sort) return list
    const sign = sort.asc ? 1 : -1
    // Tri d'affichage sur les valeurs non arrondies de results.json (aucun calcul statistique).
    return [...list].sort((x, y) => {
      switch (sort.key) {
        case 'location':
          return sign * x.name.localeCompare(y.name, lang)
        case 'trend':
          return sign * (x.a.pente_decennie - y.a.pente_decennie)
        case 'p':
          return sign * ((x.a.p_mk ?? Infinity) - (y.a.p_mk ?? Infinity))
        default:
          return sign * (RANK[x.a.evidence_level] - RANK[y.a.evidence_level])
      }
    })
  }, [zones, analyses, sort, lang])

  const toggle = (key: SortKey) => setSort((s) => (s?.key === key ? { key, asc: !s.asc } : { key, asc: true }))

  return (
    <table className="loc-table">
      <caption>{caption}</caption>
      <thead>
        <tr>
          {COLUMNS.map((c) => (
            <th
              key={c.key}
              scope="col"
              aria-sort={sort?.key === c.key ? (sort.asc ? 'ascending' : 'descending') : 'none'}
              className={c.key === 'trend' || c.key === 'p' ? 'num' : undefined}
            >
              <button type="button" onClick={() => toggle(c.key)} title={t('home.table.sort', { column: t(c.label) })}>
                {t(c.label)}
                <span aria-hidden="true" className="sort-icon">
                  {sort?.key === c.key ? (sort.asc ? '↑' : '↓') : '↕'}
                </span>
              </button>
            </th>
          ))}
          <th scope="col">
            <span className="sr-only">{t('home.table.open')}</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map(({ z, a, name }) => (
          <tr key={z.zone_id} data-zone={z.zone_id}>
            <th scope="row" data-label={t('home.table.location')}>
              <span className="zone">
                <span className={z.in_hydrobasins_congo ? 'zone-dot' : 'zone-dot zone-dot--hollow'} aria-hidden="true" />
                <span>
                  {name}
                  {!z.in_hydrobasins_congo && (
                    <small className="outside">{t('yaounde.outsideKm', { km: z.distance_to_basin_km })}</small>
                  )}
                </span>
              </span>
            </th>
            <td className="num mono" data-label={t('home.table.trend')}>
              {formatSlope(a.pente_decennie, a.variable_id, a.slope_unit, lang)}
            </td>
            <td className="num mono" data-label={t('home.table.p')}>
              {formatP(a.p_mk, lang)}
            </td>
            <td data-label={t('home.table.evidence')}>
              <EvidenceBadge level={a.evidence_level} direction={a.direction} />
            </td>
            <td className="loc-table__action">
              <Link
                to={investigateLink(z.zone_id, a.variable_id, a.period_id)}
                aria-label={t('home.table.openAria', { zone: name })}
              >
                {t('home.table.open')}
                <span aria-hidden="true">→</span>
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
