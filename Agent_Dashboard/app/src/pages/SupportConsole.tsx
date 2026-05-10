import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Send,
  Paperclip,
  AlertTriangle,
  MessageSquare,
  MoreVertical,
  Check,
  ChevronDown,
  UserCheck,
  ArrowUpCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

// ─── Types ───────────────────────────────────────────────────────────────────

type ConversationStatus = 'active' | 'resolved' | 'escalated' | 'waiting';
type Priority = 'low' | 'medium' | 'high' | 'critical';
type Sentiment = 'positive' | 'neutral' | 'negative' | 'very_negative';
type AgentWorkStatus = 'online' | 'busy' | 'offline';
type Severity = 'critical' | 'high' | 'medium';

interface ChatMessage {
  id: string;
  type: 'customer' | 'agent' | 'system';
  content: string;
  timestamp: string;
  agentName?: string;
  avatar?: string;
  cannedLabel?: string;
}

interface Conversation {
  id: string;
  userName: string;
  email: string;
  avatar: string;
  plan: string;
  lastMessage: string;
  timestamp: string;
  status: ConversationStatus;
  priority: Priority;
  sentiment: Sentiment;
  unread: number;
  ticketNumber: string;
  tags: string[];
  messages: ChatMessage[];
}

interface SupportAgent {
  id: string;
  number: string;
  name: string;
  avatar: string;
  status: AgentWorkStatus;
  currentTask: string;
  load: number;
  conversations: number;
  totalToday: number;
  avgResponseTime: string;
  uptime: string;
}

