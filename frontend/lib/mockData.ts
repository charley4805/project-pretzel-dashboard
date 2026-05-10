export type AgentStatus = 'online' | 'offline' | 'warning' | 'error' | 'idle';
export type AgentType = 'support' | 'social' | 'leadgen';

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  status: AgentStatus;
  avatar: string;
  handle: string;
  description: string;
}

export interface Activity {
  id: string;
  agentType: AgentType;
  agentName: string;
  action: string;
  detail: string;
  timestamp: string;
  badge?: string;
  badgeColor?: 'emerald' | 'amber' | 'red' | 'violet';
}

export interface Lead {
  id: string;
  name: string;
  source: string;
  score: number;
  status: 'new' | 'qualified' | 'contacted' | 'converted' | 'disqualified';
  date: string;
}

export interface Post {
  id: string;
  platform: string;
  content: string;
  scheduledFor: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  engagement: number;
}

export interface Conversation {
  id: string;
  user: string;
  agent: string;
  status: 'active' | 'resolved' | 'escalated' | 'pending';
  messageCount: number;
  lastActive: string;
  satisfaction?: number;
}

export interface Campaign {
  id: string;
  name: string;
  platform: string;
  status: 'active' | 'paused' | 'completed';
  leads: number;
  conversion: number;
}

export const agents: Agent[] = [
  { id: 'sa-1', name: 'Support Agent Alpha', type: 'support', status: 'online', avatar: '/avatar-1\.svg', handle: '@support-alpha', description: 'Handles billing & account inquiries' },
  { id: 'sa-2', name: 'Support Agent Beta', type: 'support', status: 'online', avatar: '/avatar-2\.svg', handle: '@support-beta', description: 'Technical support & troubleshooting' },
  { id: 'sa-3', name: 'Support Agent Gamma', type: 'support', status: 'online', avatar: '/avatar-3\.svg', handle: '@support-gamma', description: 'General inquiries & onboarding' },
  { id: 'sa-4', name: 'Support Agent Delta', type: 'support', status: 'warning', avatar: '/avatar-4\.svg', handle: '@support-delta', description: 'Escalation handling & L2 support' },
  { id: 'sa-5', name: 'Support Agent Epsilon', type: 'support', status: 'online', avatar: '/avatar-5\.svg', handle: '@support-epsilon', description: 'Enterprise & priority support' },
  { id: 'sa-6', name: 'Support Agent Zeta', type: 'support', status: 'error', avatar: '/avatar-6\.svg', handle: '@support-zeta', description: 'After-hours support coverage' },
  { id: 'ma-1', name: 'Social Agent Prime', type: 'social', status: 'online', avatar: '/avatar-1\.svg', handle: '@social-prime', description: 'LinkedIn content & engagement' },
  { id: 'ma-2', name: 'Social Agent Duo', type: 'social', status: 'online', avatar: '/avatar-3\.svg', handle: '@social-duo', description: 'Twitter monitoring & replies' },
  { id: 'ma-3', name: 'Social Agent Trio', type: 'social', status: 'warning', avatar: '/avatar-6\.svg', handle: '@social-trio', description: 'Instagram & visual content' },
  { id: 'ma-4', name: 'Social Agent Quad', type: 'social', status: 'online', avatar: '/avatar-4\.svg', handle: '@social-quad', description: 'Community management & DMs' },
  { id: 'lg-1', name: 'Lead Gen Scout', type: 'leadgen', status: 'online', avatar: '/avatar-2\.svg', handle: '@lead-scout', description: 'Reddit & forum prospecting' },
  { id: 'lg-2', name: 'Lead Gen Hunter', type: 'leadgen', status: 'online', avatar: '/avatar-4\.svg', handle: '@lead-hunter', description: 'IndieHackers & ProductHunt' },
  { id: 'lg-3', name: 'Lead Gen Tracker', type: 'leadgen', status: 'online', avatar: '/avatar-6\.svg', handle: '@lead-tracker', description: 'Twitter DM outreach' },
  { id: 'lg-4', name: 'Lead Gen Miner', type: 'leadgen', status: 'online', avatar: '/avatar-5\.svg', handle: '@lead-miner', description: 'LinkedIn Sales Navigator' },
  { id: 'lg-5', name: 'Lead Gen Sniper', type: 'leadgen', status: 'warning', avatar: '/avatar-1\.svg', handle: '@lead-sniper', description: 'Qualified lead verification' },
];

