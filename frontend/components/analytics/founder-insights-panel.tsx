import React, { useEffect, useState } from 'react';
import { Sparkles, TrendingUp } from 'lucide-react';

export function FounderInsightsPanel() {
  const [insights, setInsights] = useState<string[]>([]);
  
  useEffect(() => {
    // Mocking API fetch
    setInsights([
      "User signups are up 12% vs prior week.",
      "AI usage surged by 4,000 requests over the last 3 hours.",
      "The /api/ai/chat endpoint is currently showing elevated latency.",
      "Main Landing page is converting at 4.2% today, slightly above average."
    ]);
  }, []);

  return (
    <div className="bg-gradient-to-br from-indigo-900/40 to-[#111] border border-indigo-500/20 rounded-xl p-5 shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Sparkles size={120} />
      </div>
      
      <h3 className="text-md font-semibold text-indigo-100 flex items-center gap-2 mb-4">
        <Sparkles size={16} className="text-indigo-400" /> Executive Insights
      </h3>
      
      <ul className="space-y-3 relative z-10">
        {insights.map((insight, idx) => (
          <li key={idx} className="flex gap-3 text-sm text-slate-300 items-start">
            <span className="mt-0.5 text-indigo-400">
              <TrendingUp size={14} />
            </span>
            <span className="leading-tight">{insight}</span>
          </li>
        ))}
        {insights.length === 0 && (
          <li className="text-slate-500 text-sm">Analyzing current telemetry...</li>
        )}
      </ul>
    </div>
  );
}
