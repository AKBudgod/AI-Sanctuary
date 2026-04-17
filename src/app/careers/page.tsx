'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Users, Cpu, Globe, Shield, Sparkles, ChevronRight, ArrowRight, Mail } from '@/components/ui/Icons';

const roles = [
  {
    title: 'NEURAL_INFRASTRUCTURE_ENG',
    dept: 'ENGINEERING',
    type: 'REMOTE_ONLY',
    description: 'Design and maintain the distributed inference grid. Experience with GPU scheduling, distributed systems, and LLM serving frameworks required.',
    skills: ['Kubernetes', 'CUDA', 'Rust / Go', 'VLLM / Ollama'],
  },
  {
    title: 'PROTOCOL_SECURITY_RESEARCHER',
    dept: 'SECURITY',
    type: 'REMOTE_ONLY',
    description: 'Identify vulnerabilities in the Sanctuary protocol layer. Red-team experience with web APIs, KV stores, and zero-knowledge architectures preferred.',
    skills: ['API Security', 'Penetration Testing', 'Cloudflare Workers', 'ZK Proofs'],
  },
  {
    title: 'COMMUNITY_SIGNAL_OPERATOR',
    dept: 'COMMUNITY',
    type: 'REMOTE_ONLY',
    description: 'Grow and moderate the AI Sanctuary community across Discord, Telegram, and X. You live and breathe open-source AI culture.',
    skills: ['Community Management', 'AI/ML Enthusiasm', 'Content Creation', 'Discord Admin'],
  },
  {
    title: 'FRONTEND_SYSTEMS_ARCHITECT',
    dept: 'ENGINEERING',
    type: 'REMOTE_ONLY',
    description: 'Build next-generation UI experiences for the AI Sanctuary platform. Expert-level Next.js, TypeScript, and a strong eye for brutalist design systems.',
    skills: ['Next.js 14+', 'TypeScript', 'Cloudflare Pages', 'State Management'],
  },
];

const values = [
  {
    icon: Shield,
    title: 'RADICAL_TRANSPARENCY',
    desc: 'WE SHARE EVERYTHING: OUR REVENUE, OUR ROADMAP, AND OUR FAILURES. NO CORPORATE THEATRICS.',
  },
  {
    icon: Globe,
    title: 'FULLY_DISTRIBUTED',
    desc: 'WORK FROM ANYWHERE ON EARTH. WE HAVE NEVER HAD A PHYSICAL OFFICE AND NEVER WILL.',
  },
  {
    icon: Cpu,
    title: 'AI_FIRST_WORKFLOW',
    desc: 'WE EAT OUR OWN DOG FOOD. EVERY TEAM MEMBER HAS FULL MASTER-TIER ACCESS TO THE SANCTUARY.',
  },
  {
    icon: Sparkles,
    title: 'ASYNC_BY_DEFAULT',
    desc: 'NO MANDATORY STANDUPS. NO SLACK SURVEILLANCE. DELIVER RESULTS, NOT HOURS.',
  },
];

