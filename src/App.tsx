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
const Ask = lazy(() => import('./pages/Ask').then((m) => ({ default: m.Ask })))
const Explore = lazy(() => import('./pages/Explore').then((m) => ({ default: m.Explore })))
const Region = lazy(() => import('./pages/Region').then((m) => ({ default: m.Region })))
const Place = lazy(() => import('./pages/Place').then((m) => ({ default: m.Place })))
const Means = lazy(() => import('./pages/Means').then((m) => ({ default: m.Means })))
const Space = lazy(() => import('./pages/Space').then((m) => ({ default: m.Space })))
const Future = lazy(() => import('./pages/Future').then((m) => ({ default: m.Future })))

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
          <Route path="/explore" element={<Explore />} />
          <Route path="/congo" element={<Region />} />
          <Route path="/place/:zoneId" element={<Place />} />
          <Route path="/you" element={<Means />} />
          <Route path="/me" element={<Space />} />
          <Route path="/future" element={<Future />} />
          <Route path="/investigate" element={<Investigate />} />
          <Route path="/method" element={<Method />} />
          <Route path="/about" element={<About />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/ask" element={<Ask />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AppShell>
  )
}