export const conversations: Conversation[] = [
  { id: 'conv-1', user: 'sarah@acme.com', agent: 'sa-1', status: 'active', messageCount: 12, lastActive: '2m ago', satisfaction: 4.5 },
  { id: 'conv-2', user: 'mike@techcorp.io', agent: 'sa-2', status: 'resolved', messageCount: 8, lastActive: '5m ago', satisfaction: 5 },
  { id: 'conv-3', user: 'alex@startup.co', agent: 'sa-3', status: 'escalated', messageCount: 24, lastActive: '1m ago' },
  { id: 'conv-4', user: 'jordan@enterprise.com', agent: 'sa-4', status: 'active', messageCount: 18, lastActive: '30s ago' },
  { id: 'conv-5', user: 'casey@smallbiz.com', agent: 'sa-5', status: 'resolved', messageCount: 6, lastActive: '12m ago', satisfaction: 4.8 },
  { id: 'conv-6', user: 'taylor@freelance.net', agent: 'sa-1', status: 'pending', messageCount: 3, lastActive: '8m ago' },
  { id: 'conv-7', user: 'riley@bigco.org', agent: 'sa-2', status: 'active', messageCount: 15, lastActive: '1m ago' },
  { id: 'conv-8', user: 'quinn@design.studio', agent: 'sa-3', status: 'resolved', messageCount: 10, lastActive: '15m ago', satisfaction: 4.2 },
  { id: 'conv-9', user: 'drew@saas.co', agent: 'sa-5', status: 'active', messageCount: 7, lastActive: '3m ago' },
  { id: 'conv-10', user: 'blake@ecommerce.io', agent: 'sa-1', status: 'resolved', messageCount: 9, lastActive: '20m ago', satisfaction: 5 },
  { id: 'conv-11', user: 'avery@consulting.com', agent: 'sa-2', status: 'escalated', messageCount: 32, lastActive: '45s ago' },
  { id: 'conv-12', user: 'sam@mobile.app', agent: 'sa-4', status: 'active', messageCount: 14, lastActive: '4m ago' },
];

export const leads: Lead[] = [
  { id: 'lead-1', name: 'Reddit User u/saasfounder', source: 'Reddit r/SaaS', score: 92, status: 'qualified', date: '2m ago' },
  { id: 'lead-2', name: 'IndieHacker @johnbuilds', source: 'IndieHackers', score: 87, status: 'qualified', date: '5m ago' },
  { id: 'lead-3', name: 'Twitter @startup_gal', source: 'Twitter DM', score: 76, status: 'contacted', date: '12m ago' },
  { id: 'lead-4', name: 'PH User Jane Doe', source: 'ProductHunt', score: 94, status: 'converted', date: '1h ago' },
  { id: 'lead-5', name: 'LinkedIn Alex Chen', source: 'LinkedIn', score: 81, status: 'qualified', date: '8m ago' },
  { id: 'lead-6', name: 'IH User @bootstrapper', source: 'IndieHackers', score: 45, status: 'disqualified', date: '15m ago' },
  { id: 'lead-7', name: 'Reddit u/devtoolsfan', source: 'Reddit r/developer', score: 88, status: 'new', date: '3m ago' },
  { id: 'lead-8', name: 'Twitter @techlead_mike', source: 'Twitter', score: 72, status: 'contacted', date: '25m ago' },
  { id: 'lead-9', name: 'PH User StartupFan', source: 'ProductHunt', score: 65, status: 'new', date: '10m ago' },
  { id: 'lead-10', name: 'LinkedIn Sarah Johnson', source: 'LinkedIn', score: 91, status: 'qualified', date: '7m ago' },
  { id: 'lead-11', name: 'Reddit u/entrepreneur99', source: 'Reddit r/entrepreneur', score: 58, status: 'new', date: '18m ago' },
  { id: 'lead-12', name: 'IH @growthhacker', source: 'IndieHackers', score: 83, status: 'contacted', date: '30m ago' },
  { id: 'lead-13', name: 'Twitter @founderjane', source: 'Twitter', score: 79, status: 'qualified', date: '14m ago' },
  { id: 'lead-14', name: 'PH User TechEnthusiast', source: 'ProductHunt', score: 96, status: 'converted', date: '2h ago' },
  { id: 'lead-15', name: 'LinkedIn David Park', source: 'LinkedIn', score: 74, status: 'new', date: '6m ago' },
  { id: 'lead-16', name: 'Reddit u/sidehustler', source: 'Reddit r/sidehustle', score: 52, status: 'disqualified', date: '22m ago' },
  { id: 'lead-17', name: 'IH @solopreneur', source: 'IndieHackers', score: 85, status: 'qualified', date: '9m ago' },
  { id: 'lead-18', name: 'Twitter @ceolife', source: 'Twitter', score: 68, status: 'contacted', date: '35m ago' },
  { id: 'lead-19', name: 'PH User BuilderBob', source: 'ProductHunt', score: 90, status: 'qualified', date: '11m ago' },
  { id: 'lead-20', name: 'LinkedIn Emily Wong', source: 'LinkedIn', score: 77, status: 'new', date: '4m ago' },
];

