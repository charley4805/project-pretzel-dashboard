'use client';

import { useEffect, useState } from 'react';
import { Mail, Star, WifiOff } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

interface Email {
  id: string; from: string; subject: string; snippet: string;
  unread: boolean; starred: boolean; date: string; category: string;
}

function Disconnected({ label = 'Disconnected — data unavailable' }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/40 px-4 py-3 text-sm text-slate-500">
      <WifiOff size={14} className="text-red-500/60 shrink-0" />
      {label}
    </div>
  );
}

function fmtDate(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 3_600_000)  return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function EmailCard({ email }: { email: Email }) {
  return (
    <div className={`p-4 rounded-lg border transition-colors cursor-pointer ${
      email.unread ? 'border-amber-500/20 bg-amber-500/5' : 'border-slate-800 bg-slate-900/40 hover:bg-slate-800/40'
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {email.unread && <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0 mt-0.5" />}
          <span className={`text-xs truncate ${email.unread ? 'text-white font-medium' : 'text-slate-400'}`}>{email.from}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {email.starred && <Star size={11} className="text-amber-400 fill-amber-400" />}
          <span className="text-[11px] text-slate-600">{fmtDate(email.date)}</span>
        </div>
      </div>
      <p className={`text-sm mt-1 ${email.unread ? 'text-white font-medium' : 'text-slate-300'}`}>{email.subject}</p>
      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{email.snippet}</p>
    </div>
  );
}

export default function InboxPage() {
  const [support, setSupport] = useState<Email[] | null>(null);
  const [sales,   setSales]   = useState<Email[] | null>(null);
  const [stats,   setStats]   = useState<any>(null);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/admin/inbox/stats`).then(r => r.json()).catch(() => null),
      fetch(`${API}/api/admin/inbox/support`).then(r => r.json()).catch(() => null),
      fetch(`${API}/api/admin/inbox/sales`).then(r => r.json()).catch(() => null),
    ]).then(([st, sp, sa]) => {
      setStats(st);
      setSupport(Array.isArray(sp) ? sp : null);
      setSales(Array.isArray(sa) ? sa : null);
    });
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-6 text-white min-h-screen">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Inbox</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {stats?.account ?? 'admin@projectpretzel.org'}
            {stats && !stats.connected && (
              <span className="ml-2 text-xs text-red-400 border border-red-800/40 bg-red-900/20 rounded px-1.5 py-0.5">
                disconnected
              </span>
            )}
            {stats?.connected && (
              <span className="ml-2 text-xs text-emerald-500 border border-emerald-800/40 bg-emerald-900/20 rounded px-1.5 py-0.5">● live</span>
            )}
          </p>
          {stats?.note && (
            <p className="text-xs text-slate-600 mt-1">{stats.note}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Unread',  value: stats?.total_unread  ?? '—', color: 'text-amber-400'   },
            { label: 'Support', value: stats?.support_unread ?? '—', color: 'text-blue-400'    },
            { label: 'Sales',   value: stats?.sales_unread  ?? '—', color: 'text-emerald-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center px-4 py-2 rounded-lg border border-slate-800 bg-slate-900/60">
              <p className={`text-lg font-bold ${color}`}>{value}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Mail size={14} className="text-blue-400" />
            <h2 className="text-sm font-medium text-slate-300">Support</h2>
            {stats?.support_unread > 0 && (
              <span className="ml-auto text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full">{stats.support_unread} unread</span>
            )}
          </div>
          {support === null || stats?.connected === false ? (
            <Disconnected label="Support inbox unavailable — configure Gmail credentials" />
          ) : support.length === 0 ? (
            <p className="text-sm text-slate-600 text-center py-6">No support emails</p>
          ) : (
            <div className="space-y-2">{support.map(e => <EmailCard key={e.id} email={e} />)}</div>
          )}
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Mail size={14} className="text-emerald-400" />
            <h2 className="text-sm font-medium text-slate-300">Sales</h2>
            {stats?.sales_unread > 0 && (
              <span className="ml-auto text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">{stats.sales_unread} unread</span>
            )}
          </div>
          {sales === null || stats?.connected === false ? (
            <Disconnected label="Sales inbox unavailable — configure Gmail credentials" />
          ) : sales.length === 0 ? (
            <p className="text-sm text-slate-600 text-center py-6">No sales emails</p>
          ) : (
            <div className="space-y-2">{sales.map(e => <EmailCard key={e.id} email={e} />)}</div>
          )}
        </div>
      </div>
    </div>
  );
}
