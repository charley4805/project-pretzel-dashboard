'use client';

import React from 'react';
import { Headphones, AlertCircle } from 'lucide-react';

export default function SupportConsolePage() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-slate-100 p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Headphones size={24} className="text-blue-400" />
                        <h1 className="text-2xl font-semibold tracking-tight text-white">Support Console</h1>
                    </div>
                    <p className="text-sm text-slate-500">
                        Manage support agents, conversations, and customer issues
                    </p>
                </div>

                {/* Coming Soon Message */}
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-8 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
                        <AlertCircle size={24} className="text-amber-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-white mb-2">Coming Soon</h2>
                    <p className="text-sm text-slate-400 max-w-md">
                        The Support Console is being integrated from the Agent Dashboard. It will show live conversation queues,
                        escalation management, and agent performance metrics.
                    </p>
                    <div className="mt-6 p-4 rounded-lg bg-slate-900/50 border border-slate-800 max-w-md">
                        <p className="text-xs text-slate-500">
                            <strong>What's coming:</strong>
                        </p>
                        <ul className="text-xs text-slate-400 mt-2 space-y-1">
                            <li>✓ Live conversation queue</li>
                            <li>✓ Chat thread UI</li>
                            <li>✓ Escalation management</li>
                            <li>✓ Agent performance tracking</li>
                            <li>✓ Customer satisfaction metrics</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
