import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Cpu,
  Layers,
  Zap,
  Server,
  Key,
  Plug,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Info,
  ExternalLink,
  Copy,
  ChevronDown,
  ChevronUp,
  Terminal,
  Globe,
  Database,
  FileText,
  ShieldCheck,
  BrainCircuit,
  Workflow,
  Target,
  Share2,
  MessageSquare,
  Settings,
  LayoutDashboard,
} from 'lucide-react';

/* ─────────────────────────── types ─────────────────────────── */
type TabKey = 'docs' | 'architecture' | 'models' | 'mcp';

/* ─────────────────────────── data ─────────────────────────── */
const sections = [
  {
    id: 'overview',
    icon: LayoutDashboard,
    title: 'Overview Dashboard',
    desc: 'Real-time command center for your entire agent fleet.',
    bullets: [
      'KPI cards show active agents, conversations, leads captured, and system health.',
      'Performance Trends chart tracks response accuracy and engagement over time.',
      'Agent Fleet panel lists every agent with live status (online, busy, idle, error).',
      'Activity Feed streams real-time events across all agents.',
    ],
  },
  {
    id: 'support',
    icon: MessageSquare,
    title: 'Support Console',
    desc: 'Troubleshooting and escalation engine for customer issues.',
    bullets: [
      'Chat Queue shows all active customer conversations with priority flags.',
      'Conversation Viewer renders full message threading (system, customer, agent).',
      'Agent Status panel tracks which support agent is handling each ticket.',
      'Escalation Queue routes unresolved tickets to human operators.',
    ],
  },
  {
    id: 'social',
    icon: Share2,
    title: 'Social Media Hub',
    desc: 'Content scheduling, publishing, and engagement monitoring.',
    bullets: [
      'Content Calendar is a 7-day drag-and-drop grid for scheduled posts.',
      'Post Composer with multi-platform preview (Twitter, LinkedIn, etc.).',
      'Engagement Feed tracks replies, mentions, and sentiment scoring.',
      'Campaigns grid shows active marketing campaigns with reach metrics.',
    ],
  },
  {
    id: 'leads',
    icon: Target,
    title: 'Lead Gen Scanner',
    desc: 'Autonomous prospecting across forums, groups, and communities.',
    bullets: [
      'Kanban Pipeline organizes leads through 5 stages from New to Converted.',
      'Lead Detail Sidebar shows qualification scores and pain-point analysis.',
      'Scan Targets configure which forums and groups to monitor.',
      'Outreach Log records every automated message sent to prospects.',
    ],
  },
  {
    id: 'training',
    icon: BrainCircuit,
    title: 'Agent Training',
    desc: 'Teach agents with examples, feedback loops, and fine-tuning.',
    bullets: [
      'Example Pairs let you define input → expected output training data.',
      'Feedback Loop captures thumbs up/down ratings to retrain models.',
      'Fine-tuning controls adjust temperature, top-p, and model weights.',
      'Accuracy Trend chart visualizes training progress over time.',
    ],
  },
  {
    id: 'guardrails',
    icon: ShieldCheck,
    title: 'Guardrails',
    desc: 'Safety boundaries and policy enforcement for all agents.',
    bullets: [
      'Rule Engine blocks off-topic responses, PII leaks, and toxic outputs.',
      'Severity levels (Critical, High, Medium) color-code each rule.',
      'Trigger Log audits every time a guardrail fired and why.',
      'Inline editing lets you tweak rules without restarting agents.',
    ],
  },
  {
    id: 'harnesses',
    icon: Workflow,
    title: 'Agent Harnesses',
    desc: 'Multi-agent workflow orchestration with conditional logic.',
    bullets: [
      'Visual step builder chains agents, delays, decisions, and human handoffs.',
      'Pause/Resume lets you freeze a workflow mid-execution for review.',
      'Execution History shows timestamps and outcomes for every run.',
      'Branching logic routes workflows based on agent output confidence.',
    ],
  },
  {
    id: 'vault',
    icon: BookOpen,
    title: 'Obsidian Vault',
    desc: 'Shared knowledge base that all agents read and reference.',
    bullets: [
      'Folder-based document tree with markdown source files.',
      'Linked Agents sidebar shows which agents subscribe to which docs.',
      'Markdown Editor with live preview for quick knowledge updates.',
      'Knowledge Graph visualizes connections between documents and topics.',
    ],
  },
  {
    id: 'settings',
    icon: Settings,
    title: 'Agent Settings',
    desc: 'Global configuration for prompts, templates, and integrations.',
    bullets: [
      'Prompt Editor is a dark code editor with variable injection ({{name}}).',
      'Response Templates organize canned replies by category.',
      'Rules Engine defines IF/THEN automations across all agents.',
      'Integrations panel connects external APIs and webhooks.',
    ],
  },
];

