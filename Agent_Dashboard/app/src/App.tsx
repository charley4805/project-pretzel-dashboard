import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Overview from './pages/Overview'
import SupportConsole from './pages/SupportConsole'
import SocialHub from './pages/SocialHub'
import LeadGen from './pages/LeadGen'
import Settings from './pages/Settings'
import AgentTraining from './pages/AgentTraining'
import Guardrails from './pages/Guardrails'
import AgentHarnesses from './pages/AgentHarnesses'
import ObsidianVault from './pages/ObsidianVault'
import Resources from './pages/Resources'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Overview />} />
        <Route path="/support" element={<SupportConsole />} />
        <Route path="/social" element={<SocialHub />} />
        <Route path="/leads" element={<LeadGen />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/training" element={<AgentTraining />} />
        <Route path="/guardrails" element={<Guardrails />} />
        <Route path="/harnesses" element={<AgentHarnesses />} />
        <Route path="/vault" element={<ObsidianVault />} />
        <Route path="/resources" element={<Resources />} />
      </Route>
    </Routes>
  )
}
