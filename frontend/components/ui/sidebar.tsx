'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, TrendingUp, DollarSign, Activity } from 'lucide-react';

const navItems = [
  { label: 'Analytics',  href: '/admin/analytics', icon: BarChart3,   dot: 'bg-amber-500' },
  { label: 'Marketing',  href: '/admin/marketing', icon: TrendingUp,  dot: 'bg-purple-500' },
  { label: 'Sales',      href: '/admin/sales',     icon: DollarSign,  dot: 'bg-emerald-500' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 min-h-screen bg-[#0d0d0d] border-r border-slate-800/70 flex flex-col shrink-0">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-slate-800/70">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🥨</span>
          <div>
            <p className="text-sm font-semibold text-white tracking-tight leading-tight">Project Pretzel</p>
            <p className="text-[10px] text-amber-500/80 tracking-widest uppercase font-medium">Command Center</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ label, href, icon: Icon, dot }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                isActive
                  ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              <Icon size={15} className={isActive ? 'text-amber-400' : 'text-slate-500'} />
              {label}
              {isActive && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-amber-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Data Source Indicators */}
      <div className="px-4 pb-5 space-y-2 border-t border-slate-800/70 pt-4">
        <p className="text-[9px] uppercase tracking-widest text-slate-600 font-semibold mb-2">Live Sources</p>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-[11px] text-slate-500">Pretzel.io</span>
          <span className="ml-auto text-[10px] text-slate-600">FastAPI</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
          <span className="text-[11px] text-slate-500">PretzelKnot</span>
          <span className="ml-auto text-[10px] text-slate-600">.NET</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Activity size={10} className="text-emerald-500" />
          <span className="text-[10px] text-emerald-600 font-medium">All systems operational</span>
        </div>
      </div>
    </aside>
  );
}