export const posts: Post[] = [
  { id: 'post-1', platform: 'LinkedIn', content: '10 Mistakes Bootstrappers Make', scheduledFor: '3m ago', status: 'published', engagement: 1240 },
  { id: 'post-2', platform: 'Twitter', content: 'Productivity thread: 5 tools...', scheduledFor: '15m ago', status: 'published', engagement: 892 },
  { id: 'post-3', platform: 'Instagram', content: 'Behind the scenes at NexusAI', scheduledFor: '2h', status: 'scheduled', engagement: 0 },
  { id: 'post-4', platform: 'LinkedIn', content: 'How AI is changing customer support', scheduledFor: '1h ago', status: 'published', engagement: 2100 },
  { id: 'post-5', platform: 'Twitter', content: 'Building in public: Day 47', scheduledFor: '45m ago', status: 'published', engagement: 567 },
  { id: 'post-6', platform: 'LinkedIn', content: 'Customer success story: Acme Corp', scheduledFor: '4h', status: 'scheduled', engagement: 0 },
  { id: 'post-7', platform: 'Instagram', content: 'Team spotlight: Meet the engineers', scheduledFor: '30m ago', status: 'published', engagement: 3400 },
  { id: 'post-8', platform: 'Twitter', content: 'New feature announcement thread', scheduledFor: '1h', status: 'scheduled', engagement: 0 },
  { id: 'post-9', platform: 'LinkedIn', content: 'The future of AI agents in 2025', scheduledFor: '20m ago', status: 'published', engagement: 3200 },
  { id: 'post-10', platform: 'Twitter', content: 'Quick tip: API rate limits', scheduledFor: '5h', status: 'draft', engagement: 0 },
  { id: 'post-11', platform: 'Instagram', content: 'Design system evolution', scheduledFor: '3h', status: 'scheduled', engagement: 0 },
  { id: 'post-12', platform: 'LinkedIn', content: 'Hiring: Senior AI Engineer', scheduledFor: '10m ago', status: 'published', engagement: 780 },
  { id: 'post-13', platform: 'Twitter', content: 'Weekly metrics recap', scheduledFor: '6h', status: 'draft', engagement: 0 },
  { id: 'post-14', platform: 'Twitter', content: 'Community shoutout thread', scheduledFor: '25m ago', status: 'published', engagement: 1234 },
  { id: 'post-15', platform: 'LinkedIn', content: 'Partnership announcement: TechCorp', scheduledFor: '50m ago', status: 'published', engagement: 4500 },
];

