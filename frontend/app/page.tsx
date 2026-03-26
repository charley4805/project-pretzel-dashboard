'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/analytics');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="flex items-center gap-3 text-slate-500">
        <span className="text-2xl animate-bounce">🥨</span>
        <span className="text-sm">Loading Command Center…</span>
      </div>
    </div>
  );
}
