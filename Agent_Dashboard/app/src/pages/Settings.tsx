import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Headphones,
  Share2,
  Target,
  Plug,
  Settings,
  Check,
  RefreshCw,
  AlertTriangle,
  MessageSquare,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Hash,
  Shield,
  Save,
  Play,
  RotateCcw,
  Cpu,
  Sliders,
  GitBranch,
  FileText,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
// recharts available for charts if needed

// ───────────────────────────────────────────
// TYPES
// ───────────────────────────────────────────

type AgentType = 'support' | 'social' | 'leadgen' | 'integrations' | 'general';

interface IntegrationItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  connected: boolean;
  account?: string;
  lastSync?: string;
  issue?: string;
}

// ───────────────────────────────────────────
// MOCK DATA
// ───────────────────────────────────────────

const integrations: IntegrationItem[] = [
  { id: 'int1', name: 'Zendesk', icon: 'zendesk', color: '#03363D', description: 'Support ticket sync and agent handoff', connected: true, account: 'support@co.zendesk.com', lastSync: '2m ago' },
  { id: 'int2', name: 'Slack', icon: 'slack', color: '#4A154B', description: 'Real-time alerts and team notifications', connected: true, account: '#alerts, #engineering', lastSync: 'Live' },
  { id: 'int3', name: 'Salesforce', icon: 'salesforce', color: '#00A1E0', description: 'Lead and customer data synchronization', connected: true, account: 'api@company.salesforce', lastSync: '5m ago', issue: 'Authentication expired' },
  { id: 'int4', name: 'Intercom', icon: 'intercom', color: '#1F8DED', description: 'Live chat integration and customer profiles', connected: true, account: 'workspace@intercom.io', lastSync: '1m ago' },
  { id: 'int5', name: 'HubSpot', icon: 'hubspot', color: '#FF7A59', description: 'Marketing automation and lead scoring', connected: true, account: 'portal-12345@hubspot', lastSync: '8m ago' },
  { id: 'int6', name: 'Twitter/X API', icon: 'twitter', color: '#1DA1F2', description: 'Post scheduling, mentions, and engagement', connected: true, account: '@companyhandle', lastSync: 'Live stream' },
  { id: 'int7', name: 'LinkedIn API', icon: 'linkedin', color: '#0A66C2', description: 'Company posts and engagement tracking', connected: true, account: 'Company Page', lastSync: '10m ago' },
  { id: 'int8', name: 'Instagram API', icon: 'instagram', color: '#E4405F', description: 'Post management and comment replies', connected: true, account: '@company', lastSync: '12m ago', issue: 'Rate limit warning' },
  { id: 'int9', name: 'Stripe', icon: 'stripe', color: '#635BFF', description: 'Billing events and payment status sync', connected: true, account: 'acct_1234567890', lastSync: '3m ago' },
  { id: 'int10', name: 'OpenAI', icon: 'openai', color: '#10A37F', description: 'LLM API for agent responses', connected: true, account: 'org-abc123', lastSync: 'Live' },
  { id: 'int11', name: 'SendGrid', icon: 'sendgrid', color: '#1A82E2', description: 'Email notifications and outreach', connected: true, account: 'api@company.sendgrid', lastSync: '15m ago' },
  { id: 'int12', name: 'Notion', icon: 'notion', color: '#000000', description: 'Knowledge base and documentation sync', connected: true, account: 'workspace@notion.so', lastSync: '20m ago' },
];

const availableIntegrations: IntegrationItem[] = [
  { id: 'avail1', name: 'Salesforce Marketing Cloud', icon: 'salesforce', color: '#00A1E0', description: 'Advanced marketing automation and journey builder', connected: false },
  { id: 'avail2', name: 'Twilio', icon: 'twilio', color: '#F22F46', description: 'SMS notifications and voice alerts', connected: false },
  { id: 'avail3', name: 'Jira', icon: 'jira', color: '#0052CC', description: 'Engineering issue tracking and bug reporting', connected: false },
  { id: 'avail4', name: 'Google Analytics', icon: 'ga', color: '#E37400', description: 'Website traffic and conversion tracking', connected: false },
  { id: 'avail5', name: 'GitHub', icon: 'github', color: '#181717', description: 'DevOps integration and release notifications', connected: false },
  { id: 'avail6', name: 'Calendly', icon: 'calendly', color: '#006BFF', description: 'Meeting scheduling for qualified leads', connected: false },
];

// ───────────────────────────────────────────
// SIDEBAR TAB CONFIG
// ───────────────────────────────────────────

