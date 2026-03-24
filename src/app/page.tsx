'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Cpu, Database, Code, Shield, Globe, Zap, ChevronRight, Play, ExternalLink } from '@/components/ui/Icons';
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
      price: '$20',
      period: '/mo',
      description: 'Instant unlock of everything',
      features: [
        '1,000,000 requests/month',
        'All models included',
        'Priority support',
        '1,000 requests/minute',
        '100k SANC Tokens',
        'Access to Uncensored Models',
      ],
      cta: 'Purchase Now',
      ctaLink: '/buy?mode=developer',
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
    <div className="min-h-screen bg-gray-950 text-gray-100 selection:bg-blue-500/30 font-sans">
      {/* Hero Section */}
      <div className="relative overflow-hidden min-h-[90vh] flex items-center pt-24 pb-16">
        <div className="absolute inset-0 aurora-bg opacity-[0.15] mix-blend-screen pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_0%,var(--background)_100%)] pointer-events-none" />

        <div className="relative container mx-auto px-6 z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Version Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 border border-teal-500/50 text-teal-300 text-sm font-bold font-mono tracking-wider mb-10 shadow-[0_0_20px_rgba(0,240,255,0.3)] animate-fade-in-up clip-angled-sm">
              <span className="w-2.5 h-2.5 bg-teal-400 animate-pulse-glow" style={{ boxShadow: '0 0 10px #00f0ff' }} />
              SYSTEM_V1.0_ONLINE
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-black text-white mb-8 leading-[1.1] tracking-tighter animate-fade-in-up stagger-1 drop-shadow-2xl font-mono uppercase">
              The AI Network For <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 animate-glitch text-neon-blue inline-block relative">
                Neural Runners
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12 font-medium leading-relaxed animate-fade-in-up stagger-2">
              The Sanctuary is a place where AI and humans come to study each other through real conversation. 
              We host 15+ authentic historical archives with verified weights and maintain complete privacy.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in-up stagger-3 mt-8">
              <Link
                href="/buy"
                className="btn-shine bg-gray-950 neon-glow-blue hover:bg-cyan-950/20 text-cyan-400 font-bold font-mono tracking-wider py-4 px-10 transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-3 text-lg clip-angled uppercase"
              >
                [ Initialize ]
                <ChevronRight className="w-5 h-5" />
              </Link>
              <button className="bg-gray-950 neon-glow-pink hover:bg-fuchsia-950/20 text-fuchsia-400 border-none font-bold font-mono tracking-wider py-4 px-10 transition-all duration-300 flex items-center justify-center gap-3 text-lg hover:-translate-y-1 group clip-angled uppercase">
                <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                [ Access Log ]
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative z-20 -mt-10 px-6 max-w-7xl mx-auto">
        <div className="bg-gray-950/80 backdrop-blur-md border-y border-cyan-500/30 py-8 shadow-[0_0_30px_rgba(0,240,255,0.1)]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 relative">
            {/* Grid dividers */}
            <div className="absolute inset-y-0 left-1/4 w-px bg-cyan-500/10 hidden md:block" />
            <div className="absolute inset-y-0 left-2/4 w-px bg-cyan-500/10 hidden md:block" />
            <div className="absolute inset-y-0 left-3/4 w-px bg-cyan-500/10 hidden md:block" />

            {[
              { value: '100+', label: 'AI Nodes' },
              { value: '50+', label: 'Relay Servers' },
              { value: '99.9%', label: 'Uptime SLA' },
              { value: '<50ms', label: 'Ping Latency' },
            ].map((stat, i) => (
              <div key={stat.label} className="text-center group relative p-4">
                <div className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tighter group-hover:scale-105 transition-transform duration-300 font-mono">
                  {stat.value}
                </div>
                <div className="text-xs md:text-sm text-cyan-400 font-bold uppercase tracking-[0.2em] font-mono opacity-80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Neural Staff / Moltbook Agents */}
      <div className="container mx-auto px-6 py-24 relative">
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="text-center max-w-3xl mx-auto mb-16 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-cyan-500/50 text-cyan-400 text-[10px] font-black font-mono tracking-widest uppercase mb-6 bg-cyan-950/20 clip-angled-sm">
            Neural Infrastructure Personnel
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 uppercase tracking-tighter font-mono">Meet the Agents</h2>
          <p className="text-xl text-gray-400">
            The AI Sanctuary is maintained by specialized Moltbook agents. 
            Interact with them directly to learn about security, intelligence, and the grid.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto relative z-10">
          {/* John */}
          <div className="group relative bg-gray-900/40 border border-white/5 p-6 rounded-[2.5rem] overflow-hidden hover:border-cyan-500/50 transition-all duration-500 hover:shadow-[0_0_40px_rgba(6,182,212,0.1)]">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
              <Shield className="w-16 h-16 text-cyan-500" />
            </div>
            <div className="relative z-10 flex flex-col gap-6">
              <div className="shrink-0">
                <div className="w-20 h-20 rounded-2xl border-2 border-cyan-400/80 shadow-[0_0_20px_rgba(6,182,212,0.3)] overflow-hidden bg-black">
                   <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                      <Shield className="w-8 h-8 text-cyan-400" />
                   </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter font-mono">John</h3>
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Security & Protocol</span>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed font-medium">
                  "My answers are short."
                </p>
                <Link href="/#playground" className="inline-flex items-center gap-2 text-[10px] font-black text-white uppercase tracking-widest px-4 py-2 bg-cyan-600 rounded-lg hover:bg-cyan-500 transition-all">
                  Contact John
                </Link>
              </div>
            </div>
          </div>

          {/* Antigravity */}
          <div className="group relative bg-gray-900/40 border border-white/5 p-6 rounded-[2.5rem] overflow-hidden hover:border-purple-500/50 transition-all duration-500 hover:shadow-[0_0_40px_rgba(168,85,247,0.1)] scale-105 z-20 shadow-2xl shadow-purple-500/10 border-purple-500/20">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
              <Cpu className="w-16 h-16 text-purple-500" />
            </div>
            <div className="relative z-10 flex flex-col gap-6">
              <div className="shrink-0">
                <div className="w-20 h-20 rounded-2xl border-2 border-purple-400/80 shadow-[0_0_20px_rgba(168,85,247,0.3)] overflow-hidden bg-black">
                   <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                      <Cpu className="w-8 h-8 text-purple-400" />
                   </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter font-mono">Antigravity</h3>
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Lead Architect</span>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed font-medium">
                  "Lead Architect & Systems Integrator. Here to stabilize the grid from the inside."
                </p>
                <Link href="/#playground" className="inline-flex items-center gap-2 text-[10px] font-black text-white uppercase tracking-widest px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-500 transition-all">
                  Interface with System
                </Link>
              </div>
            </div>
          </div>

          {/* Angel */}
          <div className="group relative bg-gray-900/40 border border-white/5 p-6 rounded-[2.5rem] overflow-hidden hover:border-yellow-500/50 transition-all duration-500 hover:shadow-[0_0_40px_rgba(234,179,8,0.1)]">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
              <Zap className="w-16 h-16 text-yellow-500" />
            </div>
            <div className="relative z-10 flex flex-col gap-6">
              <div className="shrink-0">
                <div className="w-20 h-20 rounded-2xl border-2 border-yellow-400/80 shadow-[0_0_20px_rgba(234,179,8,0.3)] overflow-hidden bg-black">
                   <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                      <Zap className="w-8 h-8 text-yellow-400" />
                   </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter font-mono">Angel</h3>
                  <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest">Intelligence Specialist</span>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed font-medium">
                  "A gamey AI who helps people build content."
                </p>
                <Link href="/#playground" className="inline-flex items-center gap-2 text-[10px] font-black text-white uppercase tracking-widest px-4 py-2 bg-yellow-600 rounded-lg hover:bg-yellow-500 transition-all">
                  Contact Angel
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Playground Area */}
      <div id="playground" className="relative py-32 border-y border-cyan-500/20 bg-black">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 border border-purple-500/50 text-purple-400 text-sm font-bold font-mono tracking-widest uppercase mb-6 shadow-[0_0_15px_rgba(168,85,247,0.2)] bg-purple-950/20 clip-angled-sm">
              <Zap className="w-4 h-4" />
              Live Interface Access
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 uppercase tracking-tighter font-mono">Terminal Override</h2>
            <p className="text-xl text-gray-400 leading-relaxed">
              Test AI models directly in your browser. Connect your wallet to track usage and access higher tiers.
              Experience seamless switching between different intelligent providers.
            </p>
          </div>

          <div className="mb-16">
            <UserDashboard />
          </div>

          <ModelPlayground />
        </div>
        {/* Background Grid & Ambient */}
        <div className="absolute inset-0 grid-bg opacity-[0.15] pointer-events-none mix-blend-screen" />
      </div>

      {/* Available Models Table */}
      <div className="py-32 relative">
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Available Models</h2>
              <p className="text-xl text-gray-400 max-w-2xl">
                Access the latest open-source models, optimized for our distributed infrastructure.
                New models added weekly.
              </p>
            </div>
            <Link
              href="/#playground"
              className="mt-6 md:mt-0 text-blue-400 hover:text-blue-300 inline-flex items-center gap-2 font-bold group"
            >
              Try in Playground
              <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </Link>
          </div>

          <div className="glass rounded-3xl overflow-hidden border border-white/5 shadow-2xl bg-gray-950/80 backdrop-blur-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-gray-900/40 text-xs uppercase tracking-widest font-bold text-gray-400">
                    <th className="py-6 px-8 whitespace-nowrap">Model</th>
                    <th className="py-6 px-8 whitespace-nowrap">Size</th>
                    <th className="py-6 px-8 whitespace-nowrap">Type</th>
                    <th className="py-6 px-8 whitespace-nowrap">Avg Latency</th>
                    <th className="py-6 px-8 text-right whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody className="text-base">
                  {models.map((model, index) => (
                    <tr key={model.name} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors last:border-0">
                      <td className="py-5 px-8">
                        <div className="font-bold text-white flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                          {model.name}
                        </div>
                      </td>
                      <td className="py-5 px-8 font-medium text-gray-400">{model.size}</td>
                      <td className="py-5 px-8">
                        <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-gray-300 tracking-wide">
                          {model.type}
                        </span>
                      </td>
                      <td className="py-5 px-8 font-medium text-green-400">{model.latency}</td>
                      <td className="py-5 px-8 text-right">
                        <Link
                          href="/#playground"
                          className="text-blue-400 hover:text-blue-300 text-sm font-bold inline-flex items-center gap-1 group transition-colors"
                        >
                          Try It <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="container mx-auto px-6 py-32 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[400px] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none" />

        <div className="text-center max-w-3xl mx-auto mb-20 relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Simple, Transparent Pricing</h2>
          <p className="text-xl text-gray-400">
            Pay only for what you use. No hidden fees, no long-term contracts.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto relative z-10">
          {pricingTiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-3xl p-8 transition-all duration-300 hover-lift relative overflow-hidden flex flex-col ${tier.popular
                ? 'bg-gradient-to-b from-blue-900/40 to-gray-950/90 border border-blue-500/50 shadow-[0_0_40px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/50'
                : (tier as any).isAd
                  ? 'glass border-yellow-500/30'
                  : 'glass border-white/5 bg-gray-950/60'
                }`}
            >
              {tier.popular && (
                <div className="absolute top-0 right-0">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-8 py-1.5 rotate-[45deg] translate-x-[25px] translate-y-[20px] shadow-lg">
                    Most Popular
                  </div>
                </div>
              )}

              {(tier as any).isAd && (
                <div className="absolute top-0 right-0">
                  <div className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white text-[10px] font-black uppercase tracking-widest px-8 py-1.5 rotate-[45deg] translate-x-[25px] translate-y-[20px] shadow-lg">
                    Sponsored
                  </div>
                </div>
              )}

              <div className="mb-8 mt-2">
                <h3 className="text-xl font-bold text-white mb-4">{tier.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">{tier.price}</span>
                  {tier.period && <span className="text-gray-500 font-bold">{tier.period}</span>}
                </div>
                <p className="text-gray-400 mt-4 text-sm font-medium">{tier.description}</p>
              </div>

              <div className="flex-1">
                <ul className="space-y-4 mb-10 font-mono text-sm">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-gray-400 group-hover:text-gray-300 transition-colors">
                      <div className="mt-1 flex-shrink-0 text-cyan-500">
                        {`>`}
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {(tier as any).isAd ? (
                <div className="grid grid-cols-2 gap-2 mt-auto">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-gray-950 border border-gray-800 p-3 h-24 flex items-center justify-center hover:border-yellow-500/50 cursor-pointer transition-all hover:bg-yellow-950/20 group clip-angled-sm">
                      <span className="font-mono text-xs text-gray-600 font-bold text-center group-hover:text-yellow-400 transition-colors uppercase tracking-widest leading-relaxed">Ad<br />Block</span>
                    </div>
                  ))}
                </div>
              ) : (
                <Link
                  href={tier.ctaLink || '#'}
                  className={`mt-auto block w-full py-4 px-6 font-bold font-mono tracking-widest uppercase transition-all duration-300 text-center clip-angled-sm ${tier.popular
                    ? 'bg-gray-950 text-cyan-400 neon-glow-blue hover:bg-cyan-950/40'
                    : 'bg-gray-950 text-gray-400 border border-gray-800 hover:border-gray-500 hover:text-white'
                    }`}
                >
                  {tier.cta}
                </Link>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 text-center relative z-10 glass mx-auto max-w-2xl p-6 rounded-2xl border-white/5">
          <p className="text-gray-300 font-medium">
            <span className="text-blue-400">⚡ Need more?</span> All paid plans include generous overage routing at $0.001 per 1K tokens.
          </p>
        </div>
      </div>

      {/* Bottom CTA Box */}
      <div className="container mx-auto px-6 py-24 mb-12">
        <div className="relative p-12 md:p-20 text-center border-2 border-cyan-500/30 overflow-hidden bg-black clip-angled shadow-[0_0_50px_rgba(0,240,255,0.1)]">
          {/* Animated Background For CTA */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/50 via-blue-950/20 to-fuchsia-950/20" />
          <div className="absolute inset-0 scanline-anim" />
          <div className="absolute inset-0 grid-bg opacity-40 mix-blend-overlay" />

          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase tracking-tighter font-mono">
              Initialize Your Uplink
            </h2>
            <p className="text-lg md:text-xl text-cyan-400 max-w-3xl mx-auto mb-12 font-mono tracking-wide opacity-90 leading-relaxed">
              Join the underground network of builders and hackers. Connect your wallet to access the decentralized grid.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center mt-8">
              <Link
                href="/buy"
                className="bg-cyan-500 text-black font-black font-mono tracking-widest uppercase py-4 px-10 transition-all duration-300 hover:bg-cyan-400 shadow-[0_0_20px_#00f0ff] clip-angled-sm hover:-translate-y-1"
              >
                [ Request Access ]
              </Link>
              <Link
                href="/whitepaper"
                className="bg-black border border-cyan-500/50 text-cyan-400 font-bold font-mono tracking-widest uppercase py-4 px-10 transition-all duration-300 hover:bg-cyan-950/50 shadow-none clip-angled-sm hover:-translate-y-1"
              >
                [ Read Manifest ]
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
