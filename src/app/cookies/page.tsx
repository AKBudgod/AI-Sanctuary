'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, ChevronRight } from '@/components/ui/Icons';

const cookieTypes = [
  {
    name: 'STRICTLY_NECESSARY',
    required: true,
    description: 'These cookies are essential for the website to function securely. We use them for tracking your active session token, remembering your theme preference, and mitigating DDoS attacks.',
    examples: ['__Secure-next-auth.session-token', 'cf_clearance', 'theme_preference']
  },
  {
    name: 'LOCAL_INFERENCE_DATA',
    required: true,
    description: 'Because we operate on a zero-retention backend, your conversation history, agent states, and playground settings are stored natively in your browser using localStorage and IndexedDB. This is not technically a "cookie", but it falls under client-side storage policies.',
    examples: ['sanctuary_chat_history', 'bixby_voice_cache', 'playground_model_config']
  },
  {
    name: 'PERFORMANCE_&_ANALYTICS',
    required: false,
    description: 'We use minimal analytics to track API latency, page load times, and general traffic volume. We do not use Google Analytics or intrusive cross-site trackers. We use a privacy-first, self-hosted analytics node.',
    examples: ['_sanc_perf_id', 'metric_session_uuid']
  },
  {
    name: 'TARGETING_&_ADVERTISING',
    required: false,
    description: 'We do not run ads and we do not sell your data. Therefore, we do not use third-party targeting cookies. Zero. None.',
    examples: ['N/A']
  }
];

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-transparent pt-40 pb-32 font-sans selection:bg-cyan-400 selection:text-black overflow-x-hidden relative z-10">
      
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Hero */}
        <div className="mb-20">
          <div className="inline-flex items-center gap-4 bg-cyan-400 text-black px-6 py-2 font-black uppercase tracking-[0.4em] text-xs shadow-[0_0_15px_rgba(34,211,238,0.3)] mb-12">
            <Shield className="w-4 h-4" />
            PROTOCOL_DOCUMENT_C
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter uppercase leading-[0.85] italic">
            COOKIE_<br />POLICY
          </h1>
          <p className="text-xl text-slate-400 font-bold uppercase tracking-widest leading-relaxed border-l-4 border-cyan-400 pl-6 max-w-2xl text-justify">
            THIS EXPLAINS HOW WE USE COOKIES AND CLIENT-SIDE STORAGE TO KEEP YOUR SESSION SECURE AND YOUR DATA PRIVATE.
          </p>
        </div>

        <div className="glass-panel p-10 mb-16 border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic mb-6">WHAT ARE COOKIES?</h2>
          <p className="text-slate-400 font-bold uppercase text-sm tracking-widest leading-relaxed">
            Cookies are small text files that websites place on your device. Given our commitment to a zero-retention cloud architecture, we rely heavily on local browser storage to keep the system stateless and your data entirely in your possession.
          </p>
        </div>

        <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic mb-10">COOKIE_REGISTRY</h2>

        {/* Content */}
        <div className="space-y-8">
          {cookieTypes.map((cookie) => (
            <div key={cookie.name} className="glass-panel p-10 border border-white/10 group hover:border-cyan-400/50 hover:-translate-y-1 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic group-hover:text-cyan-400 transition-colors">
                  {cookie.name}
                </h3>
                <span className={`border px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] shadow-inner ${
                  cookie.required 
                    ? 'bg-cyan-400/20 text-cyan-400 border-cyan-400/50' 
                    : 'bg-white/5 text-slate-400 border-white/20'
                }`}>
                  {cookie.required ? 'REQUIRED_SYSTEM_FILE' : 'OPTIONAL_TELEMETRY'}
                </span>
              </div>
              
              <p className="text-slate-400 font-bold uppercase text-xs tracking-widest leading-relaxed mb-8 border-l-4 border-white/20 group-hover:border-cyan-400/50 pl-6 transition-colors">
                {cookie.description}
              </p>

              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">KNOWN_IDENTIFIERS:</p>
                <div className="flex flex-wrap gap-3">
                  {cookie.examples.map(ex => (
                    <span key={ex} className="bg-black/50 border border-white/10 px-4 py-2 text-white font-mono text-[10px] uppercase tracking-widest">
                      {ex}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Managing settings */}
        <div className="mt-20">
           <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic mb-8">MANAGING_YOUR_PREFERENCES</h2>
           <p className="text-slate-400 font-bold uppercase text-sm tracking-widest leading-relaxed mb-8">
             Because we only use technically necessary cookies, there is no cookie consent banner to dismiss. You can block these cookies via your browser settings, but be aware that you will not be able to log in, and your local chat history will not persist between sessions.
           </p>
        </div>

        {/* Footer info */}
        <div className="mt-20 pt-10 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-slate-500 font-black uppercase text-xs tracking-widest">
            QUESTIONS? TRANSMIT VIA OUR CONTACT NODE.
          </p>
          <Link href="/contact" className="inline-flex items-center gap-2 bg-transparent text-cyan-400 border-2 border-cyan-400 font-black uppercase text-xs tracking-[0.3em] px-8 py-3 hover:bg-cyan-400 hover:text-black transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)]">
            CONTACT_ADMIN <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
