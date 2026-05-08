import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  MessageSquare,
  Share2,
  Target,
  Settings,
  ChevronLeft,
  ChevronRight,
  Brain,
  Shield,
  Workflow,
  BookOpen,
  Library,
} from 'lucide-react';

const navGroups = [
  {
    label: 'OVERVIEW',
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    ],
  },
  {
    label: 'AGENTS',
    items: [
      { to: '/support', icon: MessageSquare, label: 'Support Console' },
      { to: '/social', icon: Share2, label: 'Social Media Hub' },
      { to: '/leads', icon: Target, label: 'Lead Gen Scanner' },
    ],
  },
  {
    label: 'AI SYSTEM',
    items: [
      { to: '/training', icon: Brain, label: 'Agent Training' },
      { to: '/guardrails', icon: Shield, label: 'Guardrails' },
      { to: '/harnesses', icon: Workflow, label: 'Harnesses' },
      { to: '/vault', icon: BookOpen, label: 'Obsidian Vault' },
    ],
  },
  {
    label: 'MANAGEMENT',
    items: [
      { to: '/settings', icon: Settings, label: 'Agent Settings' },
      { to: '/resources', icon: Library, label: 'Resources' },
    ],
  },
];

export default function Navbar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="fixed left-0 top-0 h-screen bg-[#141B41] flex flex-col z-50 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 h-16 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-[#FC814A] flex items-center justify-center shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="5" r="2" fill="white" />
            <circle cx="6" cy="10" r="2" fill="white" />
            <circle cx="18" cy="10" r="2" fill="white" />
            <circle cx="8" cy="17" r="2" fill="white" />
            <circle cx="16" cy="17" r="2" fill="white" />
            <line x1="12" y1="7" x2="6" y2="10" stroke="white" strokeWidth="1.5" />
            <line x1="12" y1="7" x2="18" y2="10" stroke="white" strokeWidth="1.5" />
            <line x1="6" y1="12" x2="8" y2="17" stroke="white" strokeWidth="1.5" />
            <line x1="18" y1="12" x2="16" y2="17" stroke="white" strokeWidth="1.5" />
            <line x1="8" y1="17" x2="16" y2="17" stroke="white" strokeWidth="1.5" />
          </svg>
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="text-white text-lg font-bold whitespace-nowrap"
            >
              NexusAI
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav Groups */}
      <nav className="flex-1 overflow-y-auto py-4">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-4">
            <AnimatePresence>
              {!collapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="px-6 pb-2 pt-4 text-[10px] font-medium text-slate-500 uppercase tracking-[0.08em]"
                >
                  {group.label}
                </motion.p>
              )}
            </AnimatePresence>
            {collapsed && <div className="h-4" />}
            {group.items.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className="relative flex items-center mx-3 mb-0.5 rounded-xl h-10 px-3 transition-colors duration-150 group"
                  style={{
                    backgroundColor: isActive ? '#1c2658' : 'transparent',
                  }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#FFC857] rounded-r-full"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <item.icon
                    size={18}
                    className="shrink-0"
                    style={{
                      color: isActive ? '#FFC857' : '#94a3b8',
                    }}
                  />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="ml-3 text-[13px] font-medium whitespace-nowrap"
                        style={{
                          color: isActive ? '#ffffff' : '#94a3b8',
                        }}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {!isActive && (
                    <div
                      className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                      style={{ backgroundColor: '#1c2658' }}
                    />
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <div className="shrink-0 p-3 border-t border-[#1c2658]">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full h-9 rounded-lg text-slate-400 hover:text-white hover:bg-[#1c2658] transition-colors duration-150"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </motion.aside>
  );
}