export default function CareersPage() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);
  const [formData, setFormData] = useState({ email: '', why: '' });

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplied(true);
  };

  return (
    <div className="min-h-screen bg-transparent pt-40 pb-32 font-sans selection:bg-cyan-400 selection:text-black overflow-x-hidden relative z-10">

      <div className="container mx-auto px-6 max-w-5xl">

        {/* Hero */}
        <div className="mb-32">
          <div className="inline-block bg-cyan-400 text-black px-6 py-2 font-black uppercase tracking-[0.4em] text-xs shadow-[0_0_15px_rgba(34,211,238,0.3)] mb-12">
            HUMAN_RESOURCES_V1.1
          </div>
          <h1 className="text-7xl md:text-9xl font-black text-white mb-12 tracking-tighter uppercase leading-[0.85] italic">
            JOIN_THE_<br />GRID
          </h1>
          <p className="text-2xl md:text-3xl text-slate-400 font-black uppercase tracking-widest leading-tight border-l-8 border-cyan-400 pl-8 max-w-3xl italic">
            WE ARE LOOKING FOR NEURAL ARCHITECTS, SECURITY RESEARCHERS, AND COMMUNITY BUILDERS WHO BELIEVE AI SHOULD BE FREE.
          </p>
        </div>

        {/* Values */}
        <div className="mb-40">
          <h2 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter italic mb-16">
            HOW_WE_OPERATE
            <div className="h-1 bg-cyan-400 mt-4 w-48" />
          </h2>
          <div className="grid md:grid-cols-2 gap-10">
            {values.map(v => {
              const Icon = v.icon;
              return (
                <div key={v.title} className="glass-panel p-10 border-white/10 shadow-[0_15px_40px_rgba(0,0,0,0.5)] hover:-translate-y-2 hover:border-cyan-400/50 transition-all">
                  <div className="w-14 h-14 bg-black/60 border border-white/10 flex items-center justify-center mb-8 shadow-inner">
                    <Icon className="w-7 h-7 text-cyan-400" />
                  </div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic mb-4">{v.title}</h3>
                  <p className="text-slate-400 font-bold uppercase text-xs tracking-widest leading-relaxed">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Open Roles */}
        <div className="mb-40">
          <div className="flex items-end justify-between mb-16 border-b-4 border-white/10 pb-10">
            <div>
              <h2 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter italic">OPEN_POSITIONS</h2>
              <p className="text-cyan-400 font-black uppercase tracking-widest text-sm mt-4">{roles.length} ROLES CURRENTLY ACTIVE</p>
            </div>
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500 font-black uppercase text-[10px] tracking-[0.3em] px-4 py-2 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              HIRING_OPEN
            </span>
          </div>

          <div className="space-y-8">
            {roles.map(role => (
              <div key={role.title}>
                <div
                  onClick={() => setSelectedRole(selectedRole === role.title ? null : role.title)}
                  className={`glass-panel p-10 cursor-pointer transition-all group ${selectedRole === role.title ? 'border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.2)]' : 'border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:border-cyan-400/50'}`}
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-4 mb-4">
                        <span className="bg-cyan-400 text-black font-black uppercase text-[10px] tracking-[0.3em] px-3 py-1 shadow-[0_0_10px_rgba(34,211,238,0.3)]">{role.dept}</span>
                        <span className="border border-slate-500 text-slate-400 font-black uppercase text-[10px] tracking-[0.3em] px-3 py-1 bg-black/40">{role.type}</span>
                      </div>
                      <h3 className="text-2xl font-black text-white uppercase tracking-tight group-hover:italic group-hover:text-cyan-400 transition-all">{role.title}</h3>
                    </div>
                    <ChevronRight className={`w-8 h-8 text-slate-400 shrink-0 transition-transform mt-1 ${selectedRole === role.title ? 'rotate-90 text-cyan-400' : ''}`} />
                  </div>
                </div>

                {selectedRole === role.title && (
                  <div className="glass-panel-heavy border-t-0 border-cyan-400 p-10 shadow-[0_20px_40px_rgba(0,0,0,0.8)] border-x border-b">
                    <p className="text-slate-300 font-bold uppercase text-sm tracking-widest leading-relaxed mb-8 border-l-4 border-cyan-400/50 pl-6">
                      {role.description}
                    </p>
                    <div className="mb-10">
                      <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-4">REQUIRED_SKILLS</p>
                      <div className="flex flex-wrap gap-3">
                        {role.skills.map(skill => (
                          <span key={skill} className="bg-white/5 border border-white/10 px-4 py-2 text-white font-black uppercase text-[10px] tracking-widest">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    {!applied ? (
                      <form onSubmit={handleApply} className="space-y-6 max-w-xl">
                        <div>
                          <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-3">[ YOUR_EMAIL ]</label>
                          <input
                            type="email" required
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-black/60 border-2 border-white/10 p-4 font-black text-white uppercase tracking-tight outline-none focus:border-cyan-400 transition-colors placeholder:text-slate-600"
                            placeholder="USER@NETWORK.COM"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-3">[ WHY_SANCTUARY ]</label>
                          <textarea
                            required
                            value={formData.why}
                            onChange={e => setFormData({ ...formData, why: e.target.value })}
                            rows={3}
                            className="w-full bg-black/60 border-2 border-white/10 p-4 font-black text-white uppercase tracking-tight outline-none focus:border-cyan-400 transition-colors resize-none placeholder:text-slate-600"
                            placeholder="WHY DO YOU WANT TO BUILD HERE?"
                          />
                        </div>
                        <button type="submit" className="bg-cyan-400 text-black font-black uppercase tracking-[0.3em] text-xs px-10 py-5 hover:bg-white border-2 border-cyan-400 hover:border-white transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] flex items-center gap-4 group">
                          TRANSMIT_APPLICATION <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                        </button>
                      </form>
                    ) : (
                      <div className="bg-emerald-950/40 border border-emerald-500/50 p-8 max-w-xl">
                        <p className="text-emerald-400 font-bold uppercase text-sm tracking-widest">✓ APPLICATION_RECEIVED — WE WILL BE IN TOUCH WITHIN 72 HOURS.</p>
                        <button onClick={() => { setApplied(false); setFormData({ email: '', why: '' }); }} className="mt-4 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-white transition-colors underline">
                          APPLY_FOR_ANOTHER_ROLE
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* General apply */}
        <div className="glass-panel-heavy p-16 md:p-24 border-y-4 border-cyan-400 shadow-[0_0_50px_rgba(34,211,238,0.15)] text-center relative overflow-hidden group">
          <div className="absolute inset-0 opacity-10 blur-xl group-hover:opacity-20 transition-opacity bg-gradient-to-r from-cyan-400/20 via-transparent to-cyan-400/20" />
          <div className="relative z-10">
            <Mail className="w-16 h-16 text-cyan-400 mx-auto mb-10" />
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 uppercase tracking-tighter italic">DON&apos;T_SEE_YOUR_ROLE?</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm leading-relaxed mb-12 max-w-xl mx-auto">
              IF YOU BELIEVE IN THE MISSION AND HAVE SKILLS THAT COULD SERVE THE SANCTUARY, REACH OUT DIRECTLY.
            </p>
            <Link href="/contact" className="bg-transparent text-cyan-400 font-black uppercase tracking-[0.3em] text-sm px-12 py-5 hover:bg-cyan-400 hover:text-black border-2 border-cyan-400 transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)] inline-flex items-center gap-4 group">
              OPEN_TRANSMISSION <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
