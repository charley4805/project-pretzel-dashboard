'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, TrendingUp, DollarSign, Activity, BarChart2, Mail, Share2, Menu, X, Bot, Headphones, MessageSquare, Target, Settings, BookOpen } from 'lucide-react';

const navItemsMain = [
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Marketing', href: '/admin/marketing', icon: TrendingUp },
  { label: 'Sales', href: '/admin/sales', icon: DollarSign },
  { label: 'Traffic', href: '/admin/traffic', icon: BarChart2 },
  { label: 'Inbox', href: '/admin/inbox', icon: Mail },
  { label: 'Social', href: '/admin/social', icon: Share2 },
];

const navItemsAgents = [
  { label: 'Agents', href: '/admin/agents', icon: Bot, section: true },
  { label: '   Support', href: '/admin/agents/support', icon: Headphones },
  { label: '   Social', href: '/admin/agents/social', icon: MessageSquare },
  { label: '   Leads', href: '/admin/agents/leads', icon: Target },
  { label: '   Settings', href: '/admin/agents/settings', icon: Settings },
  { label: '   Vault', href: '/admin/agents/vault', icon: BookOpen },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-[#0d0d0d] border border-slate-800 md:hidden"
        aria-label="Open navigation"
      >
        <Menu size={18} className="text-slate-400" />
      </button>

      {/* Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-56 bg-[#0d0d0d] border-r border-slate-800/70 flex flex-col
          transform transition-transform duration-300 ease-in-out
          md:translate-x-0
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="px-5 py-5 border-b border-slate-800/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src="/Pretzel_transparent.png"
              alt="Project Pretzel"
              className="w-8 h-8 object-contain"
            />
            <div>
              <p className="text-sm font-semibold text-white tracking-tight leading-tight">Project Pretzel</p>
              <p className="text-[10px] text-amber-500/80 tracking-widest uppercase font-medium">Command Center</p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1 rounded text-slate-500 hover:text-slate-300"
            aria-label="Close navigation"
          >
            <X size={16} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {/* Business Operations */}
          {navItemsMain.map(({ label, href, icon: Icon }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${isActive
                  ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                  }`}
              >
                <Icon size={15} className={isActive ? 'text-amber-400' : 'text-slate-500'} />
                {label}
                {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-amber-400" />}
              </Link>
            );
          })}

          {/* Divider */}
          <div className="my-3 h-px bg-slate-800/50" />

          {/* Agent Operations */}
          <p className="text-[9px] uppercase tracking-widest text-slate-600 font-semibold px-3 py-2">Agent Operations</p>
          {navItemsAgents.map(({ label, href, icon: Icon }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${isActive
                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                  }`}
              >
                <Icon size={15} className={isActive ? 'text-emerald-400' : 'text-slate-500'} />
                {label}
                {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400" />}
              </Link>
            );
          })}
        </nav>

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
    </>
  );
}
