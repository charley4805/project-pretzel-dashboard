'use client';

import React from 'react';

export default function AgentLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-[#0a0d14] text-slate-100">
            {children}
        </div>
    );
}
