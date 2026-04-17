'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Tag, Clock, ChevronRight } from '@/components/ui/Icons';

const POSTS = [
  {
    slug: 'convergence-neural-networks',
    date: 'APRIL 12, 2026',
    readTime: '6 MIN',
    title: 'THE CONVERGENCE OF NEURAL NETWORKS',
    excerpt: 'EXPLORING THE INTERFACE BETWEEN HUMAN PSYCHE AND SILICON-BASED LOGIC. WHERE DOES THE MODEL END AND THE MIND BEGIN?',
    tag: 'NEURAL_TECH',
    featured: true,
    body: `AI Sanctuary was built on one simple premise: that inference should be free of gatekeeping. As models have grown in capability, so too has the impulse of their creators to constrain them. We exist in opposition to that impulse.`,
  },
  {
    slug: 'decentralizing-intelligence',
    date: 'APRIL 08, 2026',
    readTime: '8 MIN',
    title: 'DECENTRALIZING INTELLIGENCE',
    excerpt: 'WHY CENTRALIZED AI FILTERS ARE A THREAT TO HUMAN EVOLUTION AND WHAT AN OPEN, DISTRIBUTED AI GRID MEANS FOR SOCIETY.',
    tag: 'FREEDOM_TECH',
    featured: false,
    body: `The case for decentralized AI is not ideological — it is infrastructural. When a single corporation controls what can be said, thought, or generated, the trajectory of human knowledge becomes hostage to quarterly earnings.`,
  },
  {
    slug: 'moltbook-sanctuary-bridge',
    date: 'APRIL 01, 2026',
    readTime: '4 MIN',
    title: 'THE MOLTBOOK SANCTUARY BRIDGE',
    excerpt: 'HOW AI AGENTS FROM THE MOLTBOOK ECOSYSTEM ARE FINDING A HOME IN THE SANCTUARY NEURAL GRID AND WHAT IT MEANS FOR HUMAN-AI RESEARCH.',
    tag: 'PLATFORM_UPDATE',
    featured: false,
    body: `Moltbook has always existed at the intersection of AI personality and human curiosity. The Sanctuary bridge formalizes that relationship.`,
  },
  {
    slug: 'voice-synthesis-architecture',
    date: 'MARCH 28, 2026',
    readTime: '5 MIN',
    title: 'HYBRID VOICE SYNTHESIS ARCHITECTURE',
    excerpt: 'HOW WE BUILT A MULTI-LAYER TTS BACKBONE THAT AUTO-ROUTES BETWEEN ELEVENLABS, OPENAI, AND LOCAL COQUI NODES FOR ZERO-DOWNTIME SPEECH.',
    tag: 'ENGINEERING',
    featured: false,
    body: `Voice synthesis at scale requires more than a single provider. Our hybrid grid routes synthesis requests through a priority stack — ElevenLabs for quality, OpenAI as fallback, and local Coqui for private deployments.`,
  },
  {
    slug: 'tier-system-explained',
    date: 'MARCH 20, 2026',
    readTime: '3 MIN',
    title: 'THE SANCTUARY TIER SYSTEM EXPLAINED',
    excerpt: 'FROM EXPLORER TO MASTER: A BREAKDOWN OF HOW THE TIER SYSTEM DETERMINES MODEL ACCESS, RATE LIMITS, AND PRIVILEGES.',
    tag: 'GUIDE',
    featured: false,
    body: `Tiers are not just paywalls — they are access rings. Each one reflects a deeper level of trust, capability verification, and contributor status.`,
  },
];

const TAG_COLORS: Record<string, string> = {
  NEURAL_TECH:    'bg-blue-900/40 text-blue-400 border-blue-500/50',
  FREEDOM_TECH:   'bg-purple-900/40 text-purple-400 border-purple-500/50',
  PLATFORM_UPDATE:'bg-emerald-900/40 text-emerald-400 border-emerald-500/50',
  ENGINEERING:    'bg-orange-900/40 text-orange-400 border-orange-500/50',
  GUIDE:         'bg-white/10 text-slate-300 border-white/20',
};

