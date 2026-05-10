const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export async function fetchAgentsOverview() {
  const res = await fetch(`${API_BASE}/api/admin/agents/overview`);
  if (!res.ok) throw new Error('Failed to fetch agents overview');
  return res.json();
}

export async function fetchAgentsByType(type: string) {
  const res = await fetch(`${API_BASE}/api/admin/agents/${type}`);
  if (!res.ok) throw new Error('Failed to fetch agents by type');
  return res.json();
}

export async function fetchSupportConversations() {
  const res = await fetch(`${API_BASE}/api/admin/agents/support/conversations`);
  if (!res.ok) throw new Error('Failed to fetch conversations');
  return res.json();
}

export async function fetchSocialCampaigns() {
  const res = await fetch(`${API_BASE}/api/admin/agents/social/campaigns`);
  if (!res.ok) throw new Error('Failed to fetch campaigns');
  return res.json();
}

export async function fetchLeadsPipeline() {
  const res = await fetch(`${API_BASE}/api/admin/agents/leads/pipeline`);
  if (!res.ok) throw new Error('Failed to fetch leads pipeline');
  return res.json();
}

export async function fetchKnowledgeVault() {
  const res = await fetch(`${API_BASE}/api/admin/agents/vault`);
  if (!res.ok) throw new Error('Failed to fetch vault');
  return res.json();
}
