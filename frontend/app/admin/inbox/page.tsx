'use client';

import { useEffect, useState } from 'react';
import { Mail, Star } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

interface Email {
  id: string; from: string; subject: string; snippet: string;
  unread: boolean; starred: boolean; date: string; category: string;
}

const FALLBACK_SUPPORT: Email[] = [
  { id: '1', from: 'sarah@example.com', subject: 'Issue with my contractor profile', snippet: "Hi, I'm having trouble updating my profile picture and trade certifications...", unread: true,  starred: false, date: '2026-03-27T09:14:00Z', category: 'support' },
  { id: '2', from: 'mike@example.com',  subject: "Help — can't accept payment",      snippet: "I accepted a job through PretzelKnot but the payment isn't showing...",           unread: true,  starred: true,  date: '2026-03-27T08:47:00Z', category: 'support' },
  { id: '3', from: 'jen@acme.co',       subject: 'Bug: search returns no results',   snippet: "When I search for 'plumber near 90210' the list comes back empty...",             unread: false, starred: false, date: '2026-03-26T16:22:00Z', category: 'support' },
];
const FALLBACK_SALES: Email[] = [
  { id: '101', from: 'tom@bigco.com',      subject: 'Pricing inquiry — enterprise plan', snippet: 'We have a team of 40 contractors and are looking for a platform solution...',  unread: true,  starred: true,  date: '2026-03-27T10:02:00Z', category: 'sales' },
  { id: '102', from: 'lisa@startup.io',    subject: 'Demo request',                      snippet: "I'd love to schedule a product walkthrough for our operations team...",         unread: true,  starred: false, date: '2026-03-27T07:35:00Z', category: 'sales' },
  { id: '103', from: 'david@property.com', subject: 'Upgrade question — Pro plan',       snippet: "Currently on Solo but we're growing. What does Pro include exactly?...",        unread: false, starred: false, date: '2026-03-26T14:10:00Z', category: 'sales' },
];
const FALLBACK_STATS = { total_unread: 4, support_unread: 2, sales_unread: 2, starred: 2, account: 'admin@projectpretzel.org', connected: false };

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
  const [support, setSupport] = useState<Email[]>(FALLBACK_SUPPORT);
  const [sales,   setSales]   = useState<Email[]>(FALLBACK_SALES);
  const [stats,   setStats]   = useState(FALLBACK_STATS);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/admin/inbox/stats`).then(r => r.json()).catch(() => FALLBACK_STATS),
      fetch(`${API}/api/admin/inbox/support`).then(r => r.json()).catch(() => FALLBACK_SUPPORT),
      fetch(`${API}/api/admin/inbox/sales`).then(r => r.json()).catch(() => FALLBACK_SALES),
    ]).then(([st, sp, sa]) => { setStats(st); setSupport(sp); setSales(sa); });
  }, []);

  return (
    <div className="p-6 space-y-6 text-white min-h-screen">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Inbox</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {stats.account}
            {!stats.connected && <span className="ml-2 text-xs text-amber-600 border border-amber-800/40 bg-amber-900/20 rounded px-1.5 py-0.5">mock data</span>}
            {stats.connected  && <span className="ml-2 text-xs text-emerald-500 border border-emerald-800/40 bg-emerald-900/20 rounded px-1.5 py-0.5">● live</span>}
          </p>
        </div>
        <div className="flex gap-3">
          {[
            { label: 'Unread',  value: stats.total_unread,   color: 'text-amber-400'   },
            { label: 'Support', value: stats.support_unread, color: 'text-blue-400'    },
            { label: 'Sales',   value: stats.sales_unread,   color: 'text-emerald-400' },
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
            {stats.support_unread > 0 && (
              <span className="ml-auto text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full">{stats.support_unread} unread</span>
            )}
          </div>
          <div className="space-y-2">{support.map(e => <EmailCard key={e.id} email={e} />)}</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Mail size={14} className="text-emerald-400" />
            <h2 className="text-sm font-medium text-slate-300">Sales</h2>
            {stats.sales_unread > 0 && (
              <span className="ml-auto text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">{stats.sales_unread} unread</span>
            )}
          </div>
          <div className="space-y-2">{sales.map(e => <EmailCard key={e.id} email={e} />)}</div>
        </div>
      </div>
    </div>
  );
}