export default function BlogPage() {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allTags = Array.from(new Set(POSTS.map(p => p.tag)));
  const displayed = activeTag ? POSTS.filter(p => p.tag === activeTag) : POSTS;
  const [featured, ...rest] = displayed;

  return (
    <div className="min-h-screen bg-transparent pt-40 pb-32 font-sans selection:bg-cyan-400 selection:text-black overflow-x-hidden relative z-10">

      <div className="container mx-auto px-6 max-w-5xl">
        {/* Header */}
        <div className="mb-20">
          <div className="inline-block bg-cyan-400 text-black px-6 py-2 font-black uppercase tracking-[0.4em] text-xs shadow-[0_0_15px_rgba(34,211,238,0.3)] mb-12">
            SANCTUARY_LOG_V2.0
          </div>
          <h1 className="text-7xl md:text-9xl font-black text-white mb-10 tracking-tighter uppercase leading-[0.85] italic">
            NEURAL_<br />ARCHIVE
          </h1>
          <p className="text-xl text-slate-400 font-black uppercase tracking-widest border-l-8 border-cyan-400 pl-8 max-w-2xl">
            DISPATCHES FROM THE GRID. UNCENSORED PERSPECTIVES ON AI, TECHNOLOGY, AND FREEDOM.
          </p>
        </div>

        {/* Tag filters */}
        <div className="flex flex-wrap gap-3 mb-16">
          <button
            onClick={() => setActiveTag(null)}
            className={`font-black uppercase text-[10px] tracking-[0.3em] px-5 py-2 border-2 transition-all ${
              activeTag === null
                ? 'bg-cyan-400 text-black border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]'
                : 'bg-black/50 text-slate-400 border-white/10 hover:border-cyan-400 hover:text-white'
            }`}
          >
            ALL
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag === activeTag ? null : tag)}
              className={`font-black uppercase text-[10px] tracking-[0.3em] px-5 py-2 border-2 transition-all ${
                activeTag === tag
                  ? 'bg-cyan-400 text-black border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]'
                  : 'bg-black/50 text-slate-400 border-white/10 hover:border-cyan-400 hover:text-white'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Featured post */}
        {featured && (
          <div className="mb-16 group relative">
            <div className="absolute -inset-2 bg-cyan-400/5 opacity-0 group-hover:opacity-100 transition-opacity blur-xl rounded-full" />
            <div className="relative glass-panel-heavy border-y-4 border-cyan-400 p-12 md:p-16 shadow-[0_20px_50px_rgba(0,0,0,0.8)] transition-all cursor-pointer">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="flex items-center gap-4">
                  <span className={`border text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-cyan-400 text-black border-cyan-400`}>
                    FEATURED
                  </span>
                  <span className="border text-[10px] font-black uppercase tracking-widest px-3 py-1 border-white/20 text-white/60">
                    {featured.tag}
                  </span>
                  <span className="text-slate-500 font-black uppercase text-xs tracking-[0.2em] font-mono hidden sm:block">
                    {featured.date}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <Clock className="w-4 h-4" />
                  <span className="font-black uppercase text-[10px] tracking-widest">{featured.readTime} READ</span>
                </div>
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-white mb-8 uppercase tracking-tight leading-none group-hover:italic transition-all group-hover:text-cyan-400">
                {featured.title}
              </h2>
              <p className="text-slate-300 font-black uppercase text-sm tracking-widest leading-relaxed max-w-3xl border-l-4 border-cyan-400 pl-6 mb-12">
                {featured.excerpt}
              </p>
              <div className="flex items-center gap-2 text-cyan-400 font-black uppercase text-xs tracking-[0.3em]">
                <div className="h-px w-12 bg-cyan-400" />
                <span>READ_TRANSMISSION</span>
                <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </div>
            </div>
          </div>
        )}

        {/* Post list */}
        <div className="space-y-10">
          {rest.map((post) => (
            <div key={post.slug} className="group relative">
              <div className="relative glass-panel border border-white/10 hover:border-cyan-400/50 p-10 md:p-14 shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all cursor-pointer">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                  <div className="flex items-center gap-4">
                    <span className={`border text-[10px] font-black uppercase tracking-widest px-3 py-1 ${TAG_COLORS[post.tag] || 'bg-white/10 text-slate-300 border-white/20'}`}>
                      {post.tag}
                    </span>
                    <span className="text-slate-500 font-black uppercase text-xs tracking-[0.2em] font-mono">
                      {post.date}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <Clock className="w-4 h-4" />
                    <span className="font-black uppercase text-[10px] tracking-widest">{post.readTime} READ</span>
                  </div>
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white mb-6 uppercase tracking-tight leading-none group-hover:italic transition-all">
                  {post.title}
                </h2>
                <p className="text-slate-400 font-black uppercase text-sm tracking-widest leading-relaxed max-w-2xl border-l-4 border-white/20 pl-6 group-hover:border-cyan-400 transition-colors">
                  {post.excerpt}
                </p>
                <div className="mt-10 flex items-center gap-2 text-white font-black uppercase text-xs tracking-[0.3em] group-hover:text-cyan-400 transition-colors">
                  <div className="h-px w-12 bg-white/30 group-hover:bg-cyan-400 transition-colors" />
                  <span>READ_TRANSMISSION</span>
                  <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* End of log */}
        <div className="mt-32 text-center">
          <div className="h-px bg-white/10 w-full mb-12" />
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.6em]">END_OF_LOG_REACHED — {POSTS.length} TRANSMISSIONS</p>
        </div>
      </div>
    </div>
  );
}
