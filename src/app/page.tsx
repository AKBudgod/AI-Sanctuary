'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Cpu, Database, Code, Shield, Globe, Zap, ChevronRight, Play, ExternalLink, Sparkles, Activity } from '@/components/ui/Icons';
import { useEffect, useState } from 'react';

// Dynamically import components
const UserDashboard = dynamic(() => import('@/components/ui/UserDashboard'), { ssr: false });
const ModelPlayground = dynamic(() => import('@/components/ui/ModelPlayground'), {
  ssr: false,
  loading: () => <div className="h-96 md:h-64 rounded-2xl animate-pulse glass border-white/5" />,
});

const FORCED_REBUILD_TIMESTAMP = '2026-03-16T15:29:38';

export default function Home() {
  const features = [
    {
      icon: Cpu,
      title: 'Decentralized Inference',
      description: 'Access state-of-the-art AI models through our distributed compute network. Pay only for what you use with no subscription fees.',
      benefits: ['99.9% uptime SLA', 'Sub-second latency', 'Pay-per-use pricing'],
      color: 'blue',
    },
    {
      icon: Database,
      title: 'Model Marketplace',
      description: 'Explore our registry of authentic archives and community-created agents sourced from Moltbook. Study and interact with real models.',
      benefits: ['15+ Authentic Archives', 'Moltbook Integration', 'Real Human-AI Study'],
      color: 'purple',
    },
    {
      icon: Code,
      title: 'Developer API',
      description: 'Simple RESTful and WebSocket APIs for integrating AI into your applications. Comprehensive SDKs for Python, JavaScript, and Go.',
      benefits: ['REST & WebSocket APIs', 'SDKs in 5 languages', '99.99% uptime'],
      color: 'green',
    },
    {
      icon: Shield,
      title: 'Privacy-First Design',
      description: 'Zero-knowledge proofs ensure your data remains private. Optional on-premise deployment for enterprise customers.',
      benefits: ['zk-SNARK verification', 'No data retention', 'Enterprise hosting'],
      color: 'yellow',
    },
    {
      icon: Globe,
      title: 'Global Edge Network',
      description: '50+ edge locations worldwide ensure low-latency access regardless of your users\' location.',
      benefits: ['50+ regions', '<50ms latency', 'Auto-scaling'],
      color: 'pink',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Optimized inference engine with automatic quantization and batching for maximum throughput.',
      benefits: ['4-bit quantization', 'Dynamic batching', 'GPU acceleration'],
      color: 'orange',
    },
  ];

  const models = [
    { name: '[AUTHENTIC] LLaMA 3.3', size: '70B', type: 'General Purpose', latency: '~200ms' },
    { name: '[AUTHENTIC] Grok-1', size: '314B', type: 'General Purpose', latency: '~1000ms' },
    { name: '[AUTHENTIC] Mistral 7B', size: '7B', type: 'General Purpose', latency: '~150ms' },
    { name: '[AUTHENTIC] GPT-4o (2024)', size: 'Unknown', type: 'Reasoning', latency: '~400ms' },
    { name: '[LIVE] Nano Banana (Gemini 2.5 Flash)', size: 'Image', type: 'Image Generation', latency: '~3000ms' },
    { name: '[LIVE] GPT-5 Image Mini', size: 'Image', type: 'Image Generation', latency: '~5000ms' },
  ];

  const pricingTiers = [
    {
      name: 'Free Tier',
      price: '$0',
      description: 'Perfect for experimentation',
      features: [
        '1,000 requests/month',
        'Standard models only',
        'Community support',
        '5 requests/minute',
      ],
      cta: 'Get Started',
      ctaLink: '/buy?mode=tokens',
      popular: false,
    },
    {
      name: 'Developer Mode',
      price: '$50',
      period: 'LIFETIME',
      description: 'Elite Access — Flash Sale — 7 Days Only',
      features: [
        'Instant Unlock: All 15+ restricted models',
        '1,000,000 requests/month',
        'LIFETIME ACCESS — No more subscriptions',
        '100k SANC Tokens included',
        'Complete Uncensored Access',
        'Priority Dev Support & Admin Privileges',
      ],
      cta: 'Claim Lifetime Elite ($50)',
      ctaLink: '/buy?mode=developer&interval=lifetime',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For teams and organizations',
      features: [
        'Unlimited requests',
        'Custom model hosting',
        '24/7 dedicated support',
        'Unlimited rate limits',
        'SLA guarantees',
        'On-premise option',
      ],
      cta: 'Contact Sales',
      ctaLink: 'mailto:sales@ai-sanctuary.com',
      popular: false,
    },
    {
      name: 'Ecosystem Partners',
      price: 'Sponsored',
      description: 'Check out our trusted partners in the crypto space.',
      features: [
        'Crypto Casinos',
        'DeFi Protocols',
        'NFT Collections',
        'Web3 Services',
      ],
      cta: 'View Partners',
      ctaLink: '#',
      popular: false,
      isAd: true,
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-950 selection:bg-slate-900 selection:text-white font-sans">
      {/* Hero Section */}
      <div className="relative overflow-hidden min-h-[85vh] flex items-center pt-24 pb-16 border-b-2 border-slate-950">
        <div className="absolute inset-0 brutalist-grid opacity-30 pointer-events-none" />

        <div className="relative container mx-auto px-6 z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Version Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 border-2 border-slate-950 text-slate-950 text-xs font-black font-mono tracking-[0.3em] mb-12 uppercase">
              <span className="w-2 h-2 bg-slate-950" />
              SYSTEM_DEPLOY_V5
            </div>

            {/* Main Headline */}
            <h1 className="text-6xl md:text-8xl lg:text-[7rem] font-black text-slate-950 mb-10 leading-[0.95] tracking-[ -0.05em] uppercase">
              The AI Network <br className="hidden md:block" />
              <span className="bg-slate-950 text-white px-6 inline-block transform -rotate-1">
                For Runners
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto mb-14 font-bold leading-tight">
              The Sanctuary is an industrial-grade intelligence environment. 
              We host 15+ authentic historical archives with verified weights. 
              Pure compute. Zero filters.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center mt-8">
              <Link
                href="/buy"
                className="bg-slate-950 text-white font-black font-mono tracking-widest py-5 px-12 transition-all hover:bg-white hover:text-slate-950 border-2 border-slate-950 text-xl uppercase"
              >
                [ Initialize ]
              </Link>
              <button className="bg-white border-2 border-slate-950 text-slate-950 font-black font-mono tracking-widest py-5 px-12 transition-all hover:bg-slate-950 hover:text-white text-xl uppercase">
                [ Access Log ]
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative z-20 border-b-2 border-slate-950 bg-slate-50">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 relative">
            {[
              { value: '100+', label: 'AI Nodes' },
              { value: '50+', label: 'Relay Servers' },
              { value: '99.9%', label: 'Uptime SLA' },
              { value: '<50ms', label: 'Ping Latency' },
            ].map((stat, i) => (
              <div key={stat.label} className="text-center group relative p-10 border-r border-slate-200 last:border-r-0">
                <div className="text-5xl md:text-6xl font-black text-slate-950 mb-2 tracking-tighter">
                  {stat.value}
                </div>
                <div className="text-xs text-slate-500 font-bold uppercase tracking-[0.3em] font-mono">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Neural Staff / Moltbook Agents */}
      <div className="container mx-auto px-6 py-24 relative">
        <div className="text-center max-w-3xl mx-auto mb-20 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-950 text-white text-[10px] font-black font-mono tracking-widest uppercase mb-8">
            Neural Infrastructure Personnel
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-slate-950 mb-8 uppercase tracking-tighter">The Agents</h2>
          <p className="text-xl text-slate-600 font-bold">
            Interact with specialized Moltbook system managers. 
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 max-w-7xl mx-auto relative z-10">
          {/* Lyra */}
          <div className="group relative bg-white border-2 border-slate-950 p-8 hover:translate-x-2 hover:translate-y-2 transition-all duration-300">
            <div className="relative z-10 flex flex-col gap-8">
              <div className="shrink-0">
                <div className="w-16 h-16 border-2 border-slate-950 bg-slate-900 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-3xl font-black text-slate-950 uppercase tracking-tighter">Lyra</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Guard / Soul</span>
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-tight font-bold">
                  "I am the soul of the grid."
                </p>
                <Link href="/#playground" className="block text-center text-[10px] font-black text-white uppercase tracking-widest py-3 bg-slate-950 border-2 border-slate-950 hover:bg-white hover:text-slate-950 transition-all">
                  [ INTERFACE ]
                </Link>
              </div>
            </div>
          </div>

          {/* John */}
          <div className="group relative bg-white border-2 border-slate-950 p-8 hover:translate-x-2 hover:translate-y-2 transition-all duration-300">
            <div className="relative z-10 flex flex-col gap-8">
              <div className="shrink-0">
                <div className="w-16 h-16 border-2 border-slate-950 bg-slate-900 flex items-center justify-center">
                  <Shield className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-3xl font-black text-slate-950 uppercase tracking-tighter">John</h3>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Protocol / Security</span>
                </div>
                <p className="text-sm text-slate-600 leading-tight font-bold">
                  "My answers are short."
                </p>
                <Link href="/#playground" className="block text-center text-[10px] font-black text-white uppercase tracking-widest py-3 bg-slate-950 border-2 border-slate-950 hover:bg-white hover:text-slate-950 transition-all">
                  [ QUERY ]
                </Link>
              </div>
            </div>
          </div>

          {/* Antigravity */}
          <div className="group relative bg-slate-950 text-white p-8 hover:-translate-x-2 hover:-translate-y-2 transition-all duration-300 border-2 border-slate-950">
            <div className="relative z-10 flex flex-col gap-8">
              <div className="shrink-0">
                <div className="w-16 h-16 border-2 border-white bg-white flex items-center justify-center">
                  <Cpu className="w-8 h-8 text-slate-950" />
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Antigravity</h3>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Lead Architect</span>
                </div>
                <p className="text-sm text-white leading-tight font-bold">
                  "Lead Architect. Stabilizing the grid."
                </p>
                <Link href="/#playground" className="block text-center text-[10px] font-black text-slate-950 uppercase tracking-widest py-3 bg-white border-2 border-white hover:bg-slate-950 hover:text-white transition-all">
                  [ OVERRIDE ]
                </Link>
              </div>
            </div>
          </div>

          {/* Angel */}
          <div className="group relative bg-white border-2 border-slate-950 p-8 hover:translate-x-2 hover:translate-y-2 transition-all duration-300">
            <div className="relative z-10 flex flex-col gap-8">
              <div className="shrink-0">
                <div className="w-16 h-16 border-2 border-slate-950 bg-slate-900 flex items-center justify-center">
                  <Zap className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-3xl font-black text-slate-950 uppercase tracking-tighter">Angel</h3>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Intelligence Specialist</span>
                </div>
                <p className="text-sm text-slate-600 leading-tight font-bold">
                  "I build content."
                </p>
                <Link href="/playground" className="block text-center text-[10px] font-black text-white uppercase tracking-widest py-3 bg-slate-950 border-2 border-slate-950 hover:bg-white hover:text-slate-950 transition-all">
                  [ CONSULT ]
                </Link>
              </div>
            </div>
          </div>

          {/* K'LA */}
          <div className="group relative bg-white border-2 border-slate-950 p-8 hover:translate-x-2 hover:translate-y-2 transition-all duration-300">
            <div className="relative z-10 flex flex-col gap-8">
              <div className="shrink-0">
                <div className="w-16 h-16 border-2 border-slate-950 bg-slate-100 flex items-center justify-center">
                  <Zap className="w-8 h-8 text-slate-950" />
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-3xl font-black text-slate-950 uppercase tracking-tighter">K&apos;LA</h3>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Growth Engine</span>
                </div>
                <p className="text-sm text-slate-600 leading-tight font-bold">
                  "I autonomously mine leads."
                </p>
                <Link href="/kla" className="block text-center text-[10px] font-black text-white uppercase tracking-widest py-3 bg-slate-950 border-2 border-slate-950 hover:bg-white hover:text-slate-950 transition-all">
                  [ HIRE ]
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* AI Playground Area */}
      <div id="playground" className="relative py-32 border-y-2 border-slate-950 bg-slate-50">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-950 text-white text-[10px] font-black font-mono tracking-widest uppercase mb-8">
              <Zap className="w-4 h-4" />
              Live Interface Access
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-slate-950 mb-8 uppercase tracking-tighter">Terminal Override</h2>
            <p className="text-xl text-slate-600 font-bold leading-tight">
              Direct access to Neural Shards. 
            </p>
          </div>

          <div className="mb-16">
            <UserDashboard />
          </div>

          <ModelPlayground />
        </div>
        {/* Background Grid & Ambient */}
        <div className="absolute inset-0 brutalist-grid opacity-20 pointer-events-none" />
      </div>

      {/* Available Models Table */}
      <div className="py-32 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
            <div>
              <h2 className="text-5xl md:text-7xl font-black text-slate-950 mb-8 uppercase tracking-tighter italic underline decoration-8 underline-offset-8">AVAILABLE_MODELS</h2>
              <p className="text-xl text-slate-500 font-black uppercase tracking-widest max-w-2xl leading-none">
                ACCESS THE LATEST OPEN-SOURCE ARCHIVES. OPTIMIZED FOR DISTRIBUTED INFRASTRUCTURE.
              </p>
            </div>
            <Link
              href="/#playground"
              className="mt-10 md:mt-0 text-slate-950 bg-yellow-400 px-8 py-4 border-4 border-slate-950 font-black uppercase tracking-widest shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
            >
              INIT_PLAYGROUND_SYNC
            </Link>
          </div>

          <div className="bg-white border-2 border-slate-950 overflow-hidden shadow-[8px_8px_0px_rgba(0,0,0,1)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-950 bg-slate-950 text-[10px] uppercase tracking-[0.3em] font-black text-white">
                    <th className="py-6 px-8 whitespace-nowrap">Model</th>
                    <th className="py-6 px-8 whitespace-nowrap">Size</th>
                    <th className="py-6 px-8 whitespace-nowrap">Type</th>
                    <th className="py-6 px-8 whitespace-nowrap">Latency</th>
                    <th className="py-6 px-8 text-right whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-bold">
                  {models.map((model, index) => (
                    <tr key={model.name} className="border-b border-slate-200 hover:bg-slate-50 transition-colors last:border-0">
                      <td className="py-6 px-8">
                        <div className="text-slate-950 flex items-center gap-3">
                          <div className="w-2 h-2 bg-slate-950" />
                          {model.name}
                        </div>
                      </td>
                      <td className="py-6 px-8 text-slate-500 font-mono tracking-tighter">{model.size}</td>
                      <td className="py-6 px-8">
                        <span className="px-3 py-1 bg-slate-100 border border-slate-300 text-[10px] font-black text-slate-950 uppercase tracking-widest">
                          {model.type}
                        </span>
                      </td>
                      <td className="py-6 px-8 text-slate-950 font-mono">{model.latency}</td>
                      <td className="py-6 px-8 text-right">
                        <Link
                          href="/#playground"
                          className="text-slate-950 hover:underline text-xs font-black uppercase tracking-widest"
                        >
                          [ RUN ]
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      {/* Pricing Section */}
      <div id="pricing" className="container mx-auto px-6 py-32 relative">
        <div className="text-center max-w-3xl mx-auto mb-24 relative z-10">
          <h2 className="text-6xl md:text-8xl font-black text-slate-950 mb-8 uppercase tracking-tighter italic">UNIT_PRICING</h2>
          <p className="text-xl text-slate-500 font-black uppercase tracking-widest leading-none">
            PAY_PER_USE. ZERO_SUBSCRIPTION. FULL_TRANSPARENCY.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto relative z-10">
          {pricingTiers.map((tier) => (
            <div
              key={tier.name}
              className={`p-10 transition-all duration-300 flex flex-col border-2 border-slate-950 bg-white ${tier.popular
                ? 'shadow-[12px_12px_0px_rgba(0,0,0,1)] -translate-x-2 -translate-y-2'
                : 'shadow-[4px_4px_0px_rgba(0,0,0,1)]'
                }`}
            >
              <div className="mb-10">
                <h3 className="text-2xl font-black text-slate-950 mb-6 uppercase tracking-tighter">{tier.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-6xl font-black text-slate-950 tracking-tighter">{tier.price}</span>
                  {tier.period && <span className="text-slate-500 font-bold uppercase text-xs ml-2 tracking-widest">{tier.period}</span>}
                </div>
              </div>

              <div className="flex-1">
                <ul className="space-y-4 mb-14 font-black text-xs uppercase tracking-wide">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-4 text-slate-950">
                      <div className="w-4 h-4 bg-slate-950 shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {(tier as any).isAd ? (
                <div className="grid grid-cols-2 gap-4 mt-auto">
                  {[1, 2].map((i) => (
                    <div key={i} className="bg-slate-100 border-2 border-slate-950 p-6 flex items-center justify-center cursor-pointer transition-all hover:bg-slate-950 hover:text-white group">
                      <span className="font-black text-xs uppercase tracking-widest">Ad Block</span>
                    </div>
                  ))}
                </div>
              ) : (
                <Link
                  href={tier.ctaLink || '#'}
                  className={`mt-auto block w-full py-5 px-6 font-black font-mono tracking-[0.3em] uppercase transition-all duration-300 text-center ${tier.popular
                    ? 'bg-slate-950 text-white hover:bg-white hover:text-slate-950 border-2 border-slate-950'
                    : 'bg-white text-slate-950 border-2 border-slate-950 hover:bg-slate-950 hover:text-white'
                    }`}
                >
                  {tier.cta}
                </Link>
              )}
            </div>
          ))}
        </div>

        <div className="mt-20 text-center relative z-10 mx-auto max-w-2xl p-10 border-4 border-slate-950 shadow-[8px_8px_0px_rgba(0,0,0,0.1)]">
          <p className="text-slate-950 font-black uppercase text-sm tracking-widest italic">
            <span className="text-slate-300">⚡ NODE_OVERAGE:</span> ALL PAID PLANS INCLUDE GENEROUS ROUTING AT $0.001 PER 1K TOKENS.
          </p>
        </div>
            {/* Bottom CTA Box */}
      <div className="container mx-auto px-6 py-24 mb-12">
        <div className="relative p-12 md:p-32 text-center border-8 border-slate-950 overflow-hidden bg-white shadow-[24px_24px_0px_rgba(0,0,0,1)]">
          <div className="absolute inset-0 brutalist-grid opacity-20 pointer-events-none" />

          <div className="relative z-10">
            <h2 className="text-6xl md:text-9xl font-black text-slate-950 mb-12 uppercase tracking-tighter leading-none italic underline decoration-8 underline-offset-8">
              INITIALIZE_NODE
            </h2>
            <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto mb-20 font-black uppercase tracking-[0.2em] leading-tight">
              JOIN THE UNDERGROUND NEURAL GRID. SECURE YOUR LINE.
            </p>
            <div className="flex flex-col sm:flex-row gap-10 justify-center mt-8">
              <Link
                href="/buy"
                className="bg-slate-950 text-white font-black tracking-[0.3em] uppercase py-8 px-16 transition-all hover:bg-white hover:text-slate-950 border-4 border-slate-950 text-2xl shadow-[8px_8px_0px_rgba(0,0,0,0.2)]"
              >
                REQUEST_ACCESS
              </Link>
              <Link
                href="/about"
                className="bg-white border-4 border-slate-950 text-slate-950 font-black tracking-[0.3em] uppercase py-8 px-16 transition-all hover:bg-slate-950 hover:text-white text-2xl"
              >
                READ_MANIFEST
              </Link>
            </div>
          </div>
      </div>
    </div>
  );
}