const architectureSteps = [
  {
    title: 'Event Ingestion',
    desc: 'Messages, webhooks, and scheduled triggers are pushed into a central event bus. Each event is tagged with source, priority, and target agent type.',
    icon: Zap,
    color: '#FFC857',
  },
  {
    title: 'Orchestrator Router',
    desc: 'The Harness engine inspects the event and routes it to the correct agent pipeline. If guardrails flag the input, the event is rejected with an audit entry.',
    icon: Workflow,
    color: '#177E89',
  },
  {
    title: 'Agent Execution',
    desc: 'The assigned agent loads its prompt template, pulls relevant context from the Obsidian Vault, and calls the configured LLM via OpenRouter or a local endpoint.',
    icon: Cpu,
    color: '#FC814A',
  },
  {
    title: 'Output Validation',
    desc: 'The generated response is run through guardrails again (safety, policy, format). Failures trigger a retry loop or a human escalation.',
    icon: ShieldCheck,
    color: '#FFC857',
  },
  {
    title: 'Delivery & Logging',
    desc: 'Approved outputs are delivered to the target channel (chat, social API, email). Every step is logged to the Activity Feed for observability.',
    icon: Server,
    color: '#177E89',
  },
];

const modelTiers = [
  {
    tier: 'Fast / High Volume',
    model: 'OpenRouter → Mistral 7B / Llama 3 8B',
    use: 'Lead scanning, social engagement, low-stakes replies',
    ctx: '128K tokens',
    cost: '~$0.10 / 1M tokens',
  },
  {
    tier: 'Balanced',
    model: 'OpenRouter → GPT-4o-mini / Claude 3 Haiku',
    use: 'Support triage, content drafting, guardrail classification',
    ctx: '128K tokens',
    cost: '~$0.60 / 1M tokens',
  },
  {
    tier: 'Premium / Critical',
    model: 'OpenRouter → GPT-4o / Claude 3.5 Sonnet',
    use: 'Escalation responses, complex troubleshooting, final review',
    ctx: '128K–200K tokens',
    cost: '~$5.00–$15.00 / 1M tokens',
  },
];

