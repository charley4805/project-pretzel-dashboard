'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
  type DroppableProvided,
  type DraggableProvided,
  type DraggableStateSnapshot,
  type DroppableStateSnapshot,
} from '@hello-pangea/dnd';
import {
  Layout,
  ScanLine,
  Mail,
  Search,
  Plus,
  Download,
  X,
  Globe,
  MessageCircle,
  Twitter,
  Linkedin,
  ExternalLink,
  TrendingUp,
  Code,
  Play,
  Trash2,
  Pencil,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Send,
  Eye,
  RotateCcw,
  Target,
  CheckCircle,
  Filter,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
} from 'recharts';
import { fetchLeadsPipeline } from '@/lib/api';

// -------------------------------------------
// TYPES
// -------------------------------------------

type PipelineStage = 'discovered' | 'qualified' | 'contacted' | 'responded' | 'meeting_scheduled' | 'converted';

interface LeadCard {
  id: string;
  name: string;
  handle: string;
  company: string;
  role: string;
  source: string;
  sourcePlatform: string;
  painPoint: string;
  score: number;
  stage: PipelineStage;
  agentId: string;
  agentName: string;
  dateDiscovered: string;
  industry?: string;
  companySize?: string;
  location?: string;
  problemFit?: number;
  intentSignals?: number;
  profileFit?: number;
  accessibility?: number;
  notes?: string;
  outreachHistory?: { id: string; day: string; action: string; time: string; status: 'completed' | 'pending' }[];
}

interface ScanTarget {
  id: string;
  platform: string;
  name: string;
  url: string;
  keywords: string;
  frequency: string;
  active: boolean;
  lastScan: string;
  leadsToday: number;
  sparkline: { value: number }[];
  avgScore: number;
}

interface OutreachEntry {
  id: string;
  leadName: string;
  leadHandle: string;
  leadAvatar: string;
  source: string;
  channel: string;
  messagePreview: string;
  fullMessage: string;
  sentAt: string;
  status: 'Sent' | 'Delivered' | 'Read' | 'Replied' | 'Bounced';
  response: 'Positive' | 'Neutral' | 'Negative' | 'None';
  stage: PipelineStage;
  agentId: string;
  agentName: string;
}

// -------------------------------------------
// MOCK DATA
// -------------------------------------------

const STAGE_CONFIG: Record<PipelineStage, { label: string; color: string; bg: string; border: string }> = {
  discovered: { label: 'DISCOVERED', color: '#94a3b8', bg: '#FFC857', border: '#452103' },
  qualified: { label: 'QUALIFIED', color: '#38bdf8', bg: '#f0f9ff', border: '#bae6fd' },
  contacted: { label: 'CONTACTED', color: '#fbbf24', bg: '#fffbeb', border: 'rgba(255,200,87,0.15)' },
  responded: { label: 'RESPONDED', color: '#34d399', bg: '#f5f3ff', border: '#ddd6fe' },
  meeting_scheduled: { label: 'MEETING SCHEDULED', color: '#ec4899', bg: '#fdf2f8', border: '#fbcfe8' },
  converted: { label: 'CONVERTED', color: '#34d399', bg: 'rgba(23,126,137,0.1)', border: '#a7f3d0' },
};

