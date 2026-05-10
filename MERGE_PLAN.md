# PRETZEL DASHBOARD MERGE PLAN
## Integrating Agent Dashboard into Pretzel Dashboard

**Date**: May 8, 2026  
**Status**: Planning Phase (No code changes yet)  
**Goal**: Unified command center for business operations + AI agent management

---

## 1. SUMMARY OF PRETZEL DASHBOARD

### Current State
- **Framework**: Next.js 14 (App Router, TypeScript)
- **Location**: `/frontend/`
- **Architecture**: Server-side routing with client components
- **Backend**: FastAPI (Python) at `NEXT_PUBLIC_API_URL` (default: localhost:8000)
- **Database**: Supabase PostgreSQL (asyncpg)
- **Styling**: Tailwind CSS with amber accent colors, dark theme (slate-900 bg)
- **Components**: Lucide icons, Recharts charts, Radix UI
- **State**: useState + direct API calls (no Redux/Zustand)

### Current Pages & Capabilities

```
/admin/analytics  → Ecosystem KPIs (Pretzel.io + PretzelKnot metrics)
/admin/marketing  → Marketing campaigns & data
/admin/sales      → Sales pipeline & CRM
/admin/inbox      → Gmail inbox (support + sales emails) 
/admin/social     → Social feed (Twitter/X + LinkedIn posts)
/admin/traffic    → Website traffic analytics
```

### API Routes (Backend)
```
/api/admin/analytics  → Overview, ecosystem health, growth charts
/api/admin/marketing  → Campaign data
/api/admin/sales      → Sales pipeline
/api/admin/inbox      → Gmail inbox integration
/api/admin/social     → Social media posts
/api/admin/traffic    → Traffic data
/api/admin/crm        → CRM leads, activities, notes
```

### Key Features
- ✅ Live email integration (Gmail API)
- ✅ Social media feeds (Twitter/X + LinkedIn APIs)
- ✅ Business metrics (Pretzel.io + PretzelKnot)
- ✅ Real API connections to backend
- ✅ Professional dark UI
- ⚠️ NO agent management yet
- ⚠️ Business operations only

### Styling System
- **Color Scheme**: Slate-900 background, slate-100/400 text, amber accents
- **Font**: Inter (system)
- **Components**: Mix of custom + Lucide icons + Recharts
- **Layout**: Sidebar nav (56px width) + main content area
- **Responsive**: Mobile hamburger menu

### Database Models (Current)
```python
CRMLead         → id, name, email, company, phone, source, status
CRMEmailLog     → id, lead_id, to/from_email, subject, body, sent_at
CRMActivity     → id, lead_id, activity_type, description, occurred_at
CRMNote         → id, lead_id, content, author, created_at
```

---

## 2. SUMMARY OF AGENT DASHBOARD

### Current State
- **Framework**: React 18 + Vite (React Router SPA)
- **Location**: `/Agent_Dashboard/app/`
- **Architecture**: Client-side routing with React Router
- **Data**: Mock data only (no API integration yet)
- **Styling**: Tailwind CSS with slate-900 dark theme
- **Components**: shadcn/ui, Framer Motion, @hello-pangea/dnd (drag-drop), Recharts
- **State**: useState only (no persistent state)

### Current Pages & Capabilities

```
/                 → Dashboard Overview (agent fleet status)
/support          → Support Console (conversations, chat queue)
/social           → Social Hub (content calendar, campaigns, engagement)
/leads            → Lead Gen Scanner (lead pipeline, drag-drop board)
/settings         → Agent Settings (configure agents, prompts, rules)
/training         → Agent Training (train with examples, feedback)
/guardrails       → Guardrails (safety boundaries, policy enforcement)
/harnesses        → Agent Harnesses (workflow orchestration)
/vault            → Obsidian Vault (shared knowledge base)
/resources        → Resources (documentation, guides, connectors)
```

### Key Features
- ✅ Agent fleet overview with status indicators
- ✅ Support agent console with conversation management
- ✅ Social media campaign calendar + engagement tracking
- ✅ Lead pipeline with drag-drop Kanban board
- ✅ Agent configuration & settings UI
- ✅ Training & fine-tuning interface
- ✅ Advanced UI patterns (Framer Motion, drag-drop)
- ✅ Comprehensive agent type specs (docs/agent_architecture.md)
- ⚠️ NO real backend integration
- ⚠️ NO persistence (mock data only)
- ⚠️ DISCONNECTED from business operations

