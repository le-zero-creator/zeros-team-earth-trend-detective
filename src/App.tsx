import { Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { Home } from './pages/Home'
import { ComingNext, NotFound } from './pages/Simple'

export function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/investigate" element={<ComingNext />} />
        <Route path="/method" element={<ComingNext />} />
        <Route path="/about" element={<ComingNext />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppShell>
  )
}
