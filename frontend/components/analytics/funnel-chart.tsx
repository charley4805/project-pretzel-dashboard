import React from 'react';

interface FunnelStage {
  stage: string;
  count: number;
  color: string;
}

export function FunnelChart({ data }: { data: FunnelStage[] }) {
  const max = data[0]?.count || 1;

  return (
    <div className="space-y-3">
      {data.map((stage, i) => {
        const pct = Math.round((stage.count / max) * 100);
        const convPct =
          i > 0 ? Math.round((stage.count / data[i - 1].count) * 100) : null;

        return (
          <div key={i}>
            <div className="flex justify-between items-center mb-1.5 text-sm">
              <span className="text-slate-400">{stage.stage}</span>
              <div className="flex items-center gap-3">
                {convPct !== null && (
                  <span className="text-xs text-slate-600 font-mono">{convPct}% conv.</span>
                )}
                <span className="font-semibold text-white font-mono">
                  {stage.count.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="h-8 bg-slate-800/50 rounded-lg overflow-hidden">
              <div
                className="h-full rounded-lg flex items-center px-3 transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  backgroundColor: stage.color + '25',
                  borderLeft: `3px solid ${stage.color}`,
                }}
              >
                <span className="text-xs font-semibold" style={{ color: stage.color }}>
                  {pct}%
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