export const campaigns: Campaign[] = [
  { id: 'camp-1', name: 'Q1 Social Growth', platform: 'LinkedIn + Twitter', status: 'active', leads: 234, conversion: 12.4 },
  { id: 'camp-2', name: 'Developer Outreach', platform: 'Reddit + IH', status: 'active', leads: 189, conversion: 8.7 },
  { id: 'camp-3', name: 'Enterprise Lead Gen', platform: 'LinkedIn', status: 'paused', leads: 67, conversion: 15.2 },
];

export const activities: Activity[] = [
  { id: 'act-1', agentType: 'support', agentName: 'Support Agent #3', action: 'Resolved ticket #4821', detail: 'Billing inquiry — Refund processed', timestamp: '1m ago', badge: 'Resolved', badgeColor: 'emerald' },
  { id: 'act-2', agentType: 'leadgen', agentName: 'Lead Gen Agent #2', action: 'New qualified lead found', detail: 'Reddit r/entrepreneur — SaaS pricing pain', timestamp: '2m ago', badge: 'Qualified', badgeColor: 'violet' },
  { id: 'act-3', agentType: 'social', agentName: 'Social Agent #1', action: 'Published post to LinkedIn', detail: '"10 Mistakes Bootstrappers Make" — 1.2K impressions', timestamp: '3m ago' },
  { id: 'act-4', agentType: 'support', agentName: 'Support Agent #1', action: 'Escalated ticket #4823', detail: 'Database connectivity issue — L2 assigned', timestamp: '4m ago', badge: 'Escalated', badgeColor: 'amber' },
  { id: 'act-5', agentType: 'leadgen', agentName: 'Lead Gen Agent #4', action: 'Outreach delivered', detail: 'IndieHackers user replied to DM', timestamp: '5m ago', badge: 'Converted', badgeColor: 'emerald' },
  { id: 'act-6', agentType: 'social', agentName: 'Social Agent #2', action: 'High-engagement tweet detected', detail: 'Viral thread opportunity in #buildinpublic', timestamp: '6m ago', badge: 'Trending', badgeColor: 'amber' },
  { id: 'act-7', agentType: 'support', agentName: 'Support Agent #5', action: 'Started conversation', detail: 'New live chat — Enterprise onboarding', timestamp: '7m ago' },
  { id: 'act-8', agentType: 'leadgen', agentName: 'Lead Gen Agent #1', action: 'Scan target updated', detail: 'Added ProductHunt "Ask" section to scan', timestamp: '8m ago' },
  { id: 'act-9', agentType: 'social', agentName: 'Social Agent #3', action: 'Comment reply sent', detail: 'Replied to 3 Instagram DMs about pricing', timestamp: '10m ago' },
  { id: 'act-10', agentType: 'support', agentName: 'Support Agent #2', action: 'Ticket auto-closed', detail: 'Resolved via knowledge base — Password reset', timestamp: '12m ago', badge: 'Resolved', badgeColor: 'emerald' },
  { id: 'act-11', agentType: 'leadgen', agentName: 'Lead Gen Agent #3', action: 'Lead disqualified', detail: 'IndieHackers — Budget too small (<$50/mo)', timestamp: '14m ago', badge: 'Disqualified', badgeColor: 'red' },
  { id: 'act-12', agentType: 'social', agentName: 'Social Agent #4', action: 'Campaign report generated', detail: 'Q1 Social ROI: 340% — Click for details', timestamp: '15m ago' },
  { id: 'act-13', agentType: 'support', agentName: 'Support Agent #4', action: 'Customer satisfaction rated', detail: 'Ticket #4815 — 5 stars — "Amazing support!"', timestamp: '18m ago', badge: 'Positive', badgeColor: 'emerald' },
  { id: 'act-14', agentType: 'leadgen', agentName: 'Lead Gen Agent #5', action: 'Forum scan completed', detail: 'r/SaaS: 23 new posts scanned, 4 flagged', timestamp: '20m ago' },
  { id: 'act-15', agentType: 'support', agentName: 'Support Agent #6', action: 'Agent went offline', detail: 'Scheduled maintenance — Auto-backup', timestamp: '22m ago', badge: 'Offline', badgeColor: 'red' },
  { id: 'act-16', agentType: 'social', agentName: 'Social Agent #1', action: 'Content calendar updated', detail: '3 posts scheduled for tomorrow', timestamp: '25m ago' },
  { id: 'act-17', agentType: 'leadgen', agentName: 'Lead Gen Agent #2', action: 'Lead moved to contacted', detail: 'Twitter DM sent to @startupfounder', timestamp: '28m ago' },
  { id: 'act-18', agentType: 'support', agentName: 'Support Agent #3', action: 'Knowledge base suggestion', detail: 'New article suggested: "API Rate Limits"', timestamp: '30m ago' },
  { id: 'act-19', agentType: 'social', agentName: 'Social Agent #2', action: 'Negative sentiment alert', detail: 'Twitter mention flagged — "Frustrated with UX"', timestamp: '32m ago', badge: 'Alert', badgeColor: 'amber' },
  { id: 'act-20', agentType: 'leadgen', agentName: 'Lead Gen Agent #4', action: 'Pipeline milestone', detail: 'Weekly target reached: 47 qualified leads', timestamp: '35m ago', badge: 'Milestone', badgeColor: 'violet' },
];

