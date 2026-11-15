import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type Theme = 'light' | 'dark'
const KEY = 'td.theme'

const Ctx = createContext<{ theme: Theme; toggle: () => void }>({ theme: 'light', toggle: () => {} })

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  useEffect(() => {
    try {
      if (localStorage.getItem(KEY) === 'dark') setTheme('dark')
    } catch {
      /* le thème clair reste */
    }
  }, [])
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem(KEY, theme)
    } catch {
      /* la session garde le choix */
    }
  }, [theme])
  return <Ctx.Provider value={{ theme, toggle: () => setTheme((value) => (value === 'dark' ? 'light' : 'dark')) }}>{children}</Ctx.Provider>
}

export function useTheme() {
  return useContext(Ctx)
}
