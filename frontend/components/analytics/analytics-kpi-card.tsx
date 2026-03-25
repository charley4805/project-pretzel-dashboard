import React from 'react';

export function AnalyticsKpiCard({ title, value, delta, icon, loading }: any) {
  return (
    <div className="bg-[#111] border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between h-32 transition-colors hover:border-slate-700">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-slate-400 text-sm font-medium">{title}</h4>
        <div className="p-1.5 bg-slate-800/50 rounded-md">
          {icon}
        </div>
      </div>
      
      {loading ? (
        <div className="animate-pulse bg-slate-800 h-8 w-24 rounded mt-4"></div>
      ) : (
        <div className="flex items-end gap-3 mt-2">
          <span className="text-3xl font-semibold tracking-tight text-white">
            {value.toLocaleString()}
          </span>
          {delta !== undefined && (
            <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${delta > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'} mb-1 flex items-center`}>
              {delta > 0 ? '↑' : '↓'} {Math.abs(delta)}%
            </span>
          )}
        </div>
      )}
    </div>
  );
}
