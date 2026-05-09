'use client';

import { useState } from 'react'
import {
  Workflow, Play, Pause, Plus, Trash2,
  Bot, Diamond, Zap, User, Clock, CheckCircle,
  XCircle, ArrowRight, BarChart3, Sparkles
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const stepConfig: Record<string, { color: string; bg: string; icon: typeof Bot }> = {
  agent: { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', icon: Bot },
  decision: { color: '#fbbf24', bg: 'rgba(255,200,87,0.12)', icon: Diamond },
  action: { color: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: Zap },
  human: { color: '#fb923c', bg: 'rgba(252,129,74,0.12)', icon: User },
  delay: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', icon: Clock },
}

const initialHarnesses = [
  {
    id: 'h1', name: 'Support Escalation Pipeline',
    description: 'Auto-route complex issues through Support → Lead Gen handoff',
    status: 'active', triggers: ['support.escalation.created', 'sentiment.score < -0.5'],
    lastRun: '10m ago', successRate: 96.4,
    steps: [
      { id: 's1', name: 'Support Agent', type: 'agent', status: 'complete' },
      { id: 's2', name: 'Issue Analysis', type: 'decision', status: 'complete' },
      { id: 's3', name: 'Escalation Check', type: 'decision', status: 'complete' },
      { id: 's4', name: 'Lead Gen Notify', type: 'action', status: 'pending' },
      { id: 's5', name: 'Human Review', type: 'human', status: 'pending' },
    ],
  },
  {
    id: 'h2', name: 'Social-to-Lead Signal Router',
    description: 'Convert social engagement signals into qualified leads',
    status: 'active', triggers: ['social.engagement.detected', 'intent.signal = buying'],
    lastRun: '45m ago', successRate: 82.1,
    steps: [
      { id: 's1', name: 'Social Listener', type: 'agent', status: 'complete' },
      { id: 's2', name: 'Signal Detection', type: 'decision', status: 'complete' },
      { id: 's3', name: 'Lead Scoring', type: 'action', status: 'pending' },
      { id: 's4', name: 'CRM Sync', type: 'action', status: 'pending' },
    ],
  },
  {
    id: 'h3', name: 'Content Approval Workflow',
    description: 'Route promotional content through human approval before publishing',
    status: 'paused', triggers: ['social.content.drafted', 'content.type = promotional'],
    lastRun: '2h ago', successRate: 100,
    steps: [
      { id: 's1', name: 'Content Draft', type: 'agent', status: 'complete' },
      { id: 's2', name: 'Auto-Screen', type: 'decision', status: 'complete' },
      { id: 's3', name: 'Human Review', type: 'human', status: 'pending' },
      { id: 's4', name: 'Schedule Post', type: 'action', status: 'pending' },
    ],
  },
  {
    id: 'h4', name: 'Lead Outreach Sequence',
    description: 'Multi-touch outreach with smart follow-up timing',
    status: 'active', triggers: ['lead.qualified', 'score >= 70'],
    lastRun: '1h ago', successRate: 34.2,
    steps: [
      { id: 's1', name: 'Lead Qualification', type: 'agent', status: 'complete' },
      { id: 's2', name: 'First Contact', type: 'action', status: 'complete' },
      { id: 's3', name: 'Wait 3 Days', type: 'delay', status: 'pending' },
      { id: 's4', name: 'Follow-up #1', type: 'action', status: 'pending' },
      { id: 's5', name: 'Wait 7 Days', type: 'delay', status: 'pending' },
      { id: 's6', name: 'Follow-up #2', type: 'action', status: 'pending' },
    ],
  },
]

const executionHistory = [
  { id: 1, harness: 'Support Escalation Pipeline', started: '10m ago', duration: '2m 14s', status: 'success', steps: '5/5', trigger: 'support.escalation.created' },
  { id: 2, harness: 'Social-to-Lead Signal Router', started: '45m ago', duration: '1m 32s', status: 'success', steps: '4/4', trigger: 'social.engagement.detected' },
  { id: 3, harness: 'Content Approval Workflow', started: '2h ago', duration: '—', status: 'running', steps: '2/4', trigger: 'social.content.drafted' },
  { id: 4, harness: 'Lead Outreach Sequence', started: '1h ago', duration: '8m 45s', status: 'success', steps: '6/6', trigger: 'lead.qualified' },
  { id: 5, harness: 'Support Escalation Pipeline', started: '3h ago', duration: '—', status: 'failed', steps: '3/5', trigger: 'sentiment.score < -0.5' },
  { id: 6, harness: 'Lead Outreach Sequence', started: '5h ago', duration: '4m 12s', status: 'success', steps: '3/6', trigger: 'lead.qualified' },
]

export default function AgentHarnesses() {
  const [expandedId, setExpandedId] = useState<string | null>('h1')
  const [harnessList, setHarnessList] = useState(initialHarnesses)
  const [showBuilder, setShowBuilder] = useState(false)
  const [newHarness, setNewHarness] = useState({ name: '', description: '', trigger: '', steps: [] as { name: string; type: string }[] })
  const [newStepName, setNewStepName] = useState('')
  const [newStepType, setNewStepType] = useState('agent')

  const toggleHarness = (id: string) => {
    setHarnessList(harnessList.map(h => h.id === id ? { ...h, status: h.status === 'active' ? 'paused' : 'active' } : h))
  }

  const addStep = () => {
    if (newStepName.trim()) {
      setNewHarness({ ...newHarness, steps: [...newHarness.steps, { name: newStepName, type: newStepType }] })
      setNewStepName('')
    }
  }

  const removeStep = (idx: number) => {
    setNewHarness({ ...newHarness, steps: newHarness.steps.filter((_, i) => i !== idx) })
  }

  const saveHarness = () => {
    if (newHarness.name.trim() && newHarness.steps.length > 0) {
      setHarnessList([...harnessList, {
        id: `h${Date.now()}`,
        name: newHarness.name,
        description: newHarness.description,
        status: 'active',
        steps: newHarness.steps.map((s, i) => ({ id: `s${i}`, name: s.name, type: s.type, status: 'pending' as const })),
        triggers: [newHarness.trigger || 'manual.trigger'],
        lastRun: 'Never',
        successRate: 100,
      }])
      setShowBuilder(false)
      setNewHarness({ name: '', description: '', trigger: '', steps: [] })
    }
  }

  const activeCount = harnessList.filter(h => h.status === 'active').length
  const avgSuccess = Math.round(harnessList.reduce((a, h) => a + h.successRate, 0) / harnessList.length)

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Active Harnesses', value: activeCount, icon: Workflow, color: '#34d399' },
          { label: 'Success Rate', value: `${avgSuccess}%`, icon: CheckCircle, color: '#10b981' },
          { label: 'Avg Completion', value: '4m 12s', icon: Clock, color: '#fbbf24' },
          { label: 'Failed Runs', value: '1', icon: XCircle, color: '#fb923c' },
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

      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="section-header"><Workflow size={14} /> Active Harnesses</h3>
        <button onClick={() => setShowBuilder(true)} className="btn-primary text-xs"><Plus size={12} /> Create Harness</button>
      </div>

      {/* Harness List */}
      <div className="space-y-3">
        <AnimatePresence>
          {harnessList.map((h) => {
            const isExpanded = expandedId === h.id
            const isActive = h.status === 'active'

            return (
              <motion.div
                key={h.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className="card-dark"
              >
                <div className="flex items-center justify-between p-3 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : h.id)}>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: isActive ? '#177E89' : '#FFC857', boxShadow: isActive ? '0 0 5px rgba(23,126,137,0.5)' : '0 0 5px rgba(255,200,87,0.4)' }} />
                    <div>
                      <h4 className="text-sm font-semibold text-white">{h.name}</h4>
                      <p className="text-[11px]" style={{ color: '#94a3b8' }}>{h.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {h.triggers.map((t, i) => (
                        <span key={i} className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }}>{t}</span>
                      ))}
                    </div>
                    <span className="text-[11px] font-medium" style={{ color: '#94a3b8' }}>{h.successRate}% success</span>
                    <span className="text-[11px]" style={{ color: '#94a3b8' }}>Last: {h.lastRun}</span>
                    <button onClick={(e) => { e.stopPropagation(); toggleHarness(h.id) }} className="text-[10px] font-semibold px-2 py-1 rounded" style={{ background: isActive ? 'rgba(23,126,137,0.15)' : 'rgba(255,200,87,0.1)', color: isActive ? '#177E89' : '#FFC857', border: isActive ? '1px solid rgba(23,126,137,0.25)' : '1px solid rgba(255,200,87,0.2)' }}>{isActive ? 'Pause' : 'Resume'}</button>
                    <button onClick={(e) => e.stopPropagation()} className="text-xs px-2 py-1 rounded" style={{ background: '#177E89', color: 'white' }}><Play size={10} className="inline" /></button>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                      <div className="px-3 pb-3">
                        <div className="flex items-center gap-2 overflow-x-auto pb-2">
                          {h.steps.map((step, idx) => {
                            const config = stepConfig[step.type] || stepConfig.agent
                            const StepIcon = config.icon
                            const isComplete = step.status === 'complete'
                            const isPending = step.status === 'pending'
                            return (
                              <div key={step.id} className="flex items-center gap-2 shrink-0">
                                <div className="flex flex-col items-center gap-1 p-2.5 rounded-md min-w-[110px]" style={{ background: isComplete ? config.bg : isPending ? 'rgba(255,255,255,0.04)' : 'rgba(252,129,74,0.1)', border: `1px solid ${isComplete ? `${config.color}40` : isPending ? 'rgba(255,255,255,0.06)' : '#FC814A40'}`, color: isComplete ? config.color : isPending ? '#64748b' : '#FC814A' }}>
                                  <StepIcon size={14} />
                                  <span className="text-xs font-medium text-center">{step.name}</span>
                                  <span className="text-[10px] opacity-70">{config.icon === Bot ? 'Agent' : config.icon === Diamond ? 'Decision' : config.icon === Zap ? 'Action' : config.icon === User ? 'Human' : 'Delay'}</span>
                                </div>
                                {idx < h.steps.length - 1 && <ArrowRight size={12} style={{ color: '#452103' }} />}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Execution History */}
      <div className="card-dark p-4">
        <h3 className="section-header"><BarChart3 size={14} /> Execution History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: '1px solid #452103', color: '#94a3b8' }}>
                <th className="pb-2 font-medium text-left">Harness</th>
                <th className="pb-2 font-medium text-left">Started</th>
                <th className="pb-2 font-medium text-left">Duration</th>
                <th className="pb-2 font-medium text-left">Status</th>
                <th className="pb-2 font-medium text-left">Steps</th>
                <th className="pb-2 font-medium text-left">Trigger</th>
              </tr>
            </thead>
            <tbody>
              {executionHistory.map((run) => (
                <tr key={run.id} className="hover:bg-slate-900/40/[0.02] transition-colors" style={{ borderBottom: '1px solid #452103' }}>
                  <td className="py-2 text-white">{run.harness}</td>
                  <td className="py-2" style={{ color: '#94a3b8' }}>{run.started}</td>
                  <td className="py-2" style={{ color: '#94a3b8' }}>{run.duration}</td>
                  <td className="py-2">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold" style={{ background: run.status === 'success' ? 'rgba(23,126,137,0.15)' : run.status === 'running' ? 'rgba(59,130,246,0.15)' : 'rgba(252,129,74,0.15)', color: run.status === 'success' ? '#177E89' : run.status === 'running' ? '#3b82f6' : '#FC814A', border: run.status === 'success' ? '1px solid rgba(23,126,137,0.25)' : run.status === 'running' ? '1px solid rgba(59,130,246,0.25)' : '1px solid rgba(252,129,74,0.25)' }}>
                      {run.status === 'success' && <CheckCircle size={9} />}
                      {run.status === 'running' && <Sparkles size={9} />}
                      {run.status === 'failed' && <XCircle size={9} />}
                      {run.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-2" style={{ color: '#94a3b8' }}>{run.steps}</td>
                  <td className="py-2">
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }}>{run.trigger}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Builder Modal */}
      <AnimatePresence>
        {showBuilder && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={() => setShowBuilder(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ duration: 0.2 }} className="card-dark w-full max-w-xl p-5" style={{ background: '#1c2658' }} onClick={(e) => e.stopPropagation()}>
              <h3 className="text-base font-bold text-white mb-3">Create New Harness</h3>
              <div className="space-y-2.5">
                <div>
                  <label className="text-[11px] font-semibold mb-1 block" style={{ color: '#94a3b8' }}>Harness Name</label>
                  <input value={newHarness.name} onChange={(e) => setNewHarness({ ...newHarness, name: e.target.value })} placeholder="e.g., Auto-Response Pipeline" className="input-dark" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold mb-1 block" style={{ color: '#94a3b8' }}>Description</label>
                  <textarea value={newHarness.description} onChange={(e) => setNewHarness({ ...newHarness, description: e.target.value })} placeholder="What does this harness orchestrate?" rows={2} className="textarea-dark" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold mb-1 block" style={{ color: '#94a3b8' }}>Trigger Event</label>
                  <input value={newHarness.trigger} onChange={(e) => setNewHarness({ ...newHarness, trigger: e.target.value })} placeholder="e.g., support.ticket.created" className="input-dark" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold mb-1 block" style={{ color: '#94a3b8' }}>Workflow Steps</label>
                  <div className="flex items-center gap-2 mb-2">
                    <input value={newStepName} onChange={(e) => setNewStepName(e.target.value)} placeholder="Step name..." className="input-dark flex-1" />
                    <select value={newStepType} onChange={(e) => setNewStepType(e.target.value)} className="select-dark w-28"><option value="agent">Agent</option><option value="decision">Decision</option><option value="action">Action</option><option value="human">Human</option><option value="delay">Delay</option></select>
                    <button onClick={addStep} className="btn-primary px-2.5 py-1.5 text-xs"><Plus size={12} /></button>
                  </div>
                  <div className="space-y-1.5">
                    {newHarness.steps.map((step, idx) => {
                      const config = stepConfig[step.type] || stepConfig.agent
                      const StepIcon = config.icon
                      return (
                        <div key={idx} className="flex items-center gap-2 p-2 rounded-md" style={{ background: '#0c1130', border: '1px solid #334155' }}>
                          <span className="text-[10px] font-medium w-5" style={{ color: '#94a3b8' }}>{idx + 1}</span>
                          <div className="p-1 rounded" style={{ background: config.bg, color: config.color }}><StepIcon size={12} /></div>
                          <span className="text-xs text-white flex-1">{step.name}</span>
                          <span className="text-[10px]" style={{ color: '#94a3b8' }}>{step.type}</span>
                          <button onClick={() => removeStep(idx)} className="text-slate-400 hover:text-orange-400 transition-colors"><Trash2 size={12} /></button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 mt-4">
                <button onClick={() => setShowBuilder(false)} className="btn-secondary text-xs">Cancel</button>
                <button onClick={saveHarness} className="btn-primary text-xs"><Plus size={12} /> Create Harness</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