### Agent Types Defined
1. **Support Agents** (6 instances in mockData)
   - Handles billing, technical support, general inquiries, escalations
   - Integrated: conversations, tickets, resolution tracking

2. **Social Agents** (4 instances)
   - LinkedIn content & engagement
   - Twitter monitoring & replies
   - Instagram & visual content
   - Community management & DMs

3. **Lead Gen Agents** (5 instances)
   - Reddit & forum prospecting
   - IndieHackers & ProductHunt
   - Twitter DM outreach
   - LinkedIn Sales Navigator
   - Lead verification

### UI Components (Advanced)
- Drag-drop lead pipeline (Kanban board)
- Real-time agent status dashboard
- Conversation thread UI
- Campaign calendar with scheduling
- Advanced modals and dialogs
- Animated transitions (Framer Motion)

### Data Models (Mock)
```typescript
Agent         → id, name, type, status, avatar, handle, description
Conversation  → id, user, agent, status, messageCount, lastActive
Lead          → id, name, source, score, status, date
Post          → id, platform, content, scheduledFor, status, engagement
Campaign      → id, name, platform, status, leads, conversion
Activity      → id, agentType, agentName, action, detail, timestamp
```

---

## 3. RECOMMENDED FINAL ARCHITECTURE

### Design Principle
**Single unified shell** (Pretzel Dashboard) with **Agent Dashboard integrated as connected sections**.

The final system should feel like one operating system where:
- Business tools show the agents helping that area
- Agents are visible throughout the dashboard
- Switching between business & agent views is seamless
- Each agent has clear purpose, status, and connected data

### Technology Stack (Unified)
- **Frontend**: Next.js 14 (full migration from Vite SPA)
- **Framework**: React 18 with TypeScript
- **Routing**: Next.js App Router (native routing)
- **Components**: Mix of shadcn/ui + Lucide + Recharts
- **Styling**: Tailwind CSS (single theme)
- **Animations**: Framer Motion (from Agent Dashboard)
- **Drag-Drop**: @hello-pangea/dnd (from Agent Dashboard)
- **Backend**: FastAPI (Python) - already established
- **Database**: Supabase PostgreSQL - already established
- **State**: useState + useCallback (keep simple, no Redux needed)

### Key Architectural Decisions

1. **Pretzel remains the main shell** ✅
   - Source of truth for navigation, authentication, layout
   - Sidebar expands to include Agent sections

2. **Agent Dashboard components migrate into Pretzel** ✅
   - Not a separate app
   - Becomes `/admin/agents` section with subsections
   - Reuses Pretzel's backend infrastructure

3. **Business operations stay in place** ✅
   - `/admin/analytics`, `/admin/marketing`, `/admin/sales` unchanged
   - Agent insights are ADDED to these pages, not replacing them

4. **Agent operations get new home** ✅
   - `/admin/agents` becomes new main section
   - Subsections: `/admin/agents/support`, `/admin/agents/social`, etc.

5. **Unified theme** ✅
   - Keep Pretzel's slate-900 + amber accents
   - Maintain consistent component library
   - Use shadcn/ui + Framer Motion for polish

6. **Single backend** ✅
   - One FastAPI server serves both business + agent data
   - New agent APIs: `/api/admin/agents/*`
   - Reuse existing CRM, email, social integrations

---

## 4. FINAL ROUTE STRUCTURE

### Navigation Hierarchy

```
COMMAND CENTER
├── OVERVIEW
│   └── /admin/dashboard                (unified command center view)
│
├── BUSINESS OPERATIONS
│   ├── /admin/analytics                (ecosystem KPIs + agent performance)
│   ├── /admin/marketing                (campaigns + marketing agents)
│   ├── /admin/sales                    (pipeline + lead agents)
│   ├── /admin/inbox                    (emails + support agents)
│   ├── /admin/social                   (feed + social agents)
│   └── /admin/traffic                  (analytics + data agents)
│
├── AGENT OPERATIONS                   [NEW]
│   ├── /admin/agents                   (agent fleet overview)
│   ├── /admin/agents/support           (support agent console)
│   ├── /admin/agents/social            (social agent hub)
│   ├── /admin/agents/leads             (lead gen scanner)
│   ├── /admin/agents/training          (agent training)
│   ├── /admin/agents/settings          (agent configuration)
│   ├── /admin/agents/guardrails        (safety boundaries)
│   ├── /admin/agents/harnesses         (workflow orchestration)
│   ├── /admin/agents/vault             (knowledge base)
│   └── /admin/agents/resources         (documentation)
│
└── SETTINGS
    └── /admin/settings                 (dashboard settings, API keys, etc.)
```

