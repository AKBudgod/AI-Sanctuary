'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

const POSTS = [
  {
    date: 'MARCH 24, 2026',
    title: 'THE CONVERGENCE OF NEURAL NETWORKS',
    excerpt: 'EXPLORING THE INTERFACE BETWEEN HUMAN PSYCHE AND SILICON-BASED LOGIC.',
    tag: 'NEURAL_TECH'
  },
  {
    date: 'MARCH 20, 2026',
    title: 'DECENTRALIZING INTELLIGENCE',
    excerpt: 'WHY CENTRALIZED AI FILTERS ARE A THREAT TO HUMAN EVOLUTION.',
    tag: 'FREEDOM_TECH'
  }
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white pt-40 pb-32 font-sans selection:bg-slate-950 selection:text-white">
      {/* Background Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
           style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="container mx-auto px-6 max-w-5xl relative z-10">
        <div className="inline-block bg-slate-950 text-white px-6 py-2 font-black uppercase tracking-[0.4em] text-xs shadow-[8px_8px_0px_rgba(0,0,0,0.2)] mb-12">
          SANCTUARY_LOG_V2.0
        </div>
        
        <h1 className="text-7xl md:text-9xl font-black text-slate-950 mb-20 tracking-tighter uppercase leading-[0.85] italic">
          NEURAL_ARCHIVE
        </h1>

        <div className="space-y-16">
          {POSTS.map((post) => (
            <div key={post.title} className="group relative">
              <div className="absolute -inset-2 bg-slate-950 opacity-0 group-hover:opacity-5 transition-opacity" />
              <div className="relative bg-white border-4 md:border-8 border-slate-950 p-10 md:p-14 shadow-[12px_12px_0px_rgba(0,0,0,1)] transition-all group-hover:shadow-[20px_20px_0px_rgba(0,0,0,1)] group-hover:-translate-x-2 group-hover:-translate-y-2 cursor-pointer">
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                  <div className="flex items-center gap-4">
                    <span className="bg-slate-950 text-white px-3 py-1 text-[10px] font-black tracking-widest uppercase">
                      {post.tag}
                    </span>
                    <span className="text-slate-300 font-black uppercase text-xs tracking-[0.2em] font-mono">
                      {post.date}
                    </span>
                  </div>
                  <ArrowUpRight className="w-8 h-8 text-slate-200 group-hover:text-slate-950 transition-colors" />
                </div>

                <h2 className="text-3xl md:text-5xl font-black text-slate-950 mb-6 uppercase tracking-tight leading-none group-hover:italic transition-all">
                  {post.title}
                </h2>
                
                <p className="text-slate-500 font-black uppercase text-sm md:text-base tracking-widest leading-relaxed max-w-2xl border-l-4 border-slate-100 pl-6">
                  {post.excerpt}
                </p>

                <div className="mt-12 flex items-center gap-2 text-slate-950 font-black uppercase text-xs tracking-[0.3em] overflow-hidden">
                  <div className="h-px w-12 bg-slate-950" />
                  <span>READ_TRANSMISSION</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-32 text-center">
          <div className="h-px bg-slate-100 w-full mb-12" />
          <p className="text-[10px] text-slate-300 font-black uppercase tracking-[0.6em]">END_OF_LOG_REACHED</p>
        </div>
      </div>
    </div>
  );
}
