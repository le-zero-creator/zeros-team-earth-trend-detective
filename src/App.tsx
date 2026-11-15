import { Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { About } from './pages/About'
import { Compare } from './pages/Compare'
import { Home } from './pages/Home'
import { Investigate } from './pages/Investigate'
import { Method } from './pages/Method'
import { NotFound } from './pages/Simple'

export function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/investigate" element={<Investigate />} />
        <Route path="/method" element={<Method />} />
        <Route path="/about" element={<About />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppShell>
  )
}
