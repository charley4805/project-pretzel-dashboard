'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AnalyticsKpiCard } from '@/components/analytics/analytics-kpi-card';
import { FunnelChart } from '@/components/analytics/funnel-chart';
import { fetchAgentsOverview } from '@/lib/api';
import { UserPlus, TrendingUp, Eye, Rocket, Zap, Search, Megaphone, RefreshCw, WifiOff } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

function Disconnected({ label = 'Disconnected — data unavailable' }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/40 px-4 py-3 text-sm text-slate-500">
      <WifiOff size={14} className="text-red-500/60 shrink-0" />
      {label}
    </div>
  );
}

export default function MarketingCommandCenter() {
  const [data, setData] = useState<any>(null);
  const [agentsOverview, setAgentsOverview] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [ovRes, funnelRes, acqRes, trendsRes, searchRes, campRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/marketing/overview`),
        fetch(`${API_BASE}/api/admin/marketing/funnel`),
        fetch(`${API_BASE}/api/admin/marketing/acquisition`),
        fetch(`${API_BASE}/api/admin/marketing/trends`),
        fetch(`${API_BASE}/api/admin/marketing/search-terms`),
        fetch(`${API_BASE}/api/admin/marketing/campaigns`),
      ]);
      const [ov, funnel, acq, trends, search, camp] = await Promise.all([
        ovRes.json(), funnelRes.json(), acqRes.json(),
        trendsRes.json(), searchRes.json(), campRes.json(),
      ]);
      setData({
        ...ov,
        funnel: funnel.funnel ?? [],
        acquisition_sources: acq.sources ?? [],
        weekly_signups: trends.weekly ?? [],
        top_search_terms: search.terms ?? [],
        campaigns: camp.campaigns ?? [],
      });
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const loadAgents = async () => {
      try {
        const result = await fetchAgentsOverview();
        setAgentsOverview(result);
      } catch {
        setAgentsOverview(null);
      }
    };
    loadAgents();
  }, []);

  return (
    <div className="min-h-screen bg-pretzel-walnut text-slate-100 p-4 md:p-6 font-sans">

      {/* HEADER */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Megaphone size={20} className="text-amber-500" />
            <h1 className="text-2xl font-semibold tracking-tight text-white">Marketing Command Center</h1>
          </div>
          <p className="text-slate-500 text-sm">
            Acquisition, funnel performance &amp; growth signals — Pretzel.io + PretzelKnot
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg px-4 py-1.5 text-sm font-medium"
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* TOP KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {!data ? (
          <div className="col-span-full"><Disconnected label="Marketing data unavailable" /></div>
        ) : (
          <>
            <AnalyticsKpiCard title="New Signups Today" value={data.new_signups_today} delta={data.new_signups_delta} icon={<UserPlus size={17} className="text-amber-400" />} loading={loading} />
            <AnalyticsKpiCard title="Conversion Rate" value={data.conversion_rate} delta={data.conversion_delta} icon={<TrendingUp size={17} className="text-emerald-400" />} loading={loading} suffix="%" isDecimal />
            <AnalyticsKpiCard title="Visitors Today" value={data.visitors_today} delta={data.visitors_delta} icon={<Eye size={17} className="text-blue-400" />} loading={loading} />
            <AnalyticsKpiCard title="Trial Starts" value={data.trial_starts_today} delta={data.trial_delta} icon={<Rocket size={17} className="text-purple-400" />} loading={loading} />
          </>
        )}
      </div>

      {/* AGENT PERFORMANCE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5">
          <div className="flex items-center gap-3 mb-4">
            <Zap size={16} className="text-amber-300" />
            <h2 className="text-sm font-medium text-slate-300">Agent Assist</h2>
          </div>
          {!agentsOverview ? (
            <div className="text-sm text-slate-500">Agent performance unavailable</div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Active Agents', value: agentsOverview.summary.online, hint: 'support / social / leadgen' },
                  { label: 'Warnings', value: agentsOverview.summary.warning, hint: 'review flagged' },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl bg-slate-900/70 p-4 border border-slate-800">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500 mb-2">{item.label}</p>
                    <p className="text-2xl font-semibold text-white">{item.value}</p>
                    <p className="text-[11px] text-slate-500 mt-1">{item.hint}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-xl bg-slate-900/70 p-4 border border-slate-800">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500 mb-2">Agent Activity</p>
                <p className="text-sm text-slate-300">{agentsOverview.recent_activity?.[0]?.action ?? 'No recent activity captured'}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FUNNEL + ACQUISITION */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        <div className="lg:col-span-3 bg-pretzel-indigo border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-medium text-slate-300 mb-5 flex items-center gap-2">
            <TrendingUp size={15} className="text-amber-400" /> User Acquisition Funnel
            <span className="ml-auto text-[10px] text-slate-600">Source: analytics_events + daily_rollups</span>
          </h3>
          {!data || !data.funnel?.length ? (
            <Disconnected label="Funnel data unavailable" />
          ) : (
            <FunnelChart data={data.funnel} />
          )}
        </div>

        <div className="lg:col-span-2 bg-pretzel-indigo border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
            <Search size={15} className="text-orange-400" /> Acquisition Sources
            <span className="ml-auto text-[10px] text-slate-600">utm_source</span>
          </h3>
          {!data || !data.acquisition_sources?.length ? (
            <div className="h-44 flex items-center justify-center"><Disconnected label="Acquisition data unavailable" /></div>
          ) : (
            <>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.acquisition_sources}
                      dataKey="value"
                      nameKey="source"
                      cx="50%" cy="50%"
                      innerRadius={48} outerRadius={72}
                      paddingAngle={3}
                    >
                      {data.acquisition_sources.map((entry: any, i: number) => (
                        <Cell key={i} fill={entry.color ?? '#64748b'} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' }}
                      formatter={(v: any, name: any) => [`${v}%`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2">
                {data.acquisition_sources.map((s: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color ?? '#64748b' }} />
                    <span>{s.source} <span className="text-slate-600">({s.value}%)</span></span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* SIGNUP TREND + TOP SEARCH TERMS */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        <div className="lg:col-span-3 bg-pretzel-indigo border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
            <UserPlus size={15} className="text-amber-400" /> Weekly Signup Trend
            <span className="ml-auto flex items-center gap-4 text-[10px] text-slate-500">
              <span className="flex items-center gap-1.5"><span className="inline-block w-2 h-0.5 rounded bg-amber-500" /> Pretzel.io</span>
              <span className="flex items-center gap-1.5"><span className="inline-block w-2 h-0.5 rounded bg-blue-400" /> PretzelKnot</span>
            </span>
          </h3>
          {!data || !data.weekly_signups?.length ? (
            <div className="h-56 flex items-center justify-center"><Disconnected label="Trend data unavailable" /></div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.weekly_signups} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="day" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Line type="monotone" dataKey="signups" stroke="#f59e0b" strokeWidth={2} dot={false} name="Pretzel.io" />
                  <Line type="monotone" dataKey="knot" stroke="#60a5fa" strokeWidth={2} dot={false} name="PretzelKnot" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 bg-pretzel-indigo border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
            <Search size={15} className="text-orange-400" /> Top Knot Search Terms
            <span className="ml-auto text-[10px] text-slate-600">PretzelKnot directory</span>
          </h3>
          {!data || !data.top_search_terms?.length ? (
            <Disconnected label="Search term data unavailable" />
          ) : (
            <div className="space-y-2.5">
              {data.top_search_terms.map((t: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-sm gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-slate-700 text-xs font-mono w-4 shrink-0 text-right">{i + 1}</span>
                    <span className="text-slate-300 truncate">{t.term}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-slate-500 text-xs font-mono">{t.count.toLocaleString()}</span>
                    <span className={`text-xs font-semibold w-10 text-right ${t.delta?.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'
                      }`}>{t.delta}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CAMPAIGN TABLE */}
      <div className="bg-pretzel-indigo border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
          <Megaphone size={15} className="text-amber-400" /> Campaign Performance
          <span className="ml-auto text-[10px] text-slate-600">Source: Google Ads + Meta Ads APIs</span>
        </h3>
        {!data || !data.campaigns?.length ? (
          <Disconnected label="Campaign data unavailable" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-slate-800">
                  {['Campaign', 'Impressions', 'Clicks', 'CTR', 'Conversions', 'CPA', 'Status'].map(h => (
                    <th key={h} className="pb-3 pr-6 text-xs text-slate-500 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {data.campaigns.map((c: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-900/40">
                    <td className="py-3 pr-6 text-slate-200 font-medium whitespace-nowrap">{c.name}</td>
                    <td className="py-3 pr-6 text-slate-400 font-mono">{c.impressions.toLocaleString()}</td>
                    <td className="py-3 pr-6 text-slate-400 font-mono">{c.clicks.toLocaleString()}</td>
                    <td className="py-3 pr-6 text-slate-300 font-mono">{c.ctr}</td>
                    <td className="py-3 pr-6 text-amber-400 font-mono font-semibold">{c.conversions}</td>
                    <td className="py-3 pr-6 text-slate-300 font-mono">{c.cpa}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-slate-700/50 text-slate-500'
                        }`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

