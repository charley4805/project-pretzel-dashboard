'use client';

import { useState } from 'react'
import {
  Bot, MessageSquare, Share2, Target, Plus, Trash2,
  BookOpen, TrendingUp, Clock, Shield, Brain,
  BarChart3, Zap
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts'

const agents = [
  { id: 'support-1', name: 'Support Agent Alpha', type: 'support', icon: MessageSquare, trainingExamples: 47, accuracy: 94.2, lastTrained: '2h ago', guardrailsActive: 8, model: 'gpt-4o', temperature: 0.7 },
  { id: 'social-1', name: 'Social Media Bot', type: 'social', icon: Share2, trainingExamples: 63, accuracy: 91.8, lastTrained: '4h ago', guardrailsActive: 12, model: 'gpt-4o', temperature: 0.8 },
  { id: 'leads-1', name: 'Lead Scout', type: 'leads', icon: Target, trainingExamples: 34, accuracy: 88.5, lastTrained: '1d ago', guardrailsActive: 10, model: 'claude-sonnet', temperature: 0.6 },
]

const accuracyData = [
  { day: 'Mon', support: 91, social: 88, leads: 82 },
  { day: 'Tue', support: 92, social: 89, leads: 84 },
  { day: 'Wed', support: 93, social: 90, leads: 85 },
  { day: 'Thu', support: 92, social: 91, leads: 86 },
  { day: 'Fri', support: 94, social: 90, leads: 87 },
  { day: 'Sat', support: 94, social: 92, leads: 88 },
  { day: 'Sun', support: 94, social: 92, leads: 89 },
]

const trainingSessions = [
  { id: 1, agent: 'Support Agent Alpha', type: 'Example Added', description: 'Added 12 new Q&A pairs for billing troubleshooting', time: '2h ago', status: 'completed' },
  { id: 2, agent: 'Social Media Bot', type: 'Fine-tuning', description: 'Completed batch fine-tuning on brand voice dataset', time: '4h ago', status: 'completed' },
  { id: 3, agent: 'Lead Scout', type: 'Feedback Loop', description: 'Processed 8 rejected leads for re-scoring', time: '6h ago', status: 'completed' },
  { id: 4, agent: 'Support Agent Alpha', type: 'Guardrail Test', description: 'Ran boundary test suite — 2 warnings flagged', time: '8h ago', status: 'warning' },
  { id: 5, agent: 'Social Media Bot', type: 'Content Review', description: 'Human review of 24 scheduled posts completed', time: '12h ago', status: 'completed' },
  { id: 6, agent: 'Lead Scout', type: 'Outreach Audit', description: 'Reviewed 15 outreach messages for tone compliance', time: '1d ago', status: 'completed' },
]

const examplePairs = [
  { id: 1, question: 'How do I reset my password?', answer: 'Go to Settings > Security and click "Reset Password"', agent: 'support' },
  { id: 2, question: 'What payment methods do you accept?', answer: 'We accept Visa, Mastercard, Amex, and PayPal', agent: 'support' },
  { id: 3, question: 'How do I invite team members?', answer: 'Go to Project Settings > Team and send invites via email', agent: 'support' },
  { id: 4, question: 'What industries do you serve?', answer: 'We serve general contractors, subcontractors, and project managers in construction', agent: 'leads' },
  { id: 5, question: 'Do you offer enterprise pricing?', answer: 'Yes, contact sales@pretzel.io for custom enterprise plans', agent: 'leads' },
]

const feedbackItems = [
  { id: 1, agent: 'Support Agent Alpha', response: 'You can export data from the Reports tab', correction: 'You can export data from Settings > Data Export', confidence: 72, status: 'applied' },
  { id: 2, agent: 'Social Media Bot', response: 'Our platform is the best in the world', correction: 'Our platform helps contractors save 5+ hours/week on paperwork', confidence: 45, status: 'pending' },
  { id: 3, agent: 'Lead Scout', response: 'Hi, want to buy our product?', correction: 'Hi [Name], noticed you\'re managing multiple projects — curious how you handle contract paperwork?', confidence: 38, status: 'applied' },
  { id: 4, agent: 'Support Agent Alpha', response: 'Contact support@pretzel.io', correction: 'Contact support@pretzel.io or use the in-app chat widget', confidence: 85, status: 'pending' },
]

function getAgentColor(type: string) {
  switch (type) {
    case 'support': return 'text-blue-400 bg-blue-500/100/10 border-blue-500/20'
    case 'social': return 'text-violet-400 bg-violet-500/100/10 border-violet-500/20'
    case 'leads': return 'text-amber-400 bg-amber-500/100/10 border-amber-500/20'
    default: return 'text-slate-400 bg-slate-800/500/10 border-slate-500/20'
  }
}

export default function AgentTraining() {
  const [selectedAgent, setSelectedAgent] = useState(agents[0])
  const [newQ, setNewQ] = useState('')
  const [newA, setNewA] = useState('')
  const [examples, setExamples] = useState(examplePairs)
  const [temp, setTemp] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(4096)
  const [activeTab, setActiveTab] = useState<'examples' | 'feedback' | 'fine-tune'>('examples')

  const addExample = () => {
    if (newQ.trim() && newA.trim()) {
      setExamples([...examples, { id: Date.now(), question: newQ, answer: newA, agent: selectedAgent.type }])
      setNewQ('')
      setNewA('')
    }
  }

  const removeExample = (id: number) => setExamples(examples.filter(e => e.id !== id))

  return (
    <div className="space-y-4">
      {/* Agent Selector */}
      <div className="grid grid-cols-3 gap-3">
        {agents.map((agent) => (
          <motion.button
            key={agent.id}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedAgent(agent)}
            className="metric-card text-left"
            style={{
              borderColor: selectedAgent.id === agent.id ? '#FFC857' : undefined,
              boxShadow: selectedAgent.id === agent.id ? '0 0 0 1px #FFC857' : undefined,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`w-7 h-7 rounded-md flex items-center justify-center text-xs ${getAgentColor(agent.type)}`}>
                <agent.icon size={14} />
              </div>
              <span className="status-dot status-dot-online" />
            </div>
            <h3 className="text-sm font-semibold text-white">{agent.name}</h3>
            <p className="text-[11px] mt-0.5" style={{ color: '#94a3b8' }}>{agent.model} - temp {agent.temperature}</p>
            <div className="flex items-center gap-3 mt-2 text-[11px]" style={{ color: '#94a3b8' }}>
              <span>{agent.trainingExamples} examples</span>
              <span>{agent.accuracy}% accuracy</span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Training Examples', value: selectedAgent.trainingExamples, icon: BookOpen, color: '#fbbf24' },
          { label: 'Accuracy Rate', value: `${selectedAgent.accuracy}%`, icon: TrendingUp, color: '#34d399' },
          { label: 'Last Trained', value: selectedAgent.lastTrained, icon: Clock, color: '#3b82f6' },
          { label: 'Active Guardrails', value: selectedAgent.guardrailsActive, icon: Shield, color: '#8b5cf6' },
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

      {/* Training Methods */}
      <div className="card-dark">
        <div className="flex items-center gap-1 p-3" style={{ borderBottom: '1px solid #452103' }}>
          {(['examples', 'feedback', 'fine-tune'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`tab-pill ${activeTab === tab ? 'active' : ''}`}
            >
              {tab === 'examples' && 'Example Pairs'}
              {tab === 'feedback' && 'Feedback Loop'}
              {tab === 'fine-tune' && 'Fine-tuning'}
            </button>
          ))}
        </div>

        <div className="p-3">
          <AnimatePresence mode="wait">
            {activeTab === 'examples' && (
              <motion.div key="examples" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold mb-1 block" style={{ color: '#94a3b8' }}>User Question</label>
                    <input value={newQ} onChange={(e) => setNewQ(e.target.value)} placeholder="Enter a typical user question..." className="input-dark" />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold mb-1 block" style={{ color: '#94a3b8' }}>Ideal Answer</label>
                    <input value={newA} onChange={(e) => setNewA(e.target.value)} placeholder="Enter the ideal agent response..." className="input-dark" />
                  </div>
                </div>
                <button onClick={addExample} className="btn-primary text-xs"><Plus size={12} /> Add Training Example</button>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {examples.filter(e => e.agent === selectedAgent.type || selectedAgent.type === 'all').map((ex) => (
                    <div key={ex.id} className="flex items-start gap-2 p-2.5 rounded-md" style={{ background: '#0c1130', border: '1px solid #334155' }}>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white font-medium truncate">Q: {ex.question}</p>
                        <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>A: {ex.answer}</p>
                      </div>
                      <button onClick={() => removeExample(ex.id)} className="text-slate-400 hover:text-orange-400 transition-colors"><Trash2 size={13} /></button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'feedback' && (
              <motion.div key="feedback" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="space-y-2">
                {feedbackItems.map((item) => (
                  <div key={item.id} className="p-3 rounded-md" style={{ background: '#0c1130', border: '1px solid #334155' }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-medium" style={{ color: '#94a3b8' }}>{item.agent}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${item.status === 'applied' ? 'badge-teal' : 'badge-golden'}`}>
                          {item.status === 'applied' ? 'Applied' : 'Pending'}
                        </span>
                        <span className="text-[10px]" style={{ color: '#94a3b8' }}>{item.confidence}% confidence</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px] font-semibold mb-0.5" style={{ color: '#fb923c' }}>Agent Response</p>
                        <p className="text-xs" style={{ color: '#94a3b8' }}>{item.response}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold mb-0.5" style={{ color: '#34d399' }}>Human Correction</p>
                        <p className="text-xs text-white">{item.correction}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === 'fine-tune' && (
              <motion.div key="fine-tune" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold mb-1 block" style={{ color: '#94a3b8' }}>Model</label>
                    <select className="input-dark"><option>gpt-4o</option><option>claude-sonnet</option><option>gpt-4o-mini</option></select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold mb-1 block" style={{ color: '#94a3b8' }}>Temperature: {temp}</label>
                    <input type="range" min="0" max="2" step="0.1" value={temp} onChange={(e) => setTemp(parseFloat(e.target.value))} className="w-full" style={{ accentColor: '#177E89' }} />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold mb-1 block" style={{ color: '#94a3b8' }}>Max Tokens: {maxTokens}</label>
                    <input type="range" min="512" max="8192" step="256" value={maxTokens} onChange={(e) => setMaxTokens(parseInt(e.target.value))} className="w-full" style={{ accentColor: '#177E89' }} />
                  </div>
                </div>
                <div className="p-3 rounded-md" style={{ background: '#0c1130', border: '1px solid #334155' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-white font-medium">Training Dataset</span>
                    <span className="text-[11px]" style={{ color: '#94a3b8' }}>{selectedAgent.trainingExamples} examples</span>
                  </div>
                  <div className="w-full rounded-full h-1.5 mb-2" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-1.5 rounded-full" style={{ width: '72%', background: '#177E89' }} />
                  </div>
                  <p className="text-[11px]" style={{ color: '#94a3b8' }}>Dataset size is optimal for fine-tuning (recommended: 50-200 examples)</p>
                </div>
                <button className="btn-primary text-xs"><Zap size={12} /> Run Fine-tuning Job</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Row: Chart + Timeline */}
      <div className="grid grid-cols-2 gap-4">
        {/* Accuracy Chart */}
        <div className="card-dark p-4">
          <h3 className="section-header"><BarChart3 size={14} /> Model Accuracy Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={accuracyData}>
              <defs>
                <linearGradient id="sup" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#177E89" stopOpacity={0.3} /><stop offset="95%" stopColor="#177E89" stopOpacity={0} /></linearGradient>
                <linearGradient id="soc" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#FFC857" stopOpacity={0.3} /><stop offset="95%" stopColor="#FFC857" stopOpacity={0} /></linearGradient>
                <linearGradient id="ld" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#FC814A" stopOpacity={0.3} /><stop offset="95%" stopColor="#FC814A" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(69,33,3,0.5)" />
              <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
              <YAxis domain={[70, 100]} stroke="#64748b" fontSize={11} />
              <Tooltip contentStyle={{ background: '#141B41', border: '1px solid #334155', borderRadius: 6, fontSize: 12, color: '#fff' }} itemStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="support" stroke="#177E89" fill="url(#sup)" strokeWidth={2} name="Support" />
              <Area type="monotone" dataKey="social" stroke="#FFC857" fill="url(#soc)" strokeWidth={2} name="Social" />
              <Area type="monotone" dataKey="leads" stroke="#FC814A" fill="url(#ld)" strokeWidth={2} name="Leads" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Training Timeline */}
        <div className="card-dark p-4">
          <h3 className="section-header"><Brain size={14} /> Training History</h3>
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {trainingSessions.map((session) => (
              <div key={session.id} className="flex items-start gap-2.5">
                <div className="mt-1 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: session.status === 'completed' ? '#177E89' : '#FFC857', boxShadow: session.status === 'completed' ? '0 0 5px rgba(23,126,137,0.5)' : '0 0 5px rgba(255,200,87,0.4)' }} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white font-medium">{session.type}</span>
                    <span className="text-[10px]" style={{ color: '#94a3b8' }}>{session.time}</span>
                  </div>
                  <p className="text-[11px] mt-0.5" style={{ color: '#94a3b8' }}>{session.description}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: '#94a3b8' }}>{session.agent}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
