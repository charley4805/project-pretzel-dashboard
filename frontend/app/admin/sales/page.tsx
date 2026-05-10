'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AnalyticsKpiCard } from '@/components/analytics/analytics-kpi-card';
import { RevenueChart } from '@/components/analytics/revenue-chart';
import { fetchAgentsOverview } from '@/lib/api';
import {
  DollarSign, TrendingUp, Users, CreditCard, Zap,
  AlertCircle, Repeat, Building2, RefreshCw, WifiOff,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

const TIER_COLORS: Record<string, string> = {
  Solo: '#f59e0b',
  Pro: '#a78bfa',
  Team: '#60a5fa',
  Enterprise: '#34d399',
  Group: '#fb923c',
};

function Disconnected({ label = 'Disconnected — data unavailable' }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/40 px-4 py-3 text-sm text-slate-500">
      <WifiOff size={14} className="text-red-500/60 shrink-0" />
      {label}
    </div>
  );
}

export default function SalesCommandCenter() {
  const [data, setData] = useState<any>(null);
  const [agentsOverview, setAgentsOverview] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [ovRes, revRes, subsRes, txRes, pipeRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/sales/overview`),
        fetch(`${API_BASE}/api/admin/sales/revenue`),
        fetch(`${API_BASE}/api/admin/sales/subscriptions`),
        fetch(`${API_BASE}/api/admin/sales/transactions`),
        fetch(`${API_BASE}/api/admin/sales/pipeline`),
      ]);
      const [ov, rev, subs, tx, pipe] = await Promise.all([
        ovRes.json(), revRes.json(), subsRes.json(), txRes.json(), pipeRes.json(),
      ]);
      setData({
        ...ov,
        revenue_chart: rev.monthly ?? [],
        subscription_tiers: subs.tiers ?? [],
        recent_transactions: tx.transactions ?? [],
        contract_pipeline: pipe.stages ?? [],
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

  const maxPipeline = data?.contract_pipeline?.length
    ? Math.max(...data.contract_pipeline.map((s: any) => s.count))
    : 1;

  return (
    <div className="min-h-screen bg-pretzel-walnut text-slate-100 p-4 md:p-6 font-sans">

      {/* HEADER */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <DollarSign size={20} className="text-emerald-500" />
            <h1 className="text-2xl font-semibold tracking-tight text-white">Sales Command Center</h1>
          </div>
          <p className="text-slate-500 text-sm">
            Revenue, subscriptions, contracts &amp; billing — Pretzel.io + PretzelKnot
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg px-4 py-1.5 text-sm font-medium"
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* TOP KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {!data ? (
          <div className="col-span-full"><Disconnected label="Sales data unavailable" /></div>
        ) : (
          <>
            <AnalyticsKpiCard title="MRR" value={data.mrr} delta={data.mrr_delta} icon={<DollarSign size={17} className="text-emerald-400" />} loading={loading} prefix="$" />
            <AnalyticsKpiCard title="ARR" value={data.arr} delta={data.arr_delta} icon={<TrendingUp size={17} className="text-emerald-400" />} loading={loading} prefix="$" />
            <AnalyticsKpiCard title="Active Subs" value={data.active_subscriptions} delta={data.active_subs_delta} icon={<Users size={17} className="text-amber-400" />} loading={loading} />
            <AnalyticsKpiCard title="Trial → Paid MTD" value={data.trial_conversions_this_month} delta={data.trial_conv_delta} icon={<Repeat size={17} className="text-purple-400" />} loading={loading} />
            <AnalyticsKpiCard title="Churn Rate" value={data.churn_rate} delta={data.churn_delta} icon={<AlertCircle size={17} className="text-rose-400" />} loading={loading} suffix="%" isDecimal invertDelta />
            <AnalyticsKpiCard title="ARPU" value={data.avg_revenue_per_user} icon={<CreditCard size={17} className="text-blue-400" />} loading={loading} prefix="$" isDecimal />
          </>
        )}
      </div>

      {/* AGENT FLEET SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5">
          <div className="flex items-center gap-3 mb-4">
            <Zap size={16} className="text-amber-300" />
            <h2 className="text-sm font-medium text-slate-300">Agent Fleet</h2>
          </div>
          {!agentsOverview ? (
            <div className="text-sm text-slate-500">Agent metric data unavailable</div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Total', value: agentsOverview.summary.total },
                { label: 'Online', value: agentsOverview.summary.online },
                { label: 'Warnings', value: agentsOverview.summary.warning },
                { label: 'Errors', value: agentsOverview.summary.error },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-slate-900/70 p-4 border border-slate-800">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500 mb-2">{item.label}</p>
                  <p className="text-2xl font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* REVENUE CHART + TIER BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        <div className="lg:col-span-3 bg-pretzel-indigo border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
            <TrendingUp size={15} className="text-emerald-400" /> Monthly Recurring Revenue
            <span className="ml-auto flex items-center gap-4 text-[10px] text-slate-500">
              <span className="flex items-center gap-1.5"><span className="inline-block w-2 h-0.5 rounded bg-amber-500" /> Pretzel.io</span>
              <span className="flex items-center gap-1.5"><span className="inline-block w-2 h-0.5 rounded bg-blue-400" /> PretzelKnot</span>
            </span>
          </h3>
          <div className="h-64">
            {!data || !data.revenue_chart?.length ? (
              <div className="h-full flex items-center justify-center"><Disconnected label="Revenue data unavailable" /></div>
            ) : (
              <RevenueChart data={data.revenue_chart} />
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-pretzel-indigo border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
            <CreditCard size={15} className="text-amber-400" /> Subscriptions by Tier
            <span className="ml-auto text-[10px] text-slate-600">Both platforms</span>
          </h3>
          {!data || !data.subscription_tiers?.length ? (
            <div className="h-44 flex items-center justify-center"><Disconnected label="Subscription data unavailable" /></div>
          ) : (
            <>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.subscription_tiers}
                    layout="vertical"
                    margin={{ top: 0, right: 10, left: 10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                    <XAxis type="number" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="tier" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} width={62} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' }}
                      formatter={(v: any) => [v.toLocaleString(), 'Subscribers']}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {data.subscription_tiers.map((entry: any, i: number) => (
                        <Cell key={i} fill={TIER_COLORS[entry.tier] ?? '#94a3b8'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 space-y-1.5 border-t border-slate-800 pt-3">
                {data.subscription_tiers.map((t: any, i: number) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: TIER_COLORS[t.tier] ?? '#94a3b8' }} />
                      {t.tier}
                    </span>
                    <span className="text-slate-300 font-mono">${t.mrr.toLocaleString()}<span className="text-slate-600">/mo</span></span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* CONTRACT PIPELINE */}
      <div className="bg-pretzel-indigo border border-slate-800 rounded-xl p-5 mb-8">
        <h3 className="text-sm font-medium text-slate-300 mb-5 flex items-center gap-2">
          <Building2 size={15} className="text-amber-400" /> Contract Pipeline
          <span className="ml-auto text-[10px] text-slate-600">Source: Pretzel.io contracts table</span>
        </h3>
        {!data || !data.contract_pipeline?.length ? (
          <Disconnected label="Pipeline data unavailable" />
        ) : (
          <div className="grid grid-cols-5 gap-3">
            {data.contract_pipeline.map((stage: any, i: number) => {
              const pct = Math.round((stage.count / maxPipeline) * 100);
              return (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="w-full bg-slate-800/60 rounded-xl p-3 text-center border border-slate-700/40">
                    <p className="text-[11px] text-slate-500 mb-1.5 font-medium">{stage.stage}</p>
                    <p className="text-2xl font-semibold text-white">{stage.count}</p>
                    <p className="text-xs text-amber-400 font-mono mt-1">
                      ${(stage.value / 1_000_000).toFixed(1)}M
                    </p>
                  </div>
                  <div className="w-full h-1 bg-slate-800 rounded-full">
                    <div
                      className="h-1 bg-amber-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* RECENT TRANSACTIONS */}
      <div className="bg-pretzel-indigo border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
          <CreditCard size={15} className="text-emerald-400" /> Recent Transactions
          <span className="ml-auto text-[10px] text-slate-600">Pretzel.io + PretzelKnot Stripe events</span>
        </h3>
        {!data || !data.recent_transactions?.length ? (
          <Disconnected label="Transaction data unavailable" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-slate-800">
                  {['Customer', 'Plan', 'Amount', 'Source', 'Date', 'Status'].map(h => (
                    <th key={h} className="pb-3 pr-6 text-xs text-slate-500 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {data.recent_transactions.map((tx: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-900/40">
                    <td className="py-3 pr-6 text-slate-200 font-medium whitespace-nowrap">{tx.user}</td>
                    <td className="py-3 pr-6">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full border font-medium"
                        style={{
                          color: TIER_COLORS[tx.plan] ?? '#94a3b8',
                          borderColor: (TIER_COLORS[tx.plan] ?? '#94a3b8') + '40',
                          backgroundColor: (TIER_COLORS[tx.plan] ?? '#94a3b8') + '12',
                        }}
                      >
                        {tx.plan}
                      </span>
                    </td>
                    <td className="py-3 pr-6 text-emerald-400 font-mono font-semibold">${tx.amount}</td>
                    <td className="py-3 pr-6">
                      <span className={`text-xs font-medium ${tx.source === 'pretzel' ? 'text-amber-400' : 'text-blue-400'
                        }`}>
                        {tx.source === 'pretzel' ? '🥨 Pretzel.io' : '🔵 Knot'}
                      </span>
                    </td>
                    <td className="py-3 pr-6 text-slate-500 text-xs whitespace-nowrap">{tx.date}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tx.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400' :
                          tx.status === 'failed' ? 'bg-rose-500/10    text-rose-400' :
                            'bg-slate-700/50   text-slate-500'
                        }`}>
                        {tx.status}
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