const defaultLeads: LeadCard[] = [
  // DISCOVERED
  { id: 'l1', name: 'Alex Thornton', handle: '@alex_t', company: 'TechStart Inc', role: 'Founder', source: 'Reddit r/SaaS', sourcePlatform: 'reddit', painPoint: 'Support team overwhelmed, looking for automation', score: 85, stage: 'discovered', agentId: 'lg-1', agentName: 'Scout', dateDiscovered: '2h ago', industry: 'SaaS', companySize: '10-50', location: 'San Francisco, CA', problemFit: 90, intentSignals: 75, profileFit: 88, accessibility: 82, notes: 'Found asking about alternatives to Zendesk. Mentioned their team is growing fast (20?50 people). Budget seems healthy - they have 3 tools already.', outreachHistory: [{ id: 'oh1', day: 'Day 1', action: 'Initial DM sent via Twitter', time: '3d ago', status: 'completed' }] },
  { id: 'l2', name: 'Priya Sharma', handle: 'priya@startup.io', company: 'StartupIO', role: 'CTO', source: 'IndieHackers', sourcePlatform: 'indiehackers', painPoint: 'Need better lead tracking from community', score: 72, stage: 'discovered', agentId: 'lg-2', agentName: 'Hunter', dateDiscovered: '3h ago', industry: 'B2B SaaS', companySize: '10-50', location: 'Bangalore, India', problemFit: 78, intentSignals: 65, profileFit: 80, accessibility: 70 },
  { id: 'l3', name: 'Marcus Chen', handle: '@marcuschen', company: 'ScaleUp Co', role: 'Head of Support', source: 'Twitter', sourcePlatform: 'twitter', painPoint: 'Customer churn at 15%, need retention help', score: 91, stage: 'discovered', agentId: 'lg-3', agentName: 'Tracker', dateDiscovered: '4h ago', industry: 'E-commerce', companySize: '50-200', location: 'New York, NY', problemFit: 95, intentSignals: 88, profileFit: 90, accessibility: 85 },
  { id: 'l4', name: 'Lisa Park', handle: 'lisa@techco.com', company: 'TechCo', role: 'VP Operations', source: 'ProductHunt', sourcePlatform: 'producthunt', painPoint: 'Scaling support for 10K+ users', score: 68, stage: 'discovered', agentId: 'lg-1', agentName: 'Scout', dateDiscovered: '5h ago', industry: 'Consumer App', companySize: '200-500', location: 'Seoul, South Korea', problemFit: 70, intentSignals: 60, profileFit: 75, accessibility: 65 },
  { id: 'l5', name: 'James Wright', handle: '@jwright_dev', company: 'DevShop', role: 'Solo Founder', source: 'Reddit r/entrepreneur', sourcePlatform: 'reddit', painPoint: 'Looking for AI tools to reduce manual work', score: 78, stage: 'discovered', agentId: 'lg-4', agentName: 'Miner', dateDiscovered: '6h ago', industry: 'Agency', companySize: '1-10', location: 'London, UK', problemFit: 82, intentSignals: 70, profileFit: 85, accessibility: 75 },
  { id: 'l6', name: 'Anna Kowalski', handle: 'anna@saas.io', company: 'SaaS.io', role: 'CEO', source: 'LinkedIn Group', sourcePlatform: 'linkedin', painPoint: 'Enterprise onboarding taking too long', score: 88, stage: 'discovered', agentId: 'lg-2', agentName: 'Hunter', dateDiscovered: '7h ago', industry: 'Enterprise SaaS', companySize: '200-500', location: 'Berlin, Germany', problemFit: 92, intentSignals: 80, profileFit: 90, accessibility: 88 },
  { id: 'l7', name: 'Tom Bradley', handle: '@tbradley', company: 'LaunchPad', role: 'Growth Lead', source: 'IndieHackers', sourcePlatform: 'indiehackers', painPoint: 'Need automated outreach for product launch', score: 65, stage: 'discovered', agentId: 'lg-5', agentName: 'Sniper', dateDiscovered: '8h ago', industry: 'Startup', companySize: '1-10', location: 'Toronto, Canada', problemFit: 68, intentSignals: 55, profileFit: 72, accessibility: 60 },
  { id: 'l8', name: 'Rachel Kim', handle: 'rachel@growth.co', company: 'Growth Co', role: 'Marketing Director', source: 'Twitter', sourcePlatform: 'twitter', painPoint: 'Social media management is eating my time', score: 82, stage: 'discovered', agentId: 'lg-3', agentName: 'Tracker', dateDiscovered: '9h ago', industry: 'Marketing', companySize: '10-50', location: 'Austin, TX', problemFit: 80, intentSignals: 78, profileFit: 85, accessibility: 80 },
  // QUALIFIED
  { id: 'l9', name: 'David Nakamura', handle: 'david@scaleup.com', company: 'ScaleUp', role: 'CTO', source: 'Reddit r/SaaS', sourcePlatform: 'reddit', painPoint: 'API integration issues blocking launch', score: 94, stage: 'qualified', agentId: 'lg-1', agentName: 'Scout', dateDiscovered: '1d ago', industry: 'API Platform', companySize: '50-200', location: 'Tokyo, Japan', problemFit: 98, intentSignals: 90, profileFit: 92, accessibility: 88 },
  { id: 'l10', name: 'Emily Foster', handle: '@emilyfoster', company: 'HelpDesk Pro', role: 'Support Manager', source: 'Twitter', sourcePlatform: 'twitter', painPoint: 'Looking for alternative to Zendesk', score: 87, stage: 'qualified', agentId: 'lg-2', agentName: 'Hunter', dateDiscovered: '1d ago', industry: 'SaaS', companySize: '50-200', location: 'Chicago, IL', problemFit: 95, intentSignals: 80, profileFit: 85, accessibility: 85 },
  { id: 'l11', name: 'Ryan O\'Brien', handle: 'ryan@b2b.io', company: 'B2B.io', role: 'Founder', source: 'ProductHunt', sourcePlatform: 'producthunt', painPoint: 'Manual lead qualification is bottleneck', score: 90, stage: 'qualified', agentId: 'lg-3', agentName: 'Tracker', dateDiscovered: '2d ago', industry: 'B2B', companySize: '10-50', location: 'Dublin, Ireland', problemFit: 92, intentSignals: 85, profileFit: 88, accessibility: 85 },
  { id: 'l12', name: 'Sophie Laurent', handle: 'sophie@eufirm.eu', company: 'EUFirm', role: 'Head of CX', source: 'IndieHackers', sourcePlatform: 'indiehackers', painPoint: 'Need multilingual support solution', score: 83, stage: 'qualified', agentId: 'lg-4', agentName: 'Miner', dateDiscovered: '2d ago', industry: 'Marketplace', companySize: '200-500', location: 'Paris, France', problemFit: 88, intentSignals: 72, profileFit: 85, accessibility: 80 },
  { id: 'l13', name: 'Kevin Zhang', handle: '@kevinzhang', company: 'FastGrowth', role: 'COO', source: 'Reddit r/startup', sourcePlatform: 'reddit', painPoint: 'Growing too fast, processes breaking', score: 89, stage: 'qualified', agentId: 'lg-1', agentName: 'Scout', dateDiscovered: '3d ago', industry: 'FinTech', companySize: '500+', location: 'Singapore', problemFit: 90, intentSignals: 82, profileFit: 90, accessibility: 88 },
  { id: 'l14', name: 'Maria Garcia', handle: 'maria@latam.co', company: 'LatamCo', role: 'Support Director', source: 'Twitter', sourcePlatform: 'twitter', painPoint: 'Customer support costs rising 40%', score: 86, stage: 'qualified', agentId: 'lg-5', agentName: 'Sniper', dateDiscovered: '3d ago', industry: 'E-commerce', companySize: '200-500', location: 'Mexico City, Mexico', problemFit: 92, intentSignals: 78, profileFit: 88, accessibility: 82 },
  // CONTACTED
  { id: 'l15', name: 'Nathan Brooks', handle: 'nathan@corp.com', company: 'Corp Inc', role: 'VP Engineering', source: 'Reddit r/SaaS', sourcePlatform: 'reddit', painPoint: 'Support scaling for enterprise clients', score: 92, stage: 'contacted', agentId: 'lg-1', agentName: 'Scout', dateDiscovered: '2d ago', industry: 'Enterprise', companySize: '500+', location: 'Boston, MA', problemFit: 95, intentSignals: 88, profileFit: 92, accessibility: 90 },
  { id: 'l16', name: 'Christina Wu', handle: '@christinawu', company: 'WuTech', role: 'Founder', source: 'Twitter', sourcePlatform: 'twitter', painPoint: 'Support pain on Twitter thread', score: 88, stage: 'contacted', agentId: 'lg-2', agentName: 'Hunter', dateDiscovered: '2d ago', industry: 'Consumer Tech', companySize: '10-50', location: 'Seattle, WA', problemFit: 90, intentSignals: 82, profileFit: 88, accessibility: 85 },
  { id: 'l17', name: 'Andrew Miller', handle: 'andrew@saas.io', company: 'SaaS.io', role: 'Head of Growth', source: 'IndieHackers', sourcePlatform: 'indiehackers', painPoint: 'Manual outreach not scaling', score: 85, stage: 'contacted', agentId: 'lg-3', agentName: 'Tracker', dateDiscovered: '3d ago', industry: 'SaaS', companySize: '50-200', location: 'Denver, CO', problemFit: 88, intentSignals: 80, profileFit: 85, accessibility: 82 },
  { id: 'l18', name: 'Diana Rossi', handle: 'diana@italy.it', company: 'ItaliaTech', role: 'CEO', source: 'ProductHunt', sourcePlatform: 'producthunt', painPoint: 'Customer support for EU market', score: 79, stage: 'contacted', agentId: 'lg-4', agentName: 'Miner', dateDiscovered: '3d ago', industry: 'SaaS', companySize: '10-50', location: 'Milan, Italy', problemFit: 82, intentSignals: 70, profileFit: 82, accessibility: 78 },
  { id: 'l19', name: 'Brian Taylor', handle: '@btaylor_dev', company: 'DevFirst', role: 'CTO', source: 'Reddit r/entrepreneur', sourcePlatform: 'reddit', painPoint: 'Manual outreach taking 10+ hrs/week', score: 81, stage: 'contacted', agentId: 'lg-1', agentName: 'Scout', dateDiscovered: '4d ago', industry: 'DevTools', companySize: '10-50', location: 'Portland, OR', problemFit: 85, intentSignals: 72, profileFit: 85, accessibility: 78 },
  // RESPONDED
  { id: 'l20', name: 'Jennifer Walsh', handle: 'jen@success.co', company: 'Success Co', role: 'Head of CS', source: 'Reddit r/SaaS', sourcePlatform: 'reddit', painPoint: 'Looking for support alternative', score: 96, stage: 'responded', agentId: 'lg-1', agentName: 'Scout', dateDiscovered: '1d ago', industry: 'Success Software', companySize: '50-200', location: 'Miami, FL', problemFit: 98, intentSignals: 95, profileFit: 92, accessibility: 90 },
  { id: 'l21', name: 'Michael Torres', handle: '@mtorres', company: 'TorresDigital', role: 'Founder', source: 'Twitter', sourcePlatform: 'twitter', painPoint: 'Need better support tooling', score: 91, stage: 'responded', agentId: 'lg-2', agentName: 'Hunter', dateDiscovered: '2d ago', industry: 'Agency', companySize: '10-50', location: 'Barcelona, Spain', problemFit: 92, intentSignals: 88, profileFit: 90, accessibility: 88 },
  { id: 'l22', name: 'Sarah Johnson', handle: 'sarah@agency.io', company: 'Agency IO', role: 'Managing Director', source: 'IndieHackers', sourcePlatform: 'indiehackers', painPoint: 'Support for 50+ clients', score: 89, stage: 'responded', agentId: 'lg-3', agentName: 'Tracker', dateDiscovered: '3d ago', industry: 'Agency', companySize: '50-200', location: 'Sydney, Australia', problemFit: 90, intentSignals: 85, profileFit: 88, accessibility: 82 },
  { id: 'l23', name: 'Robert Chen', handle: 'robert@enterprise.com', company: 'Enterprise Solutions', role: 'Director of IT', source: 'LinkedIn', sourcePlatform: 'linkedin', painPoint: 'Evaluating support platforms', score: 87, stage: 'responded', agentId: 'lg-4', agentName: 'Miner', dateDiscovered: '4d ago', industry: 'Enterprise', companySize: '500+', location: 'Hong Kong', problemFit: 88, intentSignals: 82, profileFit: 90, accessibility: 85 },
  // MEETING SCHEDULED
  { id: 'l24', name: 'Michelle Park', handle: 'michelle@techfirm.com', company: 'TechFirm', role: 'VP Customer Success', source: 'Reddit r/SaaS', sourcePlatform: 'reddit', painPoint: 'Onboarding 500+ enterprise users monthly', score: 93, stage: 'meeting_scheduled', agentId: 'lg-1', agentName: 'Scout', dateDiscovered: '2d ago', industry: 'Enterprise SaaS', companySize: '500+', location: 'San Jose, CA', problemFit: 95, intentSignals: 90, profileFit: 92, accessibility: 90 },
  { id: 'l25', name: 'Daniel Lee', handle: '@daniellee', company: 'StartupXYZ', role: 'CEO', source: 'Twitter', sourcePlatform: 'twitter', painPoint: 'Support costs 20% of budget', score: 90, stage: 'meeting_scheduled', agentId: 'lg-2', agentName: 'Hunter', dateDiscovered: '3d ago', industry: 'Startup', companySize: '10-50', location: 'Vancouver, Canada', problemFit: 92, intentSignals: 85, profileFit: 90, accessibility: 88 },
  // CONVERTED
  { id: 'l26', name: 'Amanda Lewis', handle: 'amanda@fintech.io', company: 'FinTech IO', role: 'Head of Operations', source: 'Reddit r/SaaS', sourcePlatform: 'reddit', painPoint: 'Support for financial products', score: 98, stage: 'converted', agentId: 'lg-1', agentName: 'Scout', dateDiscovered: '5d ago', industry: 'FinTech', companySize: '200-500', location: 'New York, NY', problemFit: 98, intentSignals: 98, profileFit: 95, accessibility: 95, notes: 'Signed Enterprise plan - $2.4K/mo. 45 seats. Implementation starting next week.', outreachHistory: [{ id: 'oh2', day: 'Day 1', action: 'Initial outreach via email', time: '7d ago', status: 'completed' }, { id: 'oh3', day: 'Day 3', action: 'Demo call scheduled', time: '5d ago', status: 'completed' }, { id: 'oh4', day: 'Day 5', action: 'Contract signed!', time: '2d ago', status: 'completed' }] },
  { id: 'l27', name: 'Jason Patel', handle: '@jpatel', company: 'Patel Ventures', role: 'Founder', source: 'Twitter', sourcePlatform: 'twitter', painPoint: 'Solo founder needs support automation', score: 95, stage: 'converted', agentId: 'lg-2', agentName: 'Hunter', dateDiscovered: '1w ago', industry: 'Venture', companySize: '1-10', location: 'London, UK', problemFit: 95, intentSignals: 92, profileFit: 95, accessibility: 95, notes: 'Pro plan upgrade - $480/mo. Annual billing.', outreachHistory: [{ id: 'oh5', day: 'Day 1', action: 'Twitter DM sent', time: '10d ago', status: 'completed' }, { id: 'oh6', day: 'Day 4', action: 'Follow-up with case study', time: '7d ago', status: 'completed' }, { id: 'oh7', day: 'Day 7', action: 'Upgraded to Pro', time: '4d ago', status: 'completed' }] },
  { id: 'l28', name: 'Laura Simmons', handle: 'laura@healthtech.co', company: 'HealthTech Co', role: 'COO', source: 'IndieHackers', sourcePlatform: 'indiehackers', painPoint: 'HIPAA-compliant support needed', score: 97, stage: 'converted', agentId: 'lg-3', agentName: 'Tracker', dateDiscovered: '1w ago', industry: 'HealthTech', companySize: '200-500', location: 'Nashville, TN', problemFit: 98, intentSignals: 95, profileFit: 95, accessibility: 92, notes: 'Team plan - 15 seats - $1.2K/mo. Compliance review passed.', outreachHistory: [{ id: 'oh8', day: 'Day 1', action: 'IndieHackers DM', time: '10d ago', status: 'completed' }, { id: 'oh9', day: 'Day 3', action: 'Security questionnaire completed', time: '8d ago', status: 'completed' }, { id: 'oh10', day: 'Day 6', action: 'Deal closed', time: '5d ago', status: 'completed' }] },
];