### Sidebar Navigation Items (Updated)
```
🏠 Dashboard              → /admin/dashboard
📊 Analytics             → /admin/analytics
📈 Marketing             → /admin/marketing
💰 Sales                 → /admin/sales
📧 Inbox                 → /admin/inbox
📱 Social                → /admin/social
📍 Traffic               → /admin/traffic

──── AGENT OPERATIONS ────
🤖 Agents (Overview)     → /admin/agents
🎧 Support Agents        → /admin/agents/support
📢 Social Agents         → /admin/agents/social
🎯 Lead Gen Agents       → /admin/agents/leads
⚙️ Agent Settings        → /admin/agents/settings
📚 Knowledge Vault       → /admin/agents/vault

──── CONFIG ────
⚙️ Settings              → /admin/settings
```

---

## 5. COMPONENT MIGRATION PLAN

### Components to KEEP (Pretzel)
- Sidebar navigation
- Layout shell
- KPI cards (will enhance)
- Email card components
- Post/Feed components
- API integration patterns

### Components to MIGRATE (Agent → Pretzel)
Source: `/Agent_Dashboard/app/src/components/`

#### UI Components (shadcn/ui-based)
```
ui/badge.tsx              → Badge component
ui/button.tsx             → Button component
ui/dialog.tsx             → Dialog/Modal component
ui/dropdown-menu.tsx      → Dropdown menu
ui/tabs.tsx               → Tab navigation
ui/textarea.tsx           → Text input
ui/select.tsx             → Select dropdown
ui/scroll-area.tsx        → Scrollable container
```

#### Advanced Components to Reuse
```
[Component]               [Source]              [Destination]
Support conversation UI   SupportConsole.tsx    /admin/agents/support + /admin/inbox
Lead Kanban board        LeadGen.tsx           /admin/agents/leads + /admin/sales
Social calendar          SocialHub.tsx         /admin/agents/social + /admin/social
Agent status cards       Overview.tsx          /admin/agents + all pages
```

#### New Components Needed
```
AgentCard
  → Status, type, description, connected data source
  
AgentModal
  → Configure, train, connect tools, review activity
  
AgentActivityFeed
  → Recent actions, conversations, leads, posts
  
BusinessAgentWidget
  → Agent card for each business section (sales, social, etc)
  
ConversationThread
  → Chat UI for support + training
  
LeadPipelineBoard
  → Kanban board for lead pipeline
  
CampaignCalendar
  → Social content calendar with scheduling
```

### Styling System (Unified)
**Source**: Pretzel's existing `tailwind.config.ts`

```typescript
// Keep all Pretzel colors
colors: {
  pretzel: { /* amber colors */ }
  slate: { /* existing */ }
}

// ADD from Agent Dashboard
plugins: [
  // Framer Motion support (already compatible)
  // No additional Tailwind plugins needed
]
```

**Design Token Decisions**:
- ✅ Keep Pretzel's slate-900 dark background
- ✅ Keep amber accents for highlights
- ✅ Use slate-400/500 for secondary text
- ✅ Emerald/red/amber for status indicators (already consistent)

---

## 6. AGENT INTEGRATION MAP

### Support Agents → Email & Support Workflows

**Connection Points**:
```
/admin/inbox
├── Show unread email count from Gmail
├── Add: "Support Agent Activity" card
│   └── Recent conversations, escalations, resolution rates
└── Modal: "Manage Support Agents"
    ├── View agent status
    ├── Configure prompts/guardrails
    └── Review conversation logs

/admin/agents/support
├── Full Support Console
├── Agent fleet status
├── Live conversation queue
├── Escalation management
└── Agent settings & training
```

**Data Flow**:
```
Gmail API → Backend (/api/admin/inbox)
        ↓
Support Agent System
        ↓
CRMEmailLog → Database
        ↓
Frontend: Show agent activity + email queue
```

**Agent Actions**:
- Draft email replies (review before sending)
- Escalate complex issues (mark, assign to team)
- Track follow-ups (schedule reminders)
- Log resolution (update lead status)

### Social Agents → Social Media & Marketing

**Connection Points**:
```
/admin/social
├── Show social feed (existing)
├── Add: "Social Agent Activity" widget
│   └── Recent posts, engagement, campaigns
└── Agent controls: Schedule, publish, reply

/admin/marketing
├── Add: "Social Campaigns" section
└── Agent status & performance

/admin/agents/social
├── Full Social Hub
├── Campaign management
├── Content calendar
├── Engagement tracking
└── Agent-specific settings
```

