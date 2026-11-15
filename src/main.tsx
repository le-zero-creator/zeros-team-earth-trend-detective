import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import '@fontsource/newsreader/latin-500.css'
import '@fontsource/newsreader/latin-600.css'
import '@fontsource/source-sans-3/latin-400.css'
import '@fontsource/source-sans-3/latin-600.css'
import './styles/tokens.css'
import './styles/app.css'
import './styles/public.css'
import './styles/site.css'
import './styles/apple.css'
import { AppErrorBoundary } from './components/AppErrorBoundary'
import { App } from './App'
import { I18nProvider } from './i18n'
import { DataProvider } from './lib/data'
import { ProfileProvider } from './lib/profile'
import { ThemeProvider } from './lib/theme'

const rootEl = document.getElementById('root')
document.documentElement.setAttribute('data-app', 'up')

if (!rootEl) {
  document.body.textContent = 'Terra Trace could not start. Reload the page.'
} else {
  createRoot(rootEl).render(
    <StrictMode>
      <AppErrorBoundary>
        <I18nProvider>
          <ThemeProvider>
          <ProfileProvider>
            <DataProvider>
              <HashRouter>
                <App />
              </HashRouter>
            </DataProvider>
          </ProfileProvider>
          </ThemeProvider>
        </I18nProvider>
      </AppErrorBoundary>
    </StrictMode>,
  )
}
