'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, Zap, Target, Mail, Video, Linkedin, Music2, Globe, ArrowRight, TrendingUp, Shield, Clock } from "@/components/ui/Icons";

const STATS = [
  { value: '6', label: 'Marketing Channels' },
  { value: '24/7', label: 'Always Running' },
  { value: '5-Touch', label: 'Email Sequences' },
  { value: '$0', label: 'Burnout Cost' },
];

const CAPABILITIES = [
  {
    icon: Target,
    title: 'PROSPECT_MINING',
    desc: "SCANS THE LIVE INTERNET VIA PERPLEXITY. HYPER-TARGETED ICP EXTRACTION. ENRICHED CSV OUTPUT.",
    label: 'SEARCH_ENGINE_V1',
  },
  {
    icon: Mail,
    title: '5_TOUCH_CAMPAIGNS',
    desc: "AUTONOMOUS EMAIL SEQUENCES. PAIN-LED HOOKS. FOMO CLOSING LOGIC. FULL DELIVERY SYNC.",
    label: 'DIPLO_UNIT_V2',
  },
  {
    icon: Zap,
    title: 'NEURAL_COPY_GEN',
    desc: "GPT-4O CONTEXT EXTRACTION. NO TEMPLATES. NATURAL REFERENCE INJECTION PER PROSPECT.",
    label: 'BRAIN_CORE_PRO',
  },
  {
    icon: Video,
    title: 'VSL_SCRIPTING',
    desc: "90-SECOND VIDEO SALES LETTERS. RETENTION-OPTIMIZED HOOKS. PROOF-OF-CONCEPT REVEALS.",
    label: 'VISUAL_SYNC_V1',
  },
  {
    icon: Linkedin,
    title: 'AUTHORITY_FEED',
    desc: "VALUE-FIRST LINKEDIN ASSETS. OPEN LOOP HOOKS. INDUSTRY INSIGHT SYTHESIS.",
    label: 'SOCIAL_NODE_V3',
  },
  {
    icon: Music2,
    title: 'VIRAL_PROTOCOLS',
    desc: "TIKTOK NATIVE SCRIPTS. ON-SCREEN CAPTION SEQUENCES. AUDIO DIRECTION & CTA LOGIC.",
    label: 'REACH_ENHANCER',
  },
];

const PLANS = [
  {
    id: "data-miner",
    name: "Data Miner",
    price: 10,
    priceSuffix: "/campaign",
    tagline: "K'LA builds you a pure list of 50 hyper-targeted leads.",
    highlight: false,
    features: [
      "Live Perplexity Internet Search",
      "Find 50 Top Companies in Niche",
      "Contact Enrichment (Email + Role)",
      "Export Clean CSV",
    ],
  },
  {
    id: "copywriter",
    name: "Copywriter",
    price: 25,
    priceSuffix: "/campaign",
    tagline: "K'LA mines 50 leads AND writes the entire email sequence.",
    highlight: false,
    features: [
      "Live Prospect Research",
      "GPT-4o Context Extraction",
      "5-Touch Cold Email Sequence",
      "LinkedIn + Ad Copy Variants",
      "A/B Subject Line Testing",
    ],
  },
  {
    id: "autonomous-sdr",
    name: "Autonomous SDR",
    price: 50,
    priceSuffix: "/mo",
    tagline: "K'LA runs the full growth engine — 24/7, on every channel, on autopilot.",
    highlight: true,
    features: [
      "Daily Automated Lead Search",
      "5-Touch Email + Follow-Up Flow",
      "X, Reddit, LinkedIn + TikTok Content",
      "VSL Script Generation",
      "30-Day Growth Plan",
      "Anti-Spam Delivery Logic",
      "Weekly Pipeline Reports",
      "10,000 SANC Tokens Included",
    ],
  },
];

const COMPARISON = [
  { feature: 'Multi-channel content generation', kla: true, polsia: true },
  { feature: 'Email outreach & sequences', kla: true, polsia: false },
  { feature: 'Live internet prospect mining', kla: true, polsia: false },
  { feature: 'VSL script generation', kla: true, polsia: false },
  { feature: 'TikTok viral scripts', kla: true, polsia: false },
  { feature: 'LinkedIn authority posts', kla: true, polsia: false },
  { feature: 'Anti-spam delivery logic', kla: true, polsia: false },
  { feature: 'Per-user campaign missions', kla: true, polsia: true },
  { feature: '30-day multi-channel growth plan', kla: true, polsia: false },
  { feature: 'SANC token rewards', kla: true, polsia: false },
];

