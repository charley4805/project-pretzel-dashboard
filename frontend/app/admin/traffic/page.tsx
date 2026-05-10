'use client';

import { useEffect, useState } from 'react';
import { WifiOff, Zap } from 'lucide-react';
import { fetchAgentsOverview } from '@/lib/api';
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

function SourceDot({ source }: { source?: string }) {
  if (source === 'knot') {
    return <span className="inline-block h-2 w-2 rounded-full bg-blue-500" title="PretzelKnot" />;
  }
  if (source === 'pretzel') {
    return <span className="inline-block h-2 w-2 rounded-full bg-amber-500" title="Pretzel.io" />;
  }
  if (source === 'both') {
    return (
      <span className="inline-flex gap-0.5" title="Both">
        <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
        <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
      </span>
    );
  }
  return null;
}

type Source = 'all' | 'pretzel' | 'knot';

export default function TrafficPage() {
  const [overview, setOverview] = useState<any>(null);
  const [trend, setTrend] = useState<any[] | null>(null);
  const [topPages, setTopPages] = useState<any[] | null>(null);
  const [sources, setSources] = useState<any[] | null>(null);
  const [agentsOverview, setAgentsOverview] = useState<any>(null);
  const [source, setSource] = useState<Source>('all');

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

  const kpiCards = () => {
    if (!overview) return [];
    if (source === 'knot') {
      return [
        { label: 'Knot Page Views', value: overview.knot_page_views_today?.toLocaleString() ?? '—', blue: true },
        { label: 'Knot Unique Visitors', value: overview.knot_unique_visitors_today?.toLocaleString() ?? '—', blue: true },
        { label: 'Knot Active Now', value: String(overview.knot_active_now ?? '—'), highlight: true },
      ];
    }
    if (source === 'pretzel') {
      return [
        { label: 'Page Views Today', value: (overview.pretzel_page_views_today ?? overview.page_views_today)?.toLocaleString() ?? '—' },
        { label: 'Unique Visitors', value: (overview.pretzel_unique_visitors_today ?? overview.unique_visitors_today)?.toLocaleString() ?? '—' },
        { label: 'Active Now', value: String(overview.active_now ?? '—'), highlight: true },
        { label: 'Bounce Rate', value: overview.bounce_rate != null ? `${overview.bounce_rate}%` : '—' },
        { label: 'Avg Session', value: fmtDuration(overview.avg_session_duration_sec) },
        { label: 'Top Referrer', value: overview.top_referrer ?? '—' },
      ];
    }
    return [
      { label: 'Page Views Today', value: overview.page_views_today?.toLocaleString() ?? '—' },
      { label: 'Unique Visitors', value: overview.unique_visitors_today?.toLocaleString() ?? '—' },
      { label: 'Active Now', value: String(overview.active_now ?? '—'), highlight: true },
      { label: 'Bounce Rate', value: overview.bounce_rate != null ? `${overview.bounce_rate}%` : '—' },
      { label: 'Avg Session', value: fmtDuration(overview.avg_session_duration_sec) },
      { label: 'Top Referrer', value: overview.top_referrer ?? '—' },
      { label: 'Knot Page Views', value: overview.knot_page_views_today?.toLocaleString() ?? '—', blue: true },
      { label: 'Knot Unique Visitors', value: overview.knot_unique_visitors_today?.toLocaleString() ?? '—', blue: true },
    ];
  };

  const filteredPages = !topPages
    ? null
    : source === 'all'
      ? topPages
      : topPages.filter(p => p.source === source || p.source === 'both');

  const showPretzelTrend = source === 'all' || source === 'pretzel';
  const showKnotTrend = source === 'all' || source === 'knot';

  return (
    <div className="p-4 md:p-6 space-y-6 text-white min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Traffic & Visitors</h1>
          <p className="text-sm text-slate-500 mt-0.5">Real-time analytics from Pretzel.io + PretzelKnot</p>
        </div>
        <div className="flex gap-2">
          {(['all', 'pretzel', 'knot'] as Source[]).map(s => (
            <button
              key={s}
              onClick={() => setSource(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${source === s
                ? s === 'knot' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                  : s === 'pretzel' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'bg-slate-700 text-white border border-slate-600'
                : 'bg-transparent text-slate-500 border border-slate-800 hover:border-slate-600'
                }`}
            >
              {s === 'all' ? 'All Sources' : s === 'pretzel' ? 'Pretzel.io' : 'PretzelKnot'}
            </button>
          ))}
        </div>
      </div>

      {/* OVERVIEW STATS */}
      {!overview ? (
        <Disconnected label="Traffic overview unavailable" />
      ) : (
        <>
          {source !== 'pretzel' && overview.knot_connected === false && (
            <Disconnected label="PretzelKnot API unavailable — showing Pretzel.io data only" />
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {kpiCards().map(({ label, value, highlight, blue }: any) => (
              <div key={label} className={`rounded-xl border p-4 ${blue ? 'border-blue-500/30 bg-blue-500/5'
                : highlight ? 'border-amber-500/30 bg-amber-500/5'
                  : 'border-slate-800 bg-slate-900/60'
                }`}>
                <p className="text-[11px] text-slate-500 uppercase tracking-wider">{label}</p>
                <p className={`text-xl font-bold mt-1 ${blue ? 'text-blue-400' : highlight ? 'text-amber-400' : 'text-white'
                  }`}>{value}</p>
              </div>
            ))}
          </div>
        </>
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
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="uvGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="knotPvGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="knotUvGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 12 }} />
              {showPretzelTrend && <Area type="monotone" dataKey="page_views" stroke="#f59e0b" strokeWidth={2} fill="url(#pvGrad)" name="Page Views" />}
              {showPretzelTrend && <Area type="monotone" dataKey="unique_visitors" stroke="#6366f1" strokeWidth={2} fill="url(#uvGrad)" name="Unique Visitors" />}
              {showKnotTrend && <Area type="monotone" dataKey="knot_page_views" stroke="#3b82f6" strokeWidth={2} fill="url(#knotPvGrad)" name="Knot Page Views" strokeDasharray={source === 'all' ? '4 2' : undefined} />}
              {showKnotTrend && <Area type="monotone" dataKey="knot_unique_visitors" stroke="#14b8a6" strokeWidth={2} fill="url(#knotUvGrad)" name="Knot Unique Visitors" strokeDasharray={source === 'all' ? '4 2' : undefined} />}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {agentsOverview && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="flex items-center gap-3 mb-4">
              <Zap size={16} className="text-amber-300" />
              <div>
                <h2 className="text-sm font-medium text-slate-300">Agent Traffic Signals</h2>
                <p className="text-xs text-slate-500">Agent activity and health affecting customer experience</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Online', value: agentsOverview.summary.online },
                { label: 'Warnings', value: agentsOverview.summary.warning },
                { label: 'Errors', value: agentsOverview.summary.error },
                { label: 'Total', value: agentsOverview.summary.total },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
                  <p className="text-[11px] text-slate-500 uppercase tracking-[0.2em] mb-2">{item.label}</p>
                  <p className="text-xl font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* TOP PAGES */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
        <h2 className="text-sm font-medium text-slate-300 mb-4">Top Pages Today</h2>
        {!filteredPages || !filteredPages.length ? (
          <Disconnected label="Page data unavailable" />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] text-slate-500 border-b border-slate-800">
                <th className="pb-2">Page</th>
                <th className="pb-2 text-center">Src</th>
                <th className="pb-2 text-right">Views</th>
                <th className="pb-2 text-right">Unique</th>
              </tr>
            </thead>
            <tbody>
              {filteredPages.map((p, i) => (
                <tr key={i} className="border-b border-slate-800/50 last:border-0">
                  <td className="py-2 text-slate-300 font-mono text-xs">{p.path}</td>
                  <td className="py-2 text-center"><SourceDot source={p.source} /></td>
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
  );
}
