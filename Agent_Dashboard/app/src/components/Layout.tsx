import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Bell } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard', subtitle: 'Real-time overview of your agent fleet' },
  '/support': { title: 'Support Console', subtitle: 'Live chat queue and conversation management' },
  '/social': { title: 'Social Media Hub', subtitle: 'Content calendar and campaign management' },
  '/leads': { title: 'Lead Gen Scanner', subtitle: 'Lead pipeline and scan target management' },
  '/settings': { title: 'Agent Settings', subtitle: 'Configure agents, prompts, rules, and integrations' },
  '/training': { title: 'Agent Training', subtitle: 'Train agents with examples, feedback, and fine-tuning' },
  '/guardrails': { title: 'Guardrails', subtitle: 'Safety boundaries and policy enforcement' },
  '/harnesses': { title: 'Agent Harnesses', subtitle: 'Multi-agent workflow orchestration' },
  '/vault': { title: 'Obsidian Vault', subtitle: 'Shared knowledge base for all agents' },
  '/resources': { title: 'Resources', subtitle: 'Documentation, architecture, and connector guides' },
};

export default function Layout() {
  const location = useLocation();
  const pageInfo = pageTitles[location.pathname] || { title: 'Dashboard', subtitle: '' };
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="flex min-h-[100dvh]">
      <Navbar />
      <div className="flex-1 flex flex-col" style={{ marginLeft: 256 }}>
        {/* Top Bar */}
        <header className="sticky top-0 z-40 h-16 bg-[#141B41] border-b border-[#1c2658] flex items-center justify-between px-8">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{pageInfo.title}</h1>
          </div>
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative flex items-center">
              <motion.div
                animate={{ width: searchOpen ? 240 : 36 }}
                transition={{ duration: 0.2 }}
                className="relative h-9 rounded-lg bg-[#1c2658] flex items-center overflow-hidden"
              >
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="flex items-center justify-center w-9 h-9 shrink-0 text-slate-400 hover:text-white"
                >
                  <Search size={18} />
                </button>
                {searchOpen && (
                  <input
                    type="text"
                    placeholder="Search anything..."
                    className="flex-1 bg-transparent text-sm text-white placeholder-slate-400 outline-none pr-3"
                    autoFocus
                  />
                )}
              </motion.div>
            </div>
            {/* Notifications */}
            <button className="relative w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:bg-[#1c2658] hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FC814A] rounded-full" />
            </button>
            {/* Avatar */}
            <img
              src="/avatar-1.jpg"
              alt="User"
              className="w-8 h-8 rounded-full object-cover border border-[#1c2658] cursor-pointer"
            />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 bg-[#141B41]">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
          >
            <Outlet />
          </motion.div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
