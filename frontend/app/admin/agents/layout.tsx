'use client';

import React from 'react';

export default function AgentLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-pretzel-walnut text-slate-100">
            {children}
        </div>
    );
}