const mcpConnectors = [
  {
    name: 'Context 7',
    category: 'Knowledge',
    desc: 'Semantic search over large documentation corpora. Agents query Context 7 to ground answers in up-to-date docs.',
    icon: FileText,
    status: 'available',
    setup: 'Set CONTEXT7_API_KEY in environment. Configure doc source URLs in Settings.',
  },
  {
    name: 'Docker MCP',
    category: 'Infrastructure',
    desc: 'Spin up, inspect, and manage containers. Agents can deploy sandboxed tools or restart services.',
    icon: Server,
    status: 'available',
    setup: 'Mount Docker socket at /var/run/docker.sock. Grant agent "docker" group membership.',
  },
  {
    name: 'Google MCPs',
    category: 'Productivity',
    desc: 'Unified access to Gmail, Calendar, Drive, Docs, and Sheets. Agents read events and draft emails.',
    icon: Globe,
    status: 'available',
    setup: 'Create OAuth 2.0 credentials in Google Cloud Console. Download client_secret.json.',
  },
  {
    name: 'Notion MCP',
    category: 'Knowledge',
    desc: 'Read pages, databases, and write updates. Agents maintain runbooks and project wikis inside Notion.',
    icon: BookOpen,
    status: 'available',
    setup: 'Create an internal integration at notion.so/my-integrations. Copy token to Settings.',
  },
  {
    name: 'Supabase MCP',
    category: 'Database',
    desc: 'Query Postgres tables, auth users, and storage buckets. Agents use Supabase as a structured memory layer.',
    icon: Database,
    status: 'available',
    setup: 'Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to environment variables.',
  },
  {
    name: 'Obsidian MCP',
    category: 'Knowledge',
    desc: 'Direct read/write to Obsidian vault files via local REST API. Mirrors the dashboard Obsidian Vault.',
    icon: BookOpen,
    status: 'available',
    setup: 'Enable Obsidian Local REST API plugin. Set OBSIDIAN_API_KEY and vault path.',
  },
  {
    name: 'Sentry MCP',
    category: 'DevOps',
    desc: 'Fetch error events, stack traces, and release health. Agents diagnose production incidents.',
    icon: AlertTriangle,
    status: 'available',
    setup: 'Generate an Auth Token at sentry.io/settings/account/api/auth-tokens/.',
  },
  {
    name: 'Filesystem MCP',
    category: 'Infrastructure',
    desc: 'Read, write, and search files on the host. Agents generate reports, export CSVs, or ingest logs.',
    icon: FileText,
    status: 'available',
    setup: 'Configure allowed_paths in agent settings to prevent unrestricted access.',
  },
  {
    name: 'Brave Search MCP',
    category: 'Web',
    desc: 'Privacy-focused web search with citation extraction. Agents research current events and verify facts.',
    icon: Globe,
    status: 'available',
    setup: 'Sign up at brave.com/search/api. Set BRAVE_API_KEY in environment.',
  },
  {
    name: 'GitHub MCP',
    category: 'DevOps',
    desc: 'Read repos, issues, PRs, and create commits. Agents review code and open bug reports.',
    icon: Terminal,
    status: 'available',
    setup: 'Create a Fine-Grained Personal Access Token with repo and issues scopes.',
  },
  {
    name: 'PostgreSQL MCP',
    category: 'Database',
    desc: 'Raw SQL access to any Postgres instance. Agents run analytics queries and update records.',
    icon: Database,
    status: 'available',
    setup: 'Set DATABASE_URL with full connection string. Use read-only role for safety.',
  },
  {
    name: 'Slack MCP',
    category: 'Communication',
    desc: 'Post messages, read channels, and react to events. Agents notify teams and ingest channel Q&A.',
    icon: MessageSquare,
    status: 'available',
    setup: 'Create a Slack app at api.slack.com/apps. Add chat:write and channels:read scopes.',
  },
];

/* ─────────────────────────── helpers ─────────────────────────── */
function copy(text: string) {
  navigator.clipboard.writeText(text);
}

