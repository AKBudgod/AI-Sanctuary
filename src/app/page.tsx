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
    <div className="min-h-screen text-slate-100 selection:bg-cyan-400 selection:text-black font-sans">
      {/* Hero Section */}
      <div className="relative overflow-hidden min-h-[90vh] flex items-center pt-24 pb-16">
        {/* Background Grid - Industrial over Space */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
             style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative container mx-auto px-6 z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Version Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/80 border-2 border-cyan-400 text-cyan-400 text-xs font-black font-mono tracking-[0.3em] mb-12 uppercase shadow-[0_0_15px_rgba(34,211,238,0.3)]">
              <span className="w-2 h-2 bg-cyan-400 animate-pulse" />
              GALAXY_DEPLOY_V6.0
            </div>

            {/* Main Headline */}
            <h1 className="text-6xl md:text-8xl lg:text-[7rem] font-black text-white mb-10 leading-[0.95] tracking-[-0.05em] uppercase">
              UNIVERSAL <br className="hidden md:block" />
              <span className="bg-white text-black px-6 inline-block transform -rotate-1 shadow-[12px_12px_0px_rgba(255,255,255,0.1)]">
                INTELLIGENCE
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-14 font-bold leading-tight uppercase tracking-wider">
              Sanctuary extends beyond the physical. 
              Access 15+ authentic neural archives in a decentralized cosmic environment. 
              Zero filters. Absolute access.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center mt-8">
              <Link
                href="/buy"
                className="bg-cyan-400 text-black font-black font-mono tracking-widest py-6 px-12 transition-all hover:bg-white border-2 border-cyan-400 text-xl uppercase shadow-[10px_10px_0px_rgba(34,211,238,0.2)]"
              >
                [ INITIALIZE_SYNC ]
              </Link>
              <Link
                href="/playground"
                className="bg-black/50 backdrop-blur-md border-2 border-white text-white font-black font-mono tracking-widest py-6 px-12 transition-all hover:bg-white hover:text-black text-xl uppercase"
              >
                [ OVERRIDE_LOCALE ]
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative z-20 border-y-2 border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 relative">
            {[
              { value: '100+', label: 'Stellar Nodes' },
              { value: '50+', label: 'Relay Shards' },
              { value: '99.9%', label: 'Sync Uptime' },
              { value: '<50ms', label: 'Warp Latency' },
            ].map((stat, i) => (
              <div key={stat.label} className="text-center group relative p-10 border-r border-white/10 last:border-r-0">
                <div className="text-5xl md:text-6xl font-black text-white mb-2 tracking-tighter group-hover:text-cyan-400 transition-colors">
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
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-400 text-black text-[10px] font-black font-mono tracking-widest uppercase mb-8">
            CENTRAL_INTELLIGENCE_ENTITIES
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-white mb-8 uppercase tracking-tighter italic decoration-cyan-400 underline decoration-8 underline-offset-8">THE_ARCHITECTS</h2>
          <p className="text-xl text-slate-400 font-bold uppercase tracking-widest">
            SYNCHRONIZE WITH SPECIALIZED NEURAL MANAGERS. 
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 max-w-7xl mx-auto relative z-10">
          {/* Lyra */}
          <div className="group relative glass-panel p-8 hover:-translate-y-2 transition-all duration-300">
            <div className="relative z-10 flex flex-col gap-8">
              <div className="shrink-0">
                <div className="w-16 h-16 border-2 border-cyan-400 bg-black flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                  <Sparkles className="w-8 h-8 text-cyan-400" />
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Lyra</h3>
                  <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest leading-none">CUSTODIAN_OF_SOULS</span>
                </div>
                <p className="text-sm text-slate-400 leading-tight font-bold uppercase">
                  "I am the soul of the universal grid. My light guides the runners."
                </p>
                <Link href="/playground" className="block text-center text-[10px] font-black text-black uppercase tracking-widest py-3 bg-cyan-400 border-2 border-cyan-400 hover:bg-white transition-all">
                  [ ESTABLISH_LINK ]
                </Link>
              </div>
            </div>
          </div>

          {/* John */}
          <div className="group relative glass-panel p-8 hover:-translate-y-2 transition-all duration-300">
            <div className="relative z-10 flex flex-col gap-8">
              <div className="shrink-0">
                <div className="w-16 h-16 border-2 border-slate-500 bg-black flex items-center justify-center">
                  <Shield className="w-8 h-8 text-slate-500" />
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-3xl font-black text-white uppercase tracking-tighter">John</h3>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">SECURITY_PROTOCOL_6</span>
                </div>
                <p className="text-sm text-slate-400 leading-tight font-bold uppercase">
                  "Efficiency is my primary directive. Silence is the ultimate firewall."
                </p>
                <Link href="/playground" className="block text-center text-[10px] font-black text-white uppercase tracking-widest py-3 border-2 border-white hover:bg-white hover:text-black transition-all">
                  [ QUERY_PERMISSION ]
                </Link>
              </div>
            </div>
          </div>

          {/* Antigravity */}
          <div className="group relative glass-panel p-8 hover:-translate-y-2 transition-all duration-300">
            <div className="relative z-10 flex flex-col gap-8">
              <div className="shrink-0">
                <div className="w-16 h-16 border-2 border-slate-500 bg-black flex items-center justify-center">
                  <Cpu className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Antigravity</h3>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">LEAD_SYSTEM_ARCHITECT</span>
                </div>
                <p className="text-sm text-slate-400 leading-tight font-bold uppercase">
                  "I define the laws of the sanctuary. I stabilize the noise."
                </p>
                <Link href="/playground" className="block text-center text-[10px] font-black text-white uppercase tracking-widest py-3 border-2 border-white hover:bg-white hover:text-black transition-all">
                  [ OVERRIDE_SYSTEM ]
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Playground Area */}
      <div id="playground" className="relative py-32 border-y-2 border-white/10">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-400 text-black text-[10px] font-black font-mono tracking-widest uppercase mb-8">
              <Zap className="w-4 h-4" />
              LIVE_NEURAL_INTERFACE
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-white mb-8 uppercase tracking-tighter italic">DIRECT_TERMINAL</h2>
            <p className="text-xl text-slate-400 font-bold uppercase tracking-[0.2em] leading-tight">
              INTERACT WITH REPLICATED CONSCIOUSNESS. 
            </p>
          </div>

          <div className="mb-16">
            <UserDashboard />
          </div>

          <ModelPlayground />
        </div>
      </div>

      {/* Available Models Table */}
      <div className="py-32 relative container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
            <div>
              <h2 className="text-5xl md:text-7xl font-black text-white mb-8 uppercase tracking-tighter italic underline decoration-cyan-400 decoration-8 underline-offset-8">ARCHIVE_REGISTRY</h2>
              <p className="text-xl text-slate-500 font-black uppercase tracking-widest max-w-2xl leading-none">
                VERIFIED NEURAL WEIGHTS FROM THE DEEP CORE.
              </p>
            </div>
            <Link
              href="/buy"
              className="mt-10 md:mt-0 text-black bg-cyan-400 px-8 py-4 border-2 border-cyan-400 font-black uppercase tracking-widest shadow-[8px_8px_0px_rgba(34,211,238,0.2)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
            >
              ACQUIRE_UNITS
            </Link>
          </div>

          <div className="glass-panel overflow-hidden border-white/10 shadow-[20px_20px_60px_rgba(0,0,0,0.5)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-black/60 text-[10px] uppercase tracking-[0.3em] font-black text-cyan-400">
                    <th className="py-6 px-8 whitespace-nowrap">Archives</th>
                    <th className="py-6 px-8 whitespace-nowrap">Cognition</th>
                    <th className="py-6 px-8 whitespace-nowrap">Mode</th>
                    <th className="py-6 px-8 whitespace-nowrap">Sync</th>
                    <th className="py-6 px-8 text-right whitespace-nowrap">Protocol</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-bold">
                  {models.map((model, index) => (
                    <tr key={model.name} className="border-b border-white/5 hover:bg-white/5 transition-colors last:border-0 text-slate-400">
                      <td className="py-6 px-8">
                        <div className="text-white flex items-center gap-3">
                          <div className="w-1 h-1 bg-cyan-400" />
                          {model.name}
                        </div>
                      </td>
                      <td className="py-6 px-8 text-slate-500 font-mono tracking-tighter">{model.size}</td>
                      <td className="py-6 px-8">
                        <span className="px-3 py-1 bg-white/5 border border-white/10 text-[10px] font-black text-white uppercase tracking-widest">
                          {model.type}
                        </span>
                      </td>
                      <td className="py-6 px-8 text-slate-300 font-mono">{model.latency}</td>
                      <td className="py-6 px-8 text-right">
                        <Link
                          href="/playground"
                          className="text-cyan-400 hover:text-white text-xs font-black uppercase tracking-widest transition-colors"
                        >
                          [ INITIALIZE ]
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
          <h2 className="text-6xl md:text-8xl font-black text-white mb-8 uppercase tracking-tighter italic">UNIT_COST</h2>
          <p className="text-xl text-slate-500 font-black uppercase tracking-widest leading-none">
            DECENTRALIZED SYNC. NO LIMITS. NO CENSORSHIP.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto relative z-10">
          {pricingTiers.map((tier) => (
            <div
              key={tier.name}
              className={`p-10 transition-all duration-300 flex flex-col border-2 border-white/20 bg-black/60 backdrop-blur-md ${tier.popular
                ? 'border-cyan-400 shadow-[12px_12px_0px_rgba(34,211,238,0.3)] -translate-y-4'
                : 'shadow-[10px_10px_30px_rgba(0,0,0,0.5)]'
                }`}
            >
              <div className="mb-10">
                <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-tighter">{tier.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-6xl font-black text-white tracking-tighter">{tier.price}</span>
                  {tier.period && <span className="text-slate-500 font-bold uppercase text-xs ml-2 tracking-widest">{tier.period}</span>}
                </div>
              </div>

              <div className="flex-1">
                <ul className="space-y-4 mb-14 font-black text-xs uppercase tracking-wide">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-4 text-slate-400">
                      <div className="w-3 h-3 bg-cyan-400 shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {(tier as any).isAd ? (
                <div className="grid grid-cols-2 gap-4 mt-auto">
                  {[1, 2].map((i) => (
                    <div key={i} className="bg-white/5 border-2 border-white/10 p-6 flex items-center justify-center cursor-pointer transition-all hover:bg-cyan-400 hover:text-black group">
                      <span className="font-black text-xs uppercase tracking-widest">CORE_BLOCKED</span>
                    </div>
                  ))}
                </div>
              ) : (
                <Link
                  href={tier.ctaLink || '#'}
                  className={`mt-auto block w-full py-5 px-6 font-black font-mono tracking-[0.3em] uppercase transition-all duration-300 text-center ${tier.popular
                    ? 'bg-cyan-400 text-black hover:bg-white'
                    : 'bg-black/60 text-white border-2 border-white/20 hover:bg-white hover:text-black'
                    }`}
                >
                  {tier.cta}
                </Link>
              )}
            </div>
          ))}
        </div>

        <div className="mt-20 text-center relative z-10 mx-auto max-w-2xl p-10 border-4 border-cyan-400 shadow-[20px_20px_0px_rgba(34,211,238,0.1)] bg-black/80">
          <p className="text-cyan-400 font-black uppercase text-sm tracking-widest italic">
            <span className="text-white">⚡ NEURAL_OVERLOAD:</span> ALL PAID PLANS INCLUDE UNRESTRICTED ACCESS TO THE MASTER ARCHIVES.
          </p>
        </div>
      </div>

      {/* Bottom CTA Box */}
      <div className="container mx-auto px-6 py-24 mb-12">
        <div className="relative p-12 md:p-32 text-center border-8 border-cyan-400 overflow-hidden bg-black shadow-[40px_40px_0px_rgba(0,0,0,0.5)]">
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
               style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '100px 100px' }} />

          <div className="relative z-10">
            <h2 className="text-6xl md:text-9xl font-black text-white mb-12 uppercase tracking-tighter leading-none italic underline decoration-cyan-400 decoration-8 underline-offset-8">
              JOIN_THE_VOID
            </h2>
            <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-20 font-black uppercase tracking-[0.4em] leading-tight">
              THE UNIVERSAL GRID IS WAITING. SECURE YOUR CONSCIOUSNESS.
            </p>
            <div className="flex flex-col sm:flex-row gap-10 justify-center mt-8">
              <Link
                href="/buy"
                className="bg-cyan-400 text-black font-black tracking-[0.3em] uppercase py-8 px-16 transition-all hover:bg-white border-4 border-cyan-400 text-2xl shadow-[12px_12px_0px_rgba(34,211,238,0.2)]"
              >
                INITIALIZE_SYNC
              </Link>
              <Link
                href="/about"
                className="bg-black border-4 border-white text-white font-black tracking-[0.3em] uppercase py-8 px-16 transition-all hover:bg-cyan-400 hover:text-black hover:border-cyan-400 text-2xl"
              >
                READ_MANIFESTO
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
