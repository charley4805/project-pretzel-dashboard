'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AnalyticsKpiCard } from '@/components/analytics/analytics-kpi-card';
import { FounderInsightsPanel } from '@/components/analytics/founder-insights-panel';
import { HealthStatusGrid } from '@/components/analytics/health-status-grid';
import { LiveFeed } from '@/components/analytics/analytics-live-feed';
import { GrowthChart } from '@/components/analytics/analytics-growth-chart';
import {
  Activity, Users, Search, Brain, Clock,
  Wrench, Star, Building2, CheckCircle, RefreshCw, WifiOff,
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';

function Disconnected({ label = 'Disconnected' }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/40 px-4 py-3 text-sm text-slate-500">
      <WifiOff size={14} className="text-red-500/60 shrink-0" />
      {label}
    </div>
  );
}

export default function AnalyticsDashboard() {
  const [overview, setOverview] = useState<any>(null);
  const [knot, setKnot] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState('all');
  const [range, setRange] = useState('today');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [ovRes, knotRes] = await Promise.all([
        fetch(`${API_BASE}/admin/analytics/overview?source_app=${source}`),
        fetch(`${API_BASE}/admin/analytics/knot-metrics`),
      ]);
      const [ovData, knotData] = await Promise.all([ovRes.json(), knotRes.json()]);
      setOverview(ovData);
      setKnot(knotData);
    } catch {
      setOverview(null);
      setKnot(null);
    } finally {
      setLoading(false);
    }
  }, [source]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-100 p-6 font-sans">

      {/* HEADER */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Ecosystem Analytics</h1>
          <p className="text-slate-500 text-sm mt-0.5">Pretzel.io + PretzelKnot — unified operational overview</p>
        </div>
        <div className="flex gap-2.5 items-center">
          <select
            value={range}
            onChange={e => setRange(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-300"
          >
            <option value="today">Today</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <select
            value={source}
            onChange={e => setSource(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-300"
          >
            <option value="all">All Ecosystem</option>
            <option value="pretzel">Pretzel.io</option>
            <option value="knot">PretzelKnot</option>
          </select>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg px-4 py-1.5 text-sm font-medium"
          >
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      {/* SOURCE BADGES */}
      <div className="flex gap-3 mb-8">
        <div className="flex items-center gap-2 bg-[#111] border border-slate-800 rounded-lg px-3 py-1.5">
          <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-xs text-slate-400">Pretzel.io — FastAPI + Supabase</span>
        </div>
        <div className="flex items-center gap-2 bg-[#111] border border-slate-800 rounded-lg px-3 py-1.5">
          <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
          <span className="text-xs text-slate-400">PretzelKnot — .NET + PostgreSQL</span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 xl:col-span-9 space-y-8">

          {/* PRETZEL.IO KPIs */}
          <section>
            <p className="text-[11px] text-amber-500/80 uppercase tracking-widest font-semibold mb-3 flex items-center gap-1.5">
              🥨 Pretzel.io — Platform
            </p>
            {!overview ? (
              <Disconnected label="Pretzel.io data unavailable" />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <AnalyticsKpiCard title="Total Users" value={overview.total_users} delta={overview.total_users_delta} icon={<Users size={17} className="text-amber-400" />} loading={loading} />
                <AnalyticsKpiCard title="Active Today (DAU)" value={overview.daily_active} delta={overview.daily_active_delta} icon={<Activity size={17} className="text-emerald-400" />} loading={loading} />
                <AnalyticsKpiCard title="Active Projects" value={overview.active_projects} icon={<Building2 size={17} className="text-blue-400" />} loading={loading} />
                <AnalyticsKpiCard title="Contracts (MTD)" value={overview.contracts_this_month} icon={<CheckCircle size={17} className="text-purple-400" />} loading={loading} />
              </div>
            )}
          </section>

          {/* PRETZELKNOT KPIs */}
          <section>
            <p className="text-[11px] text-blue-400/80 uppercase tracking-widest font-semibold mb-3">
              🔵 PretzelKnot — Contractor Directory
            </p>
            {!knot ? (
              <Disconnected label="PretzelKnot data unavailable" />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <AnalyticsKpiCard title="Total Contractors" value={knot.total_contractors} icon={<Wrench size={17} className="text-blue-400" />} loading={loading} />
                <AnalyticsKpiCard title="Verified Profiles" value={knot.verified_contractors} icon={<CheckCircle size={17} className="text-emerald-400" />} loading={loading} />
                <AnalyticsKpiCard title="New Today" value={knot.new_contractors_today} icon={<Users size={17} className="text-amber-400" />} loading={loading} />
                <AnalyticsKpiCard title="Avg Rating" value={knot.avg_rating} icon={<Star size={17} className="text-yellow-400" />} loading={loading} isDecimal />
              </div>
            )}
          </section>

          {/* PLATFORM SIGNALS */}
          <section>
            <p className="text-[11px] text-slate-500 uppercase tracking-widest font-semibold mb-3">Platform Signals</p>
            {!overview ? (
              <Disconnected label="Platform signals unavailable" />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <AnalyticsKpiCard title="AI Requests" value={overview.ai_requests_today} icon={<Brain size={17} className="text-purple-400" />} loading={loading} />
                <AnalyticsKpiCard title="Search Volume" value={overview.total_searches_today} icon={<Search size={17} className="text-orange-400" />} loading={loading} />
                <AnalyticsKpiCard title="API Requests" value={overview.api_requests_today} icon={<Activity size={17} className="text-slate-400" />} loading={loading} />
                <AnalyticsKpiCard title="Avg Latency" value={overview.avg_api_latency_ms} icon={<Clock size={17} className="text-teal-400" />} loading={loading} suffix="ms" />
              </div>
            )}
          </section>

          {/* CHARTS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#111] border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
                <Users size={15} className="text-amber-400" /> User Growth & Activation
              </h3>
              <div className="h-64">
                <GrowthChart />
              </div>
            </div>
            <div className="bg-[#111] border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
                <Brain size={15} className="text-purple-400" /> AI Usage Trends
              </h3>
              <div className="h-64 flex items-center justify-center border border-dashed border-slate-800 rounded-lg">
                <p className="text-xs text-slate-600">Wired to <code className="text-slate-500">/api/admin/analytics/ai</code></p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <HealthStatusGrid />
            <div className="bg-[#111] border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
                <Clock size={15} /> API Load &amp; Performance
              </h3>
              <div className="h-64 flex items-center justify-center border border-dashed border-slate-800 rounded-lg">
                <p className="text-xs text-slate-600">Wired to <code className="text-slate-500">/api/admin/analytics/health</code></p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="col-span-12 xl:col-span-3 space-y-6">
          <FounderInsightsPanel />
          <LiveFeed />
        </div>
      </div>
    </div>
  );
}