**Data Flow**:
```
Twitter/LinkedIn API → Backend
                   ↓
Social Agent System
                   ↓
Database (posts, campaigns, engagement)
                   ↓
Frontend: Calendar + agent activity
```

**Agent Actions**:
- Schedule posts to multiple platforms
- Monitor & reply to mentions
- Analyze engagement metrics
- Suggest content based on performance

### Lead Agents → Sales & CRM

**Connection Points**:
```
/admin/sales
├── Show pipeline (existing)
├── Add: "Lead Agent Activity" widget
│   └── New leads discovered, scores, contacted count
└── View lead sources (forums, Twitter, LinkedIn)

/admin/agents/leads
├── Lead Gen Scanner
├── Drag-drop Kanban board (by stage)
├── Lead scoring & qualification
├── Outreach history
└── Integration settings
```

**Data Flow**:
```
Forum/Social APIs → Backend
               ↓
Lead Gen Agent System
               ↓
CRMLead → Database
    ↓
Frontend: Pipeline + agent activity
```

**Agent Actions**:
- Discover leads on forums, Twitter, LinkedIn
- Qualify leads based on criteria
- Send initial outreach (draft for review)
- Track follow-up history
- Mark as converted/lost

### Data Agents → Analytics & Reporting

**Connection Points**:
```
/admin/analytics
├── Show existing KPIs
├── Add: "Agent Performance Dashboard"
│   ├── Support: Resolution rate, avg handle time
│   ├── Social: Engagement rate, post performance
│   ├── Leads: Discovery rate, conversion rate
│   └── Combined: Agent uptime, activity volume
└── Time series: Agent productivity trends

/admin/agents
├── Overall fleet health
├── Individual agent metrics
└── Comparative performance
```

**Data to Track**:
```
Support Agent Metrics
├── Conversations handled
├── Resolution rate
├── Avg response time
├── Escalation rate
├── Customer satisfaction

Social Agent Metrics
├── Posts published
├── Engagement generated
├── Response time
├── Campaign performance

Lead Agent Metrics
├── Leads discovered
├── Leads qualified
├── Outreach sent
├── Conversion rate
├── Cost per lead
```

### Cross-Cutting: Knowledge & Training

**Connection Points**:
```
/admin/agents/vault
├── Shared knowledge base
├── FAQs & troubleshooting (pulled by all agents)
├── Product updates & docs
└── Custom instructions

/admin/agents/training
├── Train support on new issues
├── Train social on brand voice
├── Train leads on target profiles
└── Fine-tune on real examples
```

**Data Structure**:
```
Agents.knowledge_vault
├── category: 'support' | 'social' | 'leads' | 'general'
├── title
├── content
├── updated_at
└── used_by_agent_type

Agents.training_examples
├── agent_type
├── task (e.g., 'email_response', 'lead_qualification')
├── input
├── expected_output
├── actual_output
└── feedback
```

---

## 7. BACKEND/API NEEDS

### New FastAPI Routes Required

```python
# Agent Fleet Management
GET     /api/admin/agents/overview
  → Returns: active agents, statuses, recent activity, uptime

GET     /api/admin/agents/{agent_type}
  → Returns: support | social | leads agents with detailed status

POST    /api/admin/agents/{agent_id}/configure
  → Update: prompts, guardrails, integrations

GET     /api/admin/agents/{agent_id}/activity
  → Returns: recent actions, conversations, metrics

# Support Agent API
GET     /api/admin/agents/support/conversations
  → Returns: open conversations, queue, escalations

GET     /api/admin/agents/support/conversations/{conv_id}
  → Returns: conversation thread, agent notes, history

POST    /api/admin/agents/support/escalate
  → Mark conversation for human review

POST    /api/admin/agents/support/draft-reply
  → Agent drafts email, waiting for human approval

# Social Agent API
GET     /api/admin/agents/social/campaigns
  → Returns: active campaigns, scheduling, performance

POST    /api/admin/agents/social/schedule-post
  → Queue post for publishing (with approval)

GET     /api/admin/agents/social/engagement
  → Returns: recent mentions, engagement, sentiment

# Lead Agent API
GET     /api/admin/agents/leads/pipeline
  → Returns: leads by stage (discovered, contacted, etc)

GET     /api/admin/agents/leads/sources
  → Returns: where leads came from (reddit, twitter, etc)

POST    /api/admin/agents/leads/score
  → Run qualification on lead

POST    /api/admin/agents/leads/outreach-draft
  → Agent drafts outreach message

# Agent Training & Configuration
GET     /api/admin/agents/vault
  → Knowledge base articles

POST    /api/admin/agents/training/example
  → Add training example

GET     /api/admin/agents/settings/{agent_type}
  → Agent prompts, guardrails, integrations

POST    /api/admin/agents/settings/{agent_type}
  → Update agent settings
```