// Performance trends data (last 7 days)
export const performanceData = [
  { day: 'Mon', conversations: 28, resolved: 24, responseTime: 158, escalationRate: 14 },
  { day: 'Tue', conversations: 32, resolved: 28, responseTime: 142, escalationRate: 12 },
  { day: 'Wed', conversations: 35, resolved: 31, responseTime: 135, escalationRate: 10 },
  { day: 'Thu', conversations: 38, resolved: 34, responseTime: 128, escalationRate: 11 },
  { day: 'Fri', conversations: 41, resolved: 37, responseTime: 120, escalationRate: 9 },
  { day: 'Sat', conversations: 44, resolved: 40, responseTime: 115, escalationRate: 8 },
  { day: 'Sun', conversations: 47, resolved: 43, responseTime: 108, escalationRate: 7 },
];

// Sparkline data for KPI cards
export const sparklineData = {
  activeAgents: [8, 9, 10, 9, 11, 12, 12],
  conversations: [28, 32, 35, 38, 41, 44, 47],
  responseTime: [142, 135, 128, 120, 115, 108, 102],
  satisfaction: [89.1, 90.3, 91.5, 92.1, 92.8, 93.5, 94.2],
};

// Hourly breakdown data
export const hourlyBreakdown = {
  support: [2, 5, 8, 12, 7, 9, 11, 14, 10, 6],
  social: [3, 7, 12, 9, 15, 11, 8, 14, 10, 6],
  leadgen: [15, 28, 42, 35, 50, 38, 45, 55, 40, 30],
};

// Agent group sparklines (24h trend)
export const agentGroupSparklines = {
  support: [6, 6, 5, 4, 4, 5, 6, 6, 5, 5, 6, 6],
  social: [2, 3, 2, 4, 3, 2, 3, 4, 3, 2, 3, 4],
  leadgen: [3, 4, 4, 5, 5, 4, 4, 5, 5, 4, 4, 5],
};

export function getStatusColor(status: AgentStatus): string {
  switch (status) {
    case 'online': return '#10b981';
    case 'warning': return '#f59e0b';
    case 'error': return '#ef4444';
    case 'idle': return '#6b7280';
    case 'offline': return '#6b7280';
    default: return '#6b7280';
  }
}

export function getStatusBgColor(status: AgentStatus): string {
  switch (status) {
    case 'online': return '#d1fae5';
    case 'warning': return '#fef3c7';
    case 'error': return '#fee2e2';
    case 'idle': return '#f1f5f9';
    case 'offline': return '#f1f5f9';
    default: return '#f1f5f9';
  }
}

export function getStatusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function getAgentTypeLabel(type: AgentType): string {
  switch (type) {
    case 'support': return 'Support';
    case 'social': return 'Social Media';
    case 'leadgen': return 'Lead Gen';
  }
}

export function getAgentTypeIconColor(type: AgentType): string {
  switch (type) {
    case 'support': return '#7c3aed';
    case 'social': return '#0ea5e9';
    case 'leadgen': return '#10b981';
  }
}

