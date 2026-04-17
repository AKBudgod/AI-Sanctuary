'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import NewsletterForm from '@/components/ui/NewsletterForm';
import {
  Discord,
  Twitter,
  Telegram,
  GitHub,
  Mail,
  Users,
  MessageSquare,
  Globe,
  Zap,
  ArrowRight,
  Award,
  ChevronRight,
  TrendingUp,
  Shield,
} from '@/components/ui/Icons';

const SOCIALS = [
  {
    name: 'DISCORD',
    handle: '@ai-sanctuary',
    icon: Discord,
    link: 'https://discord.gg/ai-sanctuary-online',
    members: '12.4K',
    desc: 'The central hub for model discussions, prompt engineering, and support.',
    color: 'border-[#5865F2]/50 hover:border-[#5865F2] hover:shadow-[0_0_20px_rgba(88,101,242,0.3)]',
    iconColor: 'text-[#5865F2]',
  },
  {
    name: 'X_(TWITTER)',
    handle: '@AI_Sanctuary',
    icon: Twitter,
    link: 'https://x.com/we_are_sanctuary_ai',
    members: '45.1K',
    desc: 'Rapid updates, server status, and new model drops.',
    color: 'border-cyan-500/50 hover:border-cyan-500 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]',
    iconColor: 'text-cyan-400',
  },
  {
    name: 'TELEGRAM',
    handle: 't.me/sanctuary_alerts',
    icon: Telegram,
    link: 'https://t.me/sanctuary_ai_official',
    members: '8.2K',
    desc: 'Direct pipeline for catastrophic node failures and elite tier alerts.',
    color: 'border-[#0088cc]/50 hover:border-[#0088cc] hover:shadow-[0_0_20px_rgba(0,136,204,0.3)]',
    iconColor: 'text-[#0088cc]',
  },
  {
    name: 'GITHUB',
    handle: 'AI-Sanctuary',
    icon: GitHub,
    link: 'https://github.com/AI-Sanctuary',
    members: '2.1K★',
    desc: 'Open-source SDKs, CLI tools, and community-driven node runners.',
    color: 'border-white/20 hover:border-white/60 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]',
    iconColor: 'text-white',
  },
];

const PROGRAMS = [
  {
    title: 'COMPUTE_GRANTS_V2',
    icon: Zap,
    status: 'ACCEPTING_APPLICATIONS',
    desc: 'Building something revolutionary? We provide up to $5,000 in API credits for open-source researchers and indie devs.',
    reqs: [
      'Project must be fully open-source (MIT/Apache)',
      'Working prototype required',
      'No venture backing > $500k',
    ],
    link: '/contact?subject=GRANTS',
  },
  {
    title: 'NODE_OPERATORS_PROGRAM',
    icon: Globe,
    status: 'WAITLIST_ONLY',
    desc: 'Earn SANC tokens by contributing idle GPU compute to the Sanctuary distributed inference layer.',
    reqs: [
      'Minimum constant VRAM: 24GB (RTX 3090/4090 or better)',
      'Symmetrical 1Gbps fiber connection',
      '99.9% targeted uptime',
    ],
    link: '/contact?subject=NODE_OP',
  },
  {
    title: 'BUG_BOUNTY_CORE',
    icon: Shield,
    status: 'ALWAYS_ACTIVE',
    desc: 'Find critical vulnerabilities in our infrastructure, model sandboxes, or token smart contracts and get paid.',
    reqs: [
      'Do not disrupt production services via DDoS',
      'Wait for triage before public disclosure',
      'Payouts scale with CVSS severity (Up to $50k)',
    ],
    link: '/contact?subject=SECURITY',
  },
];