/* ─────────────────────────── page ─────────────────────────── */
export default function Resources() {
  const [tab, setTab] = useState<TabKey>('docs');
  const [expandedSection, setExpandedSection] = useState<string | null>('overview');
  const [expandedStep, setExpandedStep] = useState<number | null>(0);
  const [copiedKey, setCopiedKey] = useState(false);
  const [mcpFilter, setMcpFilter] = useState<string>('All');

  const tabs: { key: TabKey; label: string; icon: any }[] = [
    { key: 'docs', label: 'Dashboard Docs', icon: BookOpen },
    { key: 'architecture', label: 'Architecture', icon: Layers },
    { key: 'models', label: 'Models & OpenRouter', icon: Cpu },
    { key: 'mcp', label: 'MCP Connectors', icon: Plug },
  ];

  const categories = ['All', ...Array.from(new Set(mcpConnectors.map((c) => c.category)))];
  const filteredMcp = mcpFilter === 'All' ? mcpConnectors : mcpConnectors.filter((c) => c.category === mcpFilter);

  return (
    <div className="min-h-screen bg-[#0c1130] text-slate-200 p-6 md:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <BookOpen size={24} className="text-[#FFC857]" />
          <h1 className="text-2xl font-bold text-white">Resources & Documentation</h1>
        </div>
        <p className="text-slate-400 text-sm max-w-2xl">
          Everything you need to understand, configure, and extend your AI agent fleet.
          Learn how agents run, what models power them, and how to wire external tools.
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
              style={{
                backgroundColor: active ? '#1c2658' : 'transparent',
                border: `1px solid ${active ? '#FFC857' : '#1c2658'}`,
                color: active ? '#FFC857' : '#94a3b8',
              }}
            >
              <t.icon size={16} />
              {t.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* ═══════════════════════ DOCS TAB ═══════════════════════ */}
        {tab === 'docs' && (
          <motion.div
            key="docs"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {sections.map((s, i) => {
                const open = expandedSection === s.id;
                return (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.3 }}
                    className="rounded-2xl border border-[#1c2658] overflow-hidden"
                    style={{ backgroundColor: '#141B41' }}
                  >
                    <button
                      onClick={() => setExpandedSection(open ? null : s.id)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#1c2658]/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: '#1c2658' }}
                        >
                          <s.icon size={18} style={{ color: '#FFC857' }} />
                        </div>
                        <div>
                          <h3 className="text-white text-sm font-semibold">{s.title}</h3>
                          <p className="text-slate-400 text-xs mt-0.5">{s.desc}</p>
                        </div>
                      </div>
                      {open ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                    </button>
                    <AnimatePresence>
                      {open && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-4 pt-1">
                            <ul className="space-y-2">
                              {s.bullets.map((b, j) => (
                                <li key={j} className="flex items-start gap-2 text-sm text-slate-300">
                                  <ArrowRight size={14} className="text-[#177E89] mt-0.5 shrink-0" />
                                  {b}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════ ARCHITECTURE TAB ═══════════════════════ */}
        {tab === 'architecture' && (
          <motion.div
            key="arch"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {/* How agents run — summary */}
            <div className="rounded-2xl border border-[#1c2658] p-6 mb-6" style={{ backgroundColor: '#141B41' }}>
              <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <Zap size={18} className="text-[#FFC857]" />
                How Do These Agents Run?
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed mb-4">
                NexusAI agents are event-driven Node.js services. They do not run inside this dashboard —
                the dashboard is a control plane. Each agent is a standalone worker process (or Docker container)
                that connects to a central message bus (Redis / NATS / RabbitMQ). When a trigger fires
                (webhook, schedule, or manual start), the event lands on the bus, the orchestrator picks the
                right harness, and the assigned agent executes.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'Trigger Types', value: 'Webhook, Cron, API, Manual' },
                  { label: 'Runtime', value: 'Node.js 20 + Docker' },
                  { label: 'Message Bus', value: 'Redis Pub/Sub or NATS' },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-[#1c2658] p-3" style={{ backgroundColor: '#0c1130' }}>
                    <p className="text-xs text-slate-400 uppercase tracking-wide">{stat.label}</p>
                    <p className="text-sm text-white font-medium mt-1">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Pipeline Steps */}
            <div className="space-y-3">
              {architectureSteps.map((step, i) => {
                const open = expandedStep === i;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.3 }}
                    className="rounded-2xl border border-[#1c2658] overflow-hidden"
                    style={{ backgroundColor: '#141B41' }}
                  >
                    <button
                      onClick={() => setExpandedStep(open ? null : i)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#1c2658]/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${step.color}15` }}
                        >
                          <step.icon size={20} style={{ color: step.color }} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className="text-xs font-bold px-2 py-0.5 rounded-md"
                              style={{ backgroundColor: `${step.color}20`, color: step.color }}
                            >
                              STEP {i + 1}
                            </span>
                            <h3 className="text-white text-sm font-semibold">{step.title}</h3>
                          </div>
                        </div>
                      </div>
                      {open ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                    </button>
                    <AnimatePresence>
                      {open && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-4 pt-1">
                            <p className="text-sm text-slate-300 leading-relaxed">{step.desc}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>

            {/* Diagram hint */}
            <div className="mt-6 rounded-2xl border border-dashed border-[#1c2658] p-5 text-center" style={{ backgroundColor: '#141B41' }}>
              <Layers size={24} className="text-[#177E89] mx-auto mb-2" />
              <p className="text-sm text-slate-300 font-medium">Architecture Diagram</p>
              <p className="text-xs text-slate-400 mt-1">
                Event Source → Message Bus → Orchestrator → Guardrails → Agent Worker → LLM API → Output Validation → Target Channel
              </p>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════ MODELS TAB ═══════════════════════ */}
        {tab === 'models' && (
          <motion.div
            key="models"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {/* What models */}
            <div className="rounded-2xl border border-[#1c2658] p-6 mb-6" style={{ backgroundColor: '#141B41' }}>
              <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <BrainCircuit size={18} className="text-[#FFC857]" />
                What Models Are They Using?
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed mb-4">
                Agents do not ship with a hard-coded model. Instead, each agent declares a <strong>model tier</strong> in its config.
                The tier maps to an OpenRouter model ID at runtime. This lets you upgrade or downgrade quality
                without redeploying code.
              </p>

              <div className="space-y-3">
                {modelTiers.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="rounded-xl border border-[#1c2658] p-4"
                    style={{ backgroundColor: '#0c1130' }}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-bold uppercase tracking-wide text-[#FFC857]">{m.tier}</span>
                      <span className="text-xs text-slate-400">{m.cost}</span>
                    </div>
                    <p className="text-sm text-white font-medium mb-1">{m.model}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-slate-400 mt-2">
                      <span className="flex items-center gap-1"><Info size={12} /> {m.use}</span>
                      <span className="flex items-center gap-1"><Layers size={12} /> {m.ctx}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* OpenRouter Setup */}
            <div className="rounded-2xl border border-[#1c2658] p-6" style={{ backgroundColor: '#141B41' }}>
              <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <Key size={18} className="text-[#177E89]" />
                OpenRouter Setup
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed mb-4">
                OpenRouter is the default gateway because it provides one API key for 200+ models.
                You do not need separate keys for OpenAI, Anthropic, Mistral, or Google.
              </p>

              <div className="space-y-4">
                <div className="rounded-xl border border-[#1c2658] p-4" style={{ backgroundColor: '#0c1130' }}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-white font-medium flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#177E89] text-white text-xs flex items-center justify-center">1</span>
                      Create an account
                    </p>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">Go to openrouter.ai and sign up. Navigate to Settings → Keys.</p>
                  <a href="https://openrouter.ai/settings/keys" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-[#177E89] hover:text-[#FFC857] transition-colors">
                    <ExternalLink size={12} /> openrouter.ai/settings/keys
                  </a>
                </div>

                <div className="rounded-xl border border-[#1c2658] p-4" style={{ backgroundColor: '#0c1130' }}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-white font-medium flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#177E89] text-white text-xs flex items-center justify-center">2</span>
                      Generate an API key
                    </p>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">Copy the key and store it in your agent environment.</p>
                </div>

                <div className="rounded-xl border border-[#1c2658] p-4" style={{ backgroundColor: '#0c1130' }}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-white font-medium flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#177E89] text-white text-xs flex items-center justify-center">3</span>
                      Configure the environment
                    </p>
                  </div>
                  <div className="relative rounded-lg border border-[#1c2658] p-3 mt-2" style={{ backgroundColor: '#141B41' }}>
                    <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap">
{`OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxx
OPENROUTER_HTTP_REFERER=https://your-domain.com
OPENROUTER_X_TITLE=NexusAI Agents`}
                    </pre>
                    <button
                      onClick={() => {
                        copy(`OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxx\nOPENROUTER_HTTP_REFERER=https://your-domain.com\nOPENROUTER_X_TITLE=NexusAI Agents`);
                        setCopiedKey(true);
                        setTimeout(() => setCopiedKey(false), 2000);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-md hover:bg-[#1c2658] transition-colors"
                    >
                      {copiedKey ? <CheckCircle size={14} className="text-[#177E89]" /> : <Copy size={14} className="text-slate-400" />}
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-[#1c2658] p-4" style={{ backgroundColor: '#0c1130' }}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-white font-medium flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#177E89] text-white text-xs flex items-center justify-center">4</span>
                      Map model tiers to model IDs
                    </p>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">In Agent Settings, assign OpenRouter model IDs to each tier:</p>
                  <div className="space-y-1 text-xs text-slate-300 font-mono">
                    <div className="flex items-center gap-2"><span className="text-[#FFC857]">fast:</span> mistralai/mistral-7b-instruct</div>
                    <div className="flex items-center gap-2"><span className="text-[#FFC857]">balanced:</span> openai/gpt-4o-mini</div>
                    <div className="flex items-center gap-2"><span className="text-[#FFC857]">premium:</span> anthropic/claude-3.5-sonnet</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-[#FFC857]/20 p-3 flex items-start gap-2" style={{ backgroundColor: '#FFC85708' }}>
                <AlertTriangle size={14} className="text-[#FFC857] mt-0.5 shrink-0" />
                <p className="text-xs text-slate-300">
                  <strong className="text-[#FFC857]">Do we need OpenRouter?</strong> No — you can point agents at any OpenAI-compatible endpoint (Ollama, vLLM, local LLMs). OpenRouter is simply the default because it simplifies multi-model access.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════ MCP TAB ═══════════════════════ */}
        {tab === 'mcp' && (
          <motion.div
            key="mcp"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {/* Intro */}
            <div className="rounded-2xl border border-[#1c2658] p-6 mb-6" style={{ backgroundColor: '#141B41' }}>
              <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <Plug size={18} className="text-[#FFC857]" />
                MCP Connectors
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Model Context Protocol (MCP) servers let agents read from and write to external tools.
                Each connector below exposes a standardized interface so agents can query databases,
                search the web, post to Slack, or read your Obsidian vault without custom API code.
              </p>
            </div>

            {/* Category filter */}
            <div className="flex flex-wrap gap-2 mb-4">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setMcpFilter(cat)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
                  style={{
                    backgroundColor: mcpFilter === cat ? '#1c2658' : 'transparent',
                    color: mcpFilter === cat ? '#FFC857' : '#94a3b8',
                    border: `1px solid ${mcpFilter === cat ? '#FFC857' : '#1c2658'}`,
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Connector Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredMcp.map((conn, i) => (
                <motion.div
                  key={conn.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                  className="rounded-2xl border border-[#1c2658] p-5 flex flex-col"
                  style={{ backgroundColor: '#141B41' }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: '#1c2658' }}
                      >
                        <conn.icon size={20} className="text-[#FFC857]" />
                      </div>
                      <div>
                        <h3 className="text-white text-sm font-semibold">{conn.name}</h3>
                        <span className="text-[10px] uppercase tracking-wider text-[#177E89] font-medium">{conn.category}</span>
                      </div>
                    </div>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
                      style={{
                        backgroundColor: conn.status === 'available' ? '#177E8920' : '#FC814A20',
                        color: conn.status === 'available' ? '#177E89' : '#FC814A',
                      }}
                    >
                      {conn.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed flex-1">{conn.desc}</p>
                  <div className="mt-4 pt-3 border-t border-[#1c2658]">
                    <p className="text-[10px] uppercase text-slate-500 font-medium mb-1">Setup</p>
                    <p className="text-xs text-slate-300">{conn.setup}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Quickstart command */}
            <div className="mt-6 rounded-2xl border border-[#1c2658] p-5" style={{ backgroundColor: '#141B41' }}>
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <Terminal size={16} className="text-[#177E89]" />
                Quick Start — Add a Connector
              </h3>
              <p className="text-xs text-slate-400 mb-3">
                MCP servers are installed as npm packages in the agent runtime. Example:
              </p>
              <div className="relative rounded-lg border border-[#1c2658] p-3" style={{ backgroundColor: '#0c1130' }}>
                <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap">
{`# Install the MCP server
npm install @modelcontextprotocol/server-brave-search

# Add to agent environment
BRAVE_API_KEY=your_key_here`}
                </pre>
                <button
                  onClick={() => copy(`npm install @modelcontextprotocol/server-brave-search\nBRAVE_API_KEY=your_key_here`)}
                  className="absolute top-2 right-2 p-1.5 rounded-md hover:bg-[#1c2658] transition-colors"
                >
                  <Copy size={14} className="text-slate-400" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
