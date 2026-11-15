import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { useI18n } from './i18n'
import { NotFound } from './pages/Simple'

const Home = lazy(() => import('./pages/Home').then((m) => ({ default: m.Home })))
const Investigate = lazy(() => import('./pages/Investigate').then((m) => ({ default: m.Investigate })))
const Method = lazy(() => import('./pages/Method').then((m) => ({ default: m.Method })))
const About = lazy(() => import('./pages/About').then((m) => ({ default: m.About })))
const Compare = lazy(() => import('./pages/Compare').then((m) => ({ default: m.Compare })))

function ScreenFallback() {
  const { t } = useI18n()
  return (
    <p className="skeleton__text" role="status">
      {t('state.loading')}
    </p>
  )
}

export function App() {
  return (
    <AppShell>
      <Suspense fallback={<ScreenFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/investigate" element={<Investigate />} />
          <Route path="/method" element={<Method />} />
          <Route path="/about" element={<About />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AppShell>
  )
}
