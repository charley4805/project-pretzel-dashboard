'use client';

import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

interface Post {
  id: string; platform: 'twitter' | 'linkedin'; text: string; created_at: string;
  likes: number; retweets?: number; replies?: number; comments?: number; shares?: number;
  url: string; author: string;
}

function Disconnected({ label = 'Disconnected — data unavailable' }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/40 px-4 py-3 text-sm text-slate-500">
      <WifiOff size={14} className="text-red-500/60 shrink-0" />
      {label}
    </div>
  );
}

function fmtDate(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 3_600_000)  return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function XIcon() {
  return <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>;
}
function LinkedInIcon() {
  return <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-[#0a66c2]"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>;
}

function PostCard({ post }: { post: Post }) {
  const isX = post.platform === 'twitter';
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${isX ? 'bg-black border border-slate-700' : 'bg-white'}`}>
            {isX ? <XIcon /> : <LinkedInIcon />}
          </div>
          <div>
            <p className="text-xs font-medium text-white leading-tight">{post.author}</p>
            <p className="text-[10px] text-slate-600">{fmtDate(post.created_at)}</p>
          </div>
        </div>
        <a href={post.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-slate-600 hover:text-slate-400 transition-colors">View →</a>
      </div>
      <p className="text-sm text-slate-300 leading-relaxed">{post.text}</p>
      <div className="flex items-center gap-4 text-xs text-slate-500 pt-1 border-t border-slate-800/60">
        <span>❤️ {post.likes}</span>
        {isX  && post.retweets != null && <span>🔁 {post.retweets}</span>}
        {isX  && post.replies  != null && <span>💬 {post.replies}</span>}
        {!isX && post.comments != null && <span>💬 {post.comments}</span>}
        {!isX && post.shares   != null && <span>🔄 {post.shares}</span>}
      </div>
    </div>
  );
}

export default function SocialPage() {
  const [feed,   setFeed]   = useState<Post[] | null>(null);
  const [filter, setFilter] = useState<'all' | 'twitter' | 'linkedin'>('all');

  useEffect(() => {
    fetch(`${API}/api/admin/social/feed`)
      .then(r => r.json())
      .then(data => {
        if (data && data.connected === false) {
          setFeed(null);
        } else if (data && Array.isArray(data.posts)) {
          setFeed(data.posts);
        } else if (Array.isArray(data)) {
          setFeed(data);
        } else {
          setFeed(null);
        }
      })
      .catch(() => setFeed(null));
  }, []);

  const filtered = feed === null ? [] : (filter === 'all' ? feed : feed.filter(p => p.platform === filter));

  return (
    <div className="p-4 md:p-6 space-y-6 text-white min-h-screen">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Social Feed</h1>
        <p className="text-sm text-slate-500 mt-0.5">Latest posts from @projectpretzel on X and LinkedIn</p>
      </div>

      {feed === null ? (
        <Disconnected label="Social feed unavailable — check Twitter and LinkedIn credentials" />
      ) : (
        <>
          <div className="flex gap-2">
            {([
              { key: 'all',      label: `All (${feed.length})` },
              { key: 'twitter',  label: `X / Twitter (${feed.filter(p => p.platform === 'twitter').length})` },
              { key: 'linkedin', label: `LinkedIn (${feed.filter(p => p.platform === 'linkedin').length})` },
            ] as const).map(({ key, label }) => (
              <button key={key} onClick={() => setFilter(key)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  filter === key ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' : 'border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-600'
                }`}>
                {label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(post => <PostCard key={post.id} post={post} />)}
          </div>
          {filtered.length === 0 && <p className="text-center py-12 text-slate-600 text-sm">No posts to display</p>}
        </>
      )}
    </div>
  );
}