export default function CommunityPage() {
  const [expandedProgram, setExpandedProgram] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-transparent pt-40 pb-32 font-sans selection:bg-cyan-400 selection:text-black overflow-x-hidden relative z-10">

      {/* Grid background element for extra cyber feel */}
      <div className="absolute inset-0 bg-[url('/img/grid.svg')] bg-[length:50px_50px] opacity-[0.03] pointer-events-none" />

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        
        {/* Header */}
        <div className="mb-32">
          <div className="inline-block bg-cyan-400 text-black px-6 py-2 font-black uppercase tracking-[0.4em] text-xs shadow-[0_0_15px_rgba(34,211,238,0.3)] mb-12">
            GLOBAL_NETWORK_TOPOLOGY
          </div>
          <h1 className="text-7xl md:text-9xl font-black text-white mb-10 tracking-tighter uppercase leading-[0.85] italic">
            THE_GRID_<br />COLLECTIVE
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 font-black uppercase tracking-widest leading-tight max-w-3xl border-l-8 border-cyan-400 pl-8">
            AI SANCTUARY SURVIVES BECAUSE OF ITS NODES. JOIN 50,000+ DEVELOPERS, RESEARCHERS, AND VISIONARIES BUILDING THE UNCENSORED FUTURE.
          </p>
        </div>

        {/* Pulse Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-32">
          {[
            { value: '52.7K', label: 'ACTIVE_NODES' },
            { value: '1.2B', label: 'WEEKLY_TX' },
            { value: 'Zero', label: 'CENSORED_REQ' },
            { value: '99.9%', label: 'GRID_UPTIME' }
          ].map(stat => (
            <div key={stat.label} className="glass-panel text-center p-8 border border-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
              <div className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tighter">{stat.value}</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] font-mono">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Social Cards */}
        <div className="mb-40">
          <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic mb-16">
            NODE_CHANNELS
            <div className="h-1 bg-cyan-400 mt-4 w-48" />
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SOCIALS.map(social => {
              const Icon = social.icon;
              return (
                <a
                  key={social.name}
                  href={social.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group relative glass-panel border-2 p-8 transition-all hover:-translate-y-2 cursor-pointer ${social.color}`}
                >
                  <div className="flex justify-between items-start mb-12">
                    <div className="w-16 h-16 bg-black/50 border border-white/10 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                      <Icon className={`w-8 h-8 ${social.iconColor}`} />
                    </div>
                    <span className="bg-black/40 border border-white/10 text-white font-black text-[10px] uppercase tracking-widest px-3 py-1">
                      {social.members}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter group-hover:italic transition-all mb-2">{social.name}</h3>
                    <p className={`text-xs font-black uppercase tracking-[0.2em] mb-4 font-mono ${social.iconColor}`}>
                      {social.handle}
                    </p>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest leading-relaxed">
                      {social.desc}
                    </p>
                  </div>
                  <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className={`w-5 h-5 ${social.iconColor} -rotate-45`} />
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        {/* Programs */}
        <div className="mb-40">
          <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic mb-16">
            ACTIVE_DIRECTIVES
            <div className="h-1 bg-cyan-400 mt-4 w-48" />
          </h2>
          <div className="space-y-6">
            {PROGRAMS.map((prog) => {
              const Icon = prog.icon;
              const isExpanded = expandedProgram === prog.title;
              return (
                <div key={prog.title} className="glass-panel border-l-4 border-white/20 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden">
                  <div 
                    onClick={() => setExpandedProgram(isExpanded ? null : prog.title)}
                    className="p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 cursor-pointer group hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-6">
                      <div className="hidden sm:flex w-14 h-14 bg-black/50 border border-white/10 items-center justify-center shrink-0 shadow-inner group-hover:border-cyan-400 transition-colors">
                        <Icon className="w-7 h-7 text-cyan-400" />
                      </div>
                      <div>
                        <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter italic mb-2 group-hover:text-cyan-400 transition-colors">
                          {prog.title}
                        </h3>
                        <span className={`text-[10px] font-black uppercase tracking-[0.3em] font-mono ${
                          prog.status.includes('WAITLIST') ? 'text-orange-400' : 'text-emerald-400'
                        }`}>
                          {prog.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className={`w-8 h-8 text-slate-500 transition-transform hidden md:block group-hover:text-cyan-400 ${isExpanded ? 'rotate-90' : ''}`} />
                  </div>

                  {isExpanded && (
                    <div className="p-8 md:p-10 border-t border-white/10 bg-black/40">
                      <p className="text-slate-300 font-bold text-sm uppercase tracking-widest leading-relaxed max-w-3xl mb-10 border-l-4 border-cyan-400/50 pl-6">
                        {prog.desc}
                      </p>
                      <div className="mb-10">
                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-4">CRITERIA</h4>
                        <ul className="space-y-3">
                          {prog.reqs.map((req, i) => (
                            <li key={i} className="flex items-start gap-4 text-slate-400 font-bold uppercase text-xs tracking-widest">
                              <span className="text-cyan-400 mt-0.5 shrink-0">■</span>
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <Link href={prog.link} className="inline-flex items-center gap-4 bg-transparent text-cyan-400 border-2 border-cyan-400 px-8 py-4 font-black uppercase text-xs tracking-[0.3em] hover:bg-cyan-400 hover:text-black transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)] group">
                        INITIATE_APPLICATION <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Events / Newsletter merged section */}
        <div className="grid lg:grid-cols-2 gap-10 border-t-2 border-white/10 pt-24">
          <div className="glass-panel p-10 border-t-4 border-cyan-400 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col flex-1 relative overflow-hidden">
             {/* Neon glow flair */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400/10 blur-3xl rounded-full" />
             
             <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-red-500 w-3 h-3 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                  <span className="text-slate-400 font-black uppercase text-xs tracking-widest font-mono">NEXT_EVENT</span>
                </div>
                <h3 className="text-4xl font-black text-white uppercase tracking-tighter italic mb-4">SANCTUARY<br/>TOWN HALL #14</h3>
                <p className="text-slate-400 font-bold uppercase text-xs tracking-widest leading-relaxed mb-8">
                  DISCUSSION: VLLM ENGINE UPGRADES & NEW IMAGE GENERATION PIPELINES OVERVIEW.
                </p>
                <div className="bg-black/50 border border-white/10 p-5 mb-8 inline-block">
                  <p className="text-cyan-400 font-black uppercase text-xl font-mono tracking-widest">APR 20, 2026 // 18:00 UTC</p>
                  <p className="text-slate-500 font-black uppercase text-[10px] mt-2">LOCATION: DISCORD STAGE A</p>
                </div>
                <div className="mt-auto">
                  <a href="https://discord.gg/ai-sanctuary-online" target="_blank" rel="noopener noreferrer" 
                     className="w-full py-4 bg-transparent text-cyan-400 border-2 border-cyan-400 font-black uppercase text-xs tracking-[0.3em] hover:bg-cyan-400 hover:text-black transition-all text-center block shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                    RSVP_NOW
                  </a>
                </div>
             </div>
          </div>

          <div className="relative">
            {/* The Newsletter Form component handles its own dark styling gracefully as established */}
            <div className="h-full">
               <NewsletterForm />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
