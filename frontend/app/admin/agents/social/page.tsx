'use client';

import React from 'react';
import { Share2, AlertCircle } from 'lucide-react';

export default function SocialHubPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-slate-100 p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Share2 size={24} className="text-purple-400" />
                        <h1 className="text-2xl font-semibold tracking-tight text-white">Social Hub</h1>
                    </div>
                    <p className="text-sm text-slate-500">
                        Manage social media campaigns, content calendar, and agent-driven engagement
                    </p>
                </div>

                {/* Coming Soon Message */}
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-8 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
                        <AlertCircle size={24} className="text-amber-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-white mb-2">Coming Soon</h2>
                    <p className="text-sm text-slate-400 max-w-md">
                        The Social Hub is being integrated from the Agent Dashboard. It will provide campaign management,
                        content scheduling, and real-time engagement tracking across platforms.
                    </p>
                    <div className="mt-6 p-4 rounded-lg bg-slate-900/50 border border-slate-800 max-w-md">
                        <p className="text-xs text-slate-500">
                            <strong>What's coming:</strong>
                        </p>
                        <ul className="text-xs text-slate-400 mt-2 space-y-1">
                            <li>✓ Content calendar</li>
                            <li>✓ Campaign management</li>
                            <li>✓ Post scheduling</li>
                            <li>✓ Engagement tracking</li>
                            <li>✓ Platform monitoring (X, LinkedIn, etc.)</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
