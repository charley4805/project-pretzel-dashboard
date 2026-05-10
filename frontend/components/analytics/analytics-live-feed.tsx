import React, { useEffect, useState } from 'react';
import { Radio, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import { clsx } from "clsx";

export function LiveFeed() {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    // Mocking real-time subscription
    setEvents([
      {"id": "evt1", "time": "Just now", "type": "signup", "message": "New user signed up from web", "severity": "info"},
      {"id": "evt2", "time": "2m ago", "type": "ai", "message": "AI Request spike observed on /generate_contract", "severity": "warning"},
      {"id": "evt3", "time": "15m ago", "type": "search", "message": "Zero results for 'quantum entanglement'", "severity": "info"},
      {"id": "evt4", "time": "1h ago", "type": "error", "message": "Database connection degraded momentarily", "severity": "error"},
      {"id": "evt5", "time": "1h 10m ago", "type": "profile", "message": "User completed full profile setup", "severity": "success"},
    ]);
  }, []);

  const getIconForEvent = (event_type: string, severity: string) => {
    switch (severity) {
      case "error": return <AlertCircle size={14} className="text-rose-500" />;
      case "success": return <CheckCircle2 size={14} className="text-emerald-500" />;
      case "warning": return <AlertCircle size={14} className="text-amber-500" />;
      default: return <Info size={14} className="text-blue-400" />;
    }
  };

  return (
    <div className="bg-pretzel-indigo border border-slate-800 rounded-xl p-5 shadow-sm overflow-hidden flex flex-col h-[500px]">
      <h3 className="text-sm font-medium text-slate-300 flex justify-between items-center mb-4">
        <span className="flex items-center gap-2">
          <Radio size={16} className="text-blue-400 animate-pulse" /> Live Activity Feed
        </span>
        <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">Live</span>
      </h3>
      
      <div className="flex-1 overflow-y-auto pr-2 space-y-4 relative">
        <div className="absolute left-[11px] top-2 bottom-0 w-px bg-slate-800 pointer-events-none"></div>
        {events.map((event, idx) => (
          <div key={idx} className="relative z-10 flex gap-3 pb-2 last:pb-0">
            <div className="mt-0.5 h-6 w-6 rounded-full bg-pretzel-indigo border border-slate-700 flex items-center justify-center z-10">
              {getIconForEvent(event.type, event.severity)}
            </div>
            <div>
              <p className={clsx(
                "text-sm font-medium",
                event.severity === 'error' ? 'text-rose-200' :
                event.severity === 'warning' ? 'text-amber-200' : 'text-slate-200'
              )}>
                {event.message}
              </p>
              <span className="text-xs text-slate-500">{event.time} &middot; {event.type.toUpperCase()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

