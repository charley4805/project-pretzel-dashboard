"use client";

import Link from "next/link";

export default function HomePage() {
    return (
        <main className="p-8">
            <h1 className="text-3xl font-bold mb-4">Project Pretzel Dashboard</h1>
            <p className="mb-4">
                Go to <Link href="/admin/analytics" className="text-blue-600 underline">Admin Analytics</Link>
            </p>
        </main>
    );
}