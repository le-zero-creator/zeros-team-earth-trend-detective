// Types du fichier public/data/results.json (schéma 2.1). Lecture seule : l'appli affiche, elle ne calcule pas.

export type Lang = 'en' | 'fr'
export type EvidenceLevel = 'robust' | 'exploratory' | 'not_enough_evidence_yet'
export type Direction = 'increasing' | 'decreasing'
export type SourceStatus = 'available' | 'pending' | 'reference_layer'

export interface Analysis {
  zone_id: string
  variable_id: string
  period_id: string
  period: string
  n_years: number
  unit: string
  slope_unit: string
  source_id: string
  serie_annuelle: { annee: number; valeur: number }[]
  serie_mensuelle_moyenne: number[]
  pente_decennie: number
  pente_decennie_ic95: [number, number]
  intercept: number
  variation_totale: number
  p_mk: number | null
  p_smk: number | null
  p_hr: number | null
  q_bh: number | null
  hr_vs_mk: 'confirms' | 'contradicts' | null
  direction: Direction
  significatif: boolean
  fdr_significant: boolean
  evidence_level: EvidenceLevel
  verdict_key: string
  warnings: string[]
}

export interface Variable {
  variable_id: string
  power_code: string
  name: Record<Lang, string>
  unit: string
  slope_unit: string
  source_id: string
}

export interface Source {
  id: string
  status: SourceStatus
  name: string
  type?: string
  resolution?: string
  url?: string
  accessed?: string
  note?: string
}

export interface Results {
  meta: {
    schema_version: string
    generated_at: string
    scope_en: string
    scope_fr: string
    sources: Source[]
    [k: string]: unknown
  }
  variables: Variable[]
  analyses: Analysis[]
}

export interface ZoneProps {
  zone_id: string
  name_en: string
  name_fr: string
  country: string
  note_en: string
  in_hydrobasins_congo: boolean
  distance_to_basin_km: number
}

export interface Zone extends ZoneProps {
  lat: number
  lon: number
}

export interface AppData {
  results: Results
  zones: Zone[]
  boundary: GeoJSON.FeatureCollection
}
