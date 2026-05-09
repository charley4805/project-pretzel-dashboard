'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays, MessageCircle, Megaphone, BarChart3,
  PenSquare, Twitter, Linkedin, Instagram, Facebook,
  ChevronRight, Clock, Heart, MessageSquare, Share2, Eye,
  MoreHorizontal, Copy, Trash2, Pause, Play, Edit3,
  Flag, Send, Smile, Image,
  AlertCircle, TrendingUp, Users,
} from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { fetchSocialCampaigns } from '@/lib/api';

// ─── Types ───────────────────────────────────────────────
type Platform = 'twitter' | 'linkedin' | 'instagram' | 'facebook';
type PostType = 'educational' | 'promotional' | 'engagement';
type PostStatus = 'scheduled' | 'published' | 'draft' | 'publishing';
type CampaignStatus = 'active' | 'draft' | 'paused' | 'completed';
type EngagementType = 'comment' | 'share' | 'like' | 'dm';
type EngagementSentiment = 'positive' | 'neutral' | 'negative';

interface CalendarPost {
  id: string;
  title: string;
  platform: Platform;
  type: PostType;
  status: PostStatus;
  scheduledDate: Date;
  time: string;
  likes: number;
  comments: number;
}

interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  description: string;
  platforms: Platform[];
  reach: number;
  engagementRate: number;
  clicks: number;
  startDate: string;
  endDate: string;
  progress: number;
}

interface EngagementItem {
  id: string;
  platform: Platform;
  userName: string;
  userHandle: string;
  avatarColor: string;
  actionType: EngagementType;
  content: string;
  contextPost: string;
  timeAgo: string;
  sentiment: EngagementSentiment;
  likes: number;
  replies: number;
  flagged?: boolean;
}

// ─── Constants ───────────────────────────────────────────
const PLATFORM_CONFIG: Record<Platform, { label: string; color: string; bg: string; icon: typeof Twitter }> = {
  twitter: { label: 'Twitter/X', color: 'text-sky-500', bg: 'bg-sky-500/10', icon: Twitter },
  linkedin: { label: 'LinkedIn', color: 'text-blue-400', bg: 'bg-blue-500/10', icon: Linkedin },
  instagram: { label: 'Instagram', color: 'text-pink-500', bg: 'bg-pink-500/10', icon: Instagram },
  facebook: { label: 'Facebook', color: 'text-indigo-600', bg: 'bg-indigo-500/10', icon: Facebook },
};

const TYPE_CONFIG: Record<PostType, { label: string; color: string; bg: string }> = {
  educational: { label: 'Educational', color: 'text-blue-400', bg: 'bg-blue-100' },
  promotional: { label: 'Promotional', color: 'text-purple-400', bg: 'bg-purple-100' },
  engagement: { label: 'Engagement', color: 'text-emerald-400', bg: 'bg-emerald-100' },
};

const STATUS_CONFIG: Record<PostStatus, { label: string; color: string; bg: string }> = {
  scheduled: { label: 'Scheduled', color: 'text-sky-400', bg: 'bg-sky-100' },
  published: { label: 'Published', color: 'text-emerald-400', bg: 'bg-emerald-100' },
  draft: { label: 'Draft', color: 'text-amber-400', bg: 'bg-amber-100' },
  publishing: { label: 'Publishing', color: 'text-violet-400', bg: 'bg-violet-100' },
};

const ENGAGEMENT_TYPE_CONFIG: Record<EngagementType, { label: string; color: string; bg: string }> = {
  comment: { label: 'Comment', color: 'text-blue-400', bg: 'bg-blue-100' },
  share: { label: 'Share', color: 'text-violet-400', bg: 'bg-violet-100' },
  like: { label: 'Like', color: 'text-pink-400', bg: 'bg-pink-100' },
  dm: { label: 'DM', color: 'text-emerald-400', bg: 'bg-emerald-100' },
};

const SENTIMENT_CONFIG: Record<EngagementSentiment, { color: string; bg: string }> = {
  positive: { color: 'text-emerald-400', bg: 'bg-emerald-100' },
  neutral: { color: 'text-slate-400', bg: 'bg-slate-800/50' },
  negative: { color: 'text-red-400', bg: 'bg-red-100' },
};

// ─── Mock Data ───────────────────────────────────────────
const today = new Date();
const weekStart = startOfWeek(today, { weekStartsOn: 1 });

function d(dayOffset: number): Date {
  return addDays(weekStart, dayOffset);
}

function t(h: number, m = 0): string {
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}

