'use client';

import React, { useState } from 'react';
import { Bot, Headphones, Share2, Target, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface Agent {
    id: string;
    name: string;
    type: 'support' | 'social' | 'leads';
    status: 'online' | 'offline' | 'warning';
    description: string;
    activeConversations: number;
}

// Mock agent data (will be replaced with API calls)
const mockAgents: Agent[] = [
    {
        id: 'sa-1',
        name: 'Support Agent Alpha',
        type: 'support',
        status: 'online',
        description: 'Handles billing & account inquiries',
        activeConversations: 3,
    },
    {
        id: 'sa-2',
        name: 'Support Agent Beta',
        type: 'support',
        status: 'online',
        description: 'Technical support & troubleshooting',
        activeConversations: 2,
    },
    {
        id: 'ma-1',
        name: 'Social Agent Prime',
        type: 'social',
        status: 'online',
        description: 'LinkedIn content & engagement',
        activeConversations: 1,
    },
    {
        id: 'lg-1',
        name: 'Lead Gen Scout',
        type: 'leads',
        status: 'warning',
        description: 'Reddit & forum prospecting',
        activeConversations: 5,
    },
];

const getTypeIcon = (type: string) => {
    switch (type) {
        case 'support':
            return Headphones;
        case 'social':
            return Share2;
        case 'leads':
            return Target;
        default:
            return Bot;
    }
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'online':
            return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
        case 'warning':
            return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
        case 'offline':
            return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
        default:
            return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
};

const getTypeColor = (type: string) => {
    switch (type) {
        case 'support':
            return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        case 'social':
            return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
        case 'leads':
            return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
        default:
            return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
};

const statusDot = (status: string) => {
    switch (status) {
        case 'online':
            return <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />;
        case 'warning':
            return <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />;
        case 'offline':
            return <div className="h-2 w-2 rounded-full bg-slate-500" />;
        default:
            return <div className="h-2 w-2 rounded-full bg-slate-500" />;
    }
};

export default function AgentsOverviewPage() {
    const [agents] = useState(mockAgents);

    const supportAgents = agents.filter((a) => a.type === 'support');
    const socialAgents = agents.filter((a) => a.type === 'social');
    const leadAgents = agents.filter((a) => a.type === 'leads');

    const totalActive = agents.filter((a) => a.status === 'online').length;
    const totalConversations = agents.reduce((sum, a) => sum + a.activeConversations, 0);

    return (
        <div className="p-4 md:p-6 space-y-8">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-white">Agent Fleet</h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Manage and monitor your AI agents across support, social, and lead generation
                    </p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Total Agents</p>
                        <Bot size={16} className="text-emerald-400" />
                    </div>
                    <p className="text-2xl font-semibold text-white">{agents.length}</p>
                    <p className="text-xs text-emerald-400 mt-1">{totalActive} online</p>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Active Tasks</p>
                        <Clock size={16} className="text-amber-400" />
                    </div>
                    <p className="text-2xl font-semibold text-white">{totalConversations}</p>
                    <p className="text-xs text-slate-400 mt-1">conversations & tasks</p>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">System Health</p>
                        <CheckCircle size={16} className="text-emerald-400" />
                    </div>
                    <p className="text-2xl font-semibold text-white">98%</p>
                    <p className="text-xs text-emerald-400 mt-1">All systems operational</p>
                </div>
            </div>

            {/* Support Agents Section */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <Headphones size={18} className="text-blue-400" />
                    <h2 className="text-lg font-semibold text-white">Support Agents</h2>
                    <span className="text-xs text-slate-500 ml-auto">{supportAgents.length} active</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {supportAgents.map((agent) => (
                        <AgentCard key={agent.id} agent={agent} />
                    ))}
                </div>
            </section>

            {/* Social Agents Section */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <Share2 size={18} className="text-purple-400" />
                    <h2 className="text-lg font-semibold text-white">Social Agents</h2>
                    <span className="text-xs text-slate-500 ml-auto">{socialAgents.length} active</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {socialAgents.map((agent) => (
                        <AgentCard key={agent.id} agent={agent} />
                    ))}
                </div>
            </section>

            {/* Lead Gen Agents Section */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <Target size={18} className="text-orange-400" />
                    <h2 className="text-lg font-semibold text-white">Lead Gen Agents</h2>
                    <span className="text-xs text-slate-500 ml-auto">{leadAgents.length} active</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {leadAgents.map((agent) => (
                        <AgentCard key={agent.id} agent={agent} />
                    ))}
                </div>
            </section>
        </div>
    );
}

function AgentCard({ agent }: { agent: Agent }) {
    const TypeIcon = getTypeIcon(agent.type);

    return (
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 space-y-3 hover:bg-slate-800/40 transition-colors">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                        <TypeIcon size={18} className="text-slate-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-white">{agent.name}</p>
                        <p className="text-xs text-slate-500">{agent.description}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                    {statusDot(agent.status)}
                    <span className="text-xs text-slate-500 capitalize">{agent.status}</span>
                </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-800/50">
                <span className={`text-xs font-medium px-2 py-1 rounded border ${getTypeColor(agent.type)}`}>
                    {agent.type}
                </span>
                <span className="text-xs text-slate-500 ml-auto">
                    {agent.activeConversations} active
                </span>
            </div>
        </div>
    );
}