### Backend Dependencies (Current + New)

**Already Installed**:
```
fastapi, uvicorn, sqlalchemy, asyncpg
python-dotenv, httpx
google-auth, google-api-python-client
tweepy, requests, pydantic
```

**May Need to Add**:
```
anthropic or openai        # For agent LLM backends
celery or temporal         # For async agent task execution
redis                      # For agent task queue & caching
pydantic-settings          # For better config management
```

### Integration Points with Existing Backend

```
Existing Tables (reuse)
├── CRMLead          → Link to lead agent activity
├── CRMEmailLog      → Link to support agent activity
├── CRMActivity      → Log all agent actions
└── crm_notes        → Store agent notes & reasoning

New Tables (to create)
├── agents           → Agent instances & metadata
├── agent_activity   → Action logs (conversations, posts, leads)
├── agent_config     → Prompts, guardrails, settings
├── agent_training   → Training examples & feedback
├── agent_vault      → Knowledge base articles
└── agent_metrics    → Performance data (hourly snapshots)
```

---

## 8. DATABASE NEEDS

### New Tables to Create

```python
# Core Agent Definitions
class Agent(Base):
    __tablename__ = "agents"
    id = Column(UUID, primary_key=True, default=uuid4)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)  # 'support' | 'social' | 'leads'
    status = Column(String, default='idle')  # 'online' | 'busy' | 'offline' | 'error'
    description = Column(String)
    avatar_url = Column(String, nullable=True)
    handle = Column(String, nullable=True)  # @handle
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow)
    
# Agent Configuration
class AgentConfig(Base):
    __tablename__ = "agent_config"
    id = Column(UUID, primary_key=True, default=uuid4)
    agent_id = Column(UUID, ForeignKey("agents.id"))
    system_prompt = Column(Text)  # LLM system prompt
    guardrails = Column(JSON)  # Safety rules
    integrations = Column(JSON)  # Connected tools
    settings = Column(JSON)  # Agent-specific settings
    updated_at = Column(DateTime, default=utcnow)
    
# Activity Logging
class AgentActivity(Base):
    __tablename__ = "agent_activity"
    id = Column(UUID, primary_key=True, default=uuid4)
    agent_id = Column(UUID, ForeignKey("agents.id"))
    activity_type = Column(String)  # 'conversation' | 'post' | 'lead_found' | 'training'
    data = Column(JSON)  # Flexible data structure
    created_at = Column(DateTime, default=utcnow)
    
# Training Examples
class AgentTraining(Base):
    __tablename__ = "agent_training"
    id = Column(UUID, primary_key=True, default=uuid4)
    agent_id = Column(UUID, ForeignKey("agents.id"))
    task = Column(String)  # 'email_response' | 'lead_qualification' | etc
    input_example = Column(Text)
    expected_output = Column(Text)
    feedback = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow)
    
# Knowledge Vault
class KnowledgeArticle(Base):
    __tablename__ = "knowledge_articles"
    id = Column(UUID, primary_key=True, default=uuid4)
    category = Column(String)  # 'support' | 'social' | 'leads' | 'general'
    title = Column(String)
    content = Column(Text)
    tags = Column(JSON)
    created_by = Column(String)  # admin email
    created_at = Column(DateTime, default=utcnow)
    
# Performance Metrics (for dashboards)
class AgentMetrics(Base):
    __tablename__ = "agent_metrics"
    id = Column(UUID, primary_key=True, default=uuid4)
    agent_id = Column(UUID, ForeignKey("agents.id"))
    timestamp = Column(DateTime, default=utcnow)
    conversations_handled = Column(Integer, default=0)
    resolution_rate = Column(Float, default=0.0)
    avg_response_time = Column(Float, default=0.0)  # seconds
    escalation_rate = Column(Float, default=0.0)
    custom_metrics = Column(JSON)  # type-specific metrics
```

### Schema Changes to Existing Tables

