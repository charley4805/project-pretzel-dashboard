'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Zap, MessageCircle, Clock, ThumbsUp,
  Headphones, Share2, Target,
  TrendingUp, TrendingDown,
  PlusCircle, PenSquare, Crosshair, PauseCircle, BarChart3, Settings,
  Server, Layers, Brain, Database, Radio, Search,
  ChevronRight, RefreshCw, ChevronDown,
} from 'lucide-react';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  activities as mockActivities, performanceData, sparklineData,
  hourlyBreakdown, agentGroupSparklines,
  type AgentType,
} from '@/lib/mockData';
import { fetchAgentsOverview } from '@/lib/api';

/* ─── Animation Variants ─── */
const cardStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const cardFadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } },
};

const itemStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.03 } },
};

const itemFade = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } },
};

/* ─── KPI Cards ─── */
const kpiCards = [
  { label: 'Agents Online', value: '12/15', icon: Zap, iconColor: '#177E89', iconBg: 'rgba(23,126,137,0.12)', trend: '+8%', trendUp: true, sparkline: sparklineData.activeAgents, nav: '/settings' },
  { label: 'Live Conversations', value: '47', icon: MessageCircle, iconColor: '#0ea5e9', iconBg: '#e0f2fe', trend: '+23%', trendUp: true, sparkline: sparklineData.conversations, nav: '/support' },
  { label: 'Avg Response', value: '1m 42s', icon: Clock, iconColor: '#177E89', iconBg: '#d1fae5', trend: '-18%', trendUp: true, sparkline: sparklineData.responseTime, nav: '/support' },
  { label: 'CSAT Score', value: '94.2%', icon: ThumbsUp, iconColor: '#FFC857', iconBg: 'rgba(255,200,87,0.12)', trend: '+2.1%', trendUp: true, sparkline: sparklineData.satisfaction, nav: '/support' },
];

/* ─── Agent Groups ─── */
interface AgentGroup {
  type: AgentType;
  label: string;
  icon: typeof Headphones;
  iconColor: string;
  total: number;
  active: number;
  warning: number;
  error: number;
  avatarIndices: number[];
  sparkline: number[];
}

const agentGroups: AgentGroup[] = [
  { type: 'support', label: 'Support Agents', icon: Headphones, iconColor: '#177E89', total: 6, active: 4, warning: 1, error: 1, avatarIndices: [1, 2, 3, 4], sparkline: agentGroupSparklines.support },
  { type: 'social', label: 'Social Agents', icon: Share2, iconColor: '#0ea5e9', total: 4, active: 3, warning: 1, error: 0, avatarIndices: [5, 3, 1, 6], sparkline: agentGroupSparklines.social },
  { type: 'leadgen', label: 'Lead Gen Agents', icon: Target, iconColor: '#177E89', total: 5, active: 4, warning: 1, error: 0, avatarIndices: [2, 4, 6, 5], sparkline: agentGroupSparklines.leadgen },
];

/* ─── Quick Actions ─── */
const quickActions = [
  { icon: PlusCircle, label: 'New Ticket', desc: 'Create manual support ticket' },
  { icon: PenSquare, label: 'Compose Post', desc: 'Write a social media post' },
  { icon: Crosshair, label: 'Add Target', desc: 'Add a new scan source' },
  { icon: PauseCircle, label: 'Pause Agent', desc: 'Temporarily halt an agent' },
  { icon: BarChart3, label: 'Reports', desc: 'View full analytics reports' },
  { icon: Settings, label: 'Configure', desc: 'Edit agent settings' },
];

/* ─── System Health ─── */
const healthServices = [
  { name: 'API Gateway', status: 'Online', icon: Server, color: '#34d399' },
  { name: 'Message Queue', status: 'Online', icon: Layers, color: '#34d399' },
  { name: 'LLM Provider', status: 'Online', icon: Brain, color: '#34d399' },
  { name: 'Database', status: 'Degraded', icon: Database, color: '#fbbf24' },
  { name: 'WebSocket', status: 'Online', icon: Radio, color: '#34d399' },
  { name: 'Search Index', status: 'Online', icon: Search, color: '#34d399' },
];