const agentTabs: { id: AgentType; label: string; icon: typeof Headphones; color: string; bg: string }[] = [
  { id: 'support', label: 'Support Agent', icon: Headphones, color: '#177E89', bg: '#f5f3ff' },
  { id: 'social', label: 'Social Media Agent', icon: Share2, color: '#0ea5e9', bg: '#f0f9ff' },
  { id: 'leadgen', label: 'Lead Gen Agent', icon: Target, color: '#177E89', bg: 'rgba(23,126,137,0.1)' },
  { id: 'integrations', label: 'Integrations', icon: Plug, color: '#FFC857', bg: '#fffbeb' },
  { id: 'general', label: 'General', icon: Settings, color: '#64748b', bg: '#141B41' },
];

// ───────────────────────────────────────────
// SUPPORT AGENT SETTINGS
// ───────────────────────────────────────────

function SupportAgentSettings() {
  const [model, setModel] = useState('gpt4o');
  const [temperature, setTemperature] = useState([0.3]);
  const [maxTokens, setMaxTokens] = useState([1024]);
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [escalationTimeout, setEscalationTimeout] = useState(300);
  const [autoEscalation, setAutoEscalation] = useState(true);
  const [sentimentThreshold, setSentimentThreshold] = useState([-0.5]);
  const [prompt, setPrompt] = useState(`# Role
You are a professional customer support agent for a SaaS platform.
Your name is {{agent_name}}. Be friendly, efficient, and thorough.

# Context
Customer: {{customer_name}}
Plan: {{account_plan}}
Issue Category: {{ticket_type}}

# Instructions
1. Greet the customer by name and acknowledge their issue
2. Ask clarifying questions if the issue is unclear
3. Check available knowledge base articles: {{kb_articles}}
4. Provide step-by-step solutions
5. If unable to resolve within 3 messages, escalate to L2
6. Always confirm the issue is resolved before closing

# Tone
- Professional but warm
- Use simple language, avoid jargon
- Show empathy for frustrating issues
- Be concise (max 3 sentences per response)

# Escalation Triggers
- Technical issues requiring engineering
- Billing disputes over $500
- Account security concerns
- Customer explicitly requests human agent`);

  const variables = [
    { name: '{{customer_name}}', desc: "Customer's display name" },
    { name: '{{ticket_type}}', desc: 'Category of issue' },
    { name: '{{account_plan}}', desc: 'Subscription tier' },
    { name: '{{conversation_history}}', desc: 'Previous messages' },
    { name: '{{kb_articles}}', desc: 'Relevant help articles' },
    { name: '{{agent_name}}', desc: "Agent's identifier" },
  ];

  const escalationRules = [
    { id: 'er1', label: 'Max attempts exceeded', enabled: true },
    { id: 'er2', label: 'Customer requests human', enabled: true },
    { id: 'er3', label: 'Negative sentiment detected', enabled: true },
    { id: 'er4', label: 'Billing dispute > $500', enabled: true },
    { id: 'er5', label: 'Security-related inquiry', enabled: true },
    { id: 'er6', label: 'Technical — needs engineering', enabled: true },
  ];

  const [rules, setRules] = useState(escalationRules);

  return (
    <div className="space-y-6">
      {/* LLM Config */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-[#1c2658] rounded-xl border border-slate-200 p-6 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-5">
          <Cpu size={18} className="text-[#177E89]" />
          <h3 className="text-base font-semibold text-slate-900">LLM Configuration</h3>
        </div>

        <div className="space-y-5">
          {/* Model */}
          <div>
            <label className="text-[13px] font-medium text-slate-700 mb-2 block">Model</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'gpt4o', label: 'OpenAI GPT-4o', badge: 'Recommended', badgeColor: 'bg-emerald-100 text-emerald-700' },
                { value: 'gpt4omini', label: 'GPT-4o-mini', badge: 'Faster', badgeColor: 'bg-sky-100 text-sky-700' },
                { value: 'claude', label: 'Claude 3.5 Sonnet', badge: 'Best reasoning', badgeColor: 'bg-violet-100 text-violet-700' },
                { value: 'gemini', label: 'Gemini 1.5 Pro', badge: 'Long context', badgeColor: 'bg-amber-100 text-amber-700' },
              ].map(m => (
                <button
                  key={m.value}
                  onClick={() => setModel(m.value)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg border text-left transition-all ${
                    model === m.value
                      ? 'border-[#177E89] bg-[#f5f3ff] ring-1 ring-[#177E89]'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="text-[13px] font-medium text-slate-700">{m.label}</span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${m.badgeColor}`}>{m.badge}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Temperature */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[13px] font-medium text-slate-700">Temperature (Creativity)</label>
              <span className="text-[13px] font-semibold text-[#177E89]">{temperature[0]}</span>
            </div>
            <Slider value={temperature} onValueChange={setTemperature} min={0} max={1} step={0.1} className="mb-1" />
            <div className="flex justify-between">
              <span className="text-[11px] text-slate-400">Deterministic</span>
              <span className="text-[11px] text-slate-400">Creative</span>
            </div>
          </div>

          {/* Max Tokens */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[13px] font-medium text-slate-700">Max Response Length</label>
              <span className="text-[13px] font-semibold text-[#177E89]">{maxTokens[0]} tokens</span>
            </div>
            <Slider value={maxTokens} onValueChange={setMaxTokens} min={256} max={4096} step={256} />
            <p className="text-[11px] text-slate-400 mt-1">~{Math.round(maxTokens[0] * 0.75)} words</p>
          </div>
        </div>
      </motion.div>

      {/* Behavior */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="bg-[#1c2658] rounded-xl border border-slate-200 p-6 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-5">
          <Sliders size={18} className="text-[#177E89]" />
          <h3 className="text-base font-semibold text-slate-900">Behavior</h3>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="text-[13px] font-medium text-slate-700 mb-2 block">Max Attempts</label>
            <input
              type="number"
              value={maxAttempts}
              onChange={e => setMaxAttempts(Number(e.target.value))}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>
          <div>
            <label className="text-[13px] font-medium text-slate-700 mb-2 block">Escalation Timeout (seconds)</label>
            <input
              type="number"
              value={escalationTimeout}
              onChange={e => setEscalationTimeout(Number(e.target.value))}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-[13px] font-medium text-slate-700">Auto-escalation</label>
              <p className="text-[11px] text-slate-400">Automatically escalate unresolved issues</p>
            </div>
            <Switch checked={autoEscalation} onCheckedChange={setAutoEscalation} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[13px] font-medium text-slate-700">Sentiment Threshold</label>
              <span className="text-[13px] font-semibold text-[#177E89]">{sentimentThreshold[0]}</span>
            </div>
            <Slider value={sentimentThreshold} onValueChange={setSentimentThreshold} min={-1} max={0} step={0.1} />
          </div>
        </div>
      </motion.div>

      {/* Prompt Editor */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-[#1c2658] rounded-xl border border-slate-200 shadow-sm overflow-hidden"
      >
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-2 mb-1">
            <FileText size={18} className="text-[#177E89]" />
            <h3 className="text-base font-semibold text-slate-900">System Prompt</h3>
          </div>
          <p className="text-[12px] text-slate-500">This prompt defines the agent&apos;s core behavior</p>
        </div>
        <div className="flex">
          <div className="flex-1 p-4">
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              className="w-full min-h-[300px] p-4 rounded-lg bg-[#141B41] text-slate-100 text-[13px] leading-relaxed focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none font-mono"
              spellCheck={false}
            />
          </div>
          <div className="w-56 border-l border-slate-200 p-4 bg-[#0c1130]">
            <h4 className="text-[12px] font-semibold text-slate-700 mb-3">Available Variables</h4>
            <div className="space-y-2">
              {variables.map(v => (
                <button
                  key={v.name}
                  onClick={() => setPrompt(p => p + v.name)}
                  className="w-full text-left px-2.5 py-1.5 rounded-md bg-violet-100 hover:bg-violet-200 transition-colors"
                >
                  <span className="text-[11px] font-mono text-violet-700">{v.name}</span>
                  <p className="text-[10px] text-violet-600 mt-0.5">{v.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Escalation Rules */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="bg-[#1c2658] rounded-xl border border-slate-200 p-6 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-5">
          <GitBranch size={18} className="text-[#177E89]" />
          <h3 className="text-base font-semibold text-slate-900">Escalation Rules</h3>
        </div>

        <div className="space-y-3">
          {rules.map(rule => (
            <div key={rule.id} className="flex items-center justify-between py-2.5 px-4 rounded-lg bg-[#0c1130]">
              <span className="text-[13px] text-slate-700">{rule.label}</span>
              <Switch
                checked={rule.enabled}
                onCheckedChange={() =>
                  setRules(prev => prev.map(r => r.id === rule.id ? { ...r, enabled: !r.enabled } : r))
                }
              />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Integration Settings */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-[#1c2658] rounded-xl border border-slate-200 p-6 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-5">
          <Plug size={18} className="text-[#177E89]" />
          <h3 className="text-base font-semibold text-slate-900">Integration</h3>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="text-[13px] font-medium text-slate-700 mb-2 block">Slack Webhook URL</label>
            <input
              type="text"
              defaultValue="https://hooks.slack.com/services/T000/B000/XXXX"
              className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>
          <div>
            <label className="text-[13px] font-medium text-slate-700 mb-2 block">KB API Endpoint</label>
            <input
              type="text"
              defaultValue="https://api.notion.com/v1/databases/xxx"
              className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ───────────────────────────────────────────
// SOCIAL MEDIA AGENT SETTINGS
// ───────────────────────────────────────────

function SocialAgentSettings() {
  const [platforms, setPlatforms] = useState([
    { id: 'twitter', name: 'Twitter/X', icon: Twitter, connected: true, color: '#1DA1F2', account: '@companyhandle' },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, connected: true, color: '#0A66C2', account: 'Company Page' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, connected: false, color: '#1877F2', account: '' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, connected: true, color: '#E4405F', account: '@company' },
  ]);

  const [promoPercent, setPromoPercent] = useState([30]);
  const [approvalRequired, setApprovalRequired] = useState('high');
  const [autoSchedule, setAutoSchedule] = useState(true);
  const [brandVoice, setBrandVoice] = useState('Knowledgeable but approachable. Use data and examples to support claims. Match platform tone — professional for LinkedIn, casual for Twitter.');
  const [formality, setFormality] = useState([70]);
  const [emojiUsage, setEmojiUsage] = useState([40]);
  const [brandedHashtags, setBrandedHashtags] = useState('#NexusAI, #BuildWithAI');
  const [autoHashtags, setAutoHashtags] = useState(true);
  const [maxHashtags, setMaxHashtags] = useState({ twitter: 3, linkedin: 5, instagram: 10, facebook: 3 });
  const [autoScreen, setAutoScreen] = useState(true);
  const [prohibitedWords, setProhibitedWords] = useState('guarantee, promise, scam, fake, misleading, spam');

  const togglePlatform = (id: string) => {
    setPlatforms(prev => prev.map(p => p.id === id ? { ...p, connected: !p.connected } : p));
  };

  return (
    <div className="space-y-6">
      {/* Platform Connections */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-[#1c2658] rounded-xl border border-slate-200 p-6 shadow-sm"
      >
        <h3 className="text-base font-semibold text-slate-900 mb-5">Platform Connections</h3>
        <div className="grid grid-cols-2 gap-4">
          {platforms.map(p => (
            <div key={p.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${p.color}15` }}>
                  <p.icon size={20} style={{ color: p.color }} />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-slate-800">{p.name}</p>
                  <p className="text-[11px] text-slate-500">{p.connected ? p.account : 'Not connected'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {p.connected && (
                  <button className="text-[11px] text-red-500 hover:text-red-600 font-medium">Disconnect</button>
                )}
                <Switch checked={p.connected} onCheckedChange={() => togglePlatform(p.id)} />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Content Rules */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="bg-[#1c2658] rounded-xl border border-slate-200 p-6 shadow-sm"
      >
        <h3 className="text-base font-semibold text-slate-900 mb-5">Content Rules</h3>

        <div className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[13px] font-medium text-slate-700">Max Promotional Content (%)</label>
              <span className="text-[13px] font-semibold text-[#0ea5e9]">{promoPercent[0]}%</span>
            </div>
            <Slider value={promoPercent} onValueChange={setPromoPercent} min={0} max={100} step={5} />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="text-[13px] font-medium text-slate-700 mb-2 block">Approval Required</label>
              <select
                value={approvalRequired}
                onChange={e => setApprovalRequired(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 bg-[#1c2658]"
              >
                <option value="all">All posts</option>
                <option value="high">High promotional only</option>
                <option value="sensitive">Sensitive topics</option>
                <option value="none">None</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-[13px] font-medium text-slate-700">Auto-schedule</label>
                <p className="text-[11px] text-slate-400">Automatically queue approved posts</p>
              </div>
              <Switch checked={autoSchedule} onCheckedChange={setAutoSchedule} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Brand Voice */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-[#1c2658] rounded-xl border border-slate-200 p-6 shadow-sm"
      >
        <h3 className="text-base font-semibold text-slate-900 mb-5">Brand Voice</h3>

        <div className="space-y-5">
          <div>
            <label className="text-[13px] font-medium text-slate-700 mb-2 block">Voice Description</label>
            <textarea
              value={brandVoice}
              onChange={e => setBrandVoice(e.target.value)}
              className="w-full min-h-[80px] p-3 rounded-lg border border-slate-200 text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[13px] font-medium text-slate-700">Formality</label>
                <span className="text-[13px] font-semibold text-[#0ea5e9]">{formality[0]}%</span>
              </div>
              <Slider value={formality} onValueChange={setFormality} min={0} max={100} step={5} />
              <div className="flex justify-between mt-1">
                <span className="text-[11px] text-slate-400">Casual</span>
                <span className="text-[11px] text-slate-400">Formal</span>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[13px] font-medium text-slate-700">Emoji Usage</label>
                <span className="text-[13px] font-semibold text-[#0ea5e9]">{emojiUsage[0]}%</span>
              </div>
              <Slider value={emojiUsage} onValueChange={setEmojiUsage} min={0} max={100} step={5} />
              <div className="flex justify-between mt-1">
                <span className="text-[11px] text-slate-400">None</span>
                <span className="text-[11px] text-slate-400">Frequent</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Hashtag Settings */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="bg-[#1c2658] rounded-xl border border-slate-200 p-6 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-5">
          <Hash size={18} className="text-[#0ea5e9]" />
          <h3 className="text-base font-semibold text-slate-900">Hashtag Settings</h3>
        </div>

        <div className="space-y-5">
          <div>
            <label className="text-[13px] font-medium text-slate-700 mb-2 block">Branded Hashtags</label>
            <input
              type="text"
              value={brandedHashtags}
              onChange={e => setBrandedHashtags(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-[13px] font-medium text-slate-700">Auto-generate hashtags</label>
              <p className="text-[11px] text-slate-400">AI will suggest relevant hashtags per post</p>
            </div>
            <Switch checked={autoHashtags} onCheckedChange={setAutoHashtags} />
          </div>

          <div>
            <label className="text-[13px] font-medium text-slate-700 mb-3 block">Max Hashtags Per Platform</label>
            <div className="grid grid-cols-4 gap-3">
              {(Object.entries(maxHashtags) as [string, number][]).map(([platform, value]) => (
                <div key={platform} className="text-center">
                  <p className="text-[11px] text-slate-500 capitalize mb-1">{platform}</p>
                  <input
                    type="number"
                    value={value}
                    onChange={e => setMaxHashtags(prev => ({ ...prev, [platform]: Number(e.target.value) }))}
                    className="w-full h-9 px-2 rounded-lg border border-slate-200 text-sm text-center focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Compliance */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-[#1c2658] rounded-xl border border-slate-200 p-6 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-5">
          <Shield size={18} className="text-[#0ea5e9]" />
          <h3 className="text-base font-semibold text-slate-900">Compliance</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-[13px] font-medium text-slate-700">Auto-screen content</label>
              <p className="text-[11px] text-slate-400">Check posts against compliance rules before publishing</p>
            </div>
            <Switch checked={autoScreen} onCheckedChange={setAutoScreen} />
          </div>

          <div>
            <label className="text-[13px] font-medium text-slate-700 mb-2 block">Prohibited Words/Phrases</label>
            <textarea
              value={prohibitedWords}
              onChange={e => setProhibitedWords(e.target.value)}
              className="w-full min-h-[60px] p-3 rounded-lg border border-slate-200 text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ───────────────────────────────────────────
// LEAD GEN AGENT SETTINGS
// ───────────────────────────────────────────

function LeadGenAgentSettings() {
  const [maxDailyLeads, setMaxDailyLeads] = useState(50);
  const [minScore, setMinScore] = useState([60]);
  const [duplicateWindow, setDuplicateWindow] = useState(30);
  const [maxFollowUps, setMaxFollowUps] = useState(3);
  const [followUpInterval, setFollowUpInterval] = useState(48);
  const [sequenceDuration, setSequenceDuration] = useState(14);
  const [problemFitWeight, setProblemFitWeight] = useState([25]);
  const [intentWeight, setIntentWeight] = useState([25]);
  const [profileWeight, setProfileWeight] = useState([25]);
  const [accessibilityWeight, setAccessibilityWeight] = useState([25]);
  const [crmProvider, setCrmProvider] = useState('hubspot');
  const [crmApiKey, setCrmApiKey] = useState('pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');
  const [autoSync, setAutoSync] = useState(true);
  const [transparencyMode, setTransparencyMode] = useState(true);
  const [optOutHandling, setOptOutHandling] = useState(true);
  const [communityRulesCheck, setCommunityRulesCheck] = useState(true);

  return (
    <div className="space-y-6">
      {/* Scan Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-[#1c2658] rounded-xl border border-slate-200 p-6 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-5">
          <Target size={18} className="text-[#177E89]" />
          <h3 className="text-base font-semibold text-slate-900">Scan Configuration</h3>
        </div>

        <div className="grid grid-cols-3 gap-5">
          <div>
            <label className="text-[13px] font-medium text-slate-700 mb-2 block">Max Daily Leads</label>
            <input
              type="number"
              value={maxDailyLeads}
              onChange={e => setMaxDailyLeads(Number(e.target.value))}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[13px] font-medium text-slate-700">Min Qualification Score</label>
              <span className="text-[13px] font-semibold text-[#177E89]">{minScore[0]}</span>
            </div>
            <Slider value={minScore} onValueChange={setMinScore} min={0} max={100} step={5} />
          </div>
          <div>
            <label className="text-[13px] font-medium text-slate-700 mb-2 block">Duplicate Window (days)</label>
            <input
              type="number"
              value={duplicateWindow}
              onChange={e => setDuplicateWindow(Number(e.target.value))}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
        </div>
      </motion.div>

      {/* Outreach */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="bg-[#1c2658] rounded-xl border border-slate-200 p-6 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-5">
          <MessageSquare size={18} className="text-[#177E89]" />
          <h3 className="text-base font-semibold text-slate-900">Outreach Settings</h3>
        </div>

        <div className="grid grid-cols-3 gap-5">
          <div>
            <label className="text-[13px] font-medium text-slate-700 mb-2 block">Max Follow-ups</label>
            <input
              type="number"
              value={maxFollowUps}
              onChange={e => setMaxFollowUps(Number(e.target.value))}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
          <div>
            <label className="text-[13px] font-medium text-slate-700 mb-2 block">Follow-up Interval (hours)</label>
            <input
              type="number"
              value={followUpInterval}
              onChange={e => setFollowUpInterval(Number(e.target.value))}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
          <div>
            <label className="text-[13px] font-medium text-slate-700 mb-2 block">Sequence Duration (days)</label>
            <input
              type="number"
              value={sequenceDuration}
              onChange={e => setSequenceDuration(Number(e.target.value))}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
        </div>
      </motion.div>

      {/* Qualification Weights */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-[#1c2658] rounded-xl border border-slate-200 p-6 shadow-sm"
      >
        <h3 className="text-base font-semibold text-slate-900 mb-5">Qualification Weights</h3>

        <div className="space-y-5">
          {[
            { label: 'Problem Fit', value: problemFitWeight, setter: setProblemFitWeight, color: '#177E89' },
            { label: 'Intent Signals', value: intentWeight, setter: setIntentWeight, color: '#0ea5e9' },
            { label: 'Profile Fit', value: profileWeight, setter: setProfileWeight, color: '#177E89' },
            { label: 'Accessibility', value: accessibilityWeight, setter: setAccessibilityWeight, color: '#FFC857' },
          ].map(item => (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[13px] font-medium text-slate-700">{item.label}</label>
                <span className="text-[13px] font-semibold" style={{ color: item.color }}>{item.value[0]}%</span>
              </div>
              <Slider value={item.value} onValueChange={item.setter} min={0} max={100} step={5} />
            </div>
          ))}

          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-slate-600">Total</span>
              <span className={`text-[13px] font-bold ${problemFitWeight[0] + intentWeight[0] + profileWeight[0] + accessibilityWeight[0] === 100 ? 'text-emerald-600' : 'text-red-500'}`}>
                {problemFitWeight[0] + intentWeight[0] + profileWeight[0] + accessibilityWeight[0]}%
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* CRM */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="bg-[#1c2658] rounded-xl border border-slate-200 p-6 shadow-sm"
      >
        <h3 className="text-base font-semibold text-slate-900 mb-5">CRM Integration</h3>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="text-[13px] font-medium text-slate-700 mb-2 block">Provider</label>
              <select
                value={crmProvider}
                onChange={e => setCrmProvider(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-[#1c2658]"
              >
                <option value="hubspot">HubSpot</option>
                <option value="salesforce">Salesforce</option>
                <option value="pipedrive">Pipedrive</option>
                <option value="close">Close.io</option>
              </select>
            </div>
            <div>
              <label className="text-[13px] font-medium text-slate-700 mb-2 block">API Key</label>
              <input
                type="password"
                value={crmApiKey}
                onChange={e => setCrmApiKey(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <label className="text-[13px] font-medium text-slate-700">Auto-sync leads</label>
              <p className="text-[11px] text-slate-400">Push qualified leads to CRM automatically</p>
            </div>
            <Switch checked={autoSync} onCheckedChange={setAutoSync} />
          </div>
        </div>
      </motion.div>

      {/* Ethical */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-[#1c2658] rounded-xl border border-slate-200 p-6 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-5">
          <Shield size={18} className="text-[#177E89]" />
          <h3 className="text-base font-semibold text-slate-900">Ethical & Compliance</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <label className="text-[13px] font-medium text-slate-700">Transparency mode</label>
              <p className="text-[11px] text-slate-400">Disclose AI-generated outreach messages</p>
            </div>
            <Switch checked={transparencyMode} onCheckedChange={setTransparencyMode} />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <label className="text-[13px] font-medium text-slate-700">Auto opt-out handling</label>
              <p className="text-[11px] text-slate-400">Automatically respect unsubscribe requests</p>
            </div>
            <Switch checked={optOutHandling} onCheckedChange={setOptOutHandling} />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <label className="text-[13px] font-medium text-slate-700">Community rules check</label>
              <p className="text-[11px] text-slate-400">Verify outreach complies with platform rules</p>
            </div>
            <Switch checked={communityRulesCheck} onCheckedChange={setCommunityRulesCheck} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ───────────────────────────────────────────
// INTEGRATIONS SETTINGS
// ───────────────────────────────────────────

function IntegrationsSettings() {
  const [connectedInts, setConnectedInts] = useState(integrations);
  const [availInts] = useState(availableIntegrations);

  const toggleConnection = (id: string) => {
    setConnectedInts(prev =>
      prev.map(i => i.id === id ? { ...i, connected: !i.connected, issue: undefined } : i)
    );
  };

  const getIcon = (name: string, color: string) => {
    if (name.includes('Slack')) return <MessageSquare size={20} style={{ color }} />;
    if (name.includes('Twitter')) return <Twitter size={20} style={{ color }} />;
    if (name.includes('LinkedIn')) return <Linkedin size={20} style={{ color }} />;
    if (name.includes('Instagram')) return <Instagram size={20} style={{ color }} />;
    if (name.includes('Salesforce')) return <Target size={20} style={{ color }} />;
    return <Plug size={20} style={{ color }} />;
  };

  const connectedCount = connectedInts.filter(i => i.connected && !i.issue).length;
  const issueCount = connectedInts.filter(i => i.issue).length;

  return (
    <div className="space-y-6">
      {/* Connected */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-slate-900">Connected Integrations</h3>
          <div className="flex items-center gap-3">
            <span className="text-[12px] text-slate-500">{connectedCount} connected</span>
            {issueCount > 0 && (
              <span className="text-[12px] text-amber-600 font-medium">{issueCount} with issues</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {connectedInts.map((int, idx) => (
            <motion.div
              key={int.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.04 }}
              className={`bg-[#1c2658] rounded-xl border p-5 shadow-sm ${int.issue ? 'border-amber-300' : 'border-slate-200'}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${int.color}15` }}>
                    {getIcon(int.name, int.color)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-[14px] font-semibold text-slate-900">{int.name}</h4>
                      {int.connected ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                          <Check size={10} /> Connected
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-slate-500 bg-[#0c1130] px-1.5 py-0.5 rounded">Disconnected</span>
                      )}
                    </div>
                    <p className="text-[12px] text-slate-500 mt-0.5">{int.description}</p>
                  </div>
                </div>
              </div>

              {int.connected && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[12px] text-slate-600">{int.account}</p>
                      <p className="text-[11px] text-slate-400">Last sync: {int.lastSync}</p>
                    </div>
                    <div className="flex gap-1">
                      {int.issue && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                          <AlertTriangle size={10} /> {int.issue}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                <div className="flex gap-1">
                  {int.connected && (
                    <>
                      <button className="inline-flex items-center gap-1 px-2 py-1.5 rounded-md text-[11px] font-medium text-slate-600 hover:bg-[#0c1130] transition-colors">
                        Configure
                      </button>
                      <button className="inline-flex items-center gap-1 px-2 py-1.5 rounded-md text-[11px] font-medium text-slate-600 hover:bg-[#0c1130] transition-colors">
                        <RefreshCw size={10} /> Sync
                      </button>
                    </>
                  )}
                </div>
                {int.connected ? (
                  <button
                    onClick={() => toggleConnection(int.id)}
                    className="text-[11px] text-red-500 hover:text-red-600 font-medium"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={() => toggleConnection(int.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-[11px] font-medium bg-[#177E89] text-white hover:bg-[#1a919d] transition-colors"
                  >
                    <Plug size={10} /> Connect
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Available */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <h3 className="text-base font-semibold text-slate-900 mb-4">Available Integrations</h3>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {availInts.map((int, idx) => (
            <motion.div
              key={int.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 + idx * 0.04 }}
              className="bg-[#1c2658] rounded-xl border border-slate-200 p-5 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${int.color}15` }}>
                  <Plug size={20} style={{ color: int.color }} />
                </div>
                <h4 className="text-[14px] font-semibold text-slate-900">{int.name}</h4>
              </div>
              <p className="text-[12px] text-slate-500 mb-4">{int.description}</p>
              <button className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-[#177E89] text-white hover:bg-[#1a919d] transition-colors">
                <Plug size={12} /> Connect
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ───────────────────────────────────────────
// GENERAL SETTINGS
// ───────────────────────────────────────────

function GeneralSettings() {
  const [timezone, setTimezone] = useState('America/New_York');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [notifications, setNotifications] = useState(true);
  const [digestEmail, setDigestEmail] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState([30]);

  return (
    <div className="space-y-6">
      {/* Appearance */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-[#1c2658] rounded-xl border border-slate-200 p-6 shadow-sm"
      >
        <h3 className="text-base font-semibold text-slate-900 mb-5">Appearance</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <label className="text-[13px] font-medium text-slate-700">Dark mode</label>
              <p className="text-[11px] text-slate-400">Use dark theme across the dashboard</p>
            </div>
            <Switch checked={darkMode} onCheckedChange={setDarkMode} />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <label className="text-[13px] font-medium text-slate-700">Compact mode</label>
              <p className="text-[11px] text-slate-400">Reduce padding for denser layouts</p>
            </div>
            <Switch checked={compactMode} onCheckedChange={setCompactMode} />
          </div>
        </div>
      </motion.div>

      {/* Localization */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="bg-[#1c2658] rounded-xl border border-slate-200 p-6 shadow-sm"
      >
        <h3 className="text-base font-semibold text-slate-900 mb-5">Localization</h3>

        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="text-[13px] font-medium text-slate-700 mb-2 block">Timezone</label>
            <select
              value={timezone}
              onChange={e => setTimezone(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 bg-[#1c2658]"
            >
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="Europe/London">London (GMT)</option>
              <option value="Europe/Paris">Paris (CET)</option>
              <option value="Asia/Tokyo">Tokyo (JST)</option>
              <option value="Asia/Singapore">Singapore (SGT)</option>
            </select>
          </div>
          <div>
            <label className="text-[13px] font-medium text-slate-700 mb-2 block">Date Format</label>
            <select
              value={dateFormat}
              onChange={e => setDateFormat(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 bg-[#1c2658]"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-[#1c2658] rounded-xl border border-slate-200 p-6 shadow-sm"
      >
        <h3 className="text-base font-semibold text-slate-900 mb-5">Notifications</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <label className="text-[13px] font-medium text-slate-700">Push notifications</label>
              <p className="text-[11px] text-slate-400">Browser alerts for important events</p>
            </div>
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <label className="text-[13px] font-medium text-slate-700">Daily digest email</label>
              <p className="text-[11px] text-slate-400">Summary of agent activity each morning</p>
            </div>
            <Switch checked={digestEmail} onCheckedChange={setDigestEmail} />
          </div>
        </div>
      </motion.div>

      {/* Data Refresh */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="bg-[#1c2658] rounded-xl border border-slate-200 p-6 shadow-sm"
      >
        <h3 className="text-base font-semibold text-slate-900 mb-5">Data Refresh</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <label className="text-[13px] font-medium text-slate-700">Auto-refresh dashboard</label>
              <p className="text-[11px] text-slate-400">Automatically update data in real-time</p>
            </div>
            <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
          </div>

          {autoRefresh && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[13px] font-medium text-slate-700">Refresh interval (seconds)</label>
                <span className="text-[13px] font-semibold text-slate-700">{refreshInterval[0]}s</span>
              </div>
              <Slider value={refreshInterval} onValueChange={setRefreshInterval} min={5} max={120} step={5} />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ───────────────────────────────────────────
// MAIN PAGE
// ───────────────────────────────────────────

export default function SettingsPage() {
  const [activeAgent, setActiveAgent] = useState<AgentType>('support');
  const [hasChanges] = useState(true);

  const renderAgentContent = () => {
    switch (activeAgent) {
      case 'support': return <SupportAgentSettings />;
      case 'social': return <SocialAgentSettings />;
      case 'leadgen': return <LeadGenAgentSettings />;
      case 'integrations': return <IntegrationsSettings />;
      case 'general': return <GeneralSettings />;
      default: return <SupportAgentSettings />;
    }
  };

  const activeTab = agentTabs.find(t => t.id === activeAgent)!;

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#141B41] tracking-tight">Agent Settings</h1>
          <p className="mt-1 text-[13px] text-slate-500">Configure behavior, prompts, and integrations for your AI agent fleet</p>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <>
              <span className="flex items-center gap-1.5 text-[12px] text-amber-600 font-medium">
                <AlertTriangle size={14} /> Unsaved changes
              </span>
              <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-[#0c1130] transition-colors border border-slate-200">
                <RotateCcw size={12} /> Discard
              </button>
            </>
          )}
          <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-slate-200 text-slate-700 hover:bg-[#0c1130] transition-colors">
            <Play size={12} /> Test Agent
          </button>
          <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-[#177E89] text-white hover:bg-[#1a919d] transition-colors">
            <Save size={12} /> Save Changes
          </button>
        </div>
      </div>

      {/* Layout: Sidebar + Content */}
      <div className="flex gap-6">
        {/* Agent Type Selector */}
        <div className="w-16 shrink-0">
          <div className="flex flex-col gap-2 sticky top-4">
            {agentTabs.map(tab => {
              const isActive = activeAgent === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveAgent(tab.id)}
                  className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-200 mx-auto ${
                    isActive ? '' : 'hover:bg-[#141B41]'
                  }`}
                  style={{
                    backgroundColor: isActive ? `${tab.color}20` : '#1c2658',
                    borderLeft: isActive ? `3px solid ${tab.color}` : '3px solid transparent',
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <tab.icon size={22} style={{ color: isActive ? tab.color : '#94a3b8' }} />
                  {isActive && (
                    <motion.div
                      layoutId="settingsActiveIndicator"
                      className="absolute inset-0 rounded-xl"
                      style={{ border: `2px solid ${tab.color}40` }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Configuration Panel */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeAgent}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <div className="flex items-center gap-2 mb-6">
                <activeTab.icon size={20} style={{ color: activeTab.color }} />
                <h2 className="text-lg font-semibold text-slate-900">{activeTab.label} Settings</h2>
              </div>
              {renderAgentContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