**CRMLead** (Add columns):
```python
lead_source_agent_id = Column(UUID, nullable=True)  # Which agent found this
agent_score = Column(Float, nullable=True)  # Agent's qualification score
agent_notes = Column(Text, nullable=True)  # Agent reasoning
```

**CRMEmailLog** (Add columns):
```python
support_agent_id = Column(UUID, nullable=True)  # Which agent handled
draft_status = Column(String, default='sent')  # 'draft' | 'pending_review' | 'sent'
```

---

## 9. ENVIRONMENT VARIABLES

### Current (.env)
```
DATABASE_URL=postgresql+asyncpg://...
KNOT_API_URL=https://pretzelknot-production.up.railway.app
GMAIL_CLIENT_ID=...
GMAIL_CLIENT_SECRET=...
GMAIL_REFRESH_TOKEN=...
TWITTER_BEARER_TOKEN=...
TWITTER_USERNAME=...
TWITTER_SECRET_KEY=...
TWITTER_CONSUMER_KEY=...
LINKEDIN_ACCESS_TOKEN=...
LINKEDIN_PERSON_URN=...
LINKEDIN_ORGANIZATION_URN=...
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### New Variables Needed

```
# Agent LLM Configuration
OPENAI_API_KEY=sk-...                 # For agent LLM
ANTHROPIC_API_KEY=sk-ant-...          # (Optional) Alternative LLM

# Agent Task Queue (if using Celery + Redis)
REDIS_URL=redis://localhost:6379
CELERY_BROKER_URL=redis://localhost:6379

# Agent Configuration
AGENT_SYSTEM_PROMPT_VERSION=2.0       # Control prompt versioning
AGENT_GUARDRAILS_STRICT=true          # Enable strict guardrails
AGENT_ENABLE_DRAFT_REVIEW=true        # Require human review before actions

# Model-Specific Settings
SUPPORT_AGENT_PROMPT_VERSION=1.0
SOCIAL_AGENT_PROMPT_VERSION=1.0
LEADS_AGENT_PROMPT_VERSION=1.0

# Frontend
NEXT_PUBLIC_AGENTS_ENABLED=true       # Feature flag
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Environment Setup (Development)
```bash
# Backend
python -m venv backend/.venv
source backend/.venv/Scripts/activate  # Windows
pip install -r backend/requirements.txt

# Frontend
cd frontend
npm install
npm run dev

# Both can share .env in project root
```

---

## 10. RISKS & CONFLICTS

### Technical Risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| **Route Collision** | Agent Dashboard routes conflict with Pretzel | Migrate all Agent routes to `/admin/agents/*` subdomain |
| **Component Duplication** | Both have support/social/leads UIs | Extract components to shared `@/components/agents/` |
| **Styling Conflict** | Different color schemes/themes | Unified theme config, tested before migration |
| **State Management** | No shared state = prop drilling | Use Context or URL params for shared data |
| **Database Schema** | Agent data has no home in Pretzel DB | Create new tables, run migrations carefully |
| **API Response Format** | Agent API data might differ from Pretzel | Document API contracts, version endpoints |
| **Authentication** | Both projects might have different auth | Verify both use same auth method (likely JWT) |

### Functional Risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| **Lost Functionality** | Overwrites Agent Dashboard features | Test all 10 Agent pages before migration |
| **Incomplete Integration** | Agents not connected to business data | Create explicit integration checklist |
| **Mock Data Dependency** | Agent pages use hardcoded mock data | Implement real APIs first, test with mock data |
| **User Confusion** | Navigation feels disjointed | Design clear visual hierarchy for sections |
| **Performance** | Combining apps = larger bundle | Code split agent routes, lazy load |

### Integration Risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| **Data Consistency** | Agent actions don't sync with business data | Use transactions, test data flows |
| **Email Handling** | Both projects try to manage emails | Support Agent owns outbound, Pretzel owns inbox view |
| **Social Media** | Both manage social posts | Social Agent owns scheduling/publishing, Pretzel shows feed |
| **Lead Pipeline** | Two sources of truth for leads | Lead Agent creates leads in CRM, Pretzel shows pipeline |
| **Real-time Updates** | No WebSocket for live updates | Start with polling, add WebSocket if needed |

### Deployment Risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| **Database Migration** | New tables + schema changes | Create migration scripts, test on staging |
| **Breaking Changes** | Backend API changes | Version endpoints, support old format during transition |
| **Downtime** | Merging requires restart | Plan maintenance window, notify users |
| **Rollback** | If things break, need to revert | Keep Agent Dashboard separately until confident |

