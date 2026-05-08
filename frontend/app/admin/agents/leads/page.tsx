'use client';

import React from 'react';
import { Target, AlertCircle } from 'lucide-react';

export default function LeadGenScannerPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-slate-100 p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Target size={24} className="text-orange-400" />
                        <h1 className="text-2xl font-semibold tracking-tight text-white">Lead Gen Scanner</h1>
                    </div>
                    <p className="text-sm text-slate-500">
                        Manage lead discovery, qualification, and pipeline
                    </p>
                </div>

                {/* Coming Soon Message */}
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-8 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
                        <AlertCircle size={24} className="text-amber-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-white mb-2">Coming Soon</h2>
                    <p className="text-sm text-slate-400 max-w-md">
                        The Lead Gen Scanner is being integrated from the Agent Dashboard. It will feature a drag-drop Kanban board
                        for managing leads across discovery, qualification, and conversion stages.
                    </p>
                    <div className="mt-6 p-4 rounded-lg bg-slate-900/50 border border-slate-800 max-w-md">
                        <p className="text-xs text-slate-500">
                            <strong>What's coming:</strong>
                        </p>
                        <ul className="text-xs text-slate-400 mt-2 space-y-1">
                            <li>✓ Kanban board with drag-drop</li>
                            <li>✓ Lead scoring & qualification</li>
                            <li>✓ Source tracking</li>
                            <li>✓ Outreach history</li>
                            <li>✓ CRM integration</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