interface EscalationTicket {
  id: string;
  ticketNumber: string;
  customer: string;
  plan: string;
  issue: string;
  reason: string;
  waitingTime: string;
  solutionsTried: string[];
  severity: Severity;
  assignedTeam: string;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const planColors: Record<string, string> = {
  Enterprise: 'bg-violet-100 text-violet-700',
  Pro: 'bg-sky-100 text-sky-700',
  Starter: 'bg-[#0c1130] text-slate-600',
};

const statusConfig: Record<ConversationStatus, { color: string; bg: string; dot: string; label: string }> = {
  active: { color: 'text-emerald-700', bg: 'bg-emerald-50', dot: 'bg-emerald-500', label: 'Active' },
  resolved: { color: 'text-slate-600', bg: 'bg-[#0c1130]', dot: 'bg-slate-400', label: 'Resolved' },
  escalated: { color: 'text-red-700', bg: 'bg-red-50', dot: 'bg-red-500', label: 'Escalated' },
  waiting: { color: 'text-amber-700', bg: 'bg-amber-50', dot: 'bg-amber-500', label: 'Waiting' },
};

const priorityConfig: Record<Priority, { color: string; bg: string; label: string }> = {
  low: { color: 'text-slate-600', bg: 'bg-[#0c1130]', label: 'Low' },
  medium: { color: 'text-sky-700', bg: 'bg-sky-100', label: 'Medium' },
  high: { color: 'text-amber-700', bg: 'bg-amber-100', label: 'High' },
  critical: { color: 'text-red-700', bg: 'bg-red-100', label: 'Critical' },
};

const severityConfig: Record<Severity, { color: string; bg: string; border: string; dot: string; label: string }> = {
  critical: { color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500', label: 'Critical' },
  high: { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-500', label: 'High' },
  medium: { color: 'text-sky-700', bg: 'bg-sky-50', border: 'border-sky-200', dot: 'bg-sky-500', label: 'Medium' },
};

// Note: sentiment is part of Conversation type for future use
// Sentiment type available for future enhancements
void 0 as unknown as Record<Sentiment, never>;

const sarahMessages: ChatMessage[] = [
  { id: 'm1', type: 'system', content: 'Conversation started — Enterprise customer\nTicket #4821 created', timestamp: '10:15 AM' },
  { id: 'm2', type: 'agent', content: 'Hello Sarah! Welcome back. I\'m Agent #3. How can I help you today?', timestamp: '10:15 AM', agentName: 'Agent #3', avatar: '/avatar-3.jpg' },
  { id: 'm3', type: 'customer', content: 'Hi, our team has been getting 500 Internal Server Errors on the API for the past hour. This is blocking our checkout flow. Very urgent.', timestamp: '10:16 AM', avatar: '/avatar-6.jpg' },
  { id: 'm4', type: 'agent', content: "I'm sorry to hear that. Let me check your account status and recent API logs right away.", timestamp: '10:17 AM', agentName: 'Agent #3', avatar: '/avatar-3.jpg' },
  { id: 'm5', type: 'system', content: 'Agent #3 is checking server logs...', timestamp: '10:18 AM' },
  { id: 'm6', type: 'agent', content: 'I can see the issue. There was a rate limiting misconfiguration on your Enterprise plan. I\'m fixing it now.', timestamp: '10:19 AM', agentName: 'Agent #3', avatar: '/avatar-3.jpg', cannedLabel: 'Rate Limit Fix' },
  { id: 'm7', type: 'customer', content: "Okay, how long will it take? Our customers can't complete purchases.", timestamp: '10:20 AM', avatar: '/avatar-6.jpg' },
  { id: 'm8', type: 'agent', content: "The fix is deploying now. It should be resolved within 2-3 minutes. I'll monitor it and confirm once it's live.", timestamp: '10:21 AM', agentName: 'Agent #3', avatar: '/avatar-3.jpg' },
  { id: 'm9', type: 'system', content: 'Fix deployed at 10:23 AM — Monitoring...', timestamp: '10:23 AM' },
  { id: 'm10', type: 'agent', content: 'Great news! The fix is live. I\'ve verified that your API endpoints are responding with 200 OK. Can you try a test transaction?', timestamp: '10:25 AM', agentName: 'Agent #3', avatar: '/avatar-3.jpg' },
  { id: 'm11', type: 'customer', content: 'Let me check with our dev team...', timestamp: '10:28 AM', avatar: '/avatar-6.jpg' },
  { id: 'm12', type: 'customer', content: "Yes! It's working now. Thank you so much for the quick resolution.", timestamp: '10:32 AM', avatar: '/avatar-6.jpg' },
  { id: 'm13', type: 'agent', content: "You're very welcome, Sarah. I've also increased your rate limit buffer by 20% as a precaution. Is there anything else I can help with?", timestamp: '10:33 AM', agentName: 'Agent #3', avatar: '/avatar-3.jpg' },
];

const conversations: Conversation[] = [
  { id: '1', userName: 'Sarah Mitchell', email: 'sarah@acme.com', avatar: '/avatar-6.jpg', plan: 'Enterprise', lastMessage: 'The API keeps returning 500 errors...', timestamp: '2m', status: 'active', priority: 'critical', sentiment: 'negative', unread: 2, ticketNumber: '#4821', tags: ['Enterprise', 'Technical'], messages: sarahMessages },
  { id: '2', userName: 'Mike Rodriguez', email: 'mike@techcorp.io', avatar: '/avatar-2.jpg', plan: 'Pro', lastMessage: 'Can I get a refund for last month?', timestamp: '4m', status: 'active', priority: 'medium', sentiment: 'neutral', unread: 1, ticketNumber: '#4822', tags: ['Billing'], messages: [] },
  { id: '3', userName: 'Jessica Taylor', email: 'jessica@startup.co', avatar: '/avatar-4.jpg', plan: 'Starter', lastMessage: 'How do I connect Zapier?', timestamp: '6m', status: 'waiting', priority: 'low', sentiment: 'neutral', unread: 0, ticketNumber: '#4824', tags: ['Integration'], messages: [] },
  { id: '4', userName: 'David Kim', email: 'david@enterprise.com', avatar: '/avatar-5.jpg', plan: 'Enterprise', lastMessage: 'Urgent: Our team lost dashboard access', timestamp: '8m', status: 'escalated', priority: 'critical', sentiment: 'very_negative', unread: 3, ticketNumber: '#4823', tags: ['Enterprise', 'Urgent'], messages: [] },
  { id: '5', userName: 'Emily Chen', email: 'emily@design.studio', avatar: '/avatar-1.jpg', plan: 'Pro', lastMessage: 'Feature request: dark mode for mobile', timestamp: '12m', status: 'waiting', priority: 'low', sentiment: 'positive', unread: 0, ticketNumber: '#4825', tags: ['Feature'], messages: [] },
  { id: '6', userName: 'James Wilson', email: 'james@smallbiz.com', avatar: '/avatar-3.jpg', plan: 'Starter', lastMessage: 'Billing cycle question', timestamp: '15m', status: 'active', priority: 'medium', sentiment: 'neutral', unread: 0, ticketNumber: '#4826', tags: ['Billing'], messages: [] },
  { id: '7', userName: 'Anna Lopez', email: 'anna@saas.co', avatar: '/avatar-4.jpg', plan: 'Pro', lastMessage: 'Webhook not firing on payment success', timestamp: '18m', status: 'active', priority: 'high', sentiment: 'negative', unread: 1, ticketNumber: '#4827', tags: ['Technical'], messages: [] },
  { id: '8', userName: 'Robert Brown', email: 'robert@bigco.org', avatar: '/avatar-2.jpg', plan: 'Enterprise', lastMessage: 'Need help with SSO configuration', timestamp: '22m', status: 'waiting', priority: 'high', sentiment: 'neutral', unread: 0, ticketNumber: '#4828', tags: ['Enterprise', 'Security'], messages: [] },
  { id: '9', userName: 'Lisa Wang', email: 'lisa@freelance.net', avatar: '/avatar-1.jpg', plan: 'Starter', lastMessage: 'Export data to CSV?', timestamp: '25m', status: 'resolved', priority: 'low', sentiment: 'positive', unread: 0, ticketNumber: '#4829', tags: ['Data'], messages: [] },
  { id: '10', userName: 'Tom Martinez', email: 'tom@mobile.app', avatar: '/avatar-5.jpg', plan: 'Pro', lastMessage: 'Integration with Salesforce', timestamp: '28m', status: 'active', priority: 'medium', sentiment: 'neutral', unread: 0, ticketNumber: '#4830', tags: ['Integration'], messages: [] },
  { id: '11', userName: 'Karen Lee', email: 'karen@consulting.com', avatar: '/avatar-6.jpg', plan: 'Enterprise', lastMessage: 'Custom reporting permissions', timestamp: '32m', status: 'escalated', priority: 'high', sentiment: 'negative', unread: 2, ticketNumber: '#4831', tags: ['Enterprise', 'Feature'], messages: [] },
  { id: '12', userName: 'Chris Evans', email: 'chris@ecommerce.io', avatar: '/avatar-3.jpg', plan: 'Starter', lastMessage: 'Password reset not working', timestamp: '35m', status: 'waiting', priority: 'medium', sentiment: 'neutral', unread: 0, ticketNumber: '#4832', tags: ['Account'], messages: [] },
  { id: '13', userName: 'Amanda White', email: 'amanda@techcorp.io', avatar: '/avatar-4.jpg', plan: 'Pro', lastMessage: 'API rate limit increase request', timestamp: '40m', status: 'active', priority: 'medium', sentiment: 'neutral', unread: 0, ticketNumber: '#4833', tags: ['Technical'], messages: [] },
  { id: '14', userName: 'Daniel Park', email: 'daniel@bigco.org', avatar: '/avatar-2.jpg', plan: 'Enterprise', lastMessage: 'Data migration from competitor', timestamp: '45m', status: 'active', priority: 'high', sentiment: 'positive', unread: 1, ticketNumber: '#4834', tags: ['Enterprise', 'Migration'], messages: [] },
  { id: '15', userName: 'Rachel Green', email: 'rachel@startup.co', avatar: '/avatar-1.jpg', plan: 'Starter', lastMessage: 'Cancel my subscription', timestamp: '50m', status: 'waiting', priority: 'medium', sentiment: 'negative', unread: 0, ticketNumber: '#4835', tags: ['Billing'], messages: [] },
];

const supportAgents: SupportAgent[] = [
  { id: 'a1', number: 'Agent #1', name: 'Nexus-1', avatar: '/avatar-1.jpg', status: 'online', currentTask: 'Handling #4821 — API issue', load: 65, conversations: 4, totalToday: 28, avgResponseTime: '1m 42s', uptime: '4h 12m' },
  { id: 'a2', number: 'Agent #2', name: 'Nexus-2', avatar: '/avatar-2.jpg', status: 'online', currentTask: 'Resolving billing dispute', load: 80, conversations: 5, totalToday: 34, avgResponseTime: '2m 15s', uptime: '5h 30m' },
  { id: 'a3', number: 'Agent #3', name: 'Nexus-3', avatar: '/avatar-3.jpg', status: 'online', currentTask: 'New chat — Enterprise', load: 45, conversations: 3, totalToday: 19, avgResponseTime: '1m 28s', uptime: '3h 45m' },
  { id: 'a4', number: 'Agent #4', name: 'Nexus-4', avatar: '/avatar-4.jpg', status: 'busy', currentTask: '3 escalations queued', load: 90, conversations: 6, totalToday: 41, avgResponseTime: '3m 05s', uptime: '6h 10m' },
  { id: 'a5', number: 'Agent #5', name: 'Nexus-5', avatar: '/avatar-5.jpg', status: 'online', currentTask: 'Password reset x2', load: 55, conversations: 3, totalToday: 22, avgResponseTime: '1m 55s', uptime: '4h 50m' },
  { id: 'a6', number: 'Agent #6', name: 'Nexus-6', avatar: '/avatar-6.jpg', status: 'offline', currentTask: 'Scheduled maintenance', load: 0, conversations: 0, totalToday: 0, avgResponseTime: '—', uptime: '0m' },
];

const escalationTickets: EscalationTicket[] = [
  { id: 'e1', ticketNumber: '#4823', customer: 'David Kim', plan: 'Enterprise', issue: 'Database connection timeout — checkout blocked', reason: 'Infrastructure failure affecting multiple customers', waitingTime: '8m', solutionsTried: ['Restarted DB connection pool', 'Checked network latency', 'Verified DNS resolution'], severity: 'critical', assignedTeam: 'Infrastructure' },
  { id: 'e2', ticketNumber: '#4819', customer: 'Karen Lee', plan: 'Enterprise', issue: 'SSO misconfig — 200 users locked out', reason: 'IdP certificate expired, needs manual rotation', waitingTime: '22m', solutionsTried: ['Verified SAML config', 'Re-exported metadata', 'Tested with staging IdP'], severity: 'high', assignedTeam: 'Security' },
  { id: 'e3', ticketNumber: '#4817', customer: 'Tom Chen', plan: 'Pro', issue: 'Webhook delivery failure — payment notifications', reason: 'Retry queue backed up > 10K events', waitingTime: '35m', solutionsTried: ['Cleared dead letter queue', 'Increased retry count', 'Verified endpoint health'], severity: 'high', assignedTeam: 'Platform' },
  { id: 'e4', ticketNumber: '#4812', customer: 'Lisa Park', plan: 'Pro', issue: 'Custom field API returning null values', reason: 'Schema migration incomplete for custom fields', waitingTime: '1h 12m', solutionsTried: ['Re-ran migration script', 'Checked field mappings', 'Verified API version'], severity: 'medium', assignedTeam: 'API Team' },
];

const cannedResponses = [
  { category: 'Greetings', items: [
    { label: 'Welcome greeting', text: 'Hello! Welcome to NexusAI support. How can I help you today?' },
    { label: 'Welcome back', text: 'Welcome back! Great to see you again. What can I assist with?' },
  ]},
  { category: 'Technical', items: [
    { label: 'Password reset steps', text: 'I can help you reset your password. Please check your email for a reset link which will arrive within 2 minutes.' },
    { label: 'API documentation', text: 'You can find our full API documentation at docs.nexusai.com/api. Let me know if you need help with a specific endpoint.' },
    { label: 'Clear cache', text: 'Please try clearing your browser cache and cookies, then refresh the page. This resolves most display issues.' },
  ]},
  { category: 'Billing', items: [
    { label: 'Refund processed', text: 'Your refund has been processed and should appear in your account within 3-5 business days.' },
    { label: 'Plan upgrade', text: 'I can help you upgrade your plan. The new features will be available immediately after payment confirmation.' },
  ]},
  { category: 'Closing', items: [
    { label: 'Anything else?', text: "Is there anything else I can help you with today? I'm here to assist!" },
    { label: 'Thank you', text: 'Thank you for reaching out! If you need anything else, feel free to ask. Have a great day!' },
  ]},
];

const filterTabs = [
  { key: 'all', label: 'All', count: 47 },
  { key: 'active', label: 'Active', count: 28 },
  { key: 'waiting', label: 'Waiting', count: 12 },
  { key: 'resolved', label: 'Resolved', count: 89 },
  { key: 'escalated', label: 'Escalated', count: 3 },
] as const;

// ─── Animation Config ────────────────────────────────────────────────────────

const listItemStagger = {
  hidden: { opacity: 0, x: -12 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.025, duration: 0.3, ease: 'easeOut' as const },
  }),
};

const messageStagger = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.03, duration: 0.25, ease: 'easeOut' as const },
  }),
};

