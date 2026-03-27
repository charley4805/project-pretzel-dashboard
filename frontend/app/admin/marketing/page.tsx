'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AnalyticsKpiCard } from '@/components/analytics/analytics-kpi-card';
import { FunnelChart } from '@/components/analytics/funnel-chart';
import { UserPlus, TrendingUp, Eye, Rocket, Search, Megaphone, RefreshCw } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';

const FALLBACK = {
  new_signups_today: 145, new_signups_delta: 12.1,
  conversion_rate: 4.2,   conversion_delta: 0.3,
  visitors_today: 3450,   visitors_delta: 8.5,
  trial_starts_today: 89, trial_delta: 15.2,
  funnel: [
    { stage: 'Visitors',        count: 45000, color: '#f59e0b' },
    { stage: 'Signups',         count: 15234, color: '#fb923c' },
    { stage: 'Onboarding',      count: 12000, color: '#a78bfa' },
    { stage: 'Profile Created', count: 4500,  color: '#34d399' },
    { stage: 'Active (DAU)',    count: 3420,  color: '#60a5fa' },
  ],
  acquisition_sources: [
    { source: 'Organic',     value: 42, color: '#f59e0b' },
    { source: 'Referral',    value: 28, color: '#a78bfa' },
    { source: 'Paid Search', value: 18, color: '#60a5fa' },
    { source: 'Social',      value: 12, color: '#34d399' },
  ],
  weekly_signups: [
    { day: 'Mon', signups: 120, knot: 28 },
    { day: 'Tue', signups: 145, knot: 32 },
    { day: 'Wed', signups: 108, knot: 19 },
    { day: 'Thu', signups: 178, knot: 41 },
    { day: 'Fri', signups: 163, knot: 37 },
    { day: 'Sat', signups: 95,  knot: 22 },
    { day: 'Sun', signups: 145, knot: 28 },
  ],
  top_search_terms: [
    { term: 'electrician near me',  count: 1842, delta: '+12%' },
    { term: 'plumber',              count: 1620, delta: '+8%'  },
    { term: 'general contractor',   count: 1310, delta: '+3%'  },
    { term: 'roofing contractor',   count: 980,  delta: '+22%' },
    { term: 'hvac repair',          count: 830,  delta: '-4%'  },
    { term: 'flooring installation',count: 720,  delta: '+18%' },
    { term: 'painting contractor',  count: 610,  delta: '+7%'  },
  ],
  campaigns: [
    { name: 'Spring Launch - Google', impressions: 84000, clicks: 2800, ctr: '3.3%', conversions: 142, cpa: '$14.50', status: 'active'  },
    { name: 'FB Contractor Drive',    impressions: 62000, clicks: 1900, ctr: '3.1%', conversions: 98,  cpa: '$19.20', status: 'active'  },
    { name: 'Retargeting - All',      impressions: 28000, clicks: 1400, ctr: '5.0%', conversions: 84,  cpa: '$11.80', status: 'active'  },
    { name: 'LinkedIn - B2B',         impressions: 15000, clicks: 420,  ctr: '2.8%', conversions: 28,  cpa: '$38.50', status: 'paused' },
  ],
};