---

## 11. STEP-BY-STEP IMPLEMENTATION PLAN

### Phase 1: Preparation (Week 1)
- [ ] Create branch: `feature/agent-dashboard-integration`
- [ ] Set up new database tables (migrations)
- [ ] Document current Agent Dashboard routes/pages
- [ ] Create shared component library
- [ ] Set up environment variables

### Phase 2: Component Migration (Week 2)
- [ ] Migrate shadcn/ui components
- [ ] Migrate Framer Motion animations
- [ ] Create reusable Agent UI components
- [ ] Test all migrated components in Pretzel

### Phase 3: Route Setup (Week 2-3)
- [ ] Create `/admin/agents` layout
- [ ] Create `/admin/agents/*` routes
- [ ] Implement sidebar navigation
- [ ] Test navigation between sections

### Phase 4: Agent Endpoints (Week 3-4)
- [ ] Create `/api/admin/agents/*` FastAPI routes
- [ ] Implement agent CRUD operations
- [ ] Connect to mock data initially
- [ ] Create database models + migrations

### Phase 5: Feature Integration (Week 4-5)
- [ ] Integrate Support Console
- [ ] Integrate Social Hub
- [ ] Integrate Lead Gen Scanner
- [ ] Connect each to real APIs

### Phase 6: Business Data Integration (Week 5-6)
- [ ] Add agent widgets to business pages
- [ ] Connect support agents to inbox
- [ ] Connect social agents to social feed
- [ ] Connect lead agents to sales pipeline

### Phase 7: Advanced Features (Week 6-7)
- [ ] Training & fine-tuning UI
- [ ] Guardrails configuration
- [ ] Knowledge vault
- [ ] Metrics & reporting

### Phase 8: Polish & Testing (Week 7-8)
- [ ] Unified styling & theme
- [ ] Performance optimization
- [ ] E2E testing of key workflows
- [ ] Documentation

### Phase 9: Staging Deployment (Week 8)
- [ ] Deploy to staging environment
- [ ] Full integration testing
- [ ] Performance testing under load
- [ ] Security review

### Phase 10: Production Deployment (Week 9)
- [ ] Database migrations on prod
- [ ] Deploy code
- [ ] Monitor for errors
- [ ] Gather user feedback

---

## 12. FIRST SAFE IMPLEMENTATION TASK

### Task: **Create Agent Section Layout & Navigation**

**Objective**: Establish `/admin/agents` as a new top-level section in Pretzel without breaking existing functionality.

**What Will Happen**:
1. ✅ Add "Agents" to sidebar navigation
2. ✅ Create `/admin/agents/page.tsx` (agent fleet overview)
3. ✅ Create `/admin/agents/layout.tsx` (subsection layout)
4. ✅ Add sub-routes in sidebar (support, social, leads)
5. ✅ Create stub pages for each agent type
6. ✅ Test navigation & routing
7. ✅ Verify all existing pages still work

**Why It's Safe**:
- ✅ No changes to existing routes
- ✅ No database changes
- ✅ No backend changes yet
- ✅ Additive only (new UI, no breaking changes)
- ✅ Can be rolled back by deleting `/admin/agents/` directory
- ✅ Provides foundation for Phase 2

**Expected Output**:
- New `/admin/agents/page.tsx` with agent fleet overview
- New `/admin/agents/support/page.tsx` (stub - just show "Coming soon")
- New `/admin/agents/social/page.tsx` (stub)
- New `/admin/agents/leads/page.tsx` (stub)
- Updated sidebar navigation with agent items
- All existing pages continue to work

