'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AnalyticsKpiCard } from '@/components/analytics/analytics-kpi-card';
import { RevenueChart } from '@/components/analytics/revenue-chart';
import {
  DollarSign, TrendingUp, Users, CreditCard,
  AlertCircle, Repeat, Building2, RefreshCw,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';

const TIER_COLORS: Record<string, string> = {
  Solo: '#f59e0b',
  Pro: '#a78bfa',
  Team: '#60a5fa',
  Enterprise: '#34d399',
  Group: '#fb923c',
};

const FALLBACK = {
  mrr: 84200,              mrr_delta: 3.8,
  arr: 1010400,            arr_delta: 3.8,
  active_subscriptions: 1842, active_subs_delta: 2.1,
  trial_conversions_this_month: 142, trial_conv_delta: 8.4,
  churn_rate: 1.8,         churn_delta: -0.2,
  avg_revenue_per_user: 45.7,
  revenue_chart: [
    { month: 'Oct', pretzel: 68000, knot: 8200  },
    { month: 'Nov', pretzel: 71000, knot: 9100  },
    { month: 'Dec', pretzel: 74000, knot: 9800  },
    { month: 'Jan', pretzel: 76500, knot: 10200 },
    { month: 'Feb', pretzel: 80000, knot: 10900 },
    { month: 'Mar', pretzel: 84200, knot: 11400 },
  ],
  subscription_tiers: [
    { tier: 'Solo',       count: 820, mrr: 16400 },
    { tier: 'Pro',        count: 620, mrr: 31000 },
    { tier: 'Team',       count: 280, mrr: 25200 },
    { tier: 'Enterprise', count: 42,  mrr: 8400  },
    { tier: 'Group',      count: 80,  mrr: 3200  },
  ],
  recent_transactions: [
    { id: 'inv_001', user: 'Apex Construction LLC',  plan: 'Pro',        amount: 49,  status: 'paid',     date: 'Today, 2:14 PM',   source: 'pretzel' },
    { id: 'inv_002', user: 'Mike T. Electrical',     plan: 'Solo',       amount: 19,  status: 'paid',     date: 'Today, 1:55 PM',   source: 'knot'    },
    { id: 'inv_003', user: 'Summit Builds',          plan: 'Team',       amount: 89,  status: 'paid',     date: 'Today, 1:30 PM',   source: 'pretzel' },
    { id: 'inv_004', user: 'R&L Plumbing',           plan: 'Pro',        amount: 49,  status: 'failed',   date: 'Today, 12:10 PM',  source: 'knot'    },
    { id: 'inv_005', user: 'Blue Ridge Roofing',     plan: 'Enterprise', amount: 199, status: 'paid',     date: 'Today, 11:48 AM',  source: 'pretzel' },
    { id: 'inv_006', user: 'Cornerstone GC',         plan: 'Team',       amount: 89,  status: 'refunded', date: 'Today, 10:20 AM',  source: 'pretzel' },
  ],
  contract_pipeline: [
    { stage: 'Draft',       count: 340, value: 2800000 },
    { stage: 'Sent',        count: 218, value: 1920000 },
    { stage: 'Negotiating', count: 87,  value: 890000  },
    { stage: 'Signed',      count: 145, value: 1340000 },
    { stage: 'Paid',        count: 267, value: 2100000 },
  ],
};

export default function SalesCommandCenter() {
  const [data, setData] = useState<any>(FALLBACK);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [ovRes, revRes, subsRes, txRes, pipeRes] = await Promise.all([
        fetch(`${API_BASE}/admin/sales/overview`),
        fetch(`${API_BASE}/admin/sales/revenue`),
        fetch(`${API_BASE}/admin/sales/subscriptions`),
        fetch(`${API_BASE}/admin/sales/transactions`),
        fetch(`${API_BASE}/admin/sales/pipeline`),
      ]);
      const [ov, rev, subs, tx, pipe] = await Promise.all([
        ovRes.json(), revRes.json(), subsRes.json(), txRes.json(), pipeRes.json(),
      ]);
      setData({
        ...ov,
        revenue_chart:        rev.monthly        ?? FALLBACK.revenue_chart,
        subscription_tiers:   subs.tiers         ?? FALLBACK.subscription_tiers,
        recent_transactions:  tx.transactions    ?? FALLBACK.recent_transactions,
        contract_pipeline:    pipe.stages        ?? FALLBACK.contract_pipeline,
      });
    } catch {
      setData(FALLBACK);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const maxPipeline = Math.max(...data.contract_pipeline.map((s: any) => s.count));

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-100 p-6 font-sans">

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
        <AnalyticsKpiCard title="MRR"              value={data.mrr}                          delta={data.mrr_delta}          icon={<DollarSign  size={17} className="text-emerald-400" />} loading={loading} prefix="$" />
        <AnalyticsKpiCard title="ARR"              value={data.arr}                          delta={data.arr_delta}          icon={<TrendingUp  size={17} className="text-emerald-400" />} loading={loading} prefix="$" />
        <AnalyticsKpiCard title="Active Subs"      value={data.active_subscriptions}         delta={data.active_subs_delta}  icon={<Users       size={17} className="text-amber-400"   />} loading={loading} />
        <AnalyticsKpiCard title="Trial → Paid MTD" value={data.trial_conversions_this_month} delta={data.trial_conv_delta}   icon={<Repeat      size={17} className="text-purple-400" />} loading={loading} />
        <AnalyticsKpiCard title="Churn Rate"       value={data.churn_rate}                   delta={data.churn_delta}        icon={<AlertCircle size={17} className="text-rose-400"    />} loading={loading} suffix="%" isDecimal invertDelta />
        <AnalyticsKpiCard title="ARPU"             value={data.avg_revenue_per_user}                                         icon={<CreditCard  size={17} className="text-blue-400"    />} loading={loading} prefix="$" isDecimal />
      </div>

      {/* REVENUE CHART + TIER BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        <div className="lg:col-span-3 bg-[#111] border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
            <TrendingUp size={15} className="text-emerald-400" /> Monthly Recurring Revenue
            <span className="ml-auto flex items-center gap-4 text-[10px] text-slate-500">
              <span className="flex items-center gap-1.5"><span className="inline-block w-2 h-0.5 rounded bg-amber-500" /> Pretzel.io</span>
              <span className="flex items-center gap-1.5"><span className="inline-block w-2 h-0.5 rounded bg-blue-400" /> PretzelKnot</span>
            </span>
          </h3>
          <div className="h-64">
            <RevenueChart data={data.revenue_chart} />
          </div>
        </div>

        <div className="lg:col-span-2 bg-[#111] border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
            <CreditCard size={15} className="text-amber-400" /> Subscriptions by Tier
            <span className="ml-auto text-[10px] text-slate-600">Both platforms</span>
          </h3>
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
        </div>
      </div>

      {/* CONTRACT PIPELINE */}
      <div className="bg-[#111] border border-slate-800 rounded-xl p-5 mb-8">
        <h3 className="text-sm font-medium text-slate-300 mb-5 flex items-center gap-2">
          <Building2 size={15} className="text-amber-400" /> Contract Pipeline
          <span className="ml-auto text-[10px] text-slate-600">Source: Pretzel.io contracts table</span>
        </h3>
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
      </div>

      {/* RECENT TRANSACTIONS */}
      <div className="bg-[#111] border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
          <CreditCard size={15} className="text-emerald-400" /> Recent Transactions
          <span className="ml-auto text-[10px] text-slate-600">Pretzel.io + PretzelKnot Stripe events</span>
        </h3>
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
                    <span className={`text-xs font-medium ${
                      tx.source === 'pretzel' ? 'text-amber-400' : 'text-blue-400'
                    }`}>
                      {tx.source === 'pretzel' ? '🥨 Pretzel.io' : '🔵 Knot'}
                    </span>
                  </td>
                  <td className="py-3 pr-6 text-slate-500 text-xs whitespace-nowrap">{tx.date}</td>
                  <td className="py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      tx.status === 'paid'     ? 'bg-emerald-500/10 text-emerald-400' :
                      tx.status === 'failed'   ? 'bg-rose-500/10    text-rose-400'    :
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
      </div>
    </div>
  );
}
