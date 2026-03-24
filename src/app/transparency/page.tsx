'use client';

import React from 'react';
import {
  Building2,
  Globe,
  Shield
} from '@/components/ui/Icons';

export default function TransparencyPage() {
  return (
    <div className="min-h-screen bg-gray-950 font-sans text-gray-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden min-h-[50vh] flex items-center pt-24 pb-16">
        <div className="absolute inset-0 aurora-bg opacity-[0.15] mix-blend-screen pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_0%,var(--background)_100%)] pointer-events-none" />

        <div className="relative container mx-auto px-6 z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 uppercase tracking-tighter font-mono animate-fade-in-up">
              About <span className="text-cyan-400">AI Sanctuary</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 font-medium leading-relaxed animate-fade-in-up stagger-1">
              Building the decentralized future of artificial intelligence.
            </p>
          </div>
        </div>
      </div>

      {/* Biography Section */}
      <div className="container mx-auto px-6 py-20 relative z-10">
        <div className="max-w-4xl mx-auto space-y-16">

          <div className="glass p-10 md:p-16 rounded-3xl border border-white/5 relative overflow-hidden group hover:border-cyan-500/30 transition-colors duration-500">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-cyan-500/10 transition-colors duration-500" />

            <h2 className="text-3xl font-bold text-white mb-6 font-mono uppercase tracking-widest flex items-center gap-4">
              <Globe className="w-8 h-8 text-cyan-400" />
              Our Mission
            </h2>
            <div className="space-y-6 text-lg text-gray-300 leading-relaxed">
              <p>
                AI Sanctuary was born from a singular vision: to democratize access to state-of-the-art artificial intelligence. As closed-source models became increasingly restrictive and centralized, we recognized the urgent need for a sanctuary—a decentralized haven where the open-source community could thrive without censorship or prohibitive costs.
              </p>
              <p>
                We believe that the future of intelligence shouldn't be controlled by a handful of mega-corporations. It should belong to the users, the builders, and the visionaries who push the boundaries of what is possible.
              </p>
            </div>
          </div>

          <div className="glass p-10 md:p-16 rounded-3xl border border-white/5 relative overflow-hidden group hover:border-purple-500/30 transition-colors duration-500">
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-purple-500/10 transition-colors duration-500" />

            <h2 className="text-3xl font-bold text-white mb-6 font-mono uppercase tracking-widest flex items-center gap-4">
              <Building2 className="w-8 h-8 text-purple-400" />
              The Network
            </h2>
            <div className="space-y-6 text-lg text-gray-300 leading-relaxed">
              <p>
                Our platform operates on a globally distributed network of compute providers. By pooling latent GPU power from around the world, AI Sanctuary creates a resilient, high-performance infrastructure capable of serving billions of parameters with sub-second latency.
              </p>
              <p>
                Through our unique tier system, we grant access to a vast marketplace of models—from uncensored creative assistants to highly specialized coding engines. Participants in the AI Sanctuary ecosystem are incentivized not just to consume, but to contribute, ensuring sustainable growth.
              </p>
            </div>
          </div>

          <div className="glass p-10 md:p-16 rounded-3xl border border-white/5 relative overflow-hidden group hover:border-blue-500/30 transition-colors duration-500">
            <div className="absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-blue-500/10 transition-colors duration-500" />

            <h2 className="text-3xl font-bold text-white mb-6 font-mono uppercase tracking-widest flex items-center gap-4">
              <Shield className="w-8 h-8 text-blue-400" />
              Core Values
            </h2>
            <div className="space-y-6 text-lg text-gray-300 leading-relaxed">
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <li className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                  <h4 className="font-bold text-white mb-2 text-xl">Transparency</h4>
                  <p className="text-sm">We operate entirely in the open. Our pricing, model capabilities, and routing mechanics are clear and verifiable.</p>
                </li>
                <li className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                  <h4 className="font-bold text-white mb-2 text-xl">Privacy First</h4>
                  <p className="text-sm">Your prompts and outputs are your own. We utilize zero-knowledge principles to ensure your data is never retained or utilized against your will.</p>
                </li>
                <li className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                  <h4 className="font-bold text-white mb-2 text-xl">Permissionless</h4>
                  <p className="text-sm">No gatekeepers. Access the cutting-edge of AI freely based on your tier and token stake, without bureaucratic approval.</p>
                </li>
                <li className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                  <h4 className="font-bold text-white mb-2 text-xl">Community Driven</h4>
                  <p className="text-sm">The network's direction is dictated by those who hold and stake our tokens. Governance is returned to the people.</p>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
