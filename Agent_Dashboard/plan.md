# Multi-Agent System Plan: Support, Social Media & Lead Generation

## Overview
Build a complete AI agent system with three specialized agent types plus a management dashboard.

## Stage 1 — Design & Architecture
**Skill**: None (orchestrator-designed)
**Goal**: Design all 3 agent types, their system prompts, escalation flows, and dashboard layout.
**Deliverables**:
- `docs/agent_architecture.md` — Full system design
- `docs/support_agent.md` — Support agent specs (troubleshooting logic, escalation triggers, conversation flow)
- `docs/social_media_agent.md` — Social agent specs (post types, engagement rules, marketing strategy)
- `docs/lead_gen_agent.md` — Lead gen agent specs (monitoring targets, qualifying logic, outreach templates)
- `docs/dashboard_spec.md` — Dashboard pages, components, data models

## Stage 2 — Web Dashboard Development
**Skill**: `vibecoding-webapp-swarm`
**Goal**: Build a modern React dashboard to configure, manage, and monitor all agents.
**Deliverables**:
- Full React app with TypeScript, Tailwind, shadcn/ui
- Pages: Overview, Support Agent Console, Social Media Hub, Lead Gen Scanner, Settings
- Real-time agent status, conversation logs, lead pipeline, campaign analytics

## Stage 3 — Agent Implementation
**Skill**: `vibecoding-general-swarm`
**Goal**: Build the actual agent logic, system prompts, workflows, and simulation capabilities.
**Deliverables**:
- `agents/support/` — Support agent engine with troubleshooting tree & escalation
- `agents/social/` — Social media agent with content calendar & engagement rules
- `agents/leads/` — Lead generation agent with forum/community scanning logic
- `agents/shared/` — Shared utilities (LLM interface, memory, config)

## Stage 4 — Integration & Deployment
**Skill**: `vibecoding-webapp-swarm`
**Goal**: Wire dashboard to agent backends, add live demo data, deploy.
**Deliverables**:
- Fully working integrated system
- Demo data for all 3 agent types
- Deployed dashboard

## File Structure
```
/mnt/agents/output/
├── plan.md
├── docs/
│   ├── agent_architecture.md
│   ├── support_agent.md
│   ├── social_media_agent.md
│   ├── lead_gen_agent.md
│   └── dashboard_spec.md
├── dashboard/          (React app)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── agents/
│   │   └── types/
│   └── package.json
└── deploy/
    └── index.html
```

## Execution Strategy
- Stage 1: Single design agent to produce all specs
- Stage 2: Parallel webapp swarm for dashboard components
- Stage 3: Parallel general swarm for 3 agent backends
- Stage 4: Integration, assembly, deployment
