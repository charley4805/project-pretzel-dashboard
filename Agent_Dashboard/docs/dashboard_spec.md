# Management Dashboard Specification

## Document Information
- **Version**: 1.0.0
- **Status**: Draft
- **System**: Multi-Agent AI Platform Dashboard
- **Framework**: React 18 + TypeScript + Tailwind CSS

---

## Table of Contents

1. [Overview & Layout](#1-overview--layout)
2. [Pages & Routes](#2-pages--routes)
3. [Reusable Components](#3-reusable-components)
4. [Data Models](#4-data-models)
5. [Color Scheme & Design Tokens](#5-color-scheme--design-tokens)
6. [State Management](#6-state-management)
7. [Real-Time Features](#7-real-time-features)
8. [Mock vs Real Data](#8-mock-vs-real-data)

---

## 1. Overview & Layout

### 1.1 Layout Architecture

```
+------------------------------------------------------------------+
|  TOP BAR (height: 56px)                                          |
|  [Logo] [Search]                    [Alerts] [Status] [Profile]  |
+------+-----------------------------------------------------------+
|      |                                                           |
| SIDE |                    MAIN CONTENT AREA                       |
| BAR  |                    (flexible, scrollable)                  |
| (w:  |                                                           |
| 240px|                    [Page Content]                          |
|      |                                                           |
|      |                                                           |
+------+-----------------------------------------------------------+
```

### 1.2 Top Bar

```
Height: 56px
Background: #ffffff
Border-bottom: 1px solid #e2e8f0
Position: fixed, z-index: 50
```

**Elements (left to right):**

| Element | Description | Behavior |
|---------|-------------|----------|
| **Logo** | Company logo + "Agent Platform" text | Click -> navigate to Overview |
| **Search** | Global search bar (width: 320px) | Search conversations, leads, posts, agents |
| **Alerts** | Bell icon with notification count badge | Dropdown: recent alerts, escalations |
| **System Status** | Green/Yellow/Red dot + text | "All Systems Operational" or issue count |
| **Profile** | Avatar + dropdown | Settings, Team, Logout |

### 1.3 Sidebar Navigation

```
Width: 240px
Background: #0f172a (slate-900)
Text: #94a3b8 (slate-400) default, #ffffff (white) active
Icon: 20px, left of text
Active indicator: 3px left border #10b981 (emerald-500)
```

**Navigation Items:**

```
OVERVIEW
  [Icon: LayoutDashboard] Dashboard           Route: /

AGENTS
  [Icon: MessageSquare]   Support Console     Route: /support
  [Icon: Share2]          Social Media Hub    Route: /social
  [Icon: Target]          Lead Gen Scanner    Route: /leads

MANAGEMENT
  [Icon: Settings]        Agent Settings      Route: /settings
  [Icon: BarChart3]       Analytics           Route: /analytics
  [Icon: Users]           Team Management     Route: /team
  [Icon: FileText]        Audit Logs          Route: /logs
```

**Collapsed State:**
- Width: 64px (icons only)
- Tooltip on hover with full label
- Toggle button at bottom of sidebar

### 1.4 Main Content Area

```
Background: #f8fafc (slate-50)
Padding: 24px
Max-width: 1440px (centered)
Scrollable: vertical when content overflows
```

**Page Header Pattern:**
```
+---------------------------------------------------------------+
| Page Title                              [Primary Action Button] |
| Breadcrumb: Home > Section > Page                              |
+---------------------------------------------------------------+
```

---

## 2. Pages & Routes

### 2.1 Page 1: Overview / Dashboard

**Route:** `/`
**Purpose:** At-a-glance view of entire platform health and activity

#### Layout

```
+---------------------------------------------------------------+
| Dashboard                                    [Date Range Picker]|
+---------------------------------------------------------------+
|                                                                 |
|  +-------------+  +-------------+  +-------------+  +--------+ |
|  | KPI Card 1  |  | KPI Card 2  |  | KPI Card 3  |  |KPI Crd4| |
|  |             |  |             |  |             |  |        | |
|  +-------------+  +-------------+  +-------------+  +--------+ |
|                                                                 |
|  +------------------------+  +---------------------------+     |
|  | Recent Activity Feed   |  | Status Indicators        |     |
|  |                        |  |                          |     |
|  |                        |  |                          |     |
|  |                        |  |                          |     |
|  |                        |  |                          |     |
|  +------------------------+  +---------------------------+     |
|                                                                 |
|  +------------------------+  +---------------------------+     |
|  | Performance Chart      |  | Agent Distribution       |     |
|  | (7-day trend)          |  | (donut chart)            |     |
|  |                        |  |                          |     |
|  +------------------------+  +---------------------------+     |
|                                                                 |
+---------------------------------------------------------------+
```

#### KPI Cards

| Card | Metric | Value Example | Trend | Status Color |
|------|--------|---------------|-------|--------------|
| **Active Agents** | Currently running agent workers | 12 workers | +2 today | Green if all healthy |
| **Conversations Today** | Support conversations handled | 47 conversations | +12% vs yesterday | Green |
| **Leads Found** | New qualified leads (24h) | 23 leads | +5 vs avg | Green if on target |
| **Posts Scheduled** | Social posts in queue | 8 posts | -- | Amber if < 5 |
| **Escalation Queue** | Pending human escalations | 3 waiting | -- | Red if > 5 |
| **Avg Response Time** | Mean agent response time | 1.8s | -0.3s | Green |

#### KPI Card Component

```typescript
interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;        // e.g., "+12% vs yesterday"
  trend: 'up' | 'down' | 'neutral';
  trendValue?: string;
  status: 'success' | 'warning' | 'error' | 'neutral';
  icon: LucideIcon;
  onClick?: () => void;
}
```

```
Card Design:
- Background: white
- Border: 1px solid #e2e8f0
- Border-radius: 8px
- Padding: 20px
- Shadow: 0 1px 3px rgba(0,0,0,0.1)
- Top border: 3px solid (color based on status)
  - success: #10b981
  - warning: #f59e0b
  - error: #ef4444
  - neutral: #64748b
```

#### Recent Activity Feed

```typescript
interface ActivityFeedItem {
  id: string;
  timestamp: Date;
  agent_type: 'support' | 'social' | 'lead_gen';
  action: string;
  description: string;
  status: 'success' | 'warning' | 'error' | 'info';
  actor: string;
  target?: string;
  link?: string;
}
```

**Feed Items Example:**
```
[10:32 AM] Support Agent resolved conversation #4821 with user Acme Corp
[10:28 AM] Social Agent published post "5 Productivity Tips" to LinkedIn
[10:15 AM] Lead Gen Agent qualified lead: Sarah Chen (Score: 78)
[10:05 AM] Support Agent escalated conversation #4820 (billing dispute)
[09:52 AM] Lead Gen Agent scanned r/projectmanagement (3 leads found)
[09:45 AM] Social Agent scheduled 3 posts for tomorrow
[09:30 AM] Support Agent Agent Worker 3 restarted (health check)
```

#### Status Indicators Panel

```
+ System Status ------------------+
|                                  |
| LLM API         [Green] Healthy  |
| Redis Cache     [Green] Healthy  |
| PostgreSQL      [Green] Healthy  |
| Task Queue      [Green] 12 jobs  |
|                                 |
| Agent Workers -----------+      |
| Support: 5/5 running     |      |
| Social: 2/2 running      |      |
| Lead Gen: 3/3 running    |      |
|                          |      |
| Escalations: 3 pending   |      |
+--------------------------+      |
+---------------------------------+
```

#### Performance Chart

- Type: Line chart
- X-axis: Last 7 days
- Y-axis: Conversation count / Lead count / Post count
- Lines: One per metric type
- Interactive: Hover for exact values
- Library: Recharts or Chart.js

### 2.2 Page 2: Support Console

**Route:** `/support`
**Purpose:** Monitor and manage all support conversations

#### Layout

```
+---------------------------------------------------------------+
| Support Console          [Filters] [Export] [Refresh]         |
+---------------------------------------------------------------+
|                                                                 |
|  +-----------+  +---------------------------------------------+ |
|  | Live Chat |  | Conversation Viewer                         | |
|  | List      |  |                                             | |
|  |           |  |                                             | |
|  | (sidebar) |  | (main area)                                 | |
|  |           |  |                                             | |
|  |           |  |                                             | |
|  +-----------+  +---------------------------------------------+ |
|                                                                 |
|  +------------------+  +------------------+  +----------------+ |
|  | Agent Status     |  | Escalation Queue |  | Resolution     | |
|  | (worker cards)   |  | (table)          |  | Metrics        | |
|  |                  |  |                  |  | (bar chart)    | |
|  +------------------+  +------------------+  +----------------+ |
|                                                                 |
+---------------------------------------------------------------+
```

#### Live Chat List (Left Sidebar)

```
Width: 320px
Background: white
Border-right: 1px solid #e2e8f0
Scrollable: vertical
```

**Conversation List Item:**
```typescript
interface ConversationListItem {
  id: string;
  user_name: string;
  user_avatar?: string;
  last_message: string;
  last_message_time: Date;
  status: 'active' | 'resolved' | 'escalated' | 'waiting';
  agent_name: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  unread_count: number;
  sentiment: 'positive' | 'neutral' | 'negative' | 'very_negative';
  issue_category: string;
}
```

**List Item Design:**
```
- Padding: 12px 16px
- Border-bottom: 1px solid #f1f5f9
- Hover background: #f8fafc
- Active background: #eff6ff (blue-50)
- Left border: 3px (color by status)
  - active: #3b82f6 (blue)
  - resolved: #10b981 (green)
  - escalated: #ef4444 (red)
  - waiting: #f59e0b (amber)
```

**List Filters:**
- Status: All | Active | Escalated | Resolved | Waiting
- Agent: All | Specific worker
- Priority: All | Low | Medium | High | Critical
- Search: By user name or conversation ID

#### Conversation Viewer (Main Area)

```
Header:
- User name + avatar + plan badge
- Status badge (Active/Escalated/Resolved)
- Priority badge
- Category badge
- Actions: [Take Over] [Escalate] [Resolve] [View History]

Message Area:
- Scrollable chat history
- User messages: left-aligned, white bg, border
- Agent messages: right-aligned, blue bg (#dbeafe)
- System messages: center, gray text, italic
- Timestamps on each message
- Typing indicator when agent is processing

Input Area (when human takes over):
- Text input with formatting toolbar
- Quick-reply templates dropdown
- [Send] button
```

#### Agent Status Panel

```typescript
interface AgentWorkerCard {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'error' | 'restarting';
  conversations_handling: number;
  total_conversations_today: number;
  avg_response_time: number;
  uptime: string;
  last_health_check: Date;
  version: string;
}
```

```
Agent Worker Card:
- Width: ~240px (flex grid)
- Status dot: Green/Red/Amber
- Name + Version
- Conversations: "Handling 3 | Today: 47"
- Response time: "1.2s avg"
- Uptime: "99.9%"
- Actions: [Restart] [View Logs]
```

#### Escalation Queue

```typescript
interface EscalationQueueItem {
  id: string;
  conversation_id: string;
  customer_name: string;
  customer_plan: string;
  issue_summary: string;
  reason: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  waiting_since: Date;
  assigned_agent?: string;
  estimated_wait_time: number;
  attempted_solutions_count: number;
}
```

**Queue Table Columns:**
| Column | Width | Sortable |
|--------|-------|----------|
| Priority | 80px | Yes |
| Customer | 150px | Yes |
| Plan | 100px | Yes |
| Issue | Flexible | No |
| Reason | 150px | Yes |
| Waiting | 100px | Yes |
| Solutions Tried | 120px | Yes |
| Actions | 120px | No |

**Row Actions:**
- [Take It] - Assign to current user
- [View] - Open conversation
- [Details] - View escalation package

**Queue Auto-Refresh:** Every 10 seconds

#### Resolution Metrics

```
+ Resolution Metrics (Last 7 Days) +
|                                   |
|  Total: 234    Resolved: 189      |
|  Escalated: 45  Rate: 80.8%       |
|                                   |
|  [Bar Chart: Daily resolution     |
|   count with resolved/escalated   |
|   stacked bars]                   |
|                                   |
|  Top Categories:                  |
|  1. Account Issues (23%)          |
|  2. Technical (31%)               |
|  3. Billing (12%)                 |
|  4. How-To (21%)                  |
|  5. Integrations (13%)            |
+-----------------------------------+
```

### 2.3 Page 3: Social Media Hub

**Route:** `/social`
**Purpose:** Manage content calendar, create posts, monitor engagement, track campaigns

#### Layout

```
+---------------------------------------------------------------+
| Social Media Hub     [+ New Post] [+ Campaign] [Refresh]      |
+---------------------------------------------------------------+
|                                                                 |
|  [Tabs: Calendar | Posts | Engagement | Campaigns | Analytics] |
|                                                                 |
|  [Tab Content Area]                                             |
|                                                                 |
+---------------------------------------------------------------+
```

#### Tab 1: Content Calendar

```
+---------------------------------------------------------------+
| [< Prev] January 2025 [Next >]  [View: Month | Week | List]   |
+---------------------------------------------------------------+
|  Sun    Mon    Tue    Wed    Thu    Fri    Sat               |
|                                                               |
|  [Day cells with scheduled posts as colored blocks]          |
|                                                               |
|  Click day -> Shows posts for that day in sidebar             |
|  Click post -> Opens edit modal                               |
|  Drag post -> Reschedule to different day                     |
|                                                               |
+---------------------------------------------------------------+
```

**Calendar Post Block:**
```typescript
interface CalendarPost {
  id: string;
  title: string;
  platform: 'twitter' | 'linkedin' | 'facebook' | 'instagram';
  scheduled_time: Date;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  type: 'educational' | 'promotional' | 'engagement';
  engagement_preview?: {
    likes: number;
    comments: number;
    shares: number;
  };
}
```

**Color coding by type:**
- Educational: Blue (#3b82f6)
- Promotional: Purple (#8b5cf6)
- Engagement: Green (#10b981)
- User-Generated: Amber (#f59e0b)

**Color coding by status:**
- Draft: Dashed border, 50% opacity
- Scheduled: Solid border
- Published: Green left border
- Failed: Red left border

#### Tab 2: Posts

**Post List Table:**
| Column | Description |
|--------|-------------|
| Content | First 80 chars of post |
| Platform | Twitter/LinkedIn/Facebook/Instagram icon |
| Type | Educational/Promotional/Engagement badge |
| Status | Draft/Scheduled/Published/Failed badge |
| Scheduled | Date and time |
| Engagement | Likes/Comments/Shares |
| Actions | Edit, Duplicate, Delete |

#### Tab 3: Engagement Feed

```
Real-time feed of all social interactions:

[10:45 AM] @user123 commented on LinkedIn post: "This is exactly what we needed!"
[10:42 AM] @founder_jane shared Twitter post with comment "Great tips"
[10:38 AM] @marketer_mike DM'd on Twitter: "Can you tell me more about pricing?"
[10:35 AM] @startup_dave liked Instagram carousel post
[10:30 AM] @product_lisa commented on LinkedIn: "How does this compare to [competitor]?"
```

**Each interaction shows:**
- Time
- Platform icon
- User avatar + name
- Action type (comment, share, like, DM)
- Content
- [Reply] button
- [View on Platform] link

#### Tab 4: Campaigns

```typescript
interface Campaign {
  id: string;
  name: string;
  objective: 'awareness' | 'engagement' | 'conversion' | 'event';
  status: 'draft' | 'active' | 'paused' | 'completed';
  start_date: Date;
  end_date: Date;
  platforms: string[];
  posts_count: number;
  posts_published: number;
  metrics: {
    reach: number;
    impressions: number;
    engagement_rate: number;
    clicks: number;
  };
  budget?: number;
}
```

**Campaign List:**
- Card-based layout
- Progress bar (posts published / total)
- Status badge
- Key metrics summary
- Actions: [View] [Edit] [Pause/Resume] [Archive]

#### Tab 5: Analytics

```
+---------------------------------------------------------------+
| [Date Range: Last 7 Days | 30 Days | 90 Days | Custom]        |
+---------------------------------------------------------------+
|                                                                 |
|  +-------------------+  +-------------------+  +-------------+|
|  | Engagement Rate   |  | Follower Growth   |  | Top Post    ||
|  | (line chart)      |  | (area chart)      |  | (card)      ||
|  +-------------------+  +-------------------+  +-------------+|
|                                                                 |
|  +-------------------+  +-------------------+                  |
|  | Posts Performance |  | Platform Breakdown|                  |
|  | (bar chart)       |  | (donut chart)     |                  |
|  +-------------------+  +-------------------+                  |
|                                                                 |
|  +-----------------------------------------------------------+ |
|  | Top Performing Posts Table                                | |
|  +-----------------------------------------------------------+ |
|                                                                 |
+---------------------------------------------------------------+
```

### 2.4 Page 4: Lead Gen Scanner

**Route:** `/leads`
**Purpose:** Configure scan targets, view lead pipeline, manage outreach

#### Layout

```
+---------------------------------------------------------------+
| Lead Generation        [+ Add Target] [Sync CRM] [Refresh]    |
+---------------------------------------------------------------+
|                                                                 |
|  [Tabs: Pipeline | Scan Targets | Lead Detail | Outreach Log] |
|                                                                 |
|  [Tab Content Area]                                             |
|                                                                 |
+---------------------------------------------------------------+
```

#### Tab 1: Pipeline (Kanban Board)

```
+---------------------------------------------------------------+
| [Filter: All | High Priority | This Week]  [Sort by: Score]   |
+---------------------------------------------------------------+
|                                                                 |
|  +-----------+  +-----------+  +-----------+  +-----------+    |
|  | DISCOVERED|  | QUALIFIED |  | CONTACTED |  | RESPONDED |    |
|  | (12)      |  | (8)       |  | (15)      |  | (6)       |    |
|  |           |  |           |  |           |  |           |    |
|  | [Lead]    |  | [Lead]    |  | [Lead]    |  | [Lead]    |    |
|  | [Lead]    |  | [Lead]    |  | [Lead]    |  | [Lead]    |    |
|  | [Lead]    |  | [Lead]    |  | [Lead]    |  | [Lead]    |    |
|  |           |  | [Lead]    |  | [Lead]    |  |           |    |
|  |           |  |           |  |           |  |           |    |
|  +-----------+  +-----------+  +-----------+  +-----------+    |
|                                                                 |
|  +-----------+  +-----------+                                  |
|  |MEETING    |  |CONVERTED  |                                  |
|  |SCHEDULED  |  |           |                                  |
|  | (3)       |  | (2)       |                                  |
|  |           |  |           |                                  |
|  | [Lead]    |  | [Lead]    |                                  |
|  | [Lead]    |  | [Lead]    |                                  |
|  | [Lead]    |  |           |                                  |
|  +-----------+  +-----------+                                  |
|                                                                 |
+---------------------------------------------------------------+
```

**Lead Card Design:**
```
- Width: ~240px (Kanban column width)
- Background: white
- Border: 1px solid #e2e8f0
- Border-radius: 6px
- Padding: 12px
- Margin-bottom: 8px

Header:
- Name (bold)
- Company (gray)
- Score badge (color by score)

Body:
- Problem snippet (2 lines truncated)
- Source: Reddit/LinkedIn/Twitter icon + platform name
- Date discovered

Footer:
- Last activity
- [View] [Outreach] buttons
```

**Drag and Drop:** Leads can be moved between columns (status changes)

#### Tab 2: Scan Targets

```typescript
interface ScanTargetConfig {
  id: string;
  platform: string;
  name: string;
  identifier: string;       // subreddit, group, hashtag
  keywords: string[];
  frequency: string;
  is_active: boolean;
  last_scan: Date;
  leads_found_7d: number;
  avg_lead_score: number;
}
```

**Scan Target List:**
- Table with columns: Platform, Name, Keywords, Frequency, Status, Last Scan, Leads (7d), Avg Score, Actions
- Actions: [Edit] [Pause/Resume] [Delete] [Run Now]
- Toggle switch for active/inactive

#### Tab 3: Lead Detail View

```
+---------------------------------------------------------------+
| < Back to Pipeline                                              |
+---------------------------------------------------------------+
|                                                                 |
|  +------------------------+  +---------------------------+     |
|  | Lead Profile           |  | Scoring Breakdown         |     |
|  |                        |  |                           |     |
|  | [Avatar] Name          |  | Problem Fit:      [====]  |     |
|  | Company: Acme Inc      |  | Intent Signals:   [=== ]  |     |
|  | Role: Product Manager  |  | Profile Fit:      [====]  |     |
|  | Industry: SaaS         |  | Accessibility:    [==  ]  |     |
|  | Size: 50-200           |  |                           |     |
|  | Location: SF, CA       |  | TOTAL: 74/100             |     |
|  |                        |  |                           |     |
|  | Links:                 |  | [Re-score]                |     |
|  | [LinkedIn] [Twitter]   |  |                           |     |
|  |                        |  +---------------------------+     |
|  | Tags:                  |                                   |
|  | [startup] [saas] [pm]  |  +---------------------------+    |
|  |                        |  | Discovery Context         |    |
|  | [Edit Profile]         |  |                           |    |
|  |                        |  | Platform: Reddit          |    |
|  +------------------------+  | Subreddit: r/startups     |    |
|                              | Post: "Looking for a..."  |    |
|  +------------------------+  | Date: Jan 10, 2025        |    |
|  | Outreach History       |  | [View Original Post]      |    |
|  |                        |  +---------------------------+    |
|  | [Timeline of all       |                                   |
|  |  outreach messages]    |  +---------------------------+    |
|  |                        |  | Notes                     |    |
|  |                        |  | [Add note...]             |    |
|  +------------------------+  +---------------------------+    |
|                                                                 |
+---------------------------------------------------------------+
```

#### Tab 4: Outreach Log

```
Table of all outreach messages sent:

| Time | Lead | Channel | Message | Status | Response |

Status: Sent / Delivered / Read / Replied / Bounced / Failed
Response: Positive / Neutral / Negative / None
```

### 2.5 Page 5: Agent Settings

**Route:** `/settings`
**Purpose:** Configure all agent types, prompts, rules, and integrations

#### Layout

```
+---------------------------------------------------------------+
| Agent Settings                                                |
+---------------------------------------------------------------+
|                                                                 |
|  [Sidebar: Support | Social | Lead Gen | Integrations | General]|
|                                                                 |
|  [Settings Panel]                                               |
|                                                                 |
+---------------------------------------------------------------+
```

#### Settings: Support Agent

```
+---------------------------------------------------------------+
| Support Agent Settings                                [Save]   |
+---------------------------------------------------------------+
|                                                                 |
| LLM Configuration                                               |
| - Model: [GPT-4o v]                                           |
| - Temperature: [0.7]                                          |
| - Max Tokens: [4096]                                          |
|                                                                 |
| Behavior                                                        |
| - Max Solution Attempts: [5]                                  |
| - Escalation Timeout: [10] minutes                            |
| - Auto-Escalation: [ON/OFF]                                   |
| - Sentiment Threshold: [-0.7]                                 |
|                                                                 |
| Prompts (versioned)                                             |
| - System Prompt: [Edit] [v1.0 Active]                         |
| - Escalation Prompt: [Edit] [v1.0 Active]                     |
| - Closing Prompt: [Edit] [v1.0 Active]                        |
|                                                                 |
| Escalation Rules                                                |
| - Max attempts -> Escalate: [ON]                              |
| - Human request -> Escalate: [ON]                             |
| - Sentiment < threshold -> Escalate: [ON]                     |
| - Billing issues -> Escalate: [ON]                            |
| - Security concerns -> Escalate: [ON]                         |
|                                                                 |
| Integrations                                                    |
| - Slack Webhook: [____________] [Test]                        |
| - Status Page URL: [____________]                             |
| - KB API Endpoint: [____________] [Test]                      |
|                                                                 |
+---------------------------------------------------------------+
```

#### Settings: Social Media Agent

```
+---------------------------------------------------------------+
| Social Media Agent Settings                           [Save]   |
+---------------------------------------------------------------+
|                                                                 |
| Platforms                                                       |
| - Twitter/X: [Connected v] [Disconnect]                       |
| - LinkedIn:  [Connected v] [Disconnect]                       |
| - Facebook:  [Connect]                                        |
| - Instagram: [Connect]                                        |
|                                                                 |
| Content Rules                                                   |
| - Max promotional %: [20%]                                    |
| - Approval required for: [All] [Promotional only] [None]      |
| - Auto-schedule: [ON]                                         |
| - Default posting timezone: [UTC v]                           |
|                                                                 |
| Brand Voice                                                     |
| - Voice Description: [Textarea]                               |
| - Formality Level: [Casual ---+--- Professional]              |
| - Emoji Usage: [Minimal ---+--- Frequent]                     |
|                                                                 |
| Hashtag Settings                                                |
| - Branded hashtags: [#FlowStack, #FlowStackTips]              |
| - Auto-generate hashtags: [ON]                                |
| - Max per platform: Twitter[2] LinkedIn[5] FB[2] IG[8]        |
|                                                                 |
| Compliance                                                      |
| - Auto-screen content: [ON]                                   |
| - Prohibited words: [textarea]                                |
| - Require approval for: [Competitor mentions] [Pricing]       |
|                                                                 |
+---------------------------------------------------------------+
```

#### Settings: Lead Gen Agent

```
+---------------------------------------------------------------+
| Lead Gen Agent Settings                               [Save]   |
+---------------------------------------------------------------+
|                                                                 |
| Scan Configuration                                              |
| - Scan Targets: [Manage List]                                 |
| - Max daily leads: [50]                                       |
| - Min qualification score: [60]                               |
| - Duplicate window: [30] days                                 |
|                                                                 |
| Outreach                                                        |
| - Max follow-ups: [3]                                         |
| - Follow-up interval: [3] days                                |
| - Sequence duration: [21] days                                |
| - Rate limits: [Configure]                                    |
|                                                                 |
| Qualification                                                   |
| - Problem fit weight: [40%]                                   |
| - Intent signals weight: [30%]                                |
| - Profile fit weight: [20%]                                   |
| - Accessibility weight: [10%]                                 |
|                                                                 |
| CRM Integration                                                 |
| - Provider: [HubSpot v] [Salesforce] [None]                   |
| - API Key: [____________] [Test]                              |
| - Auto-sync: [ON]                                             |
| - Sync fields: [Configure]                                    |
|                                                                 |
| Ethical Settings                                                |
| - Transparency mode: [Always disclose AI] [Human name]        |
| - Opt-out handling: [Auto] [Manual review]                    |
| - Community rules check: [ON]                                 |
|                                                                 |
+---------------------------------------------------------------+
```

---

## 3. Reusable Components

### 3.1 Component Library

#### Card

```typescript
interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;     // Button or link in header
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}
```

```
Card:
- Background: white
- Border: 1px solid #e2e8f0
- Border-radius: 8px
- Shadow: 0 1px 3px rgba(0,0,0,0.1)
- Padding (default): 20px
- Header (if title): border-bottom, pb-4, mb-4
```

#### DataTable

```typescript
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  sortable?: boolean;
  filterable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  onRowClick?: (row: T) => void;
  rowActions?: RowAction<T>[];
  emptyState?: React.ReactNode;
  loading?: boolean;
}

interface ColumnDef<T> {
  key: string;
  header: string;
  width?: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
}
```

```
Table:
- Header: bg #f8fafc, font-semibold, text-sm
- Rows: hover bg #f8fafc
- Border: 1px solid #e2e8f0 between rows
- Loading state: Skeleton rows
- Empty state: Centered illustration + message
```

#### StatusBadge

```typescript
interface StatusBadgeProps {
  status: string;
  variant: 'default' | 'outline' | 'dot';
  size?: 'sm' | 'md' | 'lg';
}
```

```
Colors:
- success (active, resolved, published, healthy): 
  bg: #dcfce7, text: #166534, border: #bbf7d0
- warning (pending, scheduled, paused): 
  bg: #fef3c7, text: #92400e, border: #fde68a
- error (escalated, failed, error): 
  bg: #fee2e2, text: #991b1b, border: #fecaca
- info (draft, discovering, idle): 
  bg: #dbeafe, text: #1e40af, border: #bfdbfe
- neutral (archived, completed, stopped): 
  bg: #f1f5f9, text: #475569, border: #e2e8f0
```

#### Modal

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: React.ReactNode;
  footer?: React.ReactNode;
}
```

```
Modal:
- Overlay: bg-black/50, backdrop-blur-sm
- Panel: bg-white, rounded-lg, shadow-xl
- Sizes: sm(400px), md(500px), lg(700px), xl(900px)
- Animation: fade in 150ms, scale 95%->100%
- Close: X button top-right, Escape key, click overlay
```

#### Form Components

```typescript
// Input
interface InputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  type?: 'text' | 'email' | 'password' | 'number';
}

// Select
interface SelectProps<T> {
  label: string;
  value: T;
  options: { label: string; value: T }[];
  onChange: (value: T) => void;
}

// Toggle
interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

// Textarea
interface TextareaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}

// Slider
interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}
```

#### Chart Components

```typescript
// LineChart
interface LineChartProps {
  data: { label: string; values: Record<string, number> }[];
  lines: string[];
  colors?: string[];
  height?: number;
}

// BarChart
interface BarChartProps {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
}

// DonutChart
interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  height?: number;
  showLegend?: boolean;
}
```

#### Search & Filter Bar

```typescript
interface FilterBarProps {
  searchPlaceholder?: string;
  onSearch: (query: string) => void;
  filters: FilterConfig[];
  onFilterChange: (filters: Record<string, any>) => void;
}
```

#### Toast Notifications

```typescript
interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}
```

```
Toast:
- Position: bottom-right
- Stacking: vertical with 8px gap
- Auto-dismiss: 5 seconds default
- Progress bar at bottom
- Animation: slide in from right
```

---

## 4. Data Models

### 4.1 Core Models

```typescript
// Agent
interface Agent {
  id: string;
  type: 'support' | 'social' | 'lead_gen';
  name: string;
  status: 'active' | 'idle' | 'error' | 'starting' | 'stopped';
  version: string;
  config: AgentConfig;
  metrics: AgentMetrics;
  created_at: Date;
  last_heartbeat: Date;
  uptime_percentage: number;
}

interface AgentConfig {
  llm_model: string;
  temperature: number;
  max_tokens: number;
  features: Record<string, boolean>;
  integrations: Record<string, string>;
}

interface AgentMetrics {
  requests_today: number;
  tokens_used_today: number;
  avg_response_time_ms: number;
  error_rate: number;
  active_conversations?: number;
  posts_published_today?: number;
  leads_found_today?: number;
}

// Conversation
interface Conversation {
  id: string;
  user_id: string;
  user: User;
  agent_id: string;
  agent_name: string;
  messages: Message[];
  status: 'active' | 'resolved' | 'escalated' | 'waiting';
  priority: 'low' | 'medium' | 'high' | 'critical';
  issue_category: string;
  sentiment_current: number;
  sentiment_history: SentimentPoint[];
  started_at: Date;
  last_activity_at: Date;
  duration_minutes: number;
  resolution?: Resolution;
  escalation?: Escalation;
}

interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'agent' | 'system' | 'human_agent';
  content: string;
  timestamp: Date;
  metadata?: {
    tokens_used?: number;
    latency_ms?: number;
    tools_called?: string[];
    confidence?: number;
  };
}

interface SentimentPoint {
  value: number;  // -1.0 to 1.0
  timestamp: Date;
}

interface Resolution {
  resolved_at: Date;
  resolved_by: 'agent' | 'human_agent';
  solution_applied: string;
  attempt_count: number;
  satisfaction_score?: number;
  feedback?: string;
}

interface Escalation {
  escalated_at: Date;
  reason: string;
  escalation_package: EscalationPackage;
  assigned_to?: string;
  resolved_at?: Date;
  resolution_outcome?: string;
}

// User
interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  plan: 'free' | 'pro' | 'enterprise';
  signup_date: Date;
  last_active: Date;
  company?: string;
  role?: string;
}

// Lead
interface Lead {
  id: string;
  name: string;
  first_name: string;
  last_name: string;
  email?: string;
  company?: string;
  role?: string;
  company_size?: number;
  industry?: string;
  location?: string;
  
  source_platform: string;
  source_url: string;
  problem_description: string;
  original_post_content: string;
  
  scores: {
    problem_fit: number;
    intent_signals: number;
    profile_fit: number;
    accessibility: number;
  };
  total_score: number;
  
  status: LeadStatus;
  priority: 'high' | 'medium' | 'low';
  
  outreach_history: OutreachMessage[];
  tags: string[];
  notes: LeadNote[];
  
  crm_id?: string;
  assigned_to?: string;
  
  created_at: Date;
  updated_at: Date;
}

type LeadStatus = 
  | 'discovered' 
  | 'qualifying' 
  | 'qualified' 
  | 'outreach_queued' 
  | 'contacted' 
  | 'responded' 
  | 'no_reply' 
  | 'meeting_scheduled' 
  | 'converted'
  | 'disqualified'
  | 'nurture'
  | 'opted_out';

interface OutreachMessage {
  id: string;
  sequence_number: number;
  channel: 'linkedin_dm' | 'twitter_dm' | 'email' | 'reddit_comment' | 'forum_comment';
  content: string;
  sent_at: Date;
  response_received: boolean;
  response_content?: string;
  response_at?: Date;
}

interface LeadNote {
  id: string;
  author: string;
  content: string;
  created_at: Date;
}

// Campaign
interface Campaign {
  id: string;
  name: string;
  objective: 'awareness' | 'engagement' | 'conversion' | 'event';
  description: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  platforms: string[];
  start_date: Date;
  end_date: Date;
  posts: CampaignPost[];
  metrics: CampaignMetrics;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

interface CampaignPost {
  id: string;
  campaign_id: string;
  content: string;
  platform: string;
  type: 'educational' | 'promotional' | 'engagement';
  status: 'draft' | 'pending_approval' | 'scheduled' | 'published' | 'failed';
  scheduled_time?: Date;
  published_time?: Date;
  engagement?: PostEngagement;
  assets: PostAsset[];
}

interface PostEngagement {
  likes: number;
  comments: number;
  shares: number;
  impressions: number;
  clicks: number;
  reach: number;
}

interface PostAsset {
  id: string;
  type: 'image' | 'video' | 'document';
  url: string;
  alt_text?: string;
}

interface CampaignMetrics {
  total_reach: number;
  total_impressions: number;
  total_engagements: number;
  total_clicks: number;
  avg_engagement_rate: number;
  follower_growth: number;
  estimated_spend?: number;
}

// Post (Social Media)
interface SocialPost {
  id: string;
  content: string;
  platform: 'twitter' | 'linkedin' | 'facebook' | 'instagram';
  type: 'educational' | 'promotional' | 'engagement' | 'ugc' | 'culture';
  status: 'draft' | 'pending_approval' | 'scheduled' | 'published' | 'failed';
  campaign_id?: string;
  scheduled_time?: Date;
  published_time?: Date;
  engagement: PostEngagement;
  hashtags: string[];
  mentions: string[];
  assets: PostAsset[];
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

// Activity
interface Activity {
  id: string;
  timestamp: Date;
  agent_type: 'support' | 'social' | 'lead_gen' | 'system';
  agent_id?: string;
  action: string;
  description: string;
  status: 'success' | 'warning' | 'error' | 'info';
  metadata: Record<string, any>;
}

// System Alert
interface SystemAlert {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  source: string;
  acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: Date;
  created_at: Date;
  resolved_at?: Date;
}

// Team Member
interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  role: 'admin' | 'support_manager' | 'social_manager' | 'lead_manager' | 'viewer';
  status: 'active' | 'inactive';
  assigned_conversations: number;
  resolved_today: number;
  last_active: Date;
}
```

### 4.2 API Response Types

```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
  error?: {
    code: string;
    message: string;
  };
}

interface PaginatedResponse<T> {
  items: T[];
  page: number;
  per_page: number;
  total: number;
  has_next: boolean;
  has_prev: boolean;
}

interface WebSocketMessage {
  type: 'agent_status' | 'conversation_update' | 'new_lead' | 'post_published' 
      | 'escalation' | 'alert' | 'activity';
  payload: any;
  timestamp: Date;
}
```

---

## 5. Color Scheme & Design Tokens

### 5.1 Primary Colors

```css
:root {
  /* Sidebar */
  --sidebar-bg: #0f172a;           /* slate-900 */
  --sidebar-text: #94a3b8;         /* slate-400 */
  --sidebar-text-active: #ffffff;  /* white */
  --sidebar-border: #1e293b;       /* slate-800 */
  --sidebar-active-border: #10b981; /* emerald-500 */
  
  /* Content Area */
  --content-bg: #f8fafc;           /* slate-50 */
  --card-bg: #ffffff;              /* white */
  --card-border: #e2e8f0;          /* slate-200 */
  
  /* Top Bar */
  --topbar-bg: #ffffff;
  --topbar-border: #e2e8f0;
  
  /* Text */
  --text-primary: #0f172a;         /* slate-900 */
  --text-secondary: #475569;       /* slate-600 */
  --text-muted: #94a3b8;           /* slate-400 */
  --text-link: #3b82f6;            /* blue-500 */
  
  /* Status Colors */
  --status-active: #10b981;        /* emerald-500 */
  --status-warning: #f59e0b;       /* amber-500 */
  --status-error: #ef4444;         /* red-500 */
  --status-info: #3b82f6;          /* blue-500 */
  
  /* Status Backgrounds */
  --status-bg-active: #dcfce7;     /* emerald-100 */
  --status-bg-warning: #fef3c7;    /* amber-100 */
  --status-bg-error: #fee2e2;      /* red-100 */
  --status-bg-info: #dbeafe;       /* blue-100 */
  
  /* Agent Type Colors */
  --agent-support: #3b82f6;        /* blue-500 */
  --agent-social: #8b5cf6;         /* violet-500 */
  --agent-lead: #f59e0b;           /* amber-500 */
  
  /* Semantic */
  --primary: #3b82f6;              /* blue-500 */
  --primary-hover: #2563eb;        /* blue-600 */
  --primary-bg: #eff6ff;           /* blue-50 */
  
  --success: #10b981;              /* emerald-500 */
  --success-hover: #059669;        /* emerald-600 */
  --success-bg: #ecfdf5;           /* emerald-50 */
  
  --danger: #ef4444;               /* red-500 */
  --danger-hover: #dc2626;         /* red-600 */
  --danger-bg: #fef2f2;            /* red-50 */
  
  /* Chart Colors */
  --chart-1: #3b82f6;
  --chart-2: #10b981;
  --chart-3: #f59e0b;
  --chart-4: #8b5cf6;
  --chart-5: #ef4444;
  --chart-6: #06b6d4;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.07);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
  
  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  
  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  
  /* Typography */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}
```

### 5.2 Typography Scale

```css
/* Headings */
.text-h1 { font-size: 24px; font-weight: 700; line-height: 1.3; }
.text-h2 { font-size: 20px; font-weight: 600; line-height: 1.35; }
.text-h3 { font-size: 16px; font-weight: 600; line-height: 1.4; }

/* Body */
.text-body { font-size: 14px; font-weight: 400; line-height: 1.5; }
.text-body-sm { font-size: 13px; font-weight: 400; line-height: 1.5; }
.text-caption { font-size: 12px; font-weight: 400; line-height: 1.4; }

/* Special */
.text-kpi { font-size: 32px; font-weight: 700; line-height: 1.2; }
.text-badge { font-size: 11px; font-weight: 600; line-height: 1; text-transform: uppercase; }
```

### 5.3 Dark Mode (Future)

```css
[data-theme="dark"] {
  --sidebar-bg: #020617;
  --content-bg: #0f172a;
  --card-bg: #1e293b;
  --card-border: #334155;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --topbar-bg: #1e293b;
  --topbar-border: #334155;
}
```

---

## 6. State Management

### 6.1 Architecture

```
State Layers:

1. Server State (React Query / TanStack Query)
   - Agent data, conversations, leads, posts
   - Cache with automatic invalidation
   - Optimistic updates for mutations
   
2. Real-Time State (WebSocket + Zustand)
   - Live conversation updates
   - Agent status changes
   - Activity feed
   - Alerts
   
3. UI State (Zustand)
   - Sidebar collapse
   - Active filters
   - Modal open/close
   - Selected items
   
4. Form State (React Hook Form)
   - Settings forms
   - Post composer
   - Lead notes
```

### 6.2 Store Structure (Zustand)

```typescript
// Global Store
interface AppStore {
  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  
  // Active page context
  currentPage: string;
  setCurrentPage: (page: string) => void;
  
  // Global filters
  globalDateRange: { start: Date; end: Date };
  setDateRange: (range: { start: Date; end: Date }) => void;
  
  // Real-time data
  agents: Agent[];
  setAgents: (agents: Agent[]) => void;
  updateAgent: (agent: Agent) => void;
  
  conversations: Conversation[];
  setConversations: (conversations: Conversation[]) => void;
  updateConversation: (conversation: Conversation) => void;
  
  leads: Lead[];
  setLeads: (leads: Lead[]) => void;
  updateLead: (lead: Lead) => void;
  
  posts: SocialPost[];
  setPosts: (posts: SocialPost[]) => void;
  updatePost: (post: SocialPost) => void;
  
  campaigns: Campaign[];
  setCampaigns: (campaigns: Campaign[]) => void;
  
  // Activity feed
  activities: Activity[];
  addActivity: (activity: Activity) => void;
  
  // Alerts
  alerts: SystemAlert[];
  addAlert: (alert: SystemAlert) => void;
  acknowledgeAlert: (id: string) => void;
  
  // Notifications
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}
```

### 6.3 React Query Keys

```typescript
const queryKeys = {
  agents: ['agents'] as const,
  agent: (id: string) => ['agents', id] as const,
  agentMetrics: (id: string) => ['agents', id, 'metrics'] as const,
  
  conversations: ['conversations'] as const,
  conversation: (id: string) => ['conversations', id] as const,
  conversationMessages: (id: string) => ['conversations', id, 'messages'] as const,
  
  leads: ['leads'] as const,
  lead: (id: string) => ['leads', id] as const,
  leadOutreach: (id: string) => ['leads', id, 'outreach'] as const,
  
  posts: ['posts'] as const,
  post: (id: string) => ['posts', id] as const,
  
  campaigns: ['campaigns'] as const,
  campaign: (id: string) => ['campaigns', id] as const,
  
  activity: ['activity'] as const,
  alerts: ['alerts'] as const,
  
  dashboard: {
    overview: ['dashboard', 'overview'] as const,
    metrics: ['dashboard', 'metrics'] as const,
  },
};
```

### 6.4 Data Flow

```
[API Server] <--REST--> [React Query] --> [Zustand Store] --> [Components]
     |                                                    |
     |<---------------- WebSocket -------------------------|
     |                                                    |
[Agent Workers] -------> [Event Bus] -------> [WebSocket Server]
```

**Data Update Patterns:**

1. **Polling (15s interval):**
   - Agent status
   - Escalation queue
   - Lead pipeline counts

2. **WebSocket (real-time):**
   - New messages in active conversations
   - New activity feed items
   - Agent status changes
   - New alerts

3. **Cache Invalidation:**
   - On mutation success
   - On WebSocket event
   - Manual refresh

4. **Optimistic Updates:**
   - Status changes (drag in kanban)
   - Note additions
   - Filter changes

---

## 7. Real-Time Features

### 7.1 WebSocket Events

```typescript
// Client -> Server
interface ClientEvent {
  type: 'subscribe' | 'unsubscribe' | 'ping' | 'typing' | 'message';
  channel?: string;
  payload?: any;
}

// Server -> Client
interface ServerEvent {
  type: 'agent_status_change' | 'conversation_update' | 'new_message'
      | 'new_lead' | 'lead_status_change' | 'post_published'
      | 'engagement_received' | 'new_alert' | 'activity'
      | 'system_status' | 'pong';
  timestamp: Date;
  payload: any;
}
```

### 7.2 Subscription Channels

| Channel | Pattern | Who Subscribes |
|---------|---------|----------------|
| Dashboard | `dashboard:{user_id}` | Overview page |
| Conversations | `conversations:*` | Support Console |
| Single Conversation | `conversation:{id}` | Active chat view |
| Agents | `agents:all` | All pages (background) |
| Leads | `leads:*` | Lead Gen page |
| Social | `social:*` | Social Media Hub |
| Alerts | `alerts:{user_id}` | All pages |
| Activity | `activity:all` | Overview page |

### 7.3 Typing Indicators

```
When agent is processing:
- Show "Agent is typing..." with animated dots
- After 5s: "Still thinking..."
- After 15s: "Complex issue, analyzing..."
- After 30s: "Taking longer than usual, standby..."
```

### 7.4 Toast Notifications

**Trigger Events:**
- New escalation received
- Agent goes offline
- Post published successfully
- Lead score changes significantly
- System alert
- Human agent takes over conversation

**Toast Design:**
```
+--------------------------------------------------+
| [Icon] Title                    [Close]          |
| Description                                      |
| [Action Button - optional]                       |
+--------------------------------------------------+

Duration: 5 seconds (10s for escalations)
Position: Bottom-right
Stack: Max 5, dismiss oldest
Click: Navigate to relevant page
```

---

## 8. Mock vs Real Data

### 8.1 Development Phases

| Phase | Data Source | Purpose |
|-------|-------------|---------|
| **Phase 1: UI Development** | Mock data (JSON files) | Build all components |
| **Phase 2: Integration** | Mixed (mock API responses) | Wire up API calls |
| **Phase 3: Staging** | Real data + test scenarios | End-to-end testing |
| **Phase 4: Production** | Real data only | Live operation |

### 8.2 Mock Data Structure

```typescript
// Mock data generators
interface MockData {
  agents: Agent[];              // 8-12 agents across types
  conversations: Conversation[]; // 20-30 conversations
  leads: Lead[];                // 50-100 leads
  posts: SocialPost[];          // 30-50 posts
  campaigns: Campaign[];        // 3-5 campaigns
  activities: Activity[];       // 100 activity items
  alerts: SystemAlert[];        // 5-10 alerts
  teamMembers: TeamMember[];    // 5-8 team members
}
```

### 8.3 Mock API Layer

```typescript
// Mock API with artificial delays
const mockApi = {
  get: async <T>(endpoint: string, delay = 500): Promise<T> => {
    await new Promise(r => setTimeout(r, delay));
    return mockData[endpoint] as T;
  },
  
  post: async <T>(endpoint: string, data: any, delay = 300): Promise<T> => {
    await new Promise(r => setTimeout(r, delay));
    // Simulate mutation
    return { id: generateId(), ...data } as T;
  }
};

// Feature flag
const USE_MOCK_API = process.env.REACT_APP_MOCK_API === 'true';

// API client that switches between mock and real
const api = USE_MOCK_API ? mockApi : realApi;
```

### 8.4 Data Seeding Script

```typescript
// Seed script for realistic mock data
async function seedMockData(): Promise<MockData> {
  return {
    agents: generateAgents(10),
    conversations: generateConversations(25),
    leads: generateLeads(75),
    posts: generatePosts(40),
    campaigns: generateCampaigns(4),
    activities: generateActivities(100),
    alerts: generateAlerts(8),
    teamMembers: generateTeamMembers(6),
  };
}

function generateAgents(count: number): Agent[] {
  const types: Agent['type'][] = ['support', 'social', 'lead_gen'];
  const statuses: Agent['status'][] = ['active', 'idle', 'error'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `agent-${i + 1}`,
    type: types[i % 3],
    name: `Worker ${i + 1}`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    version: `1.${Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 10)}`,
    // ... more fields
  }));
}
```

### 8.5 Environment Configuration

```typescript
// config.ts
export const config = {
  API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  WS_URL: process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws',
  USE_MOCK_DATA: process.env.REACT_APP_MOCK_DATA === 'true',
  REFRESH_INTERVAL: parseInt(process.env.REACT_APP_REFRESH_INTERVAL || '15000'),
  WS_ENABLED: process.env.REACT_APP_WS_ENABLED !== 'false',
  
  // Feature flags
  features: {
    darkMode: false,          // Coming soon
    advancedAnalytics: true,
    crmIntegration: true,
    bulkActions: true,
    customReports: false,     // Coming soon
  }
};
```

---

*End of Dashboard Specification*
