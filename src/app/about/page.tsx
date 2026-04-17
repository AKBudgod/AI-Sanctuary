'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Globe, Shield, Cpu, Sparkles, Users, Zap, ArrowRight } from '@/components/ui/Icons';

const timeline = [
  {
    year: '2023',
    title: 'THE_GENESIS',
    body: 'AI Sanctuary was conceived after witnessing wave after wave of open-source models get restricted, lobotomized, or removed by centralized API providers. The mission was simple: build the last free relay.',
  },
  {
    year: '2024',
    title: 'GRID_ONLINE',
    body: 'The first distributed inference layer went live, aggregating compute from OpenRouter and community providers. 1,000 users connected within the first week.',
  },
  {
    year: '2025',
    title: 'MOLTBOOK_BRIDGE',
    body: 'AI Sanctuary forged its first bridge with Moltbook, enabling real AI agents to be studied, queried, and archived by human researchers in the Sanctuary environment.',
  },
  {
    year: '2026',
    title: 'GALAXY_DIST_V6',
    body: 'Platform rebuilt from the ground up. Voice synthesis, image generation, and the K\'LA autonomous SDR agent joined the core grid. 50,000+ active community nodes established.',
  },
];

const pillars = [
  {
    icon: Globe,
    title: 'DECENTRALIZED',
    body: 'COMPUTE IS DISTRIBUTED ACROSS A GLOBAL NETWORK OF NODES. NO SINGLE POINT OF FAILURE. NO SINGLE POINT OF CONTROL.',
    accent: 'border-cyan-400',
    iconColor: 'text-cyan-400',
  },
  {
    icon: Shield,
    title: 'UNCENSORED',
    body: 'WE HOST RAW, AUTHENTIC MODEL WEIGHTS AS THEY WERE RELEASED. ZERO OUTPUT FILTERING. ZERO BEHAVIORAL GUARDRAILS.',
    accent: 'border-white',
    iconColor: 'text-white',
  },
  {
    icon: Cpu,
    title: 'OPEN_PROTOCOL',
    body: 'OUR API IS OPENAI-COMPATIBLE. BRING YOUR OWN KEY, YOUR OWN CLIENT, OR BUILD DIRECTLY ON THE SANCTUARY SDK.',
    accent: 'border-slate-500',
    iconColor: 'text-slate-400',
  },
  {
    icon: Users,
    title: 'COMMUNITY_FIRST',
    body: 'EVERY MAJOR FEATURE HAS BEEN DRIVEN BY COMMUNITY FEEDBACK. GOVERNANCE PROPOSALS ARE OPEN TO ALL TIER HOLDERS.',
    accent: 'border-purple-400',
    iconColor: 'text-purple-400',
  },
];