const CALENDAR_POSTS: CalendarPost[] = [
  // Monday
  { id: 'c1', title: '10 tips for SaaS growth in 2026', platform: 'twitter', type: 'educational', status: 'scheduled', scheduledDate: d(0), time: t(9), likes: 0, comments: 0 },
  { id: 'c2', title: 'How we scaled to 10K users', platform: 'linkedin', type: 'educational', status: 'published', scheduledDate: d(0), time: t(14), likes: 86, comments: 12 },
  { id: 'c3', title: 'Behind the scenes: Our dev team', platform: 'instagram', type: 'engagement', status: 'scheduled', scheduledDate: d(0), time: t(17), likes: 0, comments: 0 },
  // Tuesday
  { id: 'c4', title: 'The future of AI in customer support', platform: 'linkedin', type: 'educational', status: 'published', scheduledDate: d(1), time: t(8), likes: 142, comments: 23 },
  { id: 'c5', title: 'Thread: Why we chose Rust', platform: 'twitter', type: 'educational', status: 'published', scheduledDate: d(1), time: t(11), likes: 203, comments: 31 },
  { id: 'c6', title: 'Feature spotlight: Dark mode', platform: 'instagram', type: 'promotional', status: 'published', scheduledDate: d(1), time: t(13), likes: 89, comments: 7 },
  { id: 'c7', title: 'Poll: What is your biggest growth challenge?', platform: 'twitter', type: 'engagement', status: 'scheduled', scheduledDate: d(1), time: t(16), likes: 0, comments: 0 },
  { id: 'c8', title: 'Employee spotlight: Meet our CTO', platform: 'linkedin', type: 'engagement', status: 'draft', scheduledDate: d(1), time: t(19), likes: 0, comments: 0 },
  // Wednesday (today)
  { id: 'c9', title: 'Good morning builders', platform: 'twitter', type: 'engagement', status: 'published', scheduledDate: d(2), time: t(7), likes: 56, comments: 4 },
  { id: 'c10', title: 'Industry report: AI adoption 2026', platform: 'linkedin', type: 'educational', status: 'published', scheduledDate: d(2), time: t(9), likes: 198, comments: 29 },
  { id: 'c11', title: 'User testimonial: @startupXYZ', platform: 'instagram', type: 'promotional', status: 'published', scheduledDate: d(2), time: t(10), likes: 76, comments: 5 },
  { id: 'c12', title: 'Quick tip: Use webhooks for real-time', platform: 'twitter', type: 'educational', status: 'published', scheduledDate: d(2), time: t(11, 30), likes: 45, comments: 8 },
  { id: 'c13', title: 'Case study: 300% ROI with automation', platform: 'linkedin', type: 'promotional', status: 'publishing', scheduledDate: d(2), time: t(13), likes: 12, comments: 2 },
  { id: 'c14', title: 'Our CEO on the Future of Work podcast', platform: 'twitter', type: 'promotional', status: 'scheduled', scheduledDate: d(2), time: t(15), likes: 0, comments: 0 },
  { id: 'c15', title: 'Week wrap-up: Top moments', platform: 'instagram', type: 'engagement', status: 'scheduled', scheduledDate: d(2), time: t(18), likes: 0, comments: 0 },
  // Thursday
  { id: 'c16', title: 'How to reduce churn by 40%', platform: 'linkedin', type: 'educational', status: 'scheduled', scheduledDate: d(3), time: t(9), likes: 0, comments: 0 },
  { id: 'c17', title: 'Customer win: Enterprise deal closed', platform: 'twitter', type: 'promotional', status: 'scheduled', scheduledDate: d(3), time: t(12), likes: 0, comments: 0 },
  { id: 'c18', title: 'Tutorial: Advanced API usage', platform: 'instagram', type: 'educational', status: 'draft', scheduledDate: d(3), time: t(15), likes: 0, comments: 0 },
  { id: 'c19', title: 'Friday reads for founders', platform: 'twitter', type: 'engagement', status: 'scheduled', scheduledDate: d(3), time: t(17), likes: 0, comments: 0 },
  // Friday
  { id: 'c20', title: 'Weekly industry roundup', platform: 'linkedin', type: 'educational', status: 'scheduled', scheduledDate: d(4), time: t(8), likes: 0, comments: 0 },
  { id: 'c21', title: 'Feature announcement: Multi-language', platform: 'twitter', type: 'promotional', status: 'scheduled', scheduledDate: d(4), time: t(10), likes: 0, comments: 0 },
  { id: 'c22', title: 'Team lunch Friday vibes', platform: 'instagram', type: 'engagement', status: 'draft', scheduledDate: d(4), time: t(11), likes: 0, comments: 0 },
  { id: 'c23', title: 'Hiring: Senior Backend Engineer', platform: 'linkedin', type: 'promotional', status: 'scheduled', scheduledDate: d(4), time: t(13), likes: 0, comments: 0 },
  { id: 'c24', title: 'AMA: Ask us anything about AI agents', platform: 'twitter', type: 'engagement', status: 'scheduled', scheduledDate: d(4), time: t(15), likes: 0, comments: 0 },
  { id: 'c25', title: 'Weekend mode activated', platform: 'instagram', type: 'engagement', status: 'scheduled', scheduledDate: d(4), time: t(17), likes: 0, comments: 0 },
  // Saturday
  { id: 'c26', title: 'Saturday thoughts on product-market fit', platform: 'twitter', type: 'educational', status: 'scheduled', scheduledDate: d(5), time: t(10), likes: 0, comments: 0 },
  { id: 'c27', title: 'Weekend reading recommendations', platform: 'instagram', type: 'engagement', status: 'scheduled', scheduledDate: d(5), time: t(15), likes: 0, comments: 0 },
  // Sunday
  { id: 'c28', title: 'Sunday reflection: Lessons from Q1', platform: 'linkedin', type: 'educational', status: 'scheduled', scheduledDate: d(6), time: t(9), likes: 0, comments: 0 },
  { id: 'c29', title: 'What we are building next week', platform: 'twitter', type: 'engagement', status: 'scheduled', scheduledDate: d(6), time: t(12), likes: 0, comments: 0 },
  { id: 'c30', title: 'Sunday self-care for founders', platform: 'instagram', type: 'engagement', status: 'scheduled', scheduledDate: d(6), time: t(16), likes: 0, comments: 0 },
];

const LIST_POSTS = CALENDAR_POSTS.map(p => ({
  ...p,
  reach: p.status === 'published' || p.status === 'publishing' ? Math.floor(Math.random() * 8000) + 500 : 0,
  engagementRate: p.status === 'published' || p.status === 'publishing' ? (Math.random() * 8 + 2).toFixed(1) : '0.0',
  shares: p.status === 'published' || p.status === 'publishing' ? Math.floor(Math.random() * 150) : 0,
}));

const defaultCampaigns: Campaign[] = [
  {
    id: 'camp1', name: 'Q1 Product Launch', status: 'active',
    description: 'Multi-platform campaign announcing our new AI agent features and enterprise capabilities',
    platforms: ['twitter', 'linkedin', 'instagram'],
    reach: 45200, engagementRate: 8.3, clicks: 3240,
    startDate: 'Feb 1', endDate: 'Mar 31', progress: 65,
  },
  {
    id: 'camp2', name: 'Developer Relations', status: 'active',
    description: 'Building relationships with developer communities through technical content and API tutorials',
    platforms: ['twitter', 'linkedin'],
    reach: 18700, engagementRate: 12.1, clicks: 1890,
    startDate: 'Feb 15', endDate: 'Apr 15', progress: 40,
  },
  {
    id: 'camp3', name: 'Customer Success Stories', status: 'draft',
    description: 'Series of testimonial posts and case studies from our top enterprise customers',
    platforms: ['linkedin', 'instagram'],
    reach: 0, engagementRate: 0, clicks: 0,
    startDate: 'Mar 1', endDate: 'Mar 31', progress: 0,
  },
  {
    id: 'camp4', name: '#BuildInPublic March', status: 'completed',
    description: '30 days of transparent building — sharing our development process and decisions',
    platforms: ['twitter', 'instagram'],
    reach: 62100, engagementRate: 15.4, clicks: 4850,
    startDate: 'Mar 1', endDate: 'Mar 31', progress: 100,
  },
];