const outreachHistory: OutreachEntry[] = [
  { id: 'o1', leadName: 'Nathan Brooks', leadHandle: 'nathan@corp.com', leadAvatar: 'NB', source: 'Reddit', channel: 'Email', messagePreview: 'Hi Nathan, saw your post about scaling support...', fullMessage: 'Hi Nathan, saw your post about scaling support for enterprise clients. We\'ve helped similar companies reduce ticket volume by 40% while improving CSAT. Would love to share how.', sentAt: '2d ago', status: 'Replied', response: 'Positive', stage: 'responded', agentId: 'lg-1', agentName: 'Scout' },
  { id: 'o2', leadName: 'Christina Wu', leadHandle: '@christinawu', leadAvatar: 'CW', source: 'Twitter', channel: 'DM', messagePreview: 'Hey Christina, noticed you mentioned support pain...', fullMessage: 'Hey Christina, noticed you mentioned support pain points in your recent thread. We\'ve built something that might help - can I send over a quick demo link?', sentAt: '2d ago', status: 'Replied', response: 'Positive', stage: 'responded', agentId: 'lg-2', agentName: 'Hunter' },
  { id: 'o3', leadName: 'Andrew Miller', leadHandle: 'andrew@saas.io', leadAvatar: 'AM', source: 'IndieHackers', channel: 'Email', messagePreview: 'Hi Andrew, loved your post on automation...', fullMessage: 'Hi Andrew, loved your post on automation! We\'re seeing a lot of IndieHackers struggle with the same thing. Happy to share our approach.', sentAt: '3d ago', status: 'Read', response: 'None', stage: 'contacted', agentId: 'lg-3', agentName: 'Tracker' },
  { id: 'o4', leadName: 'Diana Rossi', leadHandle: 'diana@italy.it', leadAvatar: 'DR', source: 'ProductHunt', channel: 'Email', messagePreview: 'Ciao Diana, saw your comment on our PH launch...', fullMessage: 'Ciao Diana, saw your comment on our ProductHunt launch! Would love to get your feedback on our EU-specific features.', sentAt: '3d ago', status: 'Replied', response: 'Neutral', stage: 'responded', agentId: 'lg-4', agentName: 'Miner' },
  { id: 'o5', leadName: 'Brian Taylor', leadHandle: '@btaylor_dev', leadAvatar: 'BT', source: 'Reddit', channel: 'DM', messagePreview: 'Hey Brian, your post about manual outreach resonated...', fullMessage: 'Hey Brian, your post about manual outreach resonated with me. We automated 90% of our lead gen - want to see how?', sentAt: '4d ago', status: 'Read', response: 'None', stage: 'contacted', agentId: 'lg-1', agentName: 'Scout' },
  { id: 'o6', leadName: 'Jennifer Walsh', leadHandle: 'jen@success.co', leadAvatar: 'JW', source: 'Reddit', channel: 'Email', messagePreview: 'Hi Jennifer, saw you asking about support alternatives...', fullMessage: 'Hi Jennifer, saw you asking about support alternatives to Zendesk. Our customers typically save 30% while getting better features.', sentAt: '1d ago', status: 'Replied', response: 'Positive', stage: 'converted', agentId: 'lg-1', agentName: 'Scout' },
  { id: 'o7', leadName: 'Michael Torres', leadHandle: '@mtorres', leadAvatar: 'MT', source: 'Twitter', channel: 'DM', messagePreview: 'Hey Michael, thanks for the follow! Noticed you\'re...', fullMessage: 'Hey Michael, thanks for the follow! Noticed you\'re working on agency support - we have a template that might help.', sentAt: '2d ago', status: 'Replied', response: 'Positive', stage: 'responded', agentId: 'lg-2', agentName: 'Hunter' },
  { id: 'o8', leadName: 'Sarah Johnson', leadHandle: 'sarah@agency.io', leadAvatar: 'SJ', source: 'IndieHackers', channel: 'Email', messagePreview: 'Hi Sarah, your question about integrations caught...', fullMessage: 'Hi Sarah, your question about integrations caught my eye. We have native integrations with 50+ tools including yours.', sentAt: '3d ago', status: 'Replied', response: 'Positive', stage: 'responded', agentId: 'lg-3', agentName: 'Tracker' },
  { id: 'o9', leadName: 'Robert Chen', leadHandle: 'robert@enterprise.com', leadAvatar: 'RC', source: 'LinkedIn', channel: 'InMail', messagePreview: 'Hello Robert, saw your company\'s growth announcement...', fullMessage: 'Hello Robert, saw your company\'s growth announcement. Congrats! Many fast-growing companies hit support bottlenecks - we can help you get ahead of it.', sentAt: '4d ago', status: 'Delivered', response: 'None', stage: 'contacted', agentId: 'lg-4', agentName: 'Miner' },
  { id: 'o10', leadName: 'Amanda Lewis', leadHandle: 'amanda@fintech.io', leadAvatar: 'AL', source: 'Reddit', channel: 'Email', messagePreview: 'Hi Amanda, your comment about fintech support...', fullMessage: 'Hi Amanda, your comment about fintech support challenges really resonated. Our compliance-ready solution is built for exactly your use case.', sentAt: '5d ago', status: 'Replied', response: 'Positive', stage: 'converted', agentId: 'lg-1', agentName: 'Scout' },
];

