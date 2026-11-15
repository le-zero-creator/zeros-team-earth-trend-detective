import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import en from './en.json'
import fr from './fr.json'
import type { Lang } from '../lib/types'

export type Key = keyof typeof en
const DICTS: Record<Lang, Record<string, string>> = { en, fr }
const STORAGE_KEY = 'td.lang'

function readLang(): Lang {
  try {
    const fromHash = new URLSearchParams(window.location.hash.split('?')[1] ?? '').get('lang')
    if (fromHash === 'fr' || fromHash === 'en') return fromHash
    return localStorage.getItem(STORAGE_KEY) === 'fr' ? 'fr' : 'en'
  } catch {
    return 'en'
  }
}

export function translate(lang: Lang, key: Key, vars?: Record<string, string | number>): string {
  let text = DICTS[lang][key] ?? DICTS.en[key] ?? key
  if (vars) for (const [k, v] of Object.entries(vars)) text = text.replace(`{${k}}`, String(v))
  return text
}

const I18nContext = createContext<{
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: Key, vars?: Record<string, string | number>) => string
}>({ lang: 'en', setLang: () => {}, t: (key, vars) => translate('en', key, vars) })

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readLang)

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    try {
      localStorage.setItem(STORAGE_KEY, l)
    } catch {
      /* stockage indisponible : la langue reste valable pour la session */
    }
  }, [])

  const t = useCallback((key: Key, vars?: Record<string, string | number>) => translate(lang, key, vars), [lang])

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>
}

export function useI18n() {
  return useContext(I18nContext)
}
