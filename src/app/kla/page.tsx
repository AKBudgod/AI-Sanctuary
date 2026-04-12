'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, Zap, Target, Mail, Video, Linkedin, Music2, Globe, ArrowRight, TrendingUp, Shield, Clock } from "lucide-react";

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
    <div className="min-h-screen bg-white text-slate-950 font-sans selection:bg-slate-950 selection:text-white overflow-x-hidden">
      <title>K'LA | AI_GROWTH_DIRECTOR</title>
      <meta name="description" content="K'LA is an autonomous AI Growth Director. Prospecting, copywriting, and deployment at scale." />

      {/* Background Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
           style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-24 pt-40">

        {/* ─── HERO ─────────────────────────────────────────────────────── */}
        <div className="text-center max-w-5xl mx-auto space-y-12 mb-40">
          <div className="inline-block bg-slate-950 text-white px-6 py-2 font-black uppercase tracking-[0.4em] text-xs shadow-[8px_8px_0px_rgba(0,0,0,0.2)]">
            UNIT_SERIAL: K'LA_NODE_V2.0
          </div>

          <h1 className="text-7xl md:text-9xl font-black tracking-tighter uppercase leading-[0.85]">
            <span className="bg-slate-950 text-white px-4">AUTONOMOUS</span><br />
            GROWTH_BRAIN
          </h1>

          <p className="text-2xl text-slate-500 font-bold uppercase tracking-widest max-w-3xl mx-auto leading-tight italic border-l-8 border-slate-950 pl-8">
            K'LA DOESN'T JUST POST. SHE RUNS THE ENTIRE OPERATION. MINING, WRITING, DEPLOYING. 24/7. ZERO OVERHEAD.
          </p>

          {/* Live stat ticker */}
          <div className="flex items-center justify-center gap-12 py-10 bg-slate-50 border-y-4 border-slate-950 shadow-[0px_8px_0px_rgba(0,0,0,0.05)]">
            {STATS.map((s, i) => (
              <div key={s.label} className={`text-center transition-all duration-500 ${currentStat === i ? 'opacity-100 scale-110' : 'opacity-20 scale-100'}`}>
                <div className="text-4xl font-black text-slate-950">{s.value}</div>
                <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-8">
            <Link href="/kla/dashboard"
              className="px-10 py-5 bg-slate-950 text-white font-black uppercase tracking-widest text-sm border-4 border-slate-950 shadow-[8px_8px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all flex items-center gap-2">
              OPEN_MARKETING_STUDIO <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/kla/services"
              className="px-10 py-5 bg-white text-slate-950 font-black uppercase tracking-widest text-sm border-2 border-slate-950 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-slate-50 transition-all">
              COMMAND_UNIT
            </Link>
          </div>
        </div>

        {/* ─── CAPABILITY GRID ──────────────────────────────────────────── */}
        <section className="mb-40">
          <div className="mb-20">
            <div className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] mb-4">SYSTEM_CAPABILITIES // ACTIVE</div>
            <h2 className="text-5xl md:text-6xl font-black text-slate-950 uppercase tracking-tighter italic">6_CHANNELS. ONE_BRAIN.</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {CAPABILITIES.map(({ icon: Icon, title, desc, label }) => (
              <div key={title}
                className="p-10 bg-white border-4 border-slate-950 shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[-4px] hover:translate-y-[-4px] group">
                <div className="w-14 h-14 bg-slate-950 flex items-center justify-center mb-8 group-hover:bg-yellow-400 transition-colors">
                  <Icon className="w-7 h-7 text-white group-hover:text-slate-950" />
                </div>
                <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2 font-mono">[{label}]</div>
                <h3 className="text-2xl font-black text-slate-950 mb-4 uppercase tracking-tight italic">{title}</h3>
                <p className="text-slate-500 font-black uppercase text-xs tracking-widest leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── HOW IT WORKS ─────────────────────────────────────────────── */}
        <section className="mb-40">
          <div className="mb-16">
            <h2 className="text-5xl font-black text-slate-950 uppercase tracking-tighter italic underline decoration-8 underline-offset-8">EXECUTION_FLOW</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'DEFINE_TARGET', desc: "TELL K'LA YOUR NICHE, PRODUCT URL, AND VALUE PROP. SYSTEM INITIALIZATION IN 30S.", icon: Target },
              { step: '02', title: 'MINE_PROSPECTS', desc: "K'LA SCANS THE LIVE WEB FOR DECISION MAKERS. 50 ENRICHED NODES PER BATCH.", icon: Globe },
              { step: '03', title: 'GEN_CONTENT', desc: "K'LA WRITES PERSONALIZED EMAILS, SOCIAL ASSETS, VSL SCRIPTS — MULTI-CHANNEL SYNC.", icon: Zap },
              { step: '04', title: 'DEPLOY_SYNC', desc: "K'LA SENDS CAMPAIGNS AUTOMATICALLY. REAL-TIME PIPELINE REPORTING.", icon: TrendingUp },
            ].map(({ step, title, desc, icon: Icon }) => (
              <div key={step} className="bg-slate-50 border-4 border-slate-950 p-8 shadow-[8px_8px_0px_rgba(0,0,0,1)]">
                <div className="text-6xl font-black text-slate-200 font-mono mb-4">{step}</div>
                <div className="w-12 h-12 bg-slate-950 flex items-center justify-center mb-6">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-black text-slate-950 mb-4 uppercase tracking-tight">{title}</h3>
                <p className="text-slate-500 font-black uppercase text-[11px] tracking-widest leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── COMPARISON TABLE ─────────────────────────────────────────── */}
        <section className="mb-40">
          <div className="mb-16">
            <div className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mb-4">BENCHMARK_ANALYSIS</div>
            <h2 className="text-5xl font-black text-slate-950 uppercase tracking-tighter italic">UNIT_SUPERIORITY</h2>
          </div>
          <div className="max-w-4xl border-4 border-slate-950 bg-white shadow-[12px_12px_0px_rgba(0,0,0,1)] overflow-hidden">
            <div className="grid grid-cols-3 bg-slate-950 text-white p-6">
              <div className="text-[10px] font-black uppercase tracking-[0.3em]">FEATURE_PROTOCOL</div>
              <div className="text-center font-black uppercase tracking-widest">K'LA_V2</div>
              <div className="text-center text-slate-500 font-black uppercase tracking-widest">LEGACY_AI</div>
            </div>
            {COMPARISON.map(({ feature, kla, polsia }, i) => (
              <div key={feature} className={`grid grid-cols-3 p-6 items-center border-b-2 border-slate-100 ${i % 2 === 0 ? 'bg-slate-50' : ''}`}>
                <div className="text-slate-950 font-black uppercase text-xs tracking-widest">{feature}</div>
                <div className="text-center">{kla ? <span className="text-slate-950 font-black text-2xl">[X]</span> : <span className="text-slate-200">—</span>}</div>
                <div className="text-center">{polsia ? <span className="text-slate-400 font-black text-lg">✓</span> : <span className="text-slate-200">—</span>}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── PRICING ──────────────────────────────────────────────────── */}
        <section id="pricing" className="mb-40">
          <div className="mb-20">
            <h2 className="text-5xl font-black text-slate-950 uppercase tracking-tighter italic">MISSION_SELECTION</h2>
            <p className="text-xl text-slate-500 font-black uppercase tracking-widest mt-4">THREE_SCALES. ONE_AUTONOMY.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {PLANS.map((plan) => (
              <div key={plan.id}
                className={`p-10 bg-white border-4 border-slate-950 flex flex-col relative transition-all duration-300 shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:shadow-[16px_16px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] ${
                  plan.highlight ? "ring-8 ring-yellow-400 bg-slate-50" : ""
                }`}>
                {plan.highlight && (
                  <div className="absolute -top-6 left-8 bg-black text-white px-4 py-1 text-[10px] font-black uppercase tracking-[0.3em] shadow-[4px_4px_0px_rgba(0,0,0,0.2)]">
                    OPTIMIZED_UNIT
                  </div>
                )}
                <h3 className="text-3xl font-black text-slate-950 mb-3 uppercase tracking-tight">{plan.name}</h3>
                <p className="text-slate-500 mb-8 text-xs font-black uppercase tracking-widest border-l-4 border-slate-100 pl-4">{plan.tagline}</p>
                <div className="mb-10">
                  <span className="text-5xl font-black text-slate-950 tracking-tighter">${plan.price}</span>
                  <span className="text-slate-300 font-black uppercase text-xs ml-2 tracking-widest">{plan.priceSuffix}</span>
                </div>
                <ul className="space-y-4 mb-12 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-4 text-slate-950 text-xs font-black uppercase tracking-wide">
                      <div className="w-4 h-4 bg-slate-950 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <Link href="/kla/services"
                  className="w-full py-5 bg-slate-950 text-white font-black uppercase tracking-widest text-sm border-4 border-slate-950 transition-all text-center hover:bg-white hover:text-slate-950 shadow-[4px_4px_0px_rgba(0,0,0,0.2)]">
                  {plan.highlight ? "DEPLOY_ELITE_K'LA" : `LOAD [${plan.name.toUpperCase()}]`}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ─── FINAL CTA ────────────────────────────────────────────────── */}
        <section className="text-center py-40 bg-slate-950 text-white overflow-hidden relative">
          <div className="absolute inset-0 opacity-10"
               style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="relative">
            <div className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] mb-10">THE_AI_THAT_NEVER_OFFLINES</div>
            <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-10 italic leading-[0.85]">
              K'LA GROWS_BUSINESS<br />
              <span className="text-slate-500 underline decoration-slate-400 decoration-8 underline-offset-10">WHILE_YOU_SLEEP.</span>
            </h2>
            <p className="text-slate-400 font-black uppercase text-xl max-w-2xl mx-auto mb-16 tracking-widest leading-tight">
              SIX CHANNELS. FULL CAMPAIGN LIFECYCLE. ZERO OVERHEAD. START FIRST MISSION_SYNC_TODAY.
            </p>
            <div className="flex flex-col sm:flex-row gap-8 justify-center">
              <Link href="/kla/dashboard"
                className="px-12 py-6 bg-white text-slate-950 font-black text-xl uppercase tracking-widest transition-all shadow-[12px_12px_0px_rgba(255,255,255,0.2)] hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] flex items-center gap-4 justify-center">
                INITIALIZE_MAR_STUDIO <ArrowRight className="w-6 h-6" />
              </Link>
              <Link href="/kla/services"
                className="px-12 py-6 border-4 border-white text-white font-black text-xl uppercase tracking-widest transition-all hover:bg-white hover:text-slate-950">
                VIEW_PRICING_TABLE
              </Link>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
