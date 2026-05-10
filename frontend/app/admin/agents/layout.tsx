'use client';

import React from 'react';

export default function AgentLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-pretzel-tan text-pretzel-indigo">
            {children}
        </div>
    );
}