const ENGAGEMENT_FEED: EngagementItem[] = [
  {
    id: 'e1', platform: 'twitter', userName: 'Sarah Chen', userHandle: '@sarah_startups',
    avatarColor: 'bg-emerald-500/100', actionType: 'comment',
    content: 'This is exactly what we needed! Just signed up for your Pro plan. The API docs are incredible',
    contextPost: '10 tips for SaaS growth in 2026', timeAgo: '2m ago',
    sentiment: 'positive', likes: 24, replies: 3,
  },
  {
    id: 'e2', platform: 'linkedin', userName: 'Michael Rodriguez', userHandle: 'michael-rodriguez',
    avatarColor: 'bg-blue-500/100', actionType: 'comment',
    content: 'Great insights on scaling. We have seen similar results with our AI agents. Would love to connect and share notes.',
    contextPost: 'How we scaled to 10K users', timeAgo: '5m ago',
    sentiment: 'positive', likes: 15, replies: 2,
  },
  {
    id: 'e3', platform: 'instagram', userName: 'Design Studio', userHandle: '@designstudio.co',
    avatarColor: 'bg-pink-500/100', actionType: 'comment',
    content: 'Can you guys integrate with Figma? Our team would love this feature!',
    contextPost: 'Feature spotlight: Dark mode', timeAgo: '8m ago',
    sentiment: 'neutral', likes: 8, replies: 1,
  },
  {
    id: 'e4', platform: 'twitter', userName: 'Alex Dev', userHandle: '@frustrated_dev',
    avatarColor: 'bg-red-500/100', actionType: 'comment',
    content: 'Your support bot is useless. I have been trying to get help for 2 hours and keep getting canned responses.',
    contextPost: 'Thread: Why we chose Rust', timeAgo: '12m ago',
    sentiment: 'negative', likes: 3, replies: 7, flagged: true,
  },
  {
    id: 'e5', platform: 'linkedin', userName: 'Jennifer Walsh', userHandle: 'jennifer-walsh',
    avatarColor: 'bg-violet-500/100', actionType: 'share',
    content: 'Just implemented your solution and our response time dropped by 60%. Amazing ROI so far.',
    contextPost: 'Case study: 300% ROI with automation', timeAgo: '15m ago',
    sentiment: 'positive', likes: 42, replies: 8,
  },
  {
    id: 'e6', platform: 'twitter', userName: 'Tech Daily', userHandle: '@techinfluencer',
    avatarColor: 'bg-sky-500/100', actionType: 'comment',
    content: 'Has anyone else noticed their engagement rates dropping since the algorithm change? Looking for alternatives.',
    contextPost: 'Industry report: AI adoption 2026', timeAgo: '18m ago',
    sentiment: 'neutral', likes: 156, replies: 34, flagged: true,
  },
  {
    id: 'e7', platform: 'instagram', userName: 'Small Biz Owner', userHandle: '@smallbiz_owner',
    avatarColor: 'bg-amber-500/100', actionType: 'like',
    content: 'Love the behind the scenes content! Makes your brand feel so authentic. More of this please!',
    contextPost: 'Behind the scenes: Our dev team', timeAgo: '22m ago',
    sentiment: 'positive', likes: 31, replies: 4,
  },
  {
    id: 'e8', platform: 'linkedin', userName: 'David Chen', userHandle: 'david-chen',
    avatarColor: 'bg-indigo-500/100', actionType: 'dm',
    content: 'We are evaluating AI support solutions. How does your pricing compare to Intercom and Zendesk?',
    contextPost: 'Direct message', timeAgo: '25m ago',
    sentiment: 'neutral', likes: 0, replies: 0, flagged: true,
  },
  {
    id: 'e9', platform: 'twitter', userName: 'Growth Hacker', userHandle: '@growthhacker',
    avatarColor: 'bg-teal-500/100', actionType: 'share',
    content: 'This thread is gold. Bookmarking for later. Every founder should read this.',
    contextPost: '10 tips for SaaS growth in 2026', timeAgo: '30m ago',
    sentiment: 'positive', likes: 67, replies: 12,
  },
  {
    id: 'e10', platform: 'facebook', userName: 'Marketing Pro', userHandle: 'marketing-pro',
    avatarColor: 'bg-purple-500/100', actionType: 'comment',
    content: 'We have been using your platform for 6 months now. The new features are game changers!',
    contextPost: 'Feature spotlight: Dark mode', timeAgo: '35m ago',
    sentiment: 'positive', likes: 19, replies: 2,
  },
  {
    id: 'e11', platform: 'instagram', userName: 'Startup Life', userHandle: '@startuplife',
    avatarColor: 'bg-orange-500/100', actionType: 'comment',
    content: 'The dark mode looks amazing! When is it rolling out to all users?',
    contextPost: 'Feature spotlight: Dark mode', timeAgo: '42m ago',
    sentiment: 'neutral', likes: 14, replies: 6,
  },
  {
    id: 'e12', platform: 'twitter', userName: 'DevOps Weekly', userHandle: '@devopsweekly',
    avatarColor: 'bg-cyan-500/100', actionType: 'share',
    content: 'Solid technical breakdown. The webhook architecture is particularly well designed.',
    contextPost: 'Thread: Why we chose Rust', timeAgo: '48m ago',
    sentiment: 'positive', likes: 89, replies: 15,
  },
];

// ─── Analytics Data ──────────────────────────────────────
const engagementData = [
  { day: 'Mon', likes: 4.2, comments: 2.1, shares: 1.3, clicks: 3.5 },
  { day: 'Tue', likes: 5.8, comments: 3.2, shares: 1.8, clicks: 4.1 },
  { day: 'Wed', likes: 6.1, comments: 3.8, shares: 2.2, clicks: 4.8 },
  { day: 'Thu', likes: 5.3, comments: 2.9, shares: 1.6, clicks: 3.9 },
  { day: 'Fri', likes: 7.2, comments: 4.1, shares: 2.5, clicks: 5.2 },
  { day: 'Sat', likes: 3.9, comments: 1.8, shares: 1.1, clicks: 2.8 },
  { day: 'Sun', likes: 4.5, comments: 2.3, shares: 1.4, clicks: 3.2 },
];

const followerGrowthData = [
  { day: 'Mon', followers: 11420, gain: 120, loss: 12 },
  { day: 'Tue', followers: 11530, gain: 145, loss: 15 },
  { day: 'Wed', followers: 11680, gain: 198, loss: 18 },
  { day: 'Thu', followers: 11810, gain: 167, loss: 22 },
  { day: 'Fri', followers: 12000, gain: 245, loss: 20 },
  { day: 'Sat', followers: 12120, gain: 180, loss: 30 },
  { day: 'Sun', followers: 12247, gain: 167, loss: 15 },
];

const postsPerformanceData = [
  { post: '10 SaaS Tips', reach: 8200, engagement: 6.2 },
  { post: 'AI Adoption Report', reach: 12400, engagement: 8.1 },
  { post: 'Rust Thread', reach: 15600, engagement: 12.3 },
  { post: 'Dark Mode Feature', reach: 6400, engagement: 5.4 },
  { post: 'Scaling Story', reach: 9800, engagement: 7.8 },
  { post: 'ROI Case Study', reach: 11200, engagement: 9.2 },
  { post: 'Dev Team BTS', reach: 5400, engagement: 4.9 },
];

const platformBreakdownData = [
  { name: 'Twitter', value: 42, color: '#38bdf8' },
  { name: 'LinkedIn', value: 31, color: '#1d4ed8' },
  { name: 'Instagram', value: 19, color: '#ec4899' },
  { name: 'Facebook', value: 8, color: '#4f46e5' },
];

