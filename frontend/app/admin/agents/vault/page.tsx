'use client';

import { useState } from 'react'
import {
  BookOpen, Search, Plus, FileText, Folder, Tag,
  Edit2, Save, X, Grid3X3, List,
  Brain, Target, MessageSquare, Share2, CheckCircle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const vaultFolders = [
  { name: 'Product', count: 2 },
  { name: 'Sales', count: 1 },
  { name: 'Support', count: 1 },
  { name: 'Marketing', count: 3 },
  { name: 'Engineering', count: 1 },
]

const folderColors: Record<string, { color: string; bg: string }> = {
  Product: { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  Sales: { color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  Support: { color: '#fbbf24', bg: 'rgba(255,200,87,0.12)' },
  Marketing: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  Engineering: { color: '#fb923c', bg: 'rgba(252,129,74,0.12)' },
}

const vaultDocs = [
  { id: 'v1', title: 'Product Overview — Pretzel.io', folder: 'Product', tags: ['overview', 'platform', 'fastapi'], lastModified: '2d ago', size: '24 KB', content: '# Pretzel.io Platform\n\nPretzel.io is a contractor management platform built on FastAPI + Supabase.', linkedAgents: ['support-1', 'leads-1'] },
  { id: 'v2', title: 'Pricing & Plans', folder: 'Sales', tags: ['pricing', 'plans', 'billing'], lastModified: '1w ago', size: '8 KB', content: '# Pricing\n\n## Free Plan\n- Up to 3 projects', linkedAgents: ['support-1', 'social-1'] },
  { id: 'v3', title: 'Common Support Issues', folder: 'Support', tags: ['troubleshooting', 'faq', 'support'], lastModified: '3d ago', size: '45 KB', content: '# Common Issues\n\n## Login Problems\n- Clear browser cache', linkedAgents: ['support-1'] },
  { id: 'v4', title: 'Brand Voice Guidelines', folder: 'Marketing', tags: ['brand', 'voice', 'social'], lastModified: '5d ago', size: '12 KB', content: '# Brand Voice\n\n## Tone\n- Professional but approachable', linkedAgents: ['social-1'] },
  { id: 'v5', title: 'Competitor Analysis', folder: 'Marketing', tags: ['competitors', 'market', 'positioning'], lastModified: '2w ago', size: '31 KB', content: '# Competitors\n\n## Procore\nStrengths: Enterprise-focused', linkedAgents: ['leads-1', 'social-1'] },
  { id: 'v6', title: 'API Documentation', folder: 'Engineering', tags: ['api', 'docs', 'technical'], lastModified: '1d ago', size: '156 KB', content: '# API Reference\n\n## Authentication\nBearer token via /auth/token', linkedAgents: ['support-1'] },
  { id: 'v7', title: 'Onboarding Flow', folder: 'Product', tags: ['onboarding', 'ux', 'product'], lastModified: '4d ago', size: '18 KB', content: '# Onboarding\n\n## Steps\n1. Sign up (email or OAuth)', linkedAgents: ['support-1', 'leads-1'] },
  { id: 'v8', title: 'Customer Personas', folder: 'Marketing', tags: ['personas', 'icp', 'leads'], lastModified: '1w ago', size: '22 KB', content: '# Personas\n\n## Primary: General Contractor', linkedAgents: ['leads-1', 'social-1'] },
]

function getAgentColor(type: string) {
  switch (type) {
    case 'support': return 'text-blue-400 bg-blue-500/100/10 border-blue-500/20'
    case 'social': return 'text-violet-400 bg-violet-500/100/10 border-violet-500/20'
    case 'leads': return 'text-amber-400 bg-amber-500/100/10 border-amber-500/20'
    default: return 'text-slate-400 bg-slate-800/500/10 border-slate-500/20'
  }
}

type ViewMode = 'grid' | 'list'
type DocType = typeof vaultDocs[0]

export default function ObsidianVault() {
  const [activeFolder, setActiveFolder] = useState('All')
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [editingDoc, setEditingDoc] = useState<DocType | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [docs, setDocs] = useState(vaultDocs)

  const filtered = docs.filter((d) => {
    const matchFolder = activeFolder === 'All' || d.folder === activeFolder
    const matchSearch = d.title.toLowerCase().includes(search.toLowerCase()) || d.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
    return matchFolder && matchSearch
  })

  const openEditor = (doc: DocType) => { setEditingDoc({ ...doc }); setIsCreating(false) }
  const createNew = () => {
    setEditingDoc({ id: `new-${Date.now()}`, title: '', folder: activeFolder === 'All' ? 'Product' : activeFolder, tags: [], lastModified: 'Just now', size: '0 KB', content: '# New Document\n\nStart writing...', linkedAgents: [] })
    setIsCreating(true)
  }
  const saveDoc = () => {
    if (editingDoc) {
      if (isCreating) setDocs([...docs, { ...editingDoc, id: `v${Date.now()}` }])
      else setDocs(docs.map(d => d.id === editingDoc.id ? { ...editingDoc, lastModified: 'Just now' } : d))
      setEditingDoc(null); setIsCreating(false)
    }
  }
  const getAgentIcon = (agentId: string) => {
    if (agentId === 'support-1') return <MessageSquare size={10} />
    if (agentId === 'social-1') return <Share2 size={10} />
    if (agentId === 'leads-1') return <Target size={10} />
    return <Brain size={10} />
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Documents', value: docs.length, icon: FileText, color: '#fbbf24' },
          { label: 'Linked to Agents', value: docs.filter(d => d.linkedAgents.length > 0).length, icon: Brain, color: '#34d399' },
          { label: 'Last Updated', value: 'Just now', icon: Tag, color: '#fb923c' },
          { label: 'Coverage', value: '94%', icon: CheckCircle, color: '#10b981' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03, duration: 0.2 }} className="metric-card">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-medium" style={{ color: '#94a3b8' }}>{stat.label}</span>
              <stat.icon size={16} style={{ color: stat.color }} />
            </div>
            <div className="text-xl font-bold text-white">{stat.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Folder Tabs */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <button onClick={() => setActiveFolder('All')} className="px-3 py-2 rounded-md text-xs font-semibold transition-all" style={{ background: activeFolder === 'All' ? 'rgba(255,200,87,0.1)' : 'transparent', color: activeFolder === 'All' ? '#FFC857' : '#64748b', border: activeFolder === 'All' ? '1px solid rgba(255,200,87,0.25)' : '1px solid transparent' }}>All Documents</button>
        {vaultFolders.map((folder) => (
          <button key={folder.name} onClick={() => setActiveFolder(folder.name)} className="flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold transition-all" style={{ background: activeFolder === folder.name ? folderColors[folder.name].bg : 'transparent', color: activeFolder === folder.name ? folderColors[folder.name].color : '#64748b', border: activeFolder === folder.name ? `1px solid ${folderColors[folder.name].color}40` : '1px solid transparent' }}>
            <Folder size={12} />{folder.name}<span className="text-[10px] opacity-70">({folder.count})</span>
          </button>
        ))}
      </div>

      {/* Search + View + Add */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#94a3b8' }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search documents, tags..." className="input-dark pl-8" />
        </div>
        <div className="flex items-center rounded-md p-0.5" style={{ background: '#1c2658', border: '1px solid #334155' }}>
          <button onClick={() => setViewMode('grid')} className="p-1.5 rounded transition-colors" style={{ color: viewMode === 'grid' ? '#FFC857' : '#64748b', background: viewMode === 'grid' ? 'rgba(255,200,87,0.1)' : 'transparent' }}><Grid3X3 size={14} /></button>
          <button onClick={() => setViewMode('list')} className="p-1.5 rounded transition-colors" style={{ color: viewMode === 'list' ? '#FFC857' : '#64748b', background: viewMode === 'list' ? 'rgba(255,200,87,0.1)' : 'transparent' }}><List size={14} /></button>
        </div>
        <button onClick={createNew} className="btn-primary text-xs"><Plus size={12} /> New Document</button>
      </div>

      {/* Document Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-4 gap-3">
          <AnimatePresence>
            {filtered.map((doc) => (
              <motion.div key={doc.id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ y: -2 }} transition={{ duration: 0.15 }} className="card-dark p-3 group cursor-pointer" onClick={() => openEditor(doc)}>
                <div className="flex items-start justify-between mb-2">
                  <div className="p-1.5 rounded-md" style={{ background: folderColors[doc.folder]?.bg || 'rgba(255,255,255,0.06)', color: folderColors[doc.folder]?.color || '#94a3b8' }}><FileText size={14} /></div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity"><button className="p-1" style={{ color: '#94a3b8' }}><Edit2 size={12} /></button></div>
                </div>
                <h4 className="text-xs font-semibold text-white mb-1 line-clamp-1">{doc.title}</h4>
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-[9px] px-1 py-0.5 rounded font-semibold" style={{ background: folderColors[doc.folder]?.bg || 'rgba(255,255,255,0.06)', color: folderColors[doc.folder]?.color || '#94a3b8', border: `1px solid ${folderColors[doc.folder]?.color || '#94a3b8'}30` }}>{doc.folder}</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {doc.tags.map((tag) => (<span key={tag} className="text-[9px] px-1 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}>{tag}</span>))}
                </div>
                <div className="flex items-center justify-between text-[10px]" style={{ color: '#94a3b8' }}><span>{doc.lastModified}</span><span>{doc.size}</span></div>
                {doc.linkedAgents.length > 0 && (
                  <div className="flex items-center gap-1 mt-2 pt-2" style={{ borderTop: '1px solid #452103' }}>
                    <span className="text-[9px]" style={{ color: '#94a3b8' }}>Used by:</span>
                    {doc.linkedAgents.map((agentId) => (<div key={agentId} className={`w-4 h-4 rounded flex items-center justify-center ${getAgentColor(agentId === 'support-1' ? 'support' : agentId === 'social-1' ? 'social' : 'leads')}`}>{getAgentIcon(agentId)}</div>))}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="card-dark overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: '1px solid #452103', color: '#94a3b8' }}>
                <th className="p-3 font-medium text-left">Document</th>
                <th className="p-3 font-medium text-left">Folder</th>
                <th className="p-3 font-medium text-left">Tags</th>
                <th className="p-3 font-medium text-left">Linked Agents</th>
                <th className="p-3 font-medium text-left">Modified</th>
                <th className="p-3 font-medium text-left">Size</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-900/40/[0.02] transition-colors cursor-pointer" style={{ borderBottom: '1px solid #452103' }} onClick={() => openEditor(doc)}>
                  <td className="p-3"><div className="flex items-center gap-2"><div className="p-1 rounded" style={{ background: folderColors[doc.folder]?.bg || 'rgba(255,255,255,0.06)', color: folderColors[doc.folder]?.color || '#94a3b8' }}><FileText size={12} /></div><span className="text-xs text-white font-medium">{doc.title}</span></div></td>
                  <td className="p-3"><span className="text-[9px] px-1.5 py-0.5 rounded font-semibold" style={{ background: folderColors[doc.folder]?.bg || 'rgba(255,255,255,0.06)', color: folderColors[doc.folder]?.color || '#94a3b8', border: `1px solid ${folderColors[doc.folder]?.color || '#94a3b8'}30` }}>{doc.folder}</span></td>
                  <td className="p-3"><div className="flex flex-wrap gap-1">{doc.tags.map(t => (<span key={t} className="text-[9px] px-1 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}>{t}</span>))}</div></td>
                  <td className="p-3"><div className="flex items-center gap-1">{doc.linkedAgents.map((agentId) => (<div key={agentId} className={`w-4 h-4 rounded flex items-center justify-center ${getAgentColor(agentId === 'support-1' ? 'support' : agentId === 'social-1' ? 'social' : 'leads')}`}>{getAgentIcon(agentId)}</div>))}</div></td>
                  <td className="p-3" style={{ color: '#94a3b8' }}>{doc.lastModified}</td>
                  <td className="p-3" style={{ color: '#94a3b8' }}>{doc.size}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Knowledge Graph */}
      <div className="card-dark p-4">
        <h3 className="section-header"><Brain size={14} /> Knowledge Graph</h3>
        <div className="flex items-center gap-6">
          <div className="flex flex-col gap-2">
            {[{ id: 'support-1', name: 'Support Agent', color: '#3b82f6', icon: MessageSquare }, { id: 'social-1', name: 'Social Bot', color: '#8b5cf6', icon: Share2 }, { id: 'leads-1', name: 'Lead Scout', color: '#fbbf24', icon: Target }].map((agent) => (
              <div key={agent.id} className="flex items-center gap-2"><div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: agent.color }}><agent.icon size={12} className="text-white" /></div><span className="text-xs text-white">{agent.name}</span></div>
            ))}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap gap-2">
              {docs.filter(d => d.linkedAgents.length > 0).map((doc) => (
                <div key={doc.id} className="flex items-center gap-2 p-2 rounded-md" style={{ background: '#0c1130', border: '1px solid #334155' }}>
                  <FileText size={11} style={{ color: '#94a3b8' }} />
                  <span className="text-[11px]" style={{ color: '#94a3b8' }}>{doc.title}</span>
                  <div className="flex gap-0.5">{doc.linkedAgents.map((agentId) => (<div key={agentId} className="w-1.5 h-1.5 rounded-full" style={{ background: agentId === 'support-1' ? '#3b82f6' : agentId === 'social-1' ? '#8b5cf6' : '#FFC857' }} />))}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Editor Modal */}
      <AnimatePresence>
        {editingDoc && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={() => { setEditingDoc(null); setIsCreating(false) }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ duration: 0.2 }} className="card-dark w-full max-w-4xl h-[80vh] flex flex-col" style={{ background: '#1c2658' }} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 shrink-0" style={{ borderBottom: '1px solid #452103' }}>
                <div className="flex items-center gap-3 flex-1">
                  <input value={editingDoc.title} onChange={(e) => setEditingDoc({ ...editingDoc, title: e.target.value })} placeholder="Document title..." className="input-dark flex-1 text-sm font-semibold" />
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={saveDoc} className="btn-primary text-xs"><Save size={12} /> Save</button>
                  <button onClick={() => { setEditingDoc(null); setIsCreating(false) }} className="btn-secondary text-xs px-2.5 py-1.5"><X size={12} /></button>
                </div>
              </div>
              <div className="flex flex-1 overflow-hidden">
                <div className="w-56 border-r p-3 space-y-3 overflow-y-auto shrink-0" style={{ borderColor: '#334155' }}>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block" style={{ color: '#94a3b8' }}>Folder</label>
                    <select value={editingDoc.folder} onChange={(e) => setEditingDoc({ ...editingDoc, folder: e.target.value })} className="select-dark">{vaultFolders.map(f => <option key={f.name} value={f.name}>{f.name}</option>)}</select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block" style={{ color: '#94a3b8' }}>Tags</label>
                    <input value={editingDoc.tags.join(', ')} onChange={(e) => setEditingDoc({ ...editingDoc, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })} placeholder="tag1, tag2" className="input-dark" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block" style={{ color: '#94a3b8' }}>Linked Agents</label>
                    <div className="space-y-1.5">
                      {[{ id: 'support-1', name: 'Support Agent', type: 'support' }, { id: 'social-1', name: 'Social Bot', type: 'social' }, { id: 'leads-1', name: 'Lead Scout', type: 'leads' }].map((agent) => (
                        <label key={agent.id} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={editingDoc.linkedAgents.includes(agent.id)} onChange={(e) => { const linked = new Set(editingDoc.linkedAgents); if (e.target.checked) linked.add(agent.id); else linked.delete(agent.id); setEditingDoc({ ...editingDoc, linkedAgents: Array.from(linked) }) }} className="rounded w-3.5 h-3.5" style={{ accentColor: '#177E89' }} />
                          <div className={`w-4 h-4 rounded flex items-center justify-center ${getAgentColor(agent.type)}`}>{agent.type === 'support' ? <MessageSquare size={8} /> : agent.type === 'social' ? <Share2 size={8} /> : <Target size={8} />}</div>
                          <span className="text-xs" style={{ color: '#94a3b8' }}>{agent.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex-1 flex">
                  <textarea value={editingDoc.content} onChange={(e) => setEditingDoc({ ...editingDoc, content: e.target.value })} className="flex-1 p-4 resize-none focus:outline-none text-xs leading-relaxed" style={{ background: '#0c1130', color: '#94a3b8', fontFamily: "'Inter', sans-serif" }} spellCheck={false} />
                  <div className="w-64 border-l p-3 overflow-y-auto shrink-0" style={{ borderColor: '#334155' }}>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: '#94a3b8' }}>Preview</h4>
                    <div className="text-xs whitespace-pre-wrap" style={{ color: '#94a3b8' }}>{editingDoc.content}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