export default function KLAPage() {
  const [currentStat, setCurrentStat] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCurrentStat(s => (s + 1) % STATS.length), 2500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-transparent text-white font-sans selection:bg-cyan-400 selection:text-black overflow-x-hidden">
      <title>K'LA | AI_GROWTH_DIRECTOR</title>
      <meta name="description" content="K'LA is an autonomous AI Growth Director. Prospecting, copywriting, and deployment at scale." />

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-24 pt-40">

        {/* ─── HERO ─────────────────────────────────────────────────────── */}
        <div className="text-center max-w-5xl mx-auto space-y-12 mb-40">
          <div className="inline-block bg-cyan-400 text-black px-6 py-2 font-black uppercase tracking-[0.4em] text-xs shadow-[0_0_15px_rgba(34,211,238,0.3)]">
            UNIT_SERIAL: K'LA_NODE_V2.5
          </div>

          <h1 className="text-7xl md:text-9xl font-black tracking-tighter uppercase leading-[0.85] text-white">
            <span className="bg-white text-black px-4">AUTONOMOUS</span><br />
            GROWTH_BRAIN
          </h1>

          <p className="text-2xl text-slate-400 font-bold uppercase tracking-widest max-w-3xl mx-auto leading-tight italic border-l-8 border-cyan-400 pl-8">
            K'LA DOESN'T JUST POST. SHE RUNS THE ENTIRE OPERATION. MINING, WRITING, DEPLOYING. 24/7. ZERO OVERHEAD.
          </p>

          {/* Live stat ticker */}
          <div className="flex items-center justify-center gap-12 py-10 glass-panel-heavy border-y border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            {STATS.map((s, i) => (
              <div key={s.label} className={`text-center transition-all duration-500 ${currentStat === i ? 'opacity-100 scale-110' : 'opacity-20 scale-100'}`}>
                <div className="text-4xl font-black text-white">{s.value}</div>
                <div className="text-[10px] text-cyan-500 font-black uppercase tracking-widest mt-2">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-8">
            <Link href="/kla/dashboard"
              className="px-10 py-5 bg-cyan-400 text-black font-black uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:bg-white transition-all flex items-center gap-2">
              OPEN_MARKETING_STUDIO <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/kla/services"
               className="px-10 py-5 bg-black/40 text-white font-black uppercase tracking-widest text-sm border-2 border-white/10 backdrop-blur-md hover:bg-white hover:text-black transition-all">
              COMMAND_UNIT
            </Link>
          </div>
        </div>

        {/* ─── CAPABILITY GRID ──────────────────────────────────────────── */}
        <section className="mb-40">
          <div className="mb-20">
            <div className="text-[10px] text-cyan-500 font-black uppercase tracking-[0.4em] mb-4">SYSTEM_CAPABILITIES // ACTIVE</div>
            <h2 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter italic underline decoration-cyan-400 decoration-8 underline-offset-8">6_CHANNELS. ONE_BRAIN.</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {CAPABILITIES.map(({ icon: Icon, title, desc, label }) => (
              <div key={title}
                className="p-10 glass-panel border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:-translate-y-2 transition-all group">
                <div className="w-14 h-14 bg-black border border-white/10 flex items-center justify-center mb-8 group-hover:bg-cyan-400 transition-colors">
                  <Icon className="w-7 h-7 text-white group-hover:text-black" />
                </div>
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 font-mono">[{label}]</div>
                <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-tight italic">{title}</h3>
                <p className="text-slate-400 font-bold uppercase text-xs tracking-widest leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── HOW IT WORKS ─────────────────────────────────────────────── */}
        <section className="mb-40">
          <div className="mb-16">
            <h2 className="text-5xl font-black text-white uppercase tracking-tighter italic underline decoration-white/20 decoration-8 underline-offset-8">EXECUTION_FLOW</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'DEFINE_TARGET', desc: "TELL K'LA YOUR NICHE, PRODUCT URL, AND VALUE PROP. SYSTEM INITIALIZATION IN 30S.", icon: Target },
              { step: '02', title: 'MINE_PROSPECTS', desc: "K'LA SCANS THE LIVE WEB FOR DECISION MAKERS. 50 ENRICHED NODES PER BATCH.", icon: Globe },
              { step: '03', title: 'GEN_CONTENT', desc: "K'LA WRITES PERSONALIZED EMAILS, SOCIAL ASSETS, VSL SCRIPTS — MULTI-CHANNEL SYNC.", icon: Zap },
              { step: '04', title: 'DEPLOY_SYNC', desc: "K'LA SENDS CAMPAIGNS AUTOMATICALLY. REAL-TIME PIPELINE REPORTING.", icon: TrendingUp },
            ].map(({ step, title, desc, icon: Icon }) => (
              <div key={step} className="glass-panel border-white/10 p-8 shadow-[0_15px_30px_rgba(0,0,0,0.5)]">
                <div className="text-6xl font-black text-white/5 font-mono mb-4">{step}</div>
                <div className="w-12 h-12 bg-black border border-white/10 flex items-center justify-center mb-6">
                  <Icon className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-xl font-black text-white mb-4 uppercase tracking-tight">{title}</h3>
                <p className="text-slate-500 font-bold uppercase text-[11px] tracking-widest leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── COMPARISON TABLE ─────────────────────────────────────────── */}
        <section className="mb-40">
          <div className="mb-16">
            <div className="text-[10px] text-cyan-500 font-black uppercase tracking-[0.3em] mb-4">BENCHMARK_ANALYSIS</div>
            <h2 className="text-5xl font-black text-white uppercase tracking-tighter italic">UNIT_SUPERIORITY</h2>
          </div>
          <div className="max-w-4xl border border-white/10 glass-panel-heavy shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden">
            <div className="grid grid-cols-3 bg-white text-black p-6">
              <div className="text-[10px] font-black uppercase tracking-[0.3em]">FEATURE_PROTOCOL</div>
              <div className="text-center font-black uppercase tracking-widest">K'LA_V2.5</div>
              <div className="text-center text-slate-400 font-black uppercase tracking-widest">LEGACY_AI</div>
            </div>
            {COMPARISON.map(({ feature, kla, polsia }, i) => (
              <div key={feature} className={`grid grid-cols-3 p-6 items-center border-b border-white/5 ${i % 2 === 0 ? 'bg-white/5' : ''}`}>
                <div className="text-white font-black uppercase text-xs tracking-widest">{feature}</div>
                <div className="text-center">{kla ? <span className="text-cyan-400 font-black text-2xl">[X]</span> : <span className="text-white/10">—</span>}</div>
                <div className="text-center">{polsia ? <span className="text-white/40 font-black text-lg">✓</span> : <span className="text-white/10">—</span>}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── PRICING ──────────────────────────────────────────────────── */}
        <section id="pricing" className="mb-40">
          <div className="mb-20">
            <h2 className="text-5xl font-black text-white uppercase tracking-tighter italic underline decoration-cyan-400 decoration-8 underline-offset-8">MISSION_SELECTION</h2>
            <p className="text-xl text-slate-500 font-black uppercase tracking-widest mt-4">THREE_SCALES. ONE_AUTONOMY.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {PLANS.map((plan) => (
              <div key={plan.id}
                className={`p-10 glass-panel flex flex-col relative transition-all duration-300 hover:-translate-y-2 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] ${
                  plan.highlight ? "border-cyan-400/50 shadow-[0_0_50px_rgba(34,211,238,0.1)]" : ""
                }`}>
                {plan.highlight && (
                  <div className="absolute -top-6 left-8 bg-cyan-400 text-black px-4 py-1 text-[10px] font-black uppercase tracking-[0.3em] shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                    OPTIMIZED_UNIT
                  </div>
                )}
                <h3 className="text-3xl font-black text-white mb-3 uppercase tracking-tight italic">{plan.name}</h3>
                <p className="text-slate-500 mb-8 text-xs font-black uppercase tracking-widest border-l-4 border-cyan-400/20 pl-4">{plan.tagline}</p>
                <div className="mb-10">
                  <span className="text-5xl font-black text-white tracking-tighter">${plan.price}</span>
                  <span className="text-cyan-500 font-black uppercase text-xs ml-2 tracking-widest">{plan.priceSuffix}</span>
                </div>
                <ul className="space-y-4 mb-12 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-4 text-slate-300 text-xs font-black uppercase tracking-wide">
                      <div className="w-3 h-3 bg-cyan-400 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <Link href="/kla/services"
                  className={`w-full py-5 font-black uppercase tracking-widest text-sm transition-all text-center border-2 ${
                    plan.highlight 
                      ? "bg-cyan-400 text-black border-cyan-400 hover:bg-white" 
                      : "bg-black text-white border-white/10 hover:bg-white hover:text-black"
                  }`}>
                  {plan.highlight ? "DEPLOY_ELITE_K'LA" : `LOAD [${plan.name.toUpperCase()}]`}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ─── FINAL CTA ────────────────────────────────────────────────── */}
        <section className="text-center py-40 glass-panel-heavy border-y border-white/10 overflow-hidden relative">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="relative">
            <div className="text-[10px] text-cyan-500 font-black uppercase tracking-[0.4em] mb-10">THE_AI_THAT_NEVER_OFFLINES</div>
            <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-10 italic leading-[0.85] text-white">
              K'LA GROWS_BUSINESS<br />
              <span className="text-slate-500 underline decoration-cyan-400 decoration-8 underline-offset-10">WHILE_YOU_SLEEP.</span>
            </h2>
            <p className="text-slate-400 font-black uppercase text-xl max-w-2xl mx-auto mb-16 tracking-widest leading-tight">
              SIX CHANNELS. FULL CAMPAIGN LIFECYCLE. ZERO OVERHEAD. START FIRST MISSION_SYNC_TODAY.
            </p>
            <div className="flex flex-col sm:flex-row gap-8 justify-center">
              <Link href="/kla/dashboard"
                className="px-12 py-6 bg-cyan-400 text-black font-black text-xl uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(34,211,238,0.2)] hover:bg-white flex items-center gap-4 justify-center">
                INITIALIZE_MAR_STUDIO <ArrowRight className="w-6 h-6" />
              </Link>
              <Link href="/kla/services"
                className="px-12 py-6 border-4 border-white text-white font-black text-xl uppercase tracking-widest transition-all hover:bg-white hover:text-black">
                VIEW_PRICING_TABLE
              </Link>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