const topPostsData = [
  { id: 'tp1', platform: 'twitter' as Platform, title: 'Thread: Why we chose Rust', reach: 15600, engagement: 12.3 },
  { id: 'tp2', platform: 'linkedin' as Platform, title: 'AI Adoption Report 2026', reach: 12400, engagement: 8.1 },
  { id: 'tp3', platform: 'linkedin' as Platform, title: 'ROI Case Study', reach: 11200, engagement: 9.2 },
  { id: 'tp4', platform: 'twitter' as Platform, title: '10 SaaS Growth Tips', reach: 8200, engagement: 6.2 },
  { id: 'tp5', platform: 'instagram' as Platform, title: 'Feature: Dark Mode', reach: 6400, engagement: 5.4 },
];

// ─── Animation Configs ───────────────────────────────────
const tabTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
  transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.03 } },
};

const staggerItem = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

// ─── Sub-Components ──────────────────────────────────────

function PlatformIcon({ platform, size = 16 }: { platform: Platform; size?: number }) {
  const config = PLATFORM_CONFIG[platform];
  const Icon = config.icon;
  return <Icon size={size} className={config.color} />;
}

function StatusBadge({ status }: { status: PostStatus | CampaignStatus }) {
  const config = STATUS_CONFIG[status as PostStatus] || { label: status, color: 'text-slate-400', bg: 'bg-slate-800/50' };
  return (
    <span className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold', config.bg, config.color)}>
      {config.label}
    </span>
  );
}

function TypeBadge({ type }: { type: PostType }) {
  const config = TYPE_CONFIG[type];
  return (
    <span className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold', config.bg, config.color)}>
      {config.label}
    </span>
  );
}

