import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-600.css'
import '@fontsource/space-grotesk/latin-500.css'
import '@fontsource/space-grotesk/latin-700.css'
import '@fontsource/jetbrains-mono/latin-500.css'
import './styles/tokens.css'
import './styles/app.css'
import './styles/public.css'
import { AppErrorBoundary } from './components/AppErrorBoundary'
import { App } from './App'
import { I18nProvider } from './i18n'
import { DataProvider } from './lib/data'
import { ProfileProvider } from './lib/profile'

const rootEl = document.getElementById('root')
document.documentElement.setAttribute('data-app', 'up')

if (!rootEl) {
  document.body.textContent = 'Trend Detective could not start. Reload the page.'
} else {
  createRoot(rootEl).render(
    <StrictMode>
      <AppErrorBoundary>
        <I18nProvider>
          <ProfileProvider>
            <DataProvider>
              <HashRouter>
                <App />
              </HashRouter>
            </DataProvider>
          </ProfileProvider>
        </I18nProvider>
      </AppErrorBoundary>
    </StrictMode>,
  )
}