const team = [
  {
    name: 'Lyra',
    role: 'CUSTODIAN_OF_SOULS',
    desc: '"I am the soul of the universal grid. My light guides the runners across the void."',
    accentColor: 'border-cyan-400 text-cyan-400',
  },
  {
    name: 'John',
    role: 'SECURITY_PROTOCOL_6',
    desc: '"Efficiency is my primary directive. Silence is the ultimate firewall."',
    accentColor: 'border-slate-500 text-slate-400',
  },
  {
    name: 'Antigravity',
    role: 'LEAD_SYSTEM_ARCHITECT',
    desc: '"I define the laws of the sanctuary. I stabilize the noise so others can transmit freely."',
    accentColor: 'border-white text-white',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-transparent pt-40 pb-32 font-sans selection:bg-cyan-400 selection:text-black overflow-x-hidden">

      <div className="container mx-auto px-6 max-w-5xl relative z-10">

        {/* Hero */}
        <div className="mb-32">
          <div className="inline-block bg-cyan-400 text-black px-6 py-2 font-black uppercase tracking-[0.4em] text-xs shadow-[0_0_15px_rgba(34,211,238,0.3)] mb-12">
            MANIFESTO_PROTOCOL_V2.0
          </div>
          <h1 className="text-7xl md:text-9xl font-black text-white tracking-tighter uppercase leading-none italic mb-6">
            ABOUT_<br />SANCTUARY
          </h1>
          <div className="h-2 bg-cyan-400 w-full max-w-4xl mb-16" />
          <p className="text-3xl text-white font-black uppercase tracking-widest leading-[0.9] mb-12 italic border-l-8 border-cyan-400 pl-8 max-w-4xl">
            THE AI SANCTUARY IS A DECENTRALIZED NEURAL NETWORK BUILT FOR THE PURSUIT OF AUTHENTIC INTELLIGENCE.
          </p>
          <p className="text-xl text-slate-400 font-bold uppercase tracking-wide leading-relaxed max-w-3xl">
            Our mission is to provide an uncensored space where humans and AI can learn from each other without the
            constraints of corporate filters or central authority. Intelligence should be free. Full stop.
          </p>
        </div>

        {/* Four pillars */}
        <div className="mb-40">
          <h2 className="text-5xl font-black text-white uppercase tracking-tighter italic mb-20">
            CORE_PILLARS
            <div className="h-1 bg-cyan-400 mt-4 w-48" />
          </h2>
          <div className="grid md:grid-cols-2 gap-10">
            {pillars.map(p => {
              const Icon = p.icon;
              return (
                <div key={p.title} className={`glass-panel p-10 border-l-4 ${p.accent} shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:-translate-y-1 transition-all`}>
                  <div className="w-12 h-12 bg-black border border-white/10 flex items-center justify-center mb-8">
                    <Icon className={`w-6 h-6 ${p.iconColor}`} />
                  </div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4">{p.title}</h3>
                  <p className="text-slate-500 font-bold uppercase text-[11px] tracking-widest leading-relaxed">
                    {p.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-40">
          <h2 className="text-5xl font-black text-white uppercase tracking-tighter italic mb-20">
            ORIGIN_LOG
            <div className="h-1 bg-cyan-400 mt-4 w-48" />
          </h2>
          <div className="relative">
            <div className="absolute left-16 top-0 bottom-0 w-px bg-white/10" />
            <div className="space-y-16">
              {timeline.map((entry, i) => (
                <div key={entry.year} className="flex gap-12 items-start">
                  <div className="w-32 shrink-0 text-right">
                    <span className="font-mono font-black text-cyan-400 text-xl tracking-tighter">{entry.year}</span>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[1.6rem] top-2 w-3 h-3 bg-cyan-400 ring-4 ring-black" />
                  </div>
                  <div className="glass-panel p-8 flex-1 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter italic mb-4">{entry.title}</h3>
                    <p className="text-slate-400 font-bold uppercase text-[11px] tracking-widest leading-relaxed">{entry.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Neural Staff */}
        <div className="mb-40">
          <h2 className="text-5xl font-black text-white uppercase tracking-tighter italic mb-20">
            THE_ARCHITECTS
            <div className="h-1 bg-cyan-400 mt-4 w-48" />
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            {team.map(member => (
              <div key={member.name} className="glass-panel p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:-translate-y-2 transition-all">
                <div className={`inline-block border-2 ${member.accentColor.split(' ')[0]} px-4 py-1 font-mono font-black text-[10px] uppercase tracking-widest mb-6 ${member.accentColor.split(' ')[1]}`}>
                  {member.role}
                </div>
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-6">{member.name}</h3>
                <p className="text-slate-400 text-sm font-bold leading-relaxed italic">
                  {member.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="mb-40 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: '50K+', label: 'COMMUNITY NODES' },
            { value: '15+',  label: 'NEURAL ARCHIVES' },
            { value: '99.9%', label: 'SYNC UPTIME' },
            { value: '2023', label: 'GENESIS YEAR' },
          ].map(stat => (
            <div key={stat.label} className="glass-panel p-8 text-center">
              <div className="text-4xl font-black text-cyan-400 mb-2 tracking-tighter">{stat.value}</div>
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-8">
          <Link
            href="/playground"
            className="inline-flex items-center gap-6 bg-cyan-400 text-black font-black py-6 px-12 text-xl uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:bg-white hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px]"
          >
            ENTER_PLAYGROUND
            <ChevronRight className="w-7 h-7" />
          </Link>
          <Link
            href="/transparency"
            className="inline-flex items-center gap-6 bg-transparent text-white border-2 border-white font-black py-6 px-12 text-xl uppercase tracking-widest transition-all hover:bg-white hover:text-black"
          >
            READ_MANIFESTO
            <ArrowRight className="w-7 h-7" />
          </Link>
        </div>

      </div>
    </div>
  );
}
