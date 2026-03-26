import React from 'react';

interface KpiCardProps {
  title: string;
  value: number;
  delta?: number;
  icon?: React.ReactNode;
  loading?: boolean;
  suffix?: string;
  prefix?: string;
  isDecimal?: boolean;
  /** Flip the green/red logic — use for churn rate where lower is better */
  invertDelta?: boolean;
}

export function AnalyticsKpiCard({
  title,
  value,
  delta,
  icon,
  loading,
  suffix,
  prefix,
  isDecimal,
  invertDelta,
}: KpiCardProps) {
  const isPositive = invertDelta ? (delta ?? 0) < 0 : (delta ?? 0) > 0;
  const displayValue = isDecimal ? value.toFixed(1) : value.toLocaleString();

  return (
    <div className="bg-[#111] border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between h-32 hover:border-slate-700 group">
      <div className="flex justify-between items-start mb-1">
        <h4 className="text-slate-400 text-xs font-medium leading-snug">{title}</h4>
        <div className="p-1.5 bg-slate-800/50 rounded-md group-hover:bg-slate-800 shrink-0 ml-2">
          {icon}
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse bg-slate-800 h-7 w-24 rounded mt-auto" />
      ) : (
        <div className="flex items-end gap-2 mt-auto">
          <span className="text-2xl font-semibold tracking-tight text-white leading-none">
            {prefix}{displayValue}{suffix}
          </span>
          {delta !== undefined && (
            <span
              className={`text-xs font-medium px-1.5 py-0.5 rounded mb-0.5 flex items-center gap-0.5 ${
                isPositive
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-rose-500/10 text-rose-400'
              }`}
            >
              {isPositive ? '↑' : '↓'} {Math.abs(delta)}%
            </span>
          )}
        </div>
      )}
    </div>
  );
}