const scanTargets: ScanTarget[] = [
  { id: 'st1', platform: 'Reddit', name: 'r/SaaS', url: 'reddit.com/r/SaaS', keywords: 'support automation, help desk, customer service tool, Zendesk alternative', frequency: 'Every 15 min', active: true, lastScan: '2m ago', leadsToday: 12, avgScore: 82, sparkline: [{ value: 8 }, { value: 10 }, { value: 12 }, { value: 9 }, { value: 14 }, { value: 11 }, { value: 12 }] },
  { id: 'st2', platform: 'IndieHackers', name: 'IndieHackers Community', url: 'indiehackers.com', keywords: 'customer support, SaaS growth, automation, scaling team', frequency: 'Every 30 min', active: true, lastScan: '5m ago', leadsToday: 8, avgScore: 78, sparkline: [{ value: 5 }, { value: 7 }, { value: 8 }, { value: 6 }, { value: 9 }, { value: 7 }, { value: 8 }] },
  { id: 'st3', platform: 'ProductHunt', name: 'ProductHunt', url: 'producthunt.com', keywords: 'AI tool, customer support, automation, startup tool', frequency: 'Every 1 hour', active: true, lastScan: '15m ago', leadsToday: 5, avgScore: 75, sparkline: [{ value: 3 }, { value: 4 }, { value: 5 }, { value: 4 }, { value: 6 }, { value: 5 }, { value: 5 }] },
  { id: 'st4', platform: 'Twitter', name: 'Twitter/X Mentions', url: 'twitter.com (search + list)', keywords: '#customersupport, #SaaS, help desk, support tool', frequency: 'Real-time (stream)', active: true, lastScan: 'Live', leadsToday: 15, avgScore: 71, sparkline: [{ value: 10 }, { value: 12 }, { value: 15 }, { value: 11 }, { value: 14 }, { value: 13 }, { value: 15 }] },
  { id: 'st5', platform: 'LinkedIn', name: 'LinkedIn Groups', url: 'linkedin.com/groups', keywords: 'customer experience, support automation, B2B SaaS', frequency: 'Every 2 hours', active: false, lastScan: '3h ago', leadsToday: 0, avgScore: 80, sparkline: [{ value: 4 }, { value: 5 }, { value: 0 }, { value: 0 }, { value: 0 }, { value: 0 }, { value: 0 }] },
  { id: 'st6', platform: 'Discord', name: 'Discord Communities', url: 'discord.gg (multiple servers)', keywords: 'looking for tool, need help with, recommendation, alternative to', frequency: 'Every 20 min', active: true, lastScan: '8m ago', leadsToday: 7, avgScore: 68, sparkline: [{ value: 4 }, { value: 5 }, { value: 6 }, { value: 5 }, { value: 7 }, { value: 6 }, { value: 7 }] },
  { id: 'st7', platform: 'HackerNews', name: 'HackerNews', url: 'news.ycombinator.com', keywords: 'Show HN, Ask HN: support, customer service', frequency: 'Every 1 hour', active: true, lastScan: '22m ago', leadsToday: 3, avgScore: 74, sparkline: [{ value: 2 }, { value: 3 }, { value: 3 }, { value: 2 }, { value: 4 }, { value: 3 }, { value: 3 }] },
  { id: 'st8', platform: 'StackOverflow', name: 'StackOverflow', url: 'stackoverflow.com/questions/tagged', keywords: 'customer support API, help desk integration, support webhook', frequency: 'Every 2 hours', active: false, lastScan: '4h ago', leadsToday: 0, avgScore: 72, sparkline: [{ value: 2 }, { value: 2 }, { value: 1 }, { value: 0 }, { value: 0 }, { value: 0 }, { value: 0 }] },
];

