'use client';

import React, { useState, useEffect } from 'react';
import { AnalyticsKpiCard } from '@/components/analytics/analytics-kpi-card';
import { FounderInsightsPanel } from '@/components/analytics/founder-insights-panel';
import { HealthStatusGrid } from '@/components/analytics/health-status-grid';
import { LiveFeed } from '@/components/analytics/analytics-live-feed';
import { GrowthChart } from '@/components/analytics/analytics-growth-chart';
import { Activity, Users, Search, Brain, CheckCircle, Clock } from 'lucide-react';

export default function AnalyticsDashboard() {
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In production, this fetches from the FastAPI backend.
    // For now, mocking the response pattern matching the backend endpoint.
    setTimeout(() => {
      setOverview({
        total_users: 15234,
        total_users_delta: 2.4,
        new_users_today: 145,
        new_users_delta: 12.1,
        daily_active: 3420,
        daily_active_delta: -1.2,
        profiles_created: 4500,
        total_searches_today: 8900,
        ai_requests_today: 45300,
        api_requests_today: 124000,
        avg_api_latency_ms: 120,
        error_rate: 0.04,
        health_status: "optimal"
      });
      setLoading(false);
    }, 600);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-100 p-6 font-sans">
      
      {/* HEADER / COMMAND BAR */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Project Pretzel / Command Center</h1>
          <p className="text-slate-400 text-sm mt-1">Foundational insights and operational health overview.</p>
        </div>
        <div className="flex gap-4">
          <select className="bg-slate-900 border border-slate-700 rounded-md px-3 py-1.5 text-sm text-slate-300">
            <option>Today</option>
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
          </select>
          <select className="bg-slate-900 border border-slate-700 rounded-md px-3 py-1.5 text-sm text-slate-300">
            <option>All Ecosystem</option>
            <option>Main App</option>
            <option>Pretzel Knot</option>
          </select>
          <button className="bg-blue-600 hover:bg-blue-500 text-white rounded-md px-4 py-1.5 text-sm transition font-medium">
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-12 xl:col-span-9 space-y-8">
          
          {/* TOP KPI STRIP */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
            <AnalyticsKpiCard 
              title="Total Users" 
              value={overview?.total_users || 0} 
              delta={overview?.total_users_delta} 
              icon={<Users size={18} className="text-blue-400"/>} 
              loading={loading}
            />
            <AnalyticsKpiCard 
              title="Active Today (DAU)" 
              value={overview?.daily_active || 0} 
              delta={overview?.daily_active_delta} 
              icon={<Activity size={18} className="text-emerald-400"/>} 
              loading={loading}
            />
            <AnalyticsKpiCard 
              title="AI Requests" 
              value={overview?.ai_requests_today || 0} 
              icon={<Brain size={18} className="text-purple-400"/>} 
              loading={loading}
            />
            <AnalyticsKpiCard 
              title="Search Volume" 
              value={overview?.total_searches_today || 0} 
              icon={<Search size={18} className="text-orange-400"/>} 
              loading={loading}
            />
          </div>

          {/* MAIN CHARTS AREA */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#111] border border-slate-800 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
                <Users size={16} /> User Growth & Activation
              </h3>
              <div className="h-64">
                <GrowthChart />
              </div>
            </div>
            
            <div className="bg-[#111] border border-slate-800 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
                <Brain size={16} /> AI Usage Trends
              </h3>
              <div className="h-64 flex items-center justify-center border border-dashed border-slate-800 rounded-lg">
                <p className="text-xs text-slate-500">AI Tokens vs Compute Cost Chart</p>
                {/* Recharts AreaChart component goes here */}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <HealthStatusGrid />
            <div className="bg-[#111] border border-slate-800 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
                <Clock size={16} /> API Load & Performance
              </h3>
              <div className="h-64 flex items-center justify-center border border-dashed border-slate-800 rounded-lg">
                 <p className="text-xs text-slate-500">Latency Timeseries Chart</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="col-span-12 xl:col-span-3 space-y-6">
          <FounderInsightsPanel />
          <LiveFeed />
        </div>
      </div>
    </div>
  );
}
