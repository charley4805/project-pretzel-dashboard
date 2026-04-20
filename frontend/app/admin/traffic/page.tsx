'use client';

import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

const SOURCE_COLORS: Record<string, string> = {
  organic: '#f59e0b', direct: '#6366f1', social: '#ec4899',
  referral: '#10b981', email: '#3b82f6',
};

function Disconnected({ label = 'Disconnected — data unavailable' }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/40 px-4 py-3 text-sm text-slate-500">
      <WifiOff size={14} className="text-red-500/60 shrink-0" />
      {label}
    </div>
  );
}

function fmtDuration(sec: number | null) {
  if (sec == null) return '—';
  return `${Math.floor(sec / 60)}m ${sec % 60}s`;
}

export default function TrafficPage() {
  const [overview, setOverview] = useState<any>(null);
  const [trend,    setTrend]    = useState<any[] | null>(null);
  const [topPages, setTopPages] = useState<any[] | null>(null);
  const [sources,  setSources]  = useState<any[] | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/admin/traffic/overview`).then(r => r.json()).catch(() => null),
      fetch(`${API}/api/admin/traffic/daily-trend`).then(r => r.json()).catch(() => null),
      fetch(`${API}/api/admin/traffic/top-pages`).then(r => r.json()).catch(() => null),
      fetch(`${API}/api/admin/traffic/sources`).then(r => r.json()).catch(() => null),
    ]).then(([ov, tr, tp, src]) => {
      setOverview(ov?.disconnected ? null : ov);
      setTrend(Array.isArray(tr) ? tr : null);
      setTopPages(Array.isArray(tp) ? tp : null);
      setSources(Array.isArray(src) ? src : null);
    });
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-6 text-white min-h-screen">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Traffic & Visitors</h1>
        <p className="text-sm text-slate-500 mt-0.5">Real-time analytics from analytics_events</p>
      </div>

      {/* OVERVIEW STATS */}
      {!overview ? (
        <Disconnected label="Traffic overview unavailable" />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Page Views Today', value: overview.page_views_today?.toLocaleString() ?? '—' },
            { label: 'Unique Visitors',  value: overview.unique_visitors_today?.toLocaleString() ?? '—' },
            { label: 'Active Now',       value: String(overview.active_now ?? '—'), highlight: true },
            { label: 'Bounce Rate',      value: overview.bounce_rate != null ? `${overview.bounce_rate}%` : '—' },
            { label: 'Avg Session',      value: fmtDuration(overview.avg_session_duration_sec) },
            { label: 'Top Referrer',     value: overview.top_referrer ?? '—' },
          ].map(({ label, value, highlight }) => (
            <div key={label} className={`rounded-xl border p-4 ${
              highlight ? 'border-amber-500/30 bg-amber-500/5' : 'border-slate-800 bg-slate-900/60'
            }`}>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider">{label}</p>
              <p className={`text-xl font-bold mt-1 ${highlight ? 'text-amber-400' : 'text-white'}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* 7-DAY TREND */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
        <h2 className="text-sm font-medium text-slate-300 mb-4">7-Day Trend</h2>
        {!trend || !trend.length ? (
          <Disconnected label="Trend data unavailable" />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trend} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="pvGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="uvGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="page_views"      stroke="#f59e0b" strokeWidth={2} fill="url(#pvGrad)" name="Page Views" />
              <Area type="monotone" dataKey="unique_visitors" stroke="#6366f1" strokeWidth={2} fill="url(#uvGrad)" name="Unique Visitors" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* TOP PAGES */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="text-sm font-medium text-slate-300 mb-4">Top Pages Today</h2>
          {!topPages || !topPages.length ? (
            <Disconnected label="Page data unavailable" />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] text-slate-500 border-b border-slate-800">
                  <th className="pb-2">Page</th>
                  <th className="pb-2 text-right">Views</th>
                  <th className="pb-2 text-right">Unique</th>
                </tr>
              </thead>
              <tbody>
                {topPages.map((p, i) => (
                  <tr key={i} className="border-b border-slate-800/50 last:border-0">
                    <td className="py-2 text-slate-300 font-mono text-xs">{p.path}</td>
                    <td className="py-2 text-right text-white">{p.views}</td>
                    <td className="py-2 text-right text-slate-400">{p.unique}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* TRAFFIC SOURCES */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="text-sm font-medium text-slate-300 mb-4">Traffic Sources</h2>
          {!sources || !sources.length ? (
            <Disconnected label="Source data unavailable" />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={sources} layout="vertical" margin={{ left: 16, right: 24 }}>
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis dataKey="source" type="category" tick={{ fontSize: 12, fill: '#94a3b8' }} width={64} />
                  <Tooltip
                    contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 12 }}
                    formatter={(v: number) => [`${v} visitors`]}
                  />
                  <Bar dataKey="visitors" radius={[0, 4, 4, 0]}>
                    {sources.map((s, i) => (
                      <Cell key={i} fill={SOURCE_COLORS[s.source] ?? '#64748b'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-1.5">
                {sources.map((s, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ background: SOURCE_COLORS[s.source] ?? '#64748b' }} />
                      <span className="text-slate-400 capitalize">{s.source}</span>
                    </div>
                    <span className="text-slate-500">{s.pct}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