// -------------------------------------------
// HELPERS
// -------------------------------------------

function getScoreColor(score: number): string {
  if (score >= 80) return '#177E89';
  if (score >= 50) return '#FFC857';
  return '#FC814A';
}

function getSourceIcon(source: string) {
  if (source.includes('Reddit')) return <Globe size={14} className="text-orange-500" />;
  if (source.includes('Twitter')) return <Twitter size={14} className="text-sky-500" />;
  if (source.includes('LinkedIn')) return <Linkedin size={14} className="text-blue-600" />;
  if (source.includes('ProductHunt')) return <ExternalLink size={14} className="text-rose-500" />;
  if (source.includes('IndieHackers')) return <MessageCircle size={14} className="text-indigo-500" />;
  if (source.includes('Discord')) return <MessageCircle size={14} className="text-indigo-400" />;
  if (source.includes('HackerNews')) return <TrendingUp size={14} className="text-orange-600" />;
  if (source.includes('StackOverflow')) return <Code size={14} className="text-emerald-500" />;
  return <Globe size={14} className="text-slate-500" />;
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function getStageOrder(): PipelineStage[] {
  return ['discovered', 'qualified', 'contacted', 'responded', 'meeting_scheduled', 'converted'];
}

const stageOrder = getStageOrder();

// -------------------------------------------
// MINI SPARKLINE COMPONENT
// -------------------------------------------

function MiniSparkline({ data, color }: { data: { value: number }[]; color: string }) {
  return (
    <div className="h-10 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.2} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#spark-${color.replace('#', '')})`} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// -------------------------------------------
// KANBAN BOARD
// -------------------------------------------

function KanbanBoard({ leads, onCardClick }: { leads: LeadCard[]; onCardClick: (lead: LeadCard) => void }) {
  const [localLeads, setLocalLeads] = useState(leads);

  const leadsByStage = useMemo(() => {
    const map: Record<PipelineStage, LeadCard[]> = {
      discovered: [], qualified: [], contacted: [], responded: [], meeting_scheduled: [], converted: [],
    };
    stageOrder.forEach(stage => { map[stage] = []; });
    localLeads.forEach(lead => {
      if (map[lead.stage]) map[lead.stage].push(lead);
    });
    return map;
  }, [localLeads]);

  const onDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;
    const sourceStage = result.source.droppableId as PipelineStage;
    const destStage = result.destination.droppableId as PipelineStage;
    if (sourceStage === destStage) return;

    const leadId = result.draggableId;
    setLocalLeads(prev => prev.map(l => l.id === leadId ? { ...l, stage: destStage } : l));
  }, []);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 px-1" style={{ minHeight: 600 }}>
        {stageOrder.map((stage, colIdx) => {
          const config = STAGE_CONFIG[stage];
          const stageLeads = leadsByStage[stage];
          return (
            <motion.div
              key={stage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: colIdx * 0.06, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
              className="flex-shrink-0 rounded-xl flex flex-col"
              style={{ width: 280, backgroundColor: config.bg, borderTop: `3px solid ${config.color}` }}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: config.border }}>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold" style={{ color: config.color }}>{config.label}</span>
                </div>
                <Badge
                  className="text-xs font-semibold"
                  style={{ backgroundColor: `${config.color}20`, color: config.color, borderColor: `${config.color}40` }}
                  variant="outline"
                >
                  {stageLeads.length}
                </Badge>
              </div>

              {/* Droppable Area */}
              <Droppable droppableId={stage}>
                {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="flex-1 p-3 flex flex-col gap-2.5 min-h-[400px] rounded-b-xl transition-colors duration-200"
                    style={{
                      backgroundColor: snapshot.isDraggingOver ? `${config.color}15` : 'transparent',
                      border: snapshot.isDraggingOver ? `2px dashed ${config.color}60` : '2px dashed transparent',
                    }}
                  >
                    {stageLeads.map((lead, idx) => (
                      <Draggable key={lead.id} draggableId={lead.id} index={idx}>
                        {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => onCardClick(lead)}
                            className="bg-slate-900/40 rounded-lg border border-slate-800 p-3.5 cursor-grab active:cursor-grabbing hover:shadow-md hover:bg-slate-800/50 transition-all duration-200 group"
                            style={{
                              ...provided.draggableProps.style,
                              transform: snapshot.isDragging
                                ? `${provided.draggableProps.style?.transform || ''} scale(1.03) rotate(2deg)`
                                : provided.draggableProps.style?.transform,
                              boxShadow: snapshot.isDragging ? '0 8px 24px rgba(0,0,0,0.12)' : undefined,
                            }}
                          >
                          <motion.div
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.25, delay: idx * 0.025, type: 'spring', stiffness: 300, damping: 25 }}
                          >
                            {/* Top Row */}
                            <div className="flex items-start justify-between mb-1.5">
                              <div className="flex items-center gap-1.5 min-w-0">
                                {getSourceIcon(lead.source)}
                                <span className="text-[13px] font-semibold text-slate-200 truncate">{lead.name}</span>
                              </div>
                              <div
                                className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2 bg-slate-900/40"
                                style={{ borderColor: getScoreColor(lead.score), color: getScoreColor(lead.score) }}
                              >
                                {lead.score}
                              </div>
                            </div>
                            {/* Handle */}
                            <p className="text-xs text-slate-500 mb-1.5 truncate">{lead.handle}</p>
                            {/* Source Badge */}
                            <div className="mb-1.5">
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5" style={{ backgroundColor: `${config.color}15`, color: config.color, border: 'none' }}>
                                {lead.source}
                              </Badge>
                            </div>
                            {/* Pain Point */}
                            <p className="text-xs text-slate-400 line-clamp-1 mb-2.5 leading-relaxed">{lead.painPoint}</p>
                            {/* Bottom Row */}
                            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                              <span className="text-[11px] text-slate-400">{lead.dateDiscovered}</span>
                              <div className="flex items-center gap-1.5">
                                <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center">
                                  <Target size={10} className="text-white" />
                                </div>
                                <span className="text-[10px] text-slate-500 font-medium">{lead.agentName}</span>
                              </div>
                            </div>
                          </motion.div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </motion.div>
          );
        })}
      </div>
    </DragDropContext>
  );
}

// -------------------------------------------
// SCAN TARGETS
// -------------------------------------------

function ScanTargetsTab() {
  const [targets, setTargets] = useState(scanTargets);

  const toggleTarget = (id: string) => {
    setTargets(prev => prev.map(t => t.id === id ? { ...t, active: !t.active } : t));
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'Reddit': return <Globe size={20} className="text-orange-500" />;
      case 'IndieHackers': return <MessageCircle size={20} className="text-indigo-500" />;
      case 'ProductHunt': return <ExternalLink size={20} className="text-rose-500" />;
      case 'Twitter': return <Twitter size={20} className="text-sky-500" />;
      case 'LinkedIn': return <Linkedin size={20} className="text-blue-600" />;
      case 'Discord': return <MessageCircle size={20} className="text-indigo-400" />;
      case 'HackerNews': return <TrendingUp size={20} className="text-orange-600" />;
      case 'StackOverflow': return <Code size={20} className="text-emerald-500" />;
      default: return <Globe size={20} className="text-slate-500" />;
    }
  };

  const getStatusColor = (active: boolean) => active ? '#177E89' : '#FFC857';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-100">Active Scan Targets</h2>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-slate-800 text-slate-300 hover:bg-slate-800/50 transition-colors">
            <Play size={14} />
            Run All Scans
          </button>
          <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-[#1a919d] transition-colors">
            <Plus size={14} />
            Add Target
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {targets.map((target, idx) => (
          <motion.div
            key={target.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: idx * 0.05, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
            className="bg-slate-900/40 rounded-xl border border-slate-800 p-5 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-800/50 flex items-center justify-center">
                  {getPlatformIcon(target.platform)}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-100">{target.name}</h3>
                  <p className="text-[13px] text-slate-500">{target.url}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getStatusColor(target.active) }} />
                  <span className="text-xs font-medium" style={{ color: getStatusColor(target.active) }}>
                    {target.active ? 'Active' : 'Paused'}
                  </span>
                </div>
                <Switch checked={target.active} onCheckedChange={() => toggleTarget(target.id)} />
              </div>
            </div>

            {/* Settings Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <p className="text-[11px] text-slate-400 uppercase tracking-wide mb-0.5">Scan Frequency</p>
                <p className="text-[13px] text-slate-300 font-medium">{target.frequency}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 uppercase tracking-wide mb-0.5">Keywords</p>
                <p className="text-[13px] text-slate-400 truncate">{target.keywords}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 uppercase tracking-wide mb-0.5">Last Scan</p>
                <p className="text-[13px] text-slate-300">{target.lastScan}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 uppercase tracking-wide mb-0.5">Leads Today</p>
                <p className="text-[13px] font-semibold text-emerald-600">{target.leadsToday}</p>
              </div>
            </div>

            {/* Sparkline */}
            <MiniSparkline data={target.sparkline} color={target.active ? '#177E89' : '#94a3b8'} />

            {/* Footer */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800">
              <div className="flex gap-1">
                <button className="inline-flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium text-slate-400 hover:bg-slate-800/50 transition-colors">
                  <Pencil size={12} /> Edit
                </button>
                <button className="inline-flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium text-slate-400 hover:bg-slate-800/50 transition-colors">
                  <Play size={12} /> Run Now
                </button>
              </div>
              <button className="inline-flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium text-red-500 hover:bg-red-500/10 transition-colors">
                <Trash2 size={12} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// -------------------------------------------
// LEAD DETAIL SIDEBAR
// -------------------------------------------

interface SidebarTimelineEntry {
  id: string;
  day: string;
  action: string;
  time: string;
  status: 'completed' | 'pending';
}

function LeadDetailSidebar({ lead, onClose }: { lead: LeadCard; onClose: () => void }) {
  const scoreColor = getScoreColor(lead.score);
  const circumference = 2 * Math.PI * 36;
  const scoreOffset = circumference - (lead.score / 100) * circumference;

  const breakdowns = [
    { label: 'Problem Fit', value: lead.problemFit || 0, color: '#34d399' },
    { label: 'Intent Signals', value: lead.intentSignals || 0, color: '#38bdf8' },
    { label: 'Profile Fit', value: lead.profileFit || 0, color: '#34d399' },
    { label: 'Accessibility', value: lead.accessibility || 0, color: '#fbbf24' },
  ];

  const timeline: SidebarTimelineEntry[] = lead.outreachHistory || [
    { id: 'tl1', day: 'Day 1', action: `Initial outreach via ${lead.source?.includes('Twitter') ? 'DM' : 'email'}`, time: '3d ago', status: 'completed' },
    { id: 'tl2', day: 'Day 2', action: 'Follow-up with case study link', time: '2d ago', status: 'completed' },
    { id: 'tl3', day: 'Day 3', action: 'No response - scheduled bump', time: '1d ago', status: 'pending' },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed right-0 top-16 bottom-0 w-[420px] bg-slate-900/40 shadow-2xl z-50 overflow-y-auto border-l border-slate-800"
      >
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/40 border-b border-slate-800 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold text-slate-100">Lead Profile</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-800/50 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Profile */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center text-white text-lg font-bold shrink-0">
                {getInitials(lead.name)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-slate-100">{lead.name}</h3>
                <p className="text-[13px] text-slate-500">{lead.handle}</p>
                <p className="text-[13px] text-slate-400 mt-0.5">{lead.role} at <span className="font-medium">{lead.company}</span></p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <Badge variant="secondary" className="text-[10px]" style={{ backgroundColor: `${STAGE_CONFIG[lead.stage].color}15`, color: STAGE_CONFIG[lead.stage].color }}>
                {STAGE_CONFIG[lead.stage].label}
              </Badge>
              <span className="text-xs text-slate-400">Discovered {lead.dateDiscovered}</span>
            </div>
          </motion.div>

          {/* Info Grid */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-2 gap-3"
          >
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-[11px] text-slate-400 uppercase tracking-wide">Industry</p>
              <p className="text-[13px] text-slate-300 font-medium">{lead.industry || 'N/A'}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-[11px] text-slate-400 uppercase tracking-wide">Company Size</p>
              <p className="text-[13px] text-slate-300 font-medium">{lead.companySize || 'N/A'}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-[11px] text-slate-400 uppercase tracking-wide">Location</p>
              <p className="text-[13px] text-slate-300 font-medium">{lead.location || 'N/A'}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-[11px] text-slate-400 uppercase tracking-wide">Source</p>
              <div className="flex items-center gap-1">
                {getSourceIcon(lead.source)}
                <p className="text-[13px] text-slate-300 font-medium">{lead.source}</p>
              </div>
            </div>
          </motion.div>

          {/* Score Circle */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center py-2"
          >
            <div className="relative w-24 h-24">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="36" fill="none" stroke="#452103" strokeWidth="5" />
                <motion.circle
                  cx="40" cy="40" r="36" fill="none" stroke={scoreColor}
                  strokeWidth="5" strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: scoreOffset }}
                  transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-slate-100">{lead.score}</span>
                <span className="text-[10px] text-slate-400">/ 100</span>
              </div>
            </div>
            <p className="text-sm font-semibold text-slate-300 mt-2">Qualification Score</p>
          </motion.div>

          {/* Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="space-y-3"
          >
            <h4 className="text-sm font-semibold text-slate-100">Score Breakdown</h4>
            {breakdowns.map((item, idx) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + idx * 0.08 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-400">{item.label}</span>
                  <span className="text-xs font-semibold text-slate-300">{item.value}%</span>
                </div>
                <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: item.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    transition={{ duration: 0.4, delay: 0.4 + idx * 0.08, ease: 'easeOut' }}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Pain Points */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h4 className="text-sm font-semibold text-slate-100 mb-2">Pain Points</h4>
            <div className="flex flex-wrap gap-1.5">
              {['Customer support scaling', 'Manual processes', 'High costs', 'Tool fragmentation'].map(tag => (
                <span key={tag} className="text-[10px] font-medium px-2 py-1 rounded-md bg-red-500/10 text-red-400 border border-red-100">
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Intent Signals */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <h4 className="text-sm font-semibold text-slate-100 mb-2">Intent Signals</h4>
            <div className="flex flex-wrap gap-1.5">
              {['Asked for pricing', 'Mentioned competitor', 'Used comparison language', 'Budget mentioned'].map(tag => (
                <span key={tag} className="text-[10px] font-medium px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-100">
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Notes */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h4 className="text-sm font-semibold text-slate-100 mb-2">Notes</h4>
            <textarea
              className="w-full min-h-[100px] p-3 rounded-lg border border-slate-800 text-[13px] text-slate-300 bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 resize-none"
              defaultValue={lead.notes || `${lead.painPoint}. Found via ${lead.source}. Score driven by strong problem-solution fit.`}
            />
            <div className="flex items-center gap-1 mt-1.5">
              <CheckCircle2 size={12} className="text-emerald-500" />
              <span className="text-[11px] text-slate-400">Saved</span>
            </div>
          </motion.div>

          {/* Outreach History */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <h4 className="text-sm font-semibold text-slate-100 mb-3">Outreach History</h4>
            <div className="space-y-0">
              {timeline.map((entry, idx) => (
                <div key={entry.id} className="flex gap-3 relative">
                  {idx < timeline.length - 1 && (
                    <div className="absolute left-[7px] top-6 bottom-0 w-px bg-[rgba(255,200,87,0.15)]" />
                  )}
                  <div className="mt-0.5">
                    {entry.status === 'completed' ? (
                      <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    ) : (
                      <Clock size={14} className="text-amber-500 shrink-0" />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className="text-[12px] text-slate-500 font-medium">{entry.day}: {entry.time}</p>
                    <p className="text-[13px] text-slate-300">{entry.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Discovery Context */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h4 className="text-sm font-semibold text-slate-100 mb-2">Discovery Context</h4>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-[12px] text-slate-500 mb-1">Original post on {lead.source}</p>
              <p className="text-[13px] text-slate-300 italic">&ldquo;{lead.painPoint}&rdquo;</p>
              <a href="#" className="text-[12px] text-sky-600 hover:text-sky-400 mt-2 inline-flex items-center gap-0.5">
                View original post <ExternalLink size={10} />
              </a>
            </div>
          </motion.div>

          {/* Actions Footer */}
          <div className="sticky bottom-0 bg-slate-900/40 border-t border-slate-800 pt-4 pb-2 space-y-2">
            <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-[#1a919d] transition-colors">
              <ChevronRight size={16} /> Move to Next Stage
            </button>
            <div className="flex gap-2">
              <button className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-slate-800 text-slate-300 hover:bg-slate-800/50 transition-colors">
                <Send size={12} /> Send Message
              </button>
              <button className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-red-600 hover:bg-red-500/10 transition-colors">
                <AlertCircle size={12} /> Disqualify
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// -------------------------------------------
// OUTREACH LOG
// -------------------------------------------

function OutreachLogTab() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Sent': return { bg: 'bg-slate-800/50', text: 'text-slate-300', border: 'border-slate-300' };
      case 'Delivered': return { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-300' };
      case 'Read': return { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-300' };
      case 'Replied': return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-300' };
      case 'Bounced': return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-300' };
      default: return { bg: 'bg-slate-800/50', text: 'text-slate-300', border: 'border-slate-300' };
    }
  };

  const getResponseBadge = (response: string) => {
    switch (response) {
      case 'Positive': return 'bg-emerald-100 text-emerald-400 border-emerald-300';
      case 'Neutral': return 'bg-amber-100 text-amber-400 border-amber-300';
      case 'Negative': return 'bg-red-100 text-red-400 border-red-300';
      default: return 'bg-slate-800/50 text-slate-400 border-slate-300';
    }
  };

  const getRowStyle = (entry: OutreachEntry) => {
    if (entry.stage === 'converted') return 'bg-emerald-500/10/50';
    if (entry.response === 'None' && entry.status !== 'Bounced') return 'border-l-[3px] border-l-amber-400';
    return '';
  };

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { value: '47', label: 'messages sent', trend: '+23%', trendColor: 'text-emerald-600' },
          { value: '68%', label: 'avg response rate', trend: '+12%', trendColor: 'text-emerald-600' },
          { value: '18h', label: 'avg response time', trend: '-4h', trendColor: 'text-emerald-600' },
          { value: '14.9%', label: 'lead ? customer', trend: '+3.2%', trendColor: 'text-emerald-600' },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: idx * 0.05 }}
            className="bg-slate-900/40 rounded-xl border border-slate-800 p-4"
          >
            <p className="text-2xl font-bold text-slate-100">{stat.value}</p>
            <p className="text-[11px] text-slate-500 uppercase tracking-wide mt-0.5">{stat.label}</p>
            <p className={`text-[11px] font-medium mt-1 ${stat.trendColor}`}>{stat.trend}</p>
          </motion.div>
        ))}
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.2 }}
        className="bg-slate-900/40 rounded-xl border border-slate-800 shadow-sm overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-100">Outreach Log</h3>
          <div className="flex gap-2">
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-800 text-slate-300 hover:bg-slate-800/50 transition-colors">
              <Filter size={12} /> Filter
            </button>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-800 text-slate-300 hover:bg-slate-800/50 transition-colors">
              <Download size={12} /> Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-800/50">
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Lead</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Source</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Message</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Channel</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Response</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {outreachHistory.map((entry, idx) => {
                const statusStyle = getStatusBadge(entry.status);
                return (
                  <motion.tr
                    key={entry.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.02 }}
                    className={`border-b border-slate-800 hover:bg-slate-800/50 transition-colors ${getRowStyle(entry)}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center text-white text-[10px] font-bold">
                          {getInitials(entry.leadName)}
                        </div>
                        <div>
                          <p className="text-[13px] font-medium text-slate-200">{entry.leadName}</p>
                          <p className="text-[11px] text-slate-500">{entry.leadHandle}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {getSourceIcon(entry.source)}
                        <span className="text-[12px] text-slate-400">{entry.source}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[12px] text-slate-400 truncate max-w-[200px]">{entry.messagePreview}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[12px] text-slate-400">{entry.channel}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                        {entry.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${getResponseBadge(entry.response)}`}>
                        {entry.response}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button className="p-1 rounded hover:bg-slate-800/50 text-slate-500 transition-colors">
                          <Eye size={14} />
                        </button>
                        {entry.response === 'None' && entry.status !== 'Bounced' && (
                          <button className="p-1 rounded hover:bg-slate-800/50 text-slate-500 transition-colors">
                            <RotateCcw size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

// -------------------------------------------
// KPI PILLS
// -------------------------------------------

function KpiPills() {
  const pills = [
    { icon: Search, value: 378, label: 'scanned', color: '#94a3b8' },
    { icon: Target, value: 47, label: 'qualified', color: '#38bdf8' },
    { icon: Send, value: 12, label: 'contacted', color: '#fbbf24' },
    { icon: CheckCircle, value: 3, label: 'converted', color: '#34d399' },
  ];

  return (
    <div className="flex items-center gap-2">
      {pills.map((pill, idx) => (
        <motion.div
          key={pill.label}
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: idx * 0.04 }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800/50"
        >
          <pill.icon size={14} style={{ color: pill.color }} />
          <span className="text-sm font-bold text-slate-200">{pill.value}</span>
          <span className="text-xs text-slate-500">{pill.label}</span>
        </motion.div>
      ))}
    </div>
  );
}

// -------------------------------------------
// MAIN PAGE
// -------------------------------------------

export default function LeadGen() {
  const [activeTab, setActiveTab] = useState('pipeline');
  const [selectedLead, setSelectedLead] = useState<LeadCard | null>(null);
  const [leads, setLeads] = useState<LeadCard[]>(defaultLeads);
  useEffect(() => {
    fetchLeadsPipeline().then(data => setLeads(data)).catch(() => {});
  }, []);

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Lead Generation</h1>
          <p className="mt-1 text-[13px] text-slate-500">5 agents scanning - 8 active targets - Last scan: 2m ago</p>
        </div>
        <KpiPills />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="bg-slate-800/50 p-1">
            <TabsTrigger value="pipeline" className="data-[state=active]:bg-slate-900/40 data-[state=active]:text-emerald-400 text-slate-400 text-sm gap-1.5">
              <Layout size={16} /> Pipeline
            </TabsTrigger>
            <TabsTrigger value="scantargets" className="data-[state=active]:bg-slate-900/40 data-[state=active]:text-emerald-400 text-slate-400 text-sm gap-1.5">
              <ScanLine size={16} /> Scan Targets
            </TabsTrigger>
            <TabsTrigger value="outreach" className="data-[state=active]:bg-slate-900/40 data-[state=active]:text-emerald-400 text-slate-400 text-sm gap-1.5">
              <Mail size={16} /> Outreach Log
            </TabsTrigger>
          </TabsList>

          {activeTab === 'pipeline' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-2"
            >
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search leads..."
                  className="pl-8 pr-3 py-1.5 h-8 rounded-lg border border-slate-800 text-sm text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 w-48"
                />
              </div>
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 text-white hover:bg-[#1a919d] transition-colors h-8">
                <Plus size={12} /> Add Target
              </button>
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-800 text-slate-300 hover:bg-slate-800/50 transition-colors h-8">
                <Download size={12} /> Export
              </button>
            </motion.div>
          )}
        </div>

        <TabsContent value="pipeline" className="mt-0">
          <KanbanBoard leads={leads} onCardClick={setSelectedLead} />
        </TabsContent>

        <TabsContent value="scantargets" className="mt-0">
          <ScanTargetsTab />
        </TabsContent>

        <TabsContent value="outreach" className="mt-0">
          <OutreachLogTab />
        </TabsContent>
      </Tabs>

      {/* Lead Detail Sidebar */}
      <AnimatePresence>
        {selectedLead && (
          <LeadDetailSidebar lead={selectedLead} onClose={() => setSelectedLead(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