export default function MarketingCommandCenter() {
  const [data, setData] = useState<any>(FALLBACK);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [ovRes, funnelRes, acqRes, trendsRes, searchRes, campRes] = await Promise.all([
        fetch(`${API_BASE}/admin/marketing/overview`),
        fetch(`${API_BASE}/admin/marketing/funnel`),
        fetch(`${API_BASE}/admin/marketing/acquisition`),
        fetch(`${API_BASE}/admin/marketing/trends`),
        fetch(`${API_BASE}/admin/marketing/search-terms`),
        fetch(`${API_BASE}/admin/marketing/campaigns`),
      ]);
      const [ov, funnel, acq, trends, search, camp] = await Promise.all([
        ovRes.json(), funnelRes.json(), acqRes.json(),
        trendsRes.json(), searchRes.json(), campRes.json(),
      ]);
      setData({
        ...ov,
        funnel: funnel.funnel ?? FALLBACK.funnel,
        acquisition_sources: acq.sources ?? FALLBACK.acquisition_sources,
        weekly_signups: trends.weekly ?? FALLBACK.weekly_signups,
        top_search_terms: search.terms ?? FALLBACK.top_search_terms,
        campaigns: camp.campaigns ?? FALLBACK.campaigns,
      });
    } catch {
      setData(FALLBACK);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-100 p-6 font-sans">

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
        <AnalyticsKpiCard title="New Signups Today"   value={data.new_signups_today}   delta={data.new_signups_delta}  icon={<UserPlus   size={17} className="text-amber-400"  />} loading={loading} />
        <AnalyticsKpiCard title="Conversion Rate"      value={data.conversion_rate}      delta={data.conversion_delta}   icon={<TrendingUp size={17} className="text-emerald-400" />} loading={loading} suffix="%" isDecimal />
        <AnalyticsKpiCard title="Visitors Today"       value={data.visitors_today}       delta={data.visitors_delta}     icon={<Eye        size={17} className="text-blue-400"   />} loading={loading} />
        <AnalyticsKpiCard title="Trial Starts"         value={data.trial_starts_today}   delta={data.trial_delta}        icon={<Rocket     size={17} className="text-purple-400" />} loading={loading} />
      </div>

      {/* FUNNEL + ACQUISITION */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        <div className="lg:col-span-3 bg-[#111] border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-medium text-slate-300 mb-5 flex items-center gap-2">
            <TrendingUp size={15} className="text-amber-400" /> User Acquisition Funnel
            <span className="ml-auto text-[10px] text-slate-600">Source: analytics_events + daily_rollups</span>
          </h3>
          <FunnelChart data={data.funnel} />
        </div>

        <div className="lg:col-span-2 bg-[#111] border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
            <Search size={15} className="text-orange-400" /> Acquisition Sources
            <span className="ml-auto text-[10px] text-slate-600">utm_source</span>
          </h3>
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
                    <Cell key={i} fill={entry.color} />
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
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                <span>{s.source} <span className="text-slate-600">({s.value}%)</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SIGNUP TREND + TOP SEARCH TERMS */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        <div className="lg:col-span-3 bg-[#111] border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
            <UserPlus size={15} className="text-amber-400" /> Weekly Signup Trend
            <span className="ml-auto flex items-center gap-4 text-[10px] text-slate-500">
              <span className="flex items-center gap-1.5"><span className="inline-block w-2 h-0.5 rounded bg-amber-500" /> Pretzel.io</span>
              <span className="flex items-center gap-1.5"><span className="inline-block w-2 h-0.5 rounded bg-blue-400" /> PretzelKnot</span>
            </span>
          </h3>
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
                <Line type="monotone" dataKey="knot"    stroke="#60a5fa" strokeWidth={2} dot={false} name="PretzelKnot" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 bg-[#111] border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
            <Search size={15} className="text-orange-400" /> Top Knot Search Terms
            <span className="ml-auto text-[10px] text-slate-600">PretzelKnot directory</span>
          </h3>
          <div className="space-y-2.5">
            {data.top_search_terms.map((t: any, i: number) => (
              <div key={i} className="flex items-center justify-between text-sm gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-slate-700 text-xs font-mono w-4 shrink-0 text-right">{i + 1}</span>
                  <span className="text-slate-300 truncate">{t.term}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-slate-500 text-xs font-mono">{t.count.toLocaleString()}</span>
                  <span className={`text-xs font-semibold w-10 text-right ${
                    t.delta.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'
                  }`}>{t.delta}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CAMPAIGN TABLE */}
      <div className="bg-[#111] border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
          <Megaphone size={15} className="text-amber-400" /> Campaign Performance
          <span className="ml-auto text-[10px] text-slate-600">Source: Google Ads + Meta Ads APIs</span>
        </h3>
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
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      c.status === 'active'
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
      </div>
    </div>
  );
}