const rightPanelStagger = {
  hidden: { opacity: 0, x: 8 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.04, duration: 0.3, ease: 'easeOut' as const },
  }),
};

// ─── Typing Indicator ────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3 bg-[#1c2658] border border-slate-200 rounded-2xl rounded-tl-sm w-fit">
      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
}

// ─── Status Dot ──────────────────────────────────────────────────────────────

function getStatusDotColor(status: ConversationStatus): string {
  switch (status) {
    case 'active': return '#177E89';
    case 'escalated': return '#FC814A';
    case 'waiting': return '#FFC857';
    case 'resolved': return '#94a3b8';
  }
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function SupportConsole() {
  const [selectedId, setSelectedId] = useState<string>('1');
  const [queueFilter, setQueueFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(sarahMessages);
  const [escalations, setEscalations] = useState<EscalationTicket[]>(escalationTickets);
  const [headerFilter, setHeaderFilter] = useState<string>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showTyping, setShowTyping] = useState(true);

  const selectedConversation = conversations.find((c) => c.id === selectedId) || conversations[0];

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, showTyping]);

  // Simulate typing indicator disappearing after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowTyping(false), 3000);
    return () => clearTimeout(timer);
  }, [selectedId]);

  // Filter conversations
  const filteredConversations = conversations.filter((conv) => {
    const matchesFilter =
      queueFilter === 'all' ? true :
      queueFilter === 'active' ? conv.status === 'active' :
      queueFilter === 'waiting' ? conv.status === 'waiting' :
      queueFilter === 'resolved' ? conv.status === 'resolved' :
      queueFilter === 'escalated' ? conv.status === 'escalated' : true;

    const headerMatch =
      headerFilter === 'all' ? true :
      headerFilter === 'active' ? ['active', 'waiting'].includes(conv.status) :
      headerFilter === 'resolved' ? conv.status === 'resolved' :
      headerFilter === 'escalated' ? conv.status === 'escalated' : true;

    const matchesSearch = searchQuery === '' ||
      conv.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && headerMatch && matchesSearch;
  });

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    const newMessage: ChatMessage = {
      id: `new-${Date.now()}`,
      type: 'agent',
      content: messageText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }),
      agentName: 'Agent #3',
      avatar: '/avatar-3.jpg',
    };
    setMessages((prev) => [...prev, newMessage]);
    setMessageText('');
    setShowTyping(true);
  };

  const handleClaimEscalation = (id: string) => {
    setEscalations((prev) => prev.filter((e) => e.id !== id));
  };

  const handleInsertCanned = (text: string) => {
    setMessageText((prev) => (prev ? prev + ' ' + text : text));
  };

  const escalatedCount = conversations.filter((c) => c.status === 'escalated').length;
  const onlineAgents = supportAgents.filter((a) => a.status === 'online').length;

  return (
    <div className="flex flex-col h-[calc(100dvh-64px)] bg-[#141B41] overflow-hidden">
      {/* ── Page Header Bar ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="flex items-center justify-between px-6 py-3 bg-[#1c2658] border-b border-slate-200 shrink-0"
      >
        <div>
          <div className="flex items-center gap-2 text-[13px] text-slate-500">
            <span className="text-emerald-600 font-semibold">{onlineAgents}</span> agents online
            <span className="text-slate-300">·</span>
            <span className="text-emerald-600 font-semibold">{conversations.length}</span> active conversations
            <span className="text-slate-300">·</span>
            <span className="text-amber-600 font-semibold">{escalatedCount}</span> escalations
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Filter pills */}
          <div className="flex items-center gap-1 bg-[#0c1130] rounded-lg p-0.5">
            {([
              { key: 'all', label: 'All' },
              { key: 'active', label: 'Active' },
              { key: 'resolved', label: 'Resolved' },
              { key: 'escalated', label: 'Escalated' },
            ] as const).map((tab, i) => (
              <motion.button
                key={tab.key}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03, duration: 0.2 }}
                onClick={() => setHeaderFilter(tab.key)}
                className={cn(
                  'px-3 py-1 rounded-md text-xs font-medium transition-all duration-150',
                  headerFilter === tab.key
                    ? 'bg-[#177E89] text-white'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-[#141B41]/60'
                )}
              >
                {tab.label}
              </motion.button>
            ))}
          </div>
          {/* Search */}
          <div className="relative flex items-center">
            <Search size={14} className="absolute left-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-56 h-9 pl-8 pr-3 text-sm bg-[#1c2658] border-0 rounded-lg text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#ddd6fe] focus:bg-[#1c2658] transition-all"
            />
          </div>
        </div>
      </motion.div>

      {/* ── Main Three-Column Layout ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Column 1: Chat Queue ── */}
        <div className="w-[280px] bg-[#1c2658] border-r border-slate-200 flex flex-col shrink-0">
          {/* Queue filter tabs */}
          <div className="sticky top-0 z-10 bg-[#1c2658] border-b border-slate-200 px-3 pt-2 pb-0">
            <div className="flex">
              {filterTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setQueueFilter(tab.key)}
                  className={cn(
                    'flex-1 pb-2 text-xs font-medium border-b-2 transition-colors duration-150 text-center',
                    queueFilter === tab.key
                      ? 'text-[#177E89] border-[#177E89]'
                      : 'text-slate-500 border-transparent hover:text-slate-700'
                  )}
                >
                  {tab.label}{' '}
                  <span className="text-slate-400">({tab.count})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="px-3 py-2 border-b border-slate-100">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, ticket #, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-8 pr-2 text-xs bg-[#0c1130] border-0 rounded-lg text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#ddd6fe] focus:bg-[#1c2658] transition-all"
              />
            </div>
          </div>

          {/* Conversation List */}
          <ScrollArea className="flex-1">
            <div className="py-1">
              {filteredConversations.map((conv, i) => (
                <motion.button
                  key={conv.id}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={listItemStagger}
                  onClick={() => {
                    setSelectedId(conv.id);
                    if (conv.messages.length > 0) {
                      setMessages(conv.messages);
                    }
                    setShowTyping(true);
                  }}
                  className={cn(
                    'w-full text-left px-4 py-3 border-b border-slate-100 transition-all duration-150 relative',
                    selectedId === conv.id
                      ? 'bg-violet-50 border-l-[3px] border-l-[#8b5cf6]'
                      : 'hover:bg-[#0c1130] border-l-[3px] border-l-transparent'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={conv.avatar}
                          alt={conv.userName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <span
                          className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white"
                          style={{ backgroundColor: getStatusDotColor(conv.status) }}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[13px] font-semibold text-slate-900 truncate">{conv.userName}</span>
                          {conv.unread > 0 && (
                            <span className="shrink-0 w-4 h-4 rounded-full bg-[#177E89] text-white text-[10px] font-medium flex items-center justify-center">
                              {conv.unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 shrink-0">{conv.timestamp}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 pl-10">
                    <p className="text-xs text-slate-500 truncate flex-1">{conv.lastMessage}</p>
                  </div>
                  <div className="mt-1.5 flex items-center gap-1 pl-10">
                    <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-medium', priorityConfig[conv.priority].bg, priorityConfig[conv.priority].color)}>
                      {priorityConfig[conv.priority].label}
                    </span>
                    {conv.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-[#0c1130] text-slate-600 font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.button>
              ))}
            </div>
            <div className="p-3">
              <button className="w-full py-2 text-xs text-slate-500 font-medium hover:text-slate-700 hover:bg-[#0c1130] rounded-lg transition-colors flex items-center justify-center gap-1.5">
                <Clock size={12} />
                Load more conversations
              </button>
            </div>
          </ScrollArea>
        </div>

        {/* ── Column 2: Conversation Viewer ── */}
        <div className="flex-1 flex flex-col min-w-0 bg-gradient-to-b from-slate-50 to-white">
          {/* Conversation Header */}
          <div className="flex items-center justify-between px-6 py-3 bg-[#1c2658] border-b border-slate-200 shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={selectedConversation.avatar}
                  alt={selectedConversation.userName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span
                  className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white"
                  style={{ backgroundColor: getStatusDotColor(selectedConversation.status) }}
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold text-[#141B41]">{selectedConversation.userName}</span>
                  <span className={cn('text-[11px] px-2 py-0.5 rounded font-semibold', planColors[selectedConversation.plan] || 'bg-[#0c1130] text-slate-600')}>
                    {selectedConversation.plan}
                  </span>
                  <span className={cn('text-xs', statusConfig[selectedConversation.status].color)}>
                    {statusConfig[selectedConversation.status].label}
                  </span>
                  {selectedConversation.status === 'waiting' && (
                    <span className="text-xs text-amber-500">Waiting 5m</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <span>{selectedConversation.email}</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-slate-400">{selectedConversation.ticketNumber}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" className="h-8 text-xs gap-1.5">
                <UserCheck size={14} />
                Assign
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5 border-amber-300 text-amber-700 hover:bg-amber-50"
              >
                <AlertTriangle size={14} />
                Escalate
              </Button>
              <Button size="sm" className="h-8 text-xs gap-1.5 bg-[#177E89] hover:bg-[#1a919d]">
                <CheckCircle2 size={14} />
                Resolve
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Transfer</DropdownMenuItem>
                  <DropdownMenuItem>Merge</DropdownMenuItem>
                  <DropdownMenuItem>Add Note</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">Block</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Message History */}
          <ScrollArea className="flex-1 px-6 py-4">
            <div className="flex flex-col gap-4">
              {messages.map((msg, i) => {
                if (msg.type === 'system') {
                  return (
                    <motion.div
                      key={msg.id}
                      custom={i}
                      initial="hidden"
                      animate="visible"
                      variants={messageStagger}
                      className="flex items-center gap-3 my-2"
                    >
                      <div className="flex-1 h-px bg-[#141B41]" />
                      <span className="text-xs text-slate-500 whitespace-pre-line text-center">{msg.content}</span>
                      <div className="flex-1 h-px bg-[#141B41]" />
                    </motion.div>
                  );
                }

                if (msg.type === 'agent') {
                  return (
                    <motion.div
                      key={msg.id}
                      custom={i}
                      initial="hidden"
                      animate="visible"
                      variants={messageStagger}
                      className="flex items-end justify-end gap-2"
                    >
                      <div className="flex flex-col items-end max-w-[70%]">
                        <span className="text-[11px] text-violet-400 mb-0.5">{msg.agentName}</span>
                        <div className="bg-[#177E89] text-white px-4 py-2.5 rounded-2xl rounded-tr-sm">
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                        </div>
                        {msg.cannedLabel && (
                          <span className="mt-1 text-[11px] px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 font-medium">
                            Canned: {msg.cannedLabel}
                          </span>
                        )}
                        <span className="text-[11px] text-violet-300 mt-1">{msg.timestamp}</span>
                      </div>
                      <img src={msg.avatar} alt="" className="w-7 h-7 rounded-full object-cover self-end mb-5" />
                    </motion.div>
                  );
                }

                return (
                  <motion.div
                    key={msg.id}
                    custom={i}
                    initial="hidden"
                    animate="visible"
                    variants={messageStagger}
                    className="flex items-end gap-2"
                  >
                    <img src={selectedConversation.avatar} alt="" className="w-7 h-7 rounded-full object-cover self-end mb-5" />
                    <div className="max-w-[70%]">
                      <div className="bg-[#1c2658] border border-slate-200 px-4 py-2.5 rounded-2xl rounded-tl-sm">
                        <p className="text-sm text-[#141B41] leading-relaxed">{msg.content}</p>
                      </div>
                      <span className="text-[11px] text-slate-400 mt-1 block">{msg.timestamp}</span>
                    </div>
                  </motion.div>
                );
              })}

              {/* Typing indicator */}
              {showTyping && selectedConversation.status === 'active' && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-end gap-2"
                >
                  <img src={selectedConversation.avatar} alt="" className="w-7 h-7 rounded-full object-cover self-end" />
                  <TypingIndicator />
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Reply Input */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="shrink-0 bg-[#1c2658] border-t border-slate-200 px-6 py-3"
          >
            <div className="flex items-start gap-3">
              <textarea
                value={messageText}
                onChange={(e) => {
                  setMessageText(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type your reply..."
                rows={1}
                className="flex-1 min-h-[40px] max-h-[120px] px-3 py-2 text-sm text-[#141B41] placeholder:text-slate-400 bg-[#0c1130] border border-slate-200 rounded-lg resize-none outline-none focus:ring-2 focus:ring-[#ddd6fe] focus:border-[#177E89] transition-all"
              />
              <div className="flex items-center gap-1.5">
                {/* Canned responses */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-[#0c1130] hover:text-slate-700 transition-colors">
                      <MessageSquare size={16} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-72">
                    {cannedResponses.map((group) => (
                      <div key={group.category}>
                        <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          {group.category}
                        </div>
                        {group.items.map((item) => (
                          <DropdownMenuItem
                            key={item.label}
                            onClick={() => handleInsertCanned(item.text)}
                            className="flex flex-col items-start py-2"
                          >
                            <span className="text-[13px]">{item.label}</span>
                            <span className="text-[11px] text-slate-500 truncate max-w-[240px]">{item.text}</span>
                          </DropdownMenuItem>
                        ))}
                      </div>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <button className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-[#0c1130] hover:text-slate-700 transition-colors">
                  <Paperclip size={16} />
                </button>
                <button className="h-8 w-8 flex items-center justify-center rounded-lg text-amber-600 hover:bg-amber-50 transition-colors">
                  <AlertTriangle size={16} />
                </button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                  className={cn(
                    'h-8 px-3 flex items-center justify-center gap-1 rounded-lg text-sm font-medium transition-all',
                    messageText.trim()
                      ? 'bg-[#177E89] text-white hover:bg-[#1a919d]'
                      : 'bg-[#0c1130] text-slate-400 cursor-not-allowed'
                  )}
                >
                  <Send size={14} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Column 3: Right Panel ── */}
        <div className="w-[320px] bg-[#141B41] border-l border-slate-200 flex flex-col gap-4 p-4 overflow-y-auto shrink-0">
          {/* Agent Status Panel */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-[#1c2658] rounded-xl shadow-sm border border-slate-100 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#141B41]">Agent Status</span>
                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-[11px]">
                  {onlineAgents}/15 Online
                </Badge>
              </div>
              <button className="text-xs text-[#177E89] font-medium hover:underline flex items-center gap-0.5">
                View All
                <ChevronDown size={12} className="-rotate-90" />
              </button>
            </div>
            <div className="p-3 space-y-2">
              {supportAgents.map((agent, i) => (
                <motion.div
                  key={agent.id}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={rightPanelStagger}
                  className="flex items-center gap-3 p-2.5 rounded-lg bg-[#0c1130] hover:bg-[#1c2658] hover:shadow-sm transition-all cursor-pointer group"
                >
                  <div className="relative shrink-0">
                    <img src={agent.avatar} alt={agent.name} className="w-9 h-9 rounded-full object-cover" />
                    <span
                      className={cn(
                        'absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white',
                        agent.status === 'online' && 'bg-emerald-500',
                        agent.status === 'busy' && 'bg-amber-500',
                        agent.status === 'offline' && 'bg-red-500'
                      )}
                    />
                    {agent.status === 'online' && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] font-semibold text-[#141B41]">{agent.number} — {agent.name}</span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{agent.currentTask}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex flex-col items-end gap-1">
                      <div className="w-10 h-1 bg-[#141B41] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${agent.load}%` }}
                          transition={{ duration: 0.5, delay: 0.2 + i * 0.04, ease: 'easeOut' }}
                          className={cn(
                            'h-full rounded-full',
                            agent.load < 60 ? 'bg-emerald-500' : agent.load < 85 ? 'bg-amber-500' : 'bg-red-500'
                          )}
                        />
                      </div>
                    </div>
                    <span className="w-5 h-5 rounded-full bg-[#0c1130] text-slate-600 text-[10px] font-medium flex items-center justify-center">
                      {agent.conversations}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Escalation Queue */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-[#1c2658] rounded-xl shadow-sm border border-slate-100 overflow-hidden flex-1"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#141B41]">Escalation Queue</span>
                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-[11px]">
                  {escalations.length} pending
                </Badge>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-0.5">
                    All
                    <ChevronDown size={12} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>All Severities</DropdownMenuItem>
                  <DropdownMenuItem>Critical</DropdownMenuItem>
                  <DropdownMenuItem>High</DropdownMenuItem>
                  <DropdownMenuItem>Medium</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="p-3 space-y-2.5">
              <AnimatePresence mode="popLayout">
                {escalations.map((ticket, i) => (
                  <motion.div
                    key={ticket.id}
                    custom={i}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, x: 100 }}
                    variants={rightPanelStagger}
                    layout
                    className={cn(
                      'p-3 rounded-lg border transition-all hover:shadow-sm',
                      severityConfig[ticket.severity].border,
                      severityConfig[ticket.severity].bg
                    )}
                  >
                    {/* Severity */}
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className={cn('w-1.5 h-1.5 rounded-full', severityConfig[ticket.severity].dot)} />
                      <span className={cn('text-[10px] font-semibold uppercase tracking-wider', severityConfig[ticket.severity].color)}>
                        {severityConfig[ticket.severity].label}
                      </span>
                    </div>

                    {/* Ticket info */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[13px] font-semibold text-[#141B41]">{ticket.ticketNumber}</span>
                      <span className="text-xs text-slate-500">{ticket.customer}</span>
                      <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-medium', planColors[ticket.plan] || 'bg-[#0c1130] text-slate-600')}>
                        {ticket.plan}
                      </span>
                    </div>

                    {/* Issue */}
                    <p className="text-[13px] text-slate-600 mb-1.5 line-clamp-2">{ticket.issue}</p>

                    {/* Meta */}
                    <div className="flex items-center gap-2 mb-2.5">
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock size={10} />
                        {ticket.waitingTime}
                      </span>
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-[#0c1130] text-slate-600 font-medium">
                        {ticket.assignedTeam}
                      </span>
                    </div>

                    {/* Solutions tried */}
                    <div className="mb-2.5">
                      <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Solutions tried:</span>
                      <div className="mt-0.5 space-y-0.5">
                        {ticket.solutionsTried.map((solution, idx) => (
                          <div key={idx} className="flex items-center gap-1 text-[11px] text-slate-500">
                            <Check size={10} className="text-emerald-500 shrink-0" />
                            {solution}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        className="h-7 text-[11px] gap-1 bg-[#177E89] hover:bg-[#1a919d]"
                        onClick={() => handleClaimEscalation(ticket.id)}
                      >
                        <ArrowUpCircle size={12} />
                        Claim
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 text-[11px]">
                        Assign
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 text-[11px] text-slate-500">
                        View
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {escalations.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-8 text-center"
                >
                  <CheckCircle2 size={32} className="text-emerald-400 mb-2" />
                  <p className="text-sm font-medium text-slate-600">All caught up!</p>
                  <p className="text-xs text-slate-400 mt-0.5">No pending escalations</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
