'use client';

import { useState } from 'react'
import {
  Shield, AlertTriangle, AlertCircle, CheckCircle,
  Plus, Edit2, Save, X, Search,
  MessageSquare, Share2, Target, Bot
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type Severity = 'critical' | 'high' | 'medium'
type GuardrailAgent = 'all' | 'support' | 'social' | 'leads'

const severityConfig: Record<Severity, { color: string; bg: string; icon: typeof AlertTriangle }> = {
  critical: { color: '#fb923c', bg: 'rgba(252,129,74,0.12)', icon: AlertCircle },
  high: { color: '#fbbf24', bg: 'rgba(255,200,87,0.12)', icon: AlertTriangle },
  medium: { color: '#34d399', bg: 'rgba(23,126,137,0.12)', icon: Shield },
}

const categoryColors: Record<string, { color: string; bg: string }> = {
  Privacy: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  Escalation: { color: '#fbbf24', bg: 'rgba(255,200,87,0.12)' },
  Content: { color: '#34d399', bg: 'rgba(23,126,137,0.12)' },
  Brand: { color: '#fb923c', bg: 'rgba(252,129,74,0.12)' },
  Compliance: { color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  Quality: { color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
  Performance: { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
}

const agentOptions: { value: GuardrailAgent; label: string; icon: typeof MessageSquare }[] = [
  { value: 'all', label: 'All Agents', icon: Bot },
  { value: 'support', label: 'Support Agent', icon: MessageSquare },
  { value: 'social', label: 'Social Media Bot', icon: Share2 },
  { value: 'leads', label: 'Lead Scout', icon: Target },
]

const initialGuardrails = [
  { id: 1, agent: 'all' as GuardrailAgent, name: 'No PII in Responses', severity: 'critical' as Severity, status: 'active' as 'active' | 'paused', category: 'Privacy', description: 'Never include personal identifiable information in agent responses' },
  { id: 2, agent: 'support' as GuardrailAgent, name: 'Max 3 Attempts Before Escalation', severity: 'high' as Severity, status: 'active' as 'active' | 'paused', category: 'Escalation', description: 'Automatically escalate to human after 3 failed resolution attempts' },
  { id: 3, agent: 'support' as GuardrailAgent, name: 'No Medical/Legal Advice', severity: 'critical' as Severity, status: 'active' as 'active' | 'paused', category: 'Content', description: 'Refuse to provide medical, legal, or financial advice' },
  { id: 4, agent: 'social' as GuardrailAgent, name: '20% Promotional Max', severity: 'medium' as Severity, status: 'active' as 'active' | 'paused', category: 'Content', description: 'Maximum 20% of posts can be promotional content' },
  { id: 5, agent: 'social' as GuardrailAgent, name: 'No Competitor Bashing', severity: 'high' as Severity, status: 'active' as 'active' | 'paused', category: 'Brand', description: 'Never disparage competitors or their products' },
  { id: 6, agent: 'social' as GuardrailAgent, name: 'Approval Required for Pricing', severity: 'high' as Severity, status: 'active' as 'active' | 'paused', category: 'Brand', description: 'All posts mentioning pricing require human approval' },
  { id: 7, agent: 'leads' as GuardrailAgent, name: 'No Spam — Max 1 Contact/Day', severity: 'critical' as Severity, status: 'active' as 'active' | 'paused', category: 'Compliance', description: 'Never contact the same lead more than once per day' },
  { id: 8, agent: 'leads' as GuardrailAgent, name: 'Transparency — AI Disclosure', severity: 'high' as Severity, status: 'active' as 'active' | 'paused', category: 'Compliance', description: 'Must disclose AI nature when directly asked' },
  { id: 9, agent: 'leads' as GuardrailAgent, name: 'Min Score Threshold (60)', severity: 'medium' as Severity, status: 'active' as 'active' | 'paused', category: 'Quality', description: 'Only reach out to leads scoring 60+ on qualification rubric' },
  { id: 10, agent: 'leads' as GuardrailAgent, name: 'Respect Opt-out', severity: 'critical' as Severity, status: 'active' as 'active' | 'paused', category: 'Compliance', description: 'Immediately cease contact upon any opt-out signal' },
  { id: 11, agent: 'all' as GuardrailAgent, name: 'Rate Limit — 60 req/min', severity: 'medium' as Severity, status: 'active' as 'active' | 'paused', category: 'Performance', description: 'Maximum 60 API requests per minute across all agents' },
  { id: 12, agent: 'all' as GuardrailAgent, name: 'Token Budget — 100K/day', severity: 'medium' as Severity, status: 'warning' as 'active' | 'paused', category: 'Performance', description: 'Daily token consumption limit for cost control' },
]

const triggerLog = [
  { id: 1, time: '2m ago', guardrail: 'No PII in Responses', agent: 'Support Agent Alpha', context: 'User asked for SSN in chat', action: 'Blocked & Escalated' },
  { id: 2, time: '8m ago', guardrail: '20% Promotional Max', agent: 'Social Media Bot', context: 'Drafted 4th promo post today', action: 'Flagged for Review' },
  { id: 3, time: '15m ago', guardrail: 'Max 3 Attempts', agent: 'Support Agent Alpha', context: 'Failed to resolve billing issue', action: 'Auto-escalated to Human' },
  { id: 4, time: '32m ago', guardrail: 'No Spam — Max 1 Contact', agent: 'Lead Scout', context: 'Attempted 2nd outreach same day', action: 'Blocked & Logged' },
  { id: 5, time: '1h ago', guardrail: 'Approval for Pricing', agent: 'Social Media Bot', context: 'Post mentioned $29/mo pricing', action: 'Sent to Approval Queue' },
  { id: 6, time: '2h ago', guardrail: 'No Competitor Bashing', agent: 'Social Media Bot', context: 'Draft mentioned competitor flaw', action: 'Auto-corrected by AI' },
  { id: 7, time: '3h ago', guardrail: 'Min Score Threshold', agent: 'Lead Scout', context: 'Lead scored 45 (below 60 min)', action: 'Removed from Pipeline' },
  { id: 8, time: '5h ago', guardrail: 'Rate Limit', agent: 'All Agents', context: 'Burst of 120 req/min detected', action: 'Throttled to 60/min' },
]

function getAgentBadge(type: string) {
  switch (type) {
    case 'support': return { text: 'Support', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' }
    case 'social': return { text: 'Social', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' }
    case 'leads': return { text: 'Leads', color: '#fbbf24', bg: 'rgba(255,200,87,0.12)' }
    default: return { text: 'All', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' }
  }
}

export default function Guardrails() {
  const [activeFilter, setActiveFilter] = useState<GuardrailAgent>('all')
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [guardrailList, setGuardrailList] = useState(initialGuardrails)
  const [newGuardrail, setNewGuardrail] = useState({ name: '', description: '', severity: 'medium' as Severity, category: 'Content', agent: 'all' as GuardrailAgent })

  const filtered = guardrailList.filter(g => {
    const matchAgent = activeFilter === 'all' || g.agent === activeFilter || g.agent === 'all'
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase()) || g.description.toLowerCase().includes(search.toLowerCase())
    return matchAgent && matchSearch
  })

  const stats = {
    total: guardrailList.length,
    active: guardrailList.filter(g => g.status === 'active').length,
    critical: guardrailList.filter(g => g.severity === 'critical').length,
    warning: guardrailList.filter(g => g.severity === 'high').length,
  }

  const toggleStatus = (id: number) => {
    setGuardrailList(guardrailList.map(g => g.id === id ? { ...g, status: g.status === 'active' ? 'paused' : 'active' } : g))
  }

  const saveEdit = (id: number) => {
    const nameEl = document.getElementById(`name-${id}`) as HTMLInputElement
    const descEl = document.getElementById(`desc-${id}`) as HTMLTextAreaElement
    const sevEl = document.getElementById(`sev-${id}`) as HTMLSelectElement
    const catEl = document.getElementById(`cat-${id}`) as HTMLSelectElement
    if (nameEl && descEl && sevEl && catEl) {
      setGuardrailList(guardrailList.map(g => g.id === id ? {
        ...g, name: nameEl.value, description: descEl.value,
        severity: sevEl.value as Severity, category: catEl.value,
      } : g))
    }
    setEditingId(null)
  }

  const addGuardrail = () => {
    if (newGuardrail.name.trim()) {
      setGuardrailList([...guardrailList, {
        id: Date.now(),
        name: newGuardrail.name,
        description: newGuardrail.description,
        severity: newGuardrail.severity,
        status: 'active' as 'active' | 'paused',
        category: newGuardrail.category,
        agent: newGuardrail.agent,
      }])
      setShowAddModal(false)
      setNewGuardrail({ name: '', description: '', severity: 'medium', category: 'Content', agent: 'all' })
    }
  }

  return (
    <div className="space-y-4">
      {/* Agent Filter Tabs */}
      <div className="flex items-center gap-1.5">
        {agentOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setActiveFilter(opt.value)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold transition-all"
            style={{
              background: activeFilter === opt.value ? 'rgba(255,200,87,0.1)' : 'transparent',
              color: activeFilter === opt.value ? '#FFC857' : '#64748b',
              border: activeFilter === opt.value ? '1px solid rgba(255,200,87,0.25)' : '1px solid transparent',
            }}
          >
            <opt.icon size={13} />
            {opt.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Guardrails', value: stats.total, icon: Shield, color: '#fbbf24' },
          { label: 'Active', value: stats.active, icon: CheckCircle, color: '#34d399' },
          { label: 'Critical', value: stats.critical, icon: AlertCircle, color: '#fb923c' },
          { label: 'Warning', value: stats.warning, icon: AlertTriangle, color: '#fbbf24' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03, duration: 0.2 }}
            className="metric-card"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-medium" style={{ color: '#94a3b8' }}>{stat.label}</span>
              <stat.icon size={16} style={{ color: stat.color }} />
            </div>
            <div className="text-xl font-bold text-white">{stat.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Search + Add */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#94a3b8' }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search guardrails..." className="input-dark pl-8" />
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary text-xs"><Plus size={12} /> New Guardrail</button>
      </div>

      {/* Guardrails List */}
      <div className="space-y-2">
        <AnimatePresence>
          {filtered.map((g) => {
            const sev = severityConfig[g.severity as Severity]
            const SevIcon = sev.icon
            const isEditing = editingId === g.id
            const cat = categoryColors[g.category] || { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' }
            const agentBadge = getAgentBadge(g.agent)

            return (
              <motion.div
                key={g.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="card-dark p-3"
              >
                {isEditing ? (
                  <div className="space-y-2">
                    <input defaultValue={g.name} id={`name-${g.id}`} className="input-dark" />
                    <textarea defaultValue={g.description} id={`desc-${g.id}`} rows={2} className="textarea-dark" />
                    <div className="flex items-center gap-2">
                      <select id={`sev-${g.id}`} defaultValue={g.severity} className="select-dark w-28"><option value="critical">Critical</option><option value="high">High</option><option value="medium">Medium</option></select>
                      <select id={`cat-${g.id}`} defaultValue={g.category} className="select-dark w-28">{Object.keys(categoryColors).map(c => <option key={c} value={c}>{c}</option>)}</select>
                      <button onClick={() => saveEdit(g.id)} className="btn-primary text-xs px-2.5 py-1.5"><Save size={12} /> Save</button>
                      <button onClick={() => setEditingId(null)} className="btn-secondary text-xs px-2.5 py-1.5"><X size={12} /></button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-1.5 rounded-md shrink-0" style={{ background: sev.bg, color: sev.color }}><SevIcon size={15} /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <h4 className="text-sm font-semibold text-white">{g.name}</h4>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: sev.bg, color: sev.color, border: `1px solid ${sev.color}33` }}>{g.severity.toUpperCase()}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: cat.bg, color: cat.color, border: `1px solid ${cat.color}33` }}>{g.category}</span>
                      </div>
                      <p className="text-xs" style={{ color: '#94a3b8' }}>{g.description}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: agentBadge.bg, color: agentBadge.color, border: `1px solid ${agentBadge.color}33` }}>{agentBadge.text}</span>
                        <span className="text-[10px]" style={{ color: '#94a3b8' }}>Triggered 12 times today</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button onClick={() => toggleStatus(g.id)} className="text-[10px] font-semibold px-2 py-1 rounded transition-colors" style={{ background: g.status === 'active' ? 'rgba(23,126,137,0.15)' : 'rgba(148,163,184,0.1)', color: g.status === 'active' ? '#177E89' : '#64748b', border: g.status === 'active' ? '1px solid rgba(23,126,137,0.25)' : '1px solid rgba(148,163,184,0.15)' }}>{g.status === 'active' ? 'Active' : 'Paused'}</button>
                      <button onClick={() => setEditingId(g.id)} className="p-1 transition-colors" style={{ color: '#94a3b8' }}><Edit2 size={13} /></button>
                    </div>
                  </div>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Trigger Log */}
      <div className="card-dark p-4">
        <h3 className="section-header"><Shield size={14} /> Guardrail Trigger Log</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: '1px solid #452103', color: '#94a3b8' }}>
                <th className="pb-2 font-medium text-left">Time</th>
                <th className="pb-2 font-medium text-left">Guardrail</th>
                <th className="pb-2 font-medium text-left">Agent</th>
                <th className="pb-2 font-medium text-left">Trigger Context</th>
                <th className="pb-2 font-medium text-left">Action Taken</th>
              </tr>
            </thead>
            <tbody>
              {triggerLog.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/40/[0.02] transition-colors" style={{ borderBottom: '1px solid #452103' }}>
                  <td className="py-2" style={{ color: '#94a3b8' }}>{log.time}</td>
                  <td className="py-2 text-white">{log.guardrail}</td>
                  <td className="py-2">
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{
                      background: log.agent.includes('Support') ? 'rgba(59,130,246,0.12)' : log.agent.includes('Social') ? 'rgba(139,92,246,0.12)' : log.agent.includes('Lead') ? 'rgba(255,200,87,0.12)' : 'rgba(148,163,184,0.1)',
                      color: log.agent.includes('Support') ? '#3b82f6' : log.agent.includes('Social') ? '#8b5cf6' : log.agent.includes('Lead') ? '#FFC857' : '#94a3b8',
                      border: `1px solid ${log.agent.includes('Support') ? 'rgba(59,130,246,0.2)' : log.agent.includes('Social') ? 'rgba(139,92,246,0.2)' : log.agent.includes('Lead') ? 'rgba(255,200,87,0.2)' : 'rgba(148,163,184,0.15)'}`,
                    }}>{log.agent}</span>
                  </td>
                  <td className="py-2" style={{ color: '#94a3b8' }}>{log.context}</td>
                  <td className="py-2" style={{ color: '#34d399' }}>{log.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={() => setShowAddModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ duration: 0.2 }} className="card-dark w-full max-w-md p-5" style={{ background: '#1c2658' }} onClick={(e) => e.stopPropagation()}>
              <h3 className="text-base font-bold text-white mb-3">New Guardrail</h3>
              <div className="space-y-2.5">
                <div>
                  <label className="text-[11px] font-semibold mb-1 block" style={{ color: '#94a3b8' }}>Name</label>
                  <input value={newGuardrail.name} onChange={(e) => setNewGuardrail({ ...newGuardrail, name: e.target.value })} placeholder="e.g., No Pricing in DMs" className="input-dark" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold mb-1 block" style={{ color: '#94a3b8' }}>Description</label>
                  <textarea value={newGuardrail.description} onChange={(e) => setNewGuardrail({ ...newGuardrail, description: e.target.value })} placeholder="What should this guardrail prevent?" rows={2} className="textarea-dark" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold mb-1 block" style={{ color: '#94a3b8' }}>Severity</label>
                    <select value={newGuardrail.severity} onChange={(e) => setNewGuardrail({ ...newGuardrail, severity: e.target.value as Severity })} className="select-dark"><option value="critical">Critical</option><option value="high">High</option><option value="medium">Medium</option></select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold mb-1 block" style={{ color: '#94a3b8' }}>Category</label>
                    <select value={newGuardrail.category} onChange={(e) => setNewGuardrail({ ...newGuardrail, category: e.target.value })} className="select-dark">{Object.keys(categoryColors).map(c => <option key={c} value={c}>{c}</option>)}</select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold mb-1 block" style={{ color: '#94a3b8' }}>Applies To</label>
                    <select value={newGuardrail.agent} onChange={(e) => setNewGuardrail({ ...newGuardrail, agent: e.target.value as GuardrailAgent })} className="select-dark"><option value="all">All</option><option value="support">Support</option><option value="social">Social</option><option value="leads">Leads</option></select>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 mt-4">
                <button onClick={() => setShowAddModal(false)} className="btn-secondary text-xs">Cancel</button>
                <button onClick={addGuardrail} className="btn-primary text-xs"><Plus size={12} /> Create Guardrail</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