const resources = [
  { label: 'CPU', value: 42, color: '#34d399' },
  { label: 'Memory', value: 67, color: '#fbbf24' },
  { label: 'Disk', value: 23, color: '#34d399' },
  { label: 'Network', value: 78, color: '#fbbf24' },
];

/* ─── Activity Feed Filter ─── */
type ActivityFilter = 'all' | 'support' | 'social' | 'leadgen';

const agentTypeColors: Record<AgentType, string> = {
  support: 'rgba(23,126,137,0.12)',
  social: '#e0f2fe',
  leadgen: '#d1fae5',
};

const agentTypeIconColors: Record<AgentType, string> = {
  support: '#177E89',
  social: '#0ea5e9',
  leadgen: '#177E89',
};

export default function Overview() {
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>('all');
  const [expandedBreakdown, setExpandedBreakdown] = useState<string | null>('support');
  const [recentActivity, setRecentActivity] = useState(mockActivities);

  useEffect(() => {
    fetchAgentsOverview()
      .then(data => setRecentActivity(data.recent_activity ?? mockActivities))
      .catch(() => setRecentActivity(mockActivities));
  }, []);

  const filteredActivities = activityFilter === 'all'
    ? recentActivity
    : recentActivity.filter(a => a.agentType === activityFilter);

  return (
    <div className="p-8">
      {/* Subtitle */}
      <p className="text-sm text-slate-500 mb-6">Real-time overview of your agent fleet</p>

      {/* ─── KPI Cards Row ─── */}
      <motion.div
        variants={cardStagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6"
      >
        {kpiCards.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            variants={cardFadeUp}
            className="bg-slate-900/40 rounded-xl shadow-card p-5 cursor-pointer hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: kpi.iconBg }}
              >
                <kpi.icon size={20} style={{ color: kpi.iconColor }} />
              </div>
              <div className="flex items-center gap-1">
                {kpi.trendUp ? (
                  <TrendingUp size={14} className="text-emerald-500" />
                ) : (
                  <TrendingDown size={14} className="text-red-500" />
                )}
                <span className={`text-xs font-semibold ${kpi.trendUp ? 'text-emerald-600' : 'text-red-600'}`}>
                  {kpi.trend}
                </span>
              </div>
            </div>
            <div className="text-[32px] font-bold text-slate-100 leading-tight tracking-tight">{kpi.value}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-0.5">{kpi.label}</div>
            <div className="mt-3 h-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={kpi.sparkline.map((v, i) => ({ v, i }))}>
                  <defs>
                    <linearGradient id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={kpi.iconColor} stopOpacity={0.15} />
                      <stop offset="100%" stopColor={kpi.iconColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke={kpi.iconColor}
                    strokeWidth={2}
                    fill={`url(#grad-${i})`}
                    isAnimationActive
                    animationDuration={600}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ─── Two Column Layout ─── */}
      <div className="flex flex-col xl:flex-row gap-6">
        {/* LEFT COLUMN (65%) */}
        <div className="xl:w-[65%] space-y-6">

          {/* Agent Fleet Status */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
            className="bg-slate-900/40 rounded-xl shadow-card p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-slate-100">Agent Fleet Status</h2>
                <span className="flex items-center gap-1.5 ml-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500/100" />
                  </span>
                  <span className="text-xs text-slate-500">Live</span>
                </span>
              </div>
              <button className="p-1.5 rounded-lg hover:bg-slate-800/50 text-slate-400 hover:text-slate-400 transition-colors">
                <RefreshCw size={16} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {agentGroups.map((group, gi) => (
                <motion.div
                  key={group.type}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.25 + gi * 0.08, type: 'spring', stiffness: 300, damping: 25 }}
                  className="rounded-lg border border-slate-800 p-4 hover:bg-slate-800/50 transition-colors duration-150 cursor-pointer group"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <group.icon size={22} style={{ color: group.iconColor }} />
                    <span className="text-sm font-semibold text-slate-100">{group.label}</span>
                    <span className="ml-auto text-xs font-semibold bg-slate-800/50 text-slate-400 px-2 py-0.5 rounded-md">
                      {group.total}
                    </span>
                  </div>
                  {/* Avatar stack */}
                  <div className="flex items-center mb-3">
                    <div className="flex -space-x-2">
                      {group.avatarIndices.map((ai) => (
                        <img
                          key={ai}
                          src={`/avatar-${ai}.jpg`}
                          alt=""
                          className="w-7 h-7 rounded-full border-2 border-white object-cover"
                        />
                      ))}
                    </div>
                    {group.total > group.avatarIndices.length && (
                      <div className="w-7 h-7 rounded-full bg-slate-800/50 border-2 border-white flex items-center justify-center text-[10px] font-semibold text-slate-500 ml-[-4px]">
                        +{group.total - group.avatarIndices.length}
                      </div>
                    )}
                  </div>
                  {/* Status bar */}
                  <div className="h-1 rounded-full bg-slate-800/50 overflow-hidden flex mb-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(group.active / group.total) * 100}%` }}
                      transition={{ delay: 0.4 + gi * 0.1, duration: 0.6, ease: 'easeOut' }}
                      className="h-full bg-emerald-500/100"
                    />
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(group.warning / group.total) * 100}%` }}
                      transition={{ delay: 0.5 + gi * 0.1, duration: 0.6, ease: 'easeOut' }}
                      className="h-full bg-amber-500/100"
                    />
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(group.error / group.total) * 100}%` }}
                      transition={{ delay: 0.6 + gi * 0.1, duration: 0.6, ease: 'easeOut' }}
                      className="h-full bg-red-500/100"
                    />
                  </div>
                  {/* Stats */}
                  <div className="flex gap-3 text-xs">
                    <span className="text-emerald-600 font-medium">Active: {group.active}</span>
                    {group.warning > 0 && <span className="text-amber-600 font-medium">Warning: {group.warning}</span>}
                    {group.error > 0 && <span className="text-red-600 font-medium">Error: {group.error}</span>}
                  </div>
                  {/* Mini sparkline */}
                  <div className="mt-3 h-8">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={group.sparkline.map((v, i) => ({ v, i }))}>
                        <defs>
                          <linearGradient id={`ggrad-${gi}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={group.iconColor} stopOpacity={0.12} />
                            <stop offset="100%" stopColor={group.iconColor} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area
                          type="monotone"
                          dataKey="v"
                          stroke={group.iconColor}
                          strokeWidth={1.5}
                          fill={`url(#ggrad-${gi})`}
                          isAnimationActive
                          animationDuration={500}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Performance Trends Chart */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
            className="bg-slate-900/40 rounded-xl shadow-card p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-slate-100">Performance Trends</h2>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-800/50 hover:bg-slate-800/50 px-3 py-1.5 rounded-lg transition-colors">
                  Last 7 days
                  <ChevronDown size={14} />
                </button>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1c2658" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 300]} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#0f172a', borderRadius: 8, border: '1px solid #334155', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: 12 }}
                    labelStyle={{ color: '#94a3b8', fontSize: 12 }}
                  />
                  <Line yAxisId="left" type="monotone" dataKey="conversations" name="Conversations" stroke="#177E89" strokeWidth={2} dot={false} animationDuration={800} />
                  <Line yAxisId="left" type="monotone" dataKey="resolved" name="Resolved" stroke="#0ea5e9" strokeWidth={2} dot={false} animationDuration={800} />
                  <Line yAxisId="right" type="monotone" dataKey="responseTime" name="Response Time (s)" stroke="#177E89" strokeWidth={2} strokeDasharray="6 4" dot={false} animationDuration={800} />
                  <Line yAxisId="left" type="monotone" dataKey="escalationRate" name="Escalation %" stroke="#FFC857" strokeWidth={2} strokeDasharray="3 3" dot={false} animationDuration={800} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-3">
              {[
                { label: 'Conversations', color: '#34d399', style: 'solid' },
                { label: 'Resolved', color: '#38bdf8', style: 'solid' },
                { label: 'Response Time', color: '#34d399', style: 'dashed' },
                { label: 'Escalation Rate', color: '#fbbf24', style: 'dotted' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="w-3 h-0.5 rounded" style={{ backgroundColor: item.color, borderTop: item.style !== 'solid' ? `2px ${item.style} ${item.color}` : undefined, background: item.style !== 'solid' ? 'transparent' : item.color }} />
                  {item.label}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Agent Breakdown Cards */}
          <motion.div
            variants={cardStagger}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {([
              { type: 'support', label: 'Support Agent Breakdown', icon: Headphones, iconColor: '#177E89', data: hourlyBreakdown.support, metrics: { h1: 'Handled: 84', h2: 'Success Rate: 91%', h3: 'Avg Time: 3.2m' }, actions: ['Resolved billing inquiry — 2m ago', 'Escalated technical issue to L2 — 5m ago', 'Closed duplicate ticket — 8m ago'] },
              { type: 'social', label: 'Social Media Agent Breakdown', icon: Share2, iconColor: '#0ea5e9', data: hourlyBreakdown.social, metrics: { h1: 'Posts: 95', h2: 'Engagement: 6.8%', h3: 'Reach: 12.4K' }, actions: ['Published LinkedIn article — 1m ago', 'Replied to Twitter mention — 4m ago', 'Scheduled Instagram post — 12m ago'] },
              { type: 'leadgen', label: 'Lead Gen Agent Breakdown', icon: Target, iconColor: '#177E89', data: hourlyBreakdown.leadgen, metrics: { h1: 'Scanned: 378', h2: 'Qualified: 47', h3: 'Conversion: 12.4%' }, actions: ['New lead from Reddit r/SaaS — 30s ago', 'Qualified prospect on IndieHackers — 3m ago', 'Outreach sent to ProductHunt user — 7m ago'] },
            ] as const).map((section) => {
              const isExpanded = expandedBreakdown === section.type;
              return (
                <motion.div
                  key={section.type}
                  variants={cardFadeUp}
                  className="bg-slate-900/40 rounded-xl shadow-card overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedBreakdown(isExpanded ? null : section.type)}
                    className="w-full flex items-center justify-between p-5 hover:bg-slate-800/50/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <section.icon size={20} style={{ color: section.iconColor }} />
                      <span className="text-sm font-semibold text-slate-100">{section.label}</span>
                    </div>
                    <motion.div
                      animate={{ rotate: isExpanded ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight size={18} className="text-slate-400" />
                    </motion.div>
                  </button>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="px-5 pb-5 border-t border-slate-50"
                    >
                      {/* Mini bar chart */}
                      <div className="mt-4 h-28">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={section.data.map((v, i) => ({ v, h: `${i + 8}am` }))}>
                            <XAxis dataKey="h" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={1} />
                            <Tooltip
                              contentStyle={{ borderRadius: 6, border: '1px solid #334155', fontSize: 12 }}
                              cursor={{ fill: 'transparent' }}
                            />
                            <Bar dataKey="v" fill={section.iconColor} radius={[3, 3, 0, 0]} animationDuration={500} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      {/* Metrics */}
                      <div className="flex gap-6 mt-3 mb-3">
                        {Object.values(section.metrics).map(m => (
                          <span key={m} className="text-xs font-semibold text-slate-400">{m}</span>
                        ))}
                      </div>
                      {/* Recent actions */}
                      <ul className="space-y-1">
                        {section.actions.map(a => (
                          <li key={a} className="text-xs text-slate-500">{a}</li>
                        ))}
                      </ul>
                      <button className="mt-3 text-xs font-medium text-emerald-400 hover:text-emerald-400 flex items-center gap-1">
                        View Details <ChevronRight size={12} />
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* RIGHT COLUMN (35%) */}
        <div className="xl:w-[35%] space-y-6">

          {/* Activity Feed */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
            className="bg-slate-900/40 rounded-xl shadow-card p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-slate-100">Activity Feed</h2>
                <span className="flex items-center gap-1.5 ml-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500/100" />
                  </span>
                  <span className="text-xs text-slate-500">Live</span>
                </span>
              </div>
              <select
                value={activityFilter}
                onChange={e => setActivityFilter(e.target.value as ActivityFilter)}
                className="text-xs bg-slate-800/50 border border-slate-800 rounded-lg px-2 py-1 text-slate-400 outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="all">All</option>
                <option value="support">Support</option>
                <option value="social">Social</option>
                <option value="leadgen">Lead Gen</option>
              </select>
            </div>
            <motion.div
              variants={itemStagger}
              initial="hidden"
              animate="show"
              className="space-y-0 max-h-[480px] overflow-y-auto pr-1"
              style={{ scrollbarWidth: 'thin' }}
            >
              {filteredActivities.map((act) => (
                <motion.div
                  key={act.id}
                  variants={itemFade}
                  className="flex gap-3 py-2.5 border-l-2 border-slate-800 ml-3 pl-4 relative"
                >
                  {/* Timeline dot */}
                  <div
                    className="absolute -left-[9px] top-3 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center"
                    style={{ backgroundColor: agentTypeColors[act.agentType] }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: agentTypeIconColors[act.agentType] }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-100 leading-snug">
                      <span className="font-semibold">{act.agentName}</span> — {act.action}
                    </p>
                    <p className="text-[13px] text-slate-500 mt-0.5 leading-snug">{act.detail}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-400">{act.timestamp}</span>
                      {act.badge && (
                        <span
                          className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
                          style={{
                            backgroundColor: act.badgeColor === 'emerald' ? '#d1fae5' : act.badgeColor === 'amber' ? 'rgba(255,200,87,0.12)' : act.badgeColor === 'red' ? 'rgba(252,129,74,0.12)' : 'rgba(23,126,137,0.12)',
                            color: act.badgeColor === 'emerald' ? '#065f46' : act.badgeColor === 'amber' ? '#FFC857' : act.badgeColor === 'red' ? '#FC814A' : '#5b21b6',
                          }}
                        >
                          {act.badge}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            variants={cardStagger}
            initial="hidden"
            animate="show"
            className="bg-slate-900/40 rounded-xl shadow-card p-5"
          >
            <h2 className="text-base font-semibold text-slate-100 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <motion.button
                  key={action.label}
                  variants={{
                    hidden: { opacity: 0, scale: 0.95 },
                    show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 25 } },
                  }}
                  whileHover={{ y: -1, backgroundColor: '#1e293b' }}
                  whileTap={{ scale: 0.97 }}
                  className="flex flex-col items-center justify-center gap-2 bg-slate-800/50 rounded-xl p-4 min-h-[80px] transition-colors duration-150"
                >
                  <action.icon size={24} className="text-emerald-400" />
                  <span className="text-[13px] font-medium text-slate-100">{action.label}</span>
                  <span className="text-[11px] text-slate-500 text-center leading-tight">{action.desc}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* System Health */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
            className="bg-slate-900/40 rounded-xl shadow-card p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-slate-100">System Health</h2>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-400">99.97%</span>
            </div>
            {/* Services */}
            <div className="space-y-2.5">
              {healthServices.map((svc, si) => (
                <motion.div
                  key={svc.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + si * 0.04 }}
                  className="flex items-center gap-3"
                >
                  <svc.icon size={16} className="text-slate-400" />
                  <span className="text-[13px] font-medium text-slate-300 flex-1">{svc.name}</span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: svc.color }} />
                    <span className="text-xs text-slate-500">{svc.status}</span>
                  </span>
                </motion.div>
              ))}
            </div>
            {/* Resources */}
            <div className="mt-5 pt-4 border-t border-slate-800 space-y-3">
              {resources.map((res, ri) => (
                <div key={res.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">{res.label}</span>
                    <span className="font-semibold text-slate-300">{res.value}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#0a0a0a] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${res.value}%` }}
                      transition={{ delay: 0.6 + ri * 0.1, duration: 0.6, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: res.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
