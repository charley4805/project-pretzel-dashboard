import React, { useEffect, useState } from 'react';
import { Activity, ServerCrash, CheckCircle2 } from 'lucide-react';

export function HealthStatusGrid() {
  const [healthData, setHealthData] = useState<any[]>([]);

  useEffect(() => {
    // Mocking API fetch
    setHealthData([
      {"name": "Main API", "status": "healthy", "latency": "110ms", "uptime": "99.99%"},
      {"name": "PostgreSQL DB", "status": "healthy", "latency": "45ms", "uptime": "99.98%"},
      {"name": "Redis Cache", "status": "healthy", "latency": "5ms", "uptime": "100%"},
      {"name": "Celery Workers", "status": "warning", "latency": "0ms", "uptime": "99.10%"},
      {"name": "Knot App", "status": "healthy", "latency": "80ms", "uptime": "99.95%"},
    ]);
  }, []);

  return (
    <div className="bg-pretzel-indigo border border-slate-800 rounded-xl p-5 shadow-sm">
      <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2 mb-4">
        <Activity size={16} className="text-emerald-400" /> Platform Health Pulse
      </h3>
      
      <div className="space-y-3">
        {healthData.map((service, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 bg-pretzel-indigo border border-slate-800 rounded-md hover:bg-slate-900 transition">
            <div className="flex items-center gap-3">
              {service.status === 'healthy' ? (
                <CheckCircle2 size={16} className="text-emerald-500" />
              ) : (
                <ServerCrash size={16} className="text-amber-500 animate-pulse" />
              )}
              <span className="text-slate-200 text-sm font-medium">{service.name}</span>
            </div>
            
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-slate-400 w-16 text-right">{service.latency}</span>
              <span className={service.status === 'healthy' ? "text-emerald-400" : "text-amber-400"}>
                {service.uptime}
              </span>
            </div>
          </div>
        ))}
        {healthData.length === 0 && (
          <div className="p-4 text-center text-sm text-slate-500">Checking health signals...</div>
        )}
      </div>
    </div>
  );
}

