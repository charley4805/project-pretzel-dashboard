'use client';

import React from 'react';

export default function AgentLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-slate-100">
            {children}
        </div>
    );
}