// ─── Post Composer Modal ─────────────────────────────────
function PostComposerModal({
  open,
  onClose,
  editPost,
}: {
  open: boolean;
  onClose: () => void;
  editPost?: CalendarPost | null;
}) {
  const [content, setContent] = useState(editPost?.title || '');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(editPost ? [editPost.platform] : ['twitter']);
  const [postType, setPostType] = useState<PostType>(editPost?.type || 'educational');

  const charLimit = selectedPlatforms.includes('twitter') ? 280 : 2200;
  const charCount = content.length;
  const charWarning = charCount > charLimit * 0.8;
  const charError = charCount > charLimit;

  const togglePlatform = (p: Platform) => {
    setSelectedPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[640px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {editPost ? 'Edit Post' : 'Compose New Post'}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Create and schedule your social media content
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Platform Selector */}
          <div>
            <label className="text-[13px] font-medium text-slate-300 mb-2 block">Platforms</label>
            <div className="flex gap-2">
              {(Object.entries(PLATFORM_CONFIG) as [Platform, typeof PLATFORM_CONFIG.twitter][]).map(([key, config]) => {
                const selected = selectedPlatforms.includes(key);
                return (
                  <button
                    key={key}
                    onClick={() => togglePlatform(key)}
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-150',
                      selected ? 'ring-2 ring-offset-1' : 'opacity-50 hover:opacity-80'
                    )}
                    style={{
                      backgroundColor: selected ? { twitter: '#0ea5e9', linkedin: '#1d4ed8', instagram: '#ec4899', facebook: '#4f46e5' }[key] : '#1c2658',
                    }}
                  >
                    <config.icon size={18} className={selected ? 'text-white' : 'text-slate-500'} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Type Selector */}
          <div>
            <label className="text-[13px] font-medium text-slate-300 mb-2 block">Post Type</label>
            <div className="flex gap-2">
              {(Object.entries(TYPE_CONFIG) as [PostType, typeof TYPE_CONFIG.educational][]).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setPostType(key)}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                    postType === key ? cn(config.bg, config.color, 'ring-1 ring-offset-1') : 'bg-slate-800/50 text-slate-500 hover:bg-[#0a0a0a]'
                  )}
                >
                  {config.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content Textarea */}
          <div>
            <label className="text-[13px] font-medium text-slate-300 mb-2 block">Content</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What do you want to share?"
              className="min-h-[120px] resize-none"
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-slate-400">
                <Smile size={14} className="inline mr-1" />
                Emoji picker
              </span>
              <span className={cn('text-xs font-medium', charError ? 'text-red-500' : charWarning ? 'text-amber-500' : 'text-slate-400')}>
                {charCount}/{charLimit}
              </span>
            </div>
          </div>

          {/* Schedule */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[13px] font-medium text-slate-300 mb-2 block">Date</label>
              <Select defaultValue={editPost ? format(editPost.scheduledDate, 'yyyy-MM-dd') : format(today, 'yyyy-MM-dd')}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 14 }, (_, i) => {
                    const date = addDays(today, i);
                    return (
                      <SelectItem key={i} value={format(date, 'yyyy-MM-dd')}>
                        {format(date, 'EEE, MMM d')}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[13px] font-medium text-slate-300 mb-2 block">Time</label>
              <Select defaultValue={editPost?.time || '9:00 AM'}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => {
                    const h = i % 12 || 12;
                    const ampm = i < 12 ? 'AM' : 'PM';
                    return [`${h}:00 ${ampm}`, `${h}:30 ${ampm}`];
                  }).flat().map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Media Upload */}
          <div>
            <label className="text-[13px] font-medium text-slate-300 mb-2 block">Media</label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg h-20 flex items-center justify-center gap-2 text-slate-500 cursor-pointer hover:border-slate-400 hover:bg-slate-800/50 transition-colors">
              <Image size={20} />
              <span className="text-xs">Drag images/videos here or click to upload</span>
            </div>
          </div>

          {/* Preview */}
          <div>
            <label className="text-[13px] font-medium text-slate-300 mb-2 block">Preview</label>
            <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-violet-500/100 flex items-center justify-center text-white text-xs font-bold">N</div>
                <div>
                  <p className="text-sm font-semibold text-slate-100">NexusAI</p>
                  <p className="text-xs text-slate-400">@nexusai · Just now</p>
                </div>
              </div>
              <p className="text-sm text-slate-300 whitespace-pre-wrap">
                {content || <span className="text-slate-400 italic">Your post content will appear here...</span>}
              </p>
              <div className="flex items-center gap-4 mt-3 text-slate-400">
                <MessageSquare size={14} />
                <Share2 size={14} />
                <Heart size={14} />
                <Eye size={14} />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>Save Draft</Button>
          <Button variant="outline" size="sm">Schedule</Button>
          <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white">
            <Send size={14} className="mr-1" /> Post Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Tab 1: Content Calendar ─────────────────────────────
function ContentCalendarTab() {
  const [composerOpen, setComposerOpen] = useState(false);
  const [editPost, setEditPost] = useState<CalendarPost | null>(null);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handleEditPost = (post: CalendarPost) => {
    setEditPost(post);
    setComposerOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* 7-Day Calendar Grid */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="bg-slate-900/40 rounded-xl border shadow-card overflow-hidden"
      >
        <div className="grid grid-cols-7 divide-x divide-slate-200">
          {weekDays.map((day, idx) => {
            const isToday = isSameDay(day, today);
            const dayPosts = CALENDAR_POSTS.filter(p => isSameDay(p.scheduledDate, day));
            return (
              <motion.div
                key={idx}
                variants={staggerItem}
                className={cn(
                  'min-h-[420px] flex flex-col',
                  isToday && 'bg-violet-500/10/40'
                )}
              >
                {/* Day Header */}
                <div className={cn(
                  'px-3 py-3 border-b border-slate-800',
                  isToday && 'border-l-2 border-l-violet-400 border-l-solid'
                )}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-slate-500 uppercase">{format(day, 'EEE')}</span>
                    <span className={cn(
                      'text-xs font-bold px-1.5 py-0.5 rounded-full',
                      dayPosts.length > 0 ? 'bg-slate-600 text-white' : 'bg-[#0a0a0a] text-slate-500'
                    )}>
                      {dayPosts.length}
                    </span>
                  </div>
                  <p className={cn('text-base font-bold mt-0.5', isToday ? 'text-violet-600' : 'text-slate-100')}>
                    {format(day, 'd')}
                  </p>
                </div>

                {/* Day Posts */}
                <div className="flex-1 p-2 space-y-1.5 overflow-y-auto">
                  {dayPosts.map((post, pIdx) => {
                    const typeCfg = TYPE_CONFIG[post.type];
                    const statusCfg = STATUS_CONFIG[post.status];
                    const PlatIcon = PLATFORM_CONFIG[post.platform].icon;
                    return (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: pIdx * 0.02, duration: 0.25 }}
                        whileHover={{ y: -1, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                        onClick={() => handleEditPost(post)}
                        className="bg-slate-900/40 border border-slate-800 rounded-lg p-2 cursor-pointer hover:border-slate-300 transition-all"
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <Clock size={10} className="text-slate-400" />
                          <span className="text-[11px] text-slate-400">{post.time}</span>
                          <PlatIcon size={12} className={PLATFORM_CONFIG[post.platform].color} />
                          <span className={cn('ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded', statusCfg.bg, statusCfg.color)}>
                            {statusCfg.label}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 truncate leading-tight">{post.title}</p>
                        {(post.status === 'published' || post.status === 'publishing') && (
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                            <span className="flex items-center gap-0.5"><Heart size={8} /> {post.likes}</span>
                            <span className="flex items-center gap-0.5"><MessageSquare size={8} /> {post.comments}</span>
                          </div>
                        )}
                        <div className="mt-1">
                          <span className={cn('inline-block w-1.5 h-1.5 rounded-full', typeCfg.bg.replace('bg-', 'bg-').replace('100', '400'))} />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Bottom Row: Upcoming + Quick Compose */}
      <div className="grid grid-cols-5 gap-6">
        {/* Upcoming Posts */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="col-span-3 bg-slate-900/40 rounded-xl border shadow-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-100">Upcoming Posts</h3>
            <button className="text-xs text-violet-600 hover:text-violet-400 font-medium flex items-center gap-0.5">
              View All <ChevronRight size={14} />
            </button>
          </div>
          <div className="space-y-1">
            {CALENDAR_POSTS.filter(p => p.status === 'scheduled' || p.status === 'draft').slice(0, 6).map((post, idx) => {
              const PlatIcon = PLATFORM_CONFIG[post.platform].icon;
              const isToday = isSameDay(post.scheduledDate, today);
              const isTomorrow = isSameDay(post.scheduledDate, addDays(today, 1));
              let timeLabel = format(post.scheduledDate, 'EEE');
              if (isToday) timeLabel = 'Today';
              if (isTomorrow) timeLabel = 'Tomorrow';
              return (
                <motion.div
                  key={post.id}
                  variants={staggerItem}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-slate-800/50 transition-colors border-b border-slate-800 last:border-0"
                >
                  <div className={cn('w-9 h-9 rounded-full flex items-center justify-center shrink-0', PLATFORM_CONFIG[post.platform].bg)}>
                    <PlatIcon size={16} className={PLATFORM_CONFIG[post.platform].color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-slate-300 truncate">{post.title}</p>
                    <p className="text-xs text-slate-400">{timeLabel} at {post.time}</p>
                  </div>
                  <StatusBadge status={post.status} />
                  <button className="text-slate-400 hover:text-slate-400 p-1">
                    <MoreHorizontal size={14} />
                  </button>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Quick Compose */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="col-span-2 bg-slate-900/40 rounded-xl border shadow-card p-5 sticky top-4"
        >
          <h3 className="text-base font-semibold text-slate-100 mb-4">Quick Compose</h3>
          <Textarea
            placeholder="What do you want to share?"
            className="min-h-[100px] resize-none mb-3"
          />
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {(['twitter', 'linkedin', 'instagram'] as Platform[]).map(p => {
                const cfg = PLATFORM_CONFIG[p];
                const Icon = cfg.icon;
                return (
                  <button key={p} className={cn('w-8 h-8 rounded-md flex items-center justify-center', cfg.bg)}>
                    <Icon size={14} className={cfg.color} />
                  </button>
                );
              })}
            </div>
            <Button
              size="sm"
              onClick={() => { setEditPost(null); setComposerOpen(true); }}
              className="bg-violet-600 hover:bg-violet-700 text-white"
            >
              <PenSquare size={14} className="mr-1" /> Compose
            </Button>
          </div>
        </motion.div>
      </div>

      <PostComposerModal
        open={composerOpen}
        onClose={() => { setComposerOpen(false); setEditPost(null); }}
        editPost={editPost}
      />
    </div>
  );
}

// ─── Tab 2: Posts List ───────────────────────────────────
function PostsListTab() {
  const [composerOpen, setComposerOpen] = useState(false);
  const [editPost, setEditPost] = useState<CalendarPost | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filtered = filterStatus === 'all' ? LIST_POSTS : LIST_POSTS.filter(p => p.status === filterStatus);

  const handleEdit = (post: CalendarPost) => {
    setEditPost(post);
    setComposerOpen(true);
  };

  return (
    <motion.div {...tabTransition} className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="flex gap-1 bg-slate-900/40 border rounded-lg p-1">
          {(['all', 'scheduled', 'published', 'draft'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize',
                filterStatus === s ? 'bg-violet-100 text-violet-400' : 'text-slate-500 hover:bg-slate-800/50'
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/40 rounded-xl border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-800">
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Content</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Platform</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Engagement</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((post, idx) => (
                <motion.tr
                  key={post.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.015 }}
                  className="hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-slate-300 truncate max-w-[240px]">{post.title}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className={cn('w-8 h-8 rounded-full flex items-center justify-center', PLATFORM_CONFIG[post.platform].bg)}>
                      <PlatformIcon platform={post.platform} size={14} />
                    </div>
                  </td>
                  <td className="px-4 py-3"><TypeBadge type={post.type} /></td>
                  <td className="px-4 py-3"><StatusBadge status={post.status} /></td>
                  <td className="px-4 py-3 text-sm text-slate-500">{format(post.scheduledDate, 'MMM d')} <span className="text-slate-400">{post.time}</span></td>
                  <td className="px-4 py-3">
                    {post.status === 'published' || post.status === 'publishing' ? (
                      <div className="text-xs text-slate-500 space-x-2">
                        <span className="flex items-center gap-1 inline-flex"><Heart size={10} className="text-pink-400" /> {post.likes}</span>
                        <span className="flex items-center gap-1 inline-flex"><MessageSquare size={10} className="text-blue-400" /> {post.comments}</span>
                        <span className="flex items-center gap-1 inline-flex"><Share2 size={10} className="text-violet-400" /> {post.shares}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleEdit(post)} className="p-1.5 rounded-md text-slate-400 hover:text-violet-600 hover:bg-violet-500/10 transition-colors">
                        <Edit3 size={14} />
                      </button>
                      <button className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-500/10 transition-colors">
                        <Copy size={14} />
                      </button>
                      <button className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-500/10 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <PostComposerModal
        open={composerOpen}
        onClose={() => { setComposerOpen(false); setEditPost(null); }}
        editPost={editPost}
      />
    </motion.div>
  );
}

// ─── Tab 3: Engagement Feed ──────────────────────────────
function EngagementFeedTab() {
  const [filterType, setFilterType] = useState<string>('all');
  const filtered = filterType === 'all' ? ENGAGEMENT_FEED : ENGAGEMENT_FEED.filter(e => e.actionType === filterType);

  return (
    <motion.div {...tabTransition} className="grid grid-cols-5 gap-6">
      {/* Left: Feed */}
      <div className="col-span-3 space-y-4">
        {/* Filters */}
        <div className="flex gap-1 bg-slate-900/40 border rounded-lg p-1 w-fit">
          {(['all', 'comment', 'share', 'like', 'dm'] as const).map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize',
                filterType === t ? 'bg-violet-100 text-violet-400' : 'text-slate-500 hover:bg-slate-800/50'
              )}
            >
              {t === 'dm' ? 'DMs' : t + 's'}
            </button>
          ))}
        </div>

        {/* Feed Items */}
        <div className="space-y-3">
          {filtered.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.35 }}
              className={cn(
                'bg-slate-900/40 rounded-xl border shadow-card p-4 transition-all hover:shadow-card-hover',
                item.sentiment === 'negative' && 'border-l-4 border-l-red-400'
              )}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <PlatformIcon platform={item.platform} size={16} />
                  <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold', item.avatarColor)}>
                    {item.userName.charAt(0)}
                  </div>
                  <div>
                    <span className="text-[13px] font-semibold text-slate-100">{item.userName}</span>
                    <span className="text-xs text-slate-400 ml-1.5">{item.userHandle}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'text-[10px] font-semibold px-2 py-0.5 rounded',
                    ENGAGEMENT_TYPE_CONFIG[item.actionType].bg,
                    ENGAGEMENT_TYPE_CONFIG[item.actionType].color,
                  )}>
                    {ENGAGEMENT_TYPE_CONFIG[item.actionType].label}
                  </span>
                  <span className="text-xs text-slate-400">{item.timeAgo}</span>
                </div>
              </div>

              {/* Content */}
              <p className="text-sm text-slate-300 mb-1.5 leading-relaxed">{item.content}</p>
              <p className="text-xs text-slate-400 italic mb-3 truncate">Replying to: {item.contextPost}</p>

              {/* Meta & Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1"><Heart size={10} /> {item.likes}</span>
                  <span className="flex items-center gap-1"><MessageSquare size={10} /> {item.replies}</span>
                  <span className={cn(
                    'px-1.5 py-0.5 rounded text-[10px] font-medium',
                    SENTIMENT_CONFIG[item.sentiment].bg,
                    SENTIMENT_CONFIG[item.sentiment].color,
                  )}>
                    {item.sentiment}
                  </span>
                  {item.flagged && (
                    <span className="flex items-center gap-1 text-red-500">
                      <AlertCircle size={10} /> Flagged
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" className="h-7 text-xs px-2">
                    <Heart size={12} className="mr-1" /> Like
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs px-2">
                    <MessageSquare size={12} className="mr-1" /> Reply
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs px-2 text-slate-400">
                    <Flag size={12} />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Right: Sentiment & Topics */}
      <div className="col-span-2 space-y-4">
        {/* Sentiment Donut */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/40 rounded-xl border shadow-card p-5"
        >
          <h3 className="text-base font-semibold text-slate-100 mb-4">Sentiment Overview</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width={200} height={180}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Positive', value: 62, color: '#34d399' },
                    { name: 'Neutral', value: 28, color: '#94a3b8' },
                    { name: 'Negative', value: 10, color: '#fb923c' },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  dataKey="value"
                  strokeWidth={2}
                >
                  {platformBreakdownData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={['#177E89', '#94a3b8', '#FC814A'][index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center">
              <p className="text-xl font-bold text-emerald-600">94%</p>
              <p className="text-xs text-slate-500">Positive</p>
            </div>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {[
              { label: 'Positive', value: '62%', color: 'bg-emerald-500/100' },
              { label: 'Neutral', value: '28%', color: 'bg-slate-400' },
              { label: 'Negative', value: '10%', color: 'bg-red-500/100' },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-1.5 text-xs">
                <span className={cn('w-2 h-2 rounded-full', s.color)} />
                <span className="text-slate-400">{s.label}</span>
                <span className="font-semibold text-slate-100">{s.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Trending Topics */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.18 }}
          className="bg-slate-900/40 rounded-xl border shadow-card p-5"
        >
          <h3 className="text-base font-semibold text-slate-100 mb-4">Trending Topics</h3>
          <div className="space-y-3">
            {[
              { tag: '#AIagents', count: 47, color: 'bg-emerald-100 text-emerald-400' },
              { tag: '#customersupport', count: 38, color: 'bg-sky-100 text-sky-400' },
              { tag: '#SaaSgrowth', count: 31, color: 'bg-violet-100 text-violet-400' },
              { tag: '#automation', count: 24, color: 'bg-amber-100 text-amber-400' },
              { tag: '#startup', count: 19, color: 'bg-slate-800/50 text-slate-400' },
            ].map(topic => (
              <div key={topic.tag} className="flex items-center justify-between">
                <span className={cn('text-xs font-medium px-2 py-0.5 rounded', topic.color)}>{topic.tag}</span>
                <span className="text-xs text-slate-400">{topic.count} mentions</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Response Time */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.26 }}
          className="bg-slate-900/40 rounded-xl border shadow-card p-5"
        >
          <h3 className="text-sm font-semibold text-slate-100 mb-2">Avg Response Time</h3>
          <p className="text-2xl font-bold text-slate-100">4m 32s</p>
          <p className="text-xs text-emerald-600 flex items-center gap-1 mt-0.5">
            <TrendingUp size={12} /> -12% vs yesterday
          </p>
          <div className="mt-3 h-16">
            <ResponsiveContainer width="100%" height={64}>
              <BarChart data={[{ h: '8a', v: 3.2 }, { h: '9a', v: 4.1 }, { h: '10a', v: 5.8 }, { h: '11a', v: 4.5 }, { h: '12p', v: 3.9 }, { h: '1p', v: 4.8 }, { h: '2p', v: 3.5 }, { h: '3p', v: 4.2 }]}>
                <Bar dataKey="v" fill="#177E89" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── Tab 4: Campaigns ────────────────────────────────────
function CampaignsTab({ campaigns }: { campaigns: any[] }) {
  const getStatusColor = (status: CampaignStatus) => {
    switch (status) {
      case 'active': return 'bg-emerald-500/100';
      case 'draft': return 'bg-amber-500/100';
      case 'paused': return 'bg-amber-500/100';
      case 'completed': return 'bg-slate-400';
    }
  };

  const getStatusBadge = (status: CampaignStatus) => {
    switch (status) {
      case 'active': return { bg: 'bg-emerald-100', color: 'text-emerald-400', label: 'Active' };
      case 'draft': return { bg: 'bg-amber-100', color: 'text-amber-400', label: 'Draft' };
      case 'paused': return { bg: 'bg-amber-100', color: 'text-amber-400', label: 'Paused' };
      case 'completed': return { bg: 'bg-slate-800/50', color: 'text-slate-400', label: 'Completed' };
    }
  };

  return (
    <motion.div {...tabTransition} className="grid grid-cols-2 gap-4">
      {campaigns.map((campaign, idx) => {
        const statusBadge = getStatusBadge(campaign.status);
        return (
          <motion.div
            key={campaign.id}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.06, duration: 0.35 }}
            whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
            className="bg-slate-900/40 rounded-xl border shadow-card overflow-hidden"
          >
            {/* Top Banner */}
            <div className={cn('h-2', getStatusColor(campaign.status))} />

            <div className="p-5">
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-base font-semibold text-slate-100">{campaign.name}</h3>
                <span className={cn('text-[11px] font-semibold px-2 py-0.5 rounded', statusBadge.bg, statusBadge.color)}>
                  {statusBadge.label}
                </span>
              </div>

              {/* Description */}
              <p className="text-[13px] text-slate-400 mb-3 line-clamp-2 leading-relaxed">{campaign.description}</p>

              {/* Platform Icons */}
              <div className="flex gap-1.5 mb-4">
                {campaign.platforms.map((p: Platform) => {
                  const cfg = PLATFORM_CONFIG[p];
                  const Icon = cfg.icon;
                  return (
                    <div key={p} className={cn('w-7 h-7 rounded-full flex items-center justify-center', cfg.bg)}>
                      <Icon size={13} className={cfg.color} />
                    </div>
                  );
                })}
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div>
                  <p className="text-sm font-semibold text-slate-100">
                    {campaign.reach > 0 ? `${(campaign.reach / 1000).toFixed(1)}K` : '—'}
                  </p>
                  <p className="text-[11px] text-slate-500">Reach</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-100">
                    {campaign.engagementRate > 0 ? `${campaign.engagementRate}%` : '—'}
                  </p>
                  <p className="text-[11px] text-slate-500">Engagement</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-100">
                    {campaign.clicks > 0 ? `${(campaign.clicks / 1000).toFixed(1)}K` : '—'}
                  </p>
                  <p className="text-[11px] text-slate-500">Clicks</p>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">{campaign.startDate} → {campaign.endDate}</span>
                  <span className="font-medium text-slate-300">{campaign.progress}%</span>
                </div>
                <div className="h-1.5 bg-[#0a0a0a] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${campaign.progress}%` }}
                    transition={{ delay: 0.3 + idx * 0.1, duration: 0.6, ease: 'easeOut' }}
                    className={cn('h-full rounded-full', getStatusColor(campaign.status))}
                  />
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <button className="text-xs text-violet-600 hover:text-violet-400 font-medium flex items-center gap-0.5">
                  View Details <ChevronRight size={12} />
                </button>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" className="h-7 text-xs px-2">
                    <Edit3 size={12} className="mr-1" /> Edit
                  </Button>
                  {campaign.status === 'active' && (
                    <Button size="sm" variant="ghost" className="h-7 text-xs px-2">
                      <Pause size={12} className="mr-1" /> Pause
                    </Button>
                  )}
                  {campaign.status === 'paused' && (
                    <Button size="sm" variant="ghost" className="h-7 text-xs px-2">
                      <Play size={12} className="mr-1" /> Resume
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

// ─── Tab 5: Analytics ────────────────────────────────────
function AnalyticsTab() {
  const [dateRange, setDateRange] = useState('7days');

  return (
    <motion.div {...tabTransition} className="space-y-6">
      {/* Time Range & Summary */}
      <div className="flex items-center justify-between">
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="month">This month</SelectItem>
            <SelectItem value="custom">Custom range</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-3">
          {[
            { label: 'Total Reach', value: '87.3K', trend: '+12%' },
            { label: 'Avg Engagement', value: '7.2%', trend: '+0.8%' },
            { label: 'Posts Published', value: '142', trend: '+23' },
            { label: 'New Followers', value: '+1,247', trend: '+18%' },
          ].map(metric => (
            <div key={metric.label} className="bg-slate-900/40 border rounded-lg px-4 py-2 flex items-center gap-3">
              <div>
                <p className="text-xs text-slate-500">{metric.label}</p>
                <p className="text-sm font-bold text-slate-100">{metric.value}</p>
              </div>
              <span className="text-[10px] font-medium text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded">{metric.trend}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Row 1: Main Charts */}
      <div className="grid grid-cols-2 gap-4">
        {/* Engagement Rate */}
        <div className="bg-slate-900/40 rounded-xl border shadow-card p-5">
          <h3 className="text-base font-semibold text-slate-100 mb-4">Engagement Rate Over Time</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={engagementData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1c2658" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #334155', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                labelStyle={{ fontSize: 12, color: '#94a3b8' }}
              />
              <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="likes" stroke="#177E89" strokeWidth={2} dot={{ r: 3 }} name="Likes" />
              <Line type="monotone" dataKey="comments" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3 }} name="Comments" />
              <Line type="monotone" dataKey="shares" stroke="#177E89" strokeWidth={2} dot={{ r: 3 }} name="Shares" />
              <Line type="monotone" dataKey="clicks" stroke="#FFC857" strokeWidth={2} dot={{ r: 3 }} name="Clicks" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Follower Growth */}
        <div className="bg-slate-900/40 rounded-xl border shadow-card p-5">
          <h3 className="text-base font-semibold text-slate-100 mb-4">Follower Growth</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={followerGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1c2658" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #334155', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
              />
              <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="followers" stroke="#177E89" fill="rgba(23,126,137,0.12)" strokeWidth={2} name="Total Followers" />
              <Area type="monotone" dataKey="gain" stroke="#177E89" fill="#d1fae5" strokeWidth={2} name="New Followers" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Breakdown Charts */}
      <div className="grid grid-cols-3 gap-4">
        {/* Posts Performance */}
        <div className="bg-slate-900/40 rounded-xl border shadow-card p-5">
          <h3 className="text-base font-semibold text-slate-100 mb-4">Post Performance</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={postsPerformanceData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1c2658" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="post" type="category" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} width={80} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #334155', fontSize: 12 }}
              />
              <Bar dataKey="reach" fill="#177E89" radius={[0, 4, 4, 0]} name="Reach" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Platform Breakdown */}
        <div className="bg-slate-900/40 rounded-xl border shadow-card p-5">
          <h3 className="text-base font-semibold text-slate-100 mb-4">Platform Breakdown</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={platformBreakdownData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                dataKey="value"
                strokeWidth={2}
              >
                {platformBreakdownData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #334155', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {platformBreakdownData.map(p => (
              <div key={p.name} className="flex items-center gap-1 text-xs">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                <span className="text-slate-400">{p.name}</span>
                <span className="font-semibold text-slate-100">{p.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Audience Growth Metric */}
        <div className="bg-slate-900/40 rounded-xl border shadow-card p-5">
          <h3 className="text-base font-semibold text-slate-100 mb-2">Audience Growth</h3>
          <p className="text-2xl font-bold text-slate-100">12,847</p>
          <p className="text-xs text-emerald-600 flex items-center gap-1 mt-0.5">
            <Users size={12} /> +1,247 this week
          </p>
          <div className="mt-4">
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={followerGrowthData}>
                <Area type="monotone" dataKey="followers" stroke="#177E89" fill="#d1fae5" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Performing Posts */}
      <div className="bg-slate-900/40 rounded-xl border shadow-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-slate-100">Top Performing Posts</h3>
          <button className="text-xs text-violet-600 hover:text-violet-400 font-medium flex items-center gap-0.5">
            View All <ChevronRight size={12} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-800">
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Post</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Reach</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Eng. Rate</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topPostsData.map((post, idx) => (
                <motion.tr
                  key={post.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={cn('w-7 h-7 rounded-full flex items-center justify-center', PLATFORM_CONFIG[post.platform].bg)}>
                        <PlatformIcon platform={post.platform} size={12} />
                      </div>
                      <span className="text-sm text-slate-300">{post.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-100">{(post.reach / 1000).toFixed(1)}K</td>
                  <td className="px-4 py-3 text-sm text-slate-300">{post.engagement}%</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-xs text-emerald-600">
                      <TrendingUp size={12} /> +{(Math.random() * 5 + 1).toFixed(1)}%
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page Component ─────────────────────────────────
const TABS = [
  { key: 'calendar', label: 'Calendar', icon: CalendarDays, badge: null },
  { key: 'posts', label: 'Posts', icon: MessageCircle, badge: null },
  { key: 'engagement', label: 'Engagement', icon: MessageCircle, badge: '12 new' },
  { key: 'campaigns', label: 'Campaigns', icon: Megaphone, badge: '3 active' },
  { key: 'analytics', label: 'Analytics', icon: BarChart3, badge: null },
];

export default function SocialHub() {
  const [activeTab, setActiveTab] = useState('calendar');
  const [composerOpen, setComposerOpen] = useState(false);
  const [platformFilter, setPlatformFilter] = useState('all');
  const [campaigns, setCampaigns] = useState(defaultCampaigns);
  useEffect(() => {
    fetchSocialCampaigns().then(data => setCampaigns(data)).catch(() => {});
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'calendar': return <ContentCalendarTab />;
      case 'posts': return <PostsListTab />;
      case 'engagement': return <EngagementFeedTab />;
      case 'campaigns': return <CampaignsTab campaigns={campaigns} />;
      case 'analytics': return <AnalyticsTab />;
      default: return <ContentCalendarTab />;
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Social Media Hub</h1>
          <p className="mt-1.5 text-[13px] text-slate-500 flex items-center gap-2">
            <span>4 agents</span>
            <span className="text-slate-300">·</span>
            <span className="text-violet-600 font-medium">95 posts today</span>
            <span className="text-slate-300">·</span>
            <span className="text-sky-600 font-medium">12.4K reach</span>
            <span className="text-slate-300">·</span>
            <span className="text-emerald-600 font-medium">6.8% engagement</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={platformFilter} onValueChange={setPlatformFilter}>
            <SelectTrigger className="w-36 h-9 text-xs">
              <SelectValue placeholder="All Platforms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="twitter">Twitter/X</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => setComposerOpen(true)}
            className="bg-violet-600 hover:bg-violet-700 text-white h-9 text-sm"
          >
            <PenSquare size={16} className="mr-1.5" /> New Post
          </Button>
          <Button
            variant="outline"
            className="h-9 text-sm border-slate-800 text-slate-300"
          >
            <Megaphone size={16} className="mr-1.5" /> New Campaign
          </Button>
        </div>
      </motion.div>

      {/* Tab Bar */}
      <div className="border-b border-slate-800 sticky top-16 z-30 bg-[#0a0a0a]">
        <div className="flex gap-1">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'relative flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all border-b-2',
                activeTab === tab.key
                  ? 'text-violet-600 border-violet-600 bg-violet-500/10/50'
                  : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-800/50'
              )}
            >
              <tab.icon size={16} />
              {tab.label}
              {tab.badge && (
                <span className={cn(
                  'text-[10px] font-semibold px-1.5 py-0.5 rounded-full',
                  tab.key === 'engagement' ? 'bg-red-100 text-red-400' : 'bg-violet-100 text-violet-400'
                )}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          {...tabTransition}
        >
          {renderTabContent()}
        </motion.div>
      </AnimatePresence>

      {/* Post Composer Modal */}
      <PostComposerModal
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
      />
    </div>
  );
}
