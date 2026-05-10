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
        className="fixed top-4 left-4 z-50 p-2 rounded-lg md:hidden"
        style={{ backgroundColor: '#452103', border: '1px solid #5a2d04' }}
        aria-label="Open navigation"
      >
        <Menu size={18} style={{ color: '#FFC857' }} />
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
          fixed inset-y-0 left-0 z-40 w-56 flex flex-col
          transform transition-transform duration-300 ease-in-out
          md:translate-x-0
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ backgroundColor: '#452103', borderRight: '1px solid #5a2d04' }}
      >
        {/* Header */}
        <div
          className="px-5 py-5 flex items-center justify-between"
          style={{ borderBottom: '1px solid #5a2d04' }}
        >
          <div className="flex items-center gap-2.5">
            <svg width="32" height="32" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-label="Project Pretzel">
              <rect width="64" height="64" rx="12" fill="rgba(255,200,87,0.15)"/>
              <text x="32" y="44" fontFamily="serif" fontSize="36" fontWeight="bold" fill="#FFC857" textAnchor="middle">P</text>
            </svg>
            <div>
              <p className="text-sm font-semibold text-white tracking-tight leading-tight">Project Pretzel</p>
              <p className="text-[10px] tracking-widest uppercase font-medium" style={{ color: '#FFC857' }}>
                Command Center
              </p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1 rounded"
            style={{ color: '#FFC857' }}
            aria-label="Close navigation"
          >
            <X size={16} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {/* Business Operations */}
          <p className="text-[9px] uppercase tracking-widest font-semibold px-3 py-1 mb-1" style={{ color: '#B8946E' }}>
            Business
          </p>
          {navItemsMain.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href || (pathname.startsWith(href) && href !== '/admin/analytics' ? false : pathname === href);
            const isCurrentSection = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150`}
                style={{
                  backgroundColor: isCurrentSection ? 'rgba(255,200,87,0.15)' : 'transparent',
                  color: isCurrentSection ? '#FFC857' : '#E8D5B7',
                  border: isCurrentSection ? '1px solid rgba(255,200,87,0.25)' : '1px solid transparent',
                }}
              >
                <Icon
                  size={15}
                  style={{ color: isCurrentSection ? '#FFC857' : '#B8946E' }}
                />
                {label}
                {isCurrentSection && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full" style={{ backgroundColor: '#FFC857' }} />
                )}
              </Link>
            );
          })}

          {/* Divider */}
          <div className="my-3 h-px" style={{ backgroundColor: '#5a2d04' }} />

          {/* Agent Operations */}
          <p className="text-[9px] uppercase tracking-widest font-semibold px-3 py-1 mb-1" style={{ color: '#B8946E' }}>
            Agent Operations
          </p>
          {navItemsAgents.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href;
            const isCurrentSection = pathname.startsWith(href) && href !== '/admin/agents'
              ? true
              : pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150`}
                style={{
                  backgroundColor: isCurrentSection ? 'rgba(23,126,137,0.15)' : 'transparent',
                  color: isCurrentSection ? '#177E89' : '#E8D5B7',
                  border: isCurrentSection ? '1px solid rgba(23,126,137,0.25)' : '1px solid transparent',
                }}
              >
                <Icon
                  size={15}
                  style={{ color: isCurrentSection ? '#177E89' : '#B8946E' }}
                />
                {label}
                {isCurrentSection && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full" style={{ backgroundColor: '#177E89' }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div
          className="px-4 pb-5 pt-4 space-y-2"
          style={{ borderTop: '1px solid #5a2d04' }}
        >
          <p className="text-[9px] uppercase tracking-widest font-semibold mb-2" style={{ color: '#B8946E' }}>
            Live Sources
          </p>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#FFC857' }} />
            <span className="text-[11px]" style={{ color: '#E8D5B7' }}>Pretzel.io</span>
            <span className="ml-auto text-[10px]" style={{ color: '#B8946E' }}>FastAPI</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#177E89' }} />
            <span className="text-[11px]" style={{ color: '#E8D5B7' }}>PretzelKnot</span>
            <span className="ml-auto text-[10px]" style={{ color: '#B8946E' }}>.NET</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Activity size={10} style={{ color: '#177E89' }} />
            <span className="text-[10px] font-medium" style={{ color: '#177E89' }}>All systems operational</span>
          </div>
        </div>
      </aside>
    </>
  );
}