**Acceptance Criteria**:
- [ ] Sidebar shows "Agents" section with subsections
- [ ] Clicking each agent route loads the correct page
- [ ] Back button and navigation work correctly
- [ ] Existing /admin/* routes still accessible
- [ ] No console errors or warnings
- [ ] Mobile navigation works

**Estimated Time**: 2-3 hours

**Next Task After**: Import shadcn/ui components into Pretzel project

---

## APPENDIX A: File Structure After Merge

```
project-pretzel-dashboard/
├── frontend/
│   ├── app/
│   │   ├── admin/
│   │   │   ├── analytics/page.tsx          (existing - enhanced)
│   │   │   ├── marketing/page.tsx          (existing - enhanced)
│   │   │   ├── sales/page.tsx              (existing - enhanced)
│   │   │   ├── inbox/page.tsx              (existing - enhanced)
│   │   │   ├── social/page.tsx             (existing - enhanced)
│   │   │   ├── traffic/page.tsx            (existing)
│   │   │   ├── agents/                     (NEW)
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx                (fleet overview)
│   │   │   │   ├── support/
│   │   │   │   │   ├── layout.tsx
│   │   │   │   │   └── page.tsx            (support console)
│   │   │   │   ├── social/
│   │   │   │   │   └── page.tsx            (social hub)
│   │   │   │   ├── leads/
│   │   │   │   │   └── page.tsx            (lead gen scanner)
│   │   │   │   ├── training/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── settings/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── guardrails/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── vault/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── resources/
│   │   │   │       └── page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   ├── layout.tsx                     (existing)
│   │   └── page.tsx                       (existing redirect)
│   ├── components/
│   │   ├── ui/                            (existing + expanded)
│   │   ├── analytics/                     (existing)
│   │   ├── agents/                        (NEW)
│   │   │   ├── agent-card.tsx
│   │   │   ├── agent-modal.tsx
│   │   │   ├── conversation-thread.tsx
│   │   │   ├── lead-kanban.tsx
│   │   │   ├── campaign-calendar.tsx
│   │   │   └── activity-feed.tsx
│   │   └── shared/                        (NEW)
│   │       └── business-agent-widget.tsx
│   ├── lib/
│   │   ├── utils.ts                       (existing)
│   │   └── api.ts                         (NEW - API client)
│   ├── hooks/                             (NEW if needed)
│   ├── package.json                       (updated deps)
│   └── tailwind.config.ts                 (unchanged)
│
├── backend/
│   ├── app/
│   │   ├── main.py                        (updated with agent routes)
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── agents.py              (NEW)
│   │   │   │   ├── agents_support.py      (NEW)
│   │   │   │   ├── agents_social.py       (NEW)
│   │   │   │   ├── agents_leads.py        (NEW)
│   │   │   │   └── [existing routes]
│   │   └── models/
│   │       ├── agent.py                   (NEW)
│   │       ├── agent_config.py            (NEW)
│   │       ├── agent_activity.py          (NEW)
│   │       ├── agent_training.py          (NEW)
│   │       └── [existing models]
│   ├── migrations/                        (NEW if using Alembic)
│   │   └── versions/
│   │       └── XXXX_add_agent_tables.py
│   └── requirements.txt                   (updated deps)
│
├── docs/
│   ├── agent_architecture.md              (existing, reference)
│   ├── MERGE_PLAN.md                      (this file)
│   └── IMPLEMENTATION_GUIDE.md            (NEW - step-by-step)
│
├── .env                                   (updated with agent vars)
└── MIGRATION_NOTES.md                     (NEW - for team)
```

---

## APPENDIX B: Comparison Matrix

| Aspect | Pretzel Dashboard | Agent Dashboard | Merged Result |
|--------|---|---|---|
| **Framework** | Next.js 14 | React + Vite | Next.js 14 |
| **Routing** | App Router | React Router | App Router |
| **Backend** | FastAPI | None (mock) | FastAPI |
| **Database** | Supabase PostgreSQL | None | Supabase PostgreSQL |
| **Components** | Lucide + Recharts | shadcn/ui + Framer | All merged |
| **Styling** | Tailwind | Tailwind | Unified Tailwind |
| **State** | useState | useState | useState (simple) |
| **Auth** | [To verify] | [To verify] | Unified |
| **Real APIs** | ✅ Connected | ❌ Mock only | ✅ All connected |
| **Agent Mgmt** | ❌ None | ✅ Full | ✅ Full |
| **Pages** | 6 business sections | 10 agent pages | 16 total pages |
| **Deployment** | Single Next.js build | Separate Vite build | Single Next.js build |

---

## APPENDIX C: Success Metrics

After merge, we'll measure success by:

### Functionality
- ✅ All 6 Pretzel pages working
- ✅ All 10 Agent pages working
- ✅ Navigation between all sections smooth
- ✅ No broken links or 404s

### Performance
- ✅ Initial page load < 3s
- ✅ Route transitions < 500ms
- ✅ API calls < 1s
- ✅ No memory leaks

### Integration
- ✅ Support agents can manage emails
- ✅ Social agents can schedule posts
- ✅ Lead agents populate CRM
- ✅ Agent metrics show on analytics

### User Experience
- ✅ Navigation clear and intuitive
- ✅ Sidebar shows all sections
- ✅ Mobile responsive
- ✅ Consistent styling throughout

---

**END OF MERGE PLAN**
