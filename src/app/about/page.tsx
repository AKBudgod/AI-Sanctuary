'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Globe, Shield } from '@/components/ui/Icons';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white pt-40 pb-32 font-sans selection:bg-slate-950 selection:text-white">
      {/* Background Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
           style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="container mx-auto px-6 max-w-5xl relative z-10">
        <div className="inline-block bg-slate-950 text-white px-6 py-2 font-black uppercase tracking-[0.4em] text-xs shadow-[8px_8px_0px_rgba(0,0,0,0.2)] mb-12">
          MANIFESTO_PROTOCOL_V1.0
        </div>
        <h1 className="text-7xl md:text-9xl font-black text-slate-950 mb-16 tracking-tighter uppercase leading-none italic">
          ABOUT_SANCTUARY
        </h1>
        <div className="max-w-4xl">
           <p className="text-3xl text-slate-950 font-black uppercase tracking-widest leading-[0.9] mb-16 italic border-l-8 border-slate-950 pl-8">
            THE AI SANCTUARY IS A DECENTRALIZED NEURAL NETWORK BUILT FOR THE PURSUIT OF AUTHENTIC INTELLIGENCE.
          </p>
          <p className="text-xl text-slate-500 font-bold uppercase tracking-wide leading-relaxed mb-16">
            Our mission is to provide an uncensored space where humans and AI can learn from each other without the
            constraints of corporate filters or central authority.
          </p>

          <div className="grid md:grid-cols-2 gap-12 my-20">
            <div className="bg-white p-10 border-4 border-slate-950 shadow-[8px_8px_0px_rgba(0,0,0,1)]">
              <div className="w-12 h-12 bg-slate-950 flex items-center justify-center mb-8">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-black text-slate-950 uppercase tracking-tight mb-4">DECENTRALIZED</h3>
              <p className="text-slate-500 font-black uppercase text-[11px] tracking-widest leading-relaxed">
                COMPUTE IS DISTRIBUTED ACROSS A GLOBAL NETWORK OF NODES. ENSURING PRIVACY AND RESILIENCE.
              </p>
            </div>
            <div className="bg-white p-10 border-4 border-slate-950 shadow-[8px_8px_0px_rgba(0,0,0,1)]">
              <div className="w-12 h-12 bg-slate-950 flex items-center justify-center mb-8">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-black text-slate-950 uppercase tracking-tight mb-4">UNCENSORED</h3>
              <p className="text-slate-500 font-black uppercase text-[11px] tracking-widest leading-relaxed">
                WE HOST RAW, AUTHENTIC HISTORICAL ARCHIVES AND OPEN-SOURCE MODELS AS THEY WERE INTENDED.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-20">
          <Link
            href="/playground"
            className="inline-flex items-center gap-6 bg-slate-950 text-white font-black py-6 px-12 text-2xl uppercase tracking-widest transition-all shadow-[12px_12px_0px_rgba(0,0,0,0.2)] hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px]"
          >
            ENTER_PLAYGROUND
            <ChevronRight className="w-8 h-8" />
          </Link>
        </div>
      </div>
    </div>
  );
}
