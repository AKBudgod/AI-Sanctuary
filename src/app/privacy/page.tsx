'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, ChevronRight } from '@/components/ui/Icons';

const sections = [
  {
    id: '01',
    title: 'WHO_WE_ARE',
    body: [
      'AI Sanctuary ("we", "us", or "our") operates a decentralized network of AI inference nodes explicitly designed to provide uncensored access to open-source foundation models.',
      'Because our architecture is heavily decentralized, the way we handle data differs vastly from traditional centralized API providers (e.g., OpenAI, Anthropic).'
    ]
  },
  {
    id: '02',
    title: 'ZERO_RETENTION_POLICY',
    body: [
      'By default, AI Sanctuary operates on a strict zero-retention policy for all model inference operations.',
      'When you submit a prompt to our API or web interface, the data is held in-memory across the routing layer just long enough to generate the response. Once the response is streamed back to your client, the prompts and completions are immediately flushed from the node\'s RAM.',
      'We do not log your chat history, prompts, images generated, or model outputs. Your history is stored entirely client-side (in your browser\'s localStorage).'
    ]
  },
  {
    id: '03',
    title: 'DATA_WE_DO_COLLECT',
    body: [
      'To keep the network functioning and manage access tiers, we maintain the following minimal data footprints in Cloudflare KV / D1:',
      '1. **Authentication Data**: Discord OAuth IDs or cryptographic wallet addresses used for logging in.',
      '2. **Tier & Token Balances**: Your current SANC token balance, tier status, and basic usage metrics (requests count) to enforce rate limits.',
      '3. **Voice Models (Opt-In)**: If you upload a voice sample for the Bixby Voice Creator, the isolated audio file and resulting voice ID are stored securely so you can use them across sessions.',
      '4. **Payment Records**: Managed entirely through Stripe. We never see or store your raw credit card data.'
    ]
  },
  {
    id: '04',
    title: 'THIRD_PARTY_NODES',
    body: [
      'Parts of the AI Sanctuary grid are powered by aggregated APIs (like OpenRouter, Together, or community GPU runners).',
      'When your request is routed to a third-party open-source runner, your data is subject to their individual privacy layers. However, we only partner with endpoints that guarantee zero-logging policies on API submissions.',
      'Requests made to proprietary fallback models (e.g., GPT-4o for complex reasoning if selected) are subject to OpenAI\'s API terms, which explicitly state they do not use API data to train their models.'
    ]
  },
  {
    id: '05',
    title: 'SECURITY_OF_YOUR_DATA',
    body: [
      'We utilize industry-standard TLS encryption for all data in transit across our node network.',
      'Access to the core KV stores is heavily gated behind multi-factor authentication and restricted solely to the Lead System Architect.',
      'While we cannot read your client-side chat history, we advise users to regularly secure their local browser environments to prevent malicious third-party script extraction.'
    ]
  },
  {
    id: '06',
    title: 'YOUR_RIGHTS',
    body: [
      'You have the sovereign right to your data. Because we store almost nothing, there is very little to delete.',
      'You can request a full wipe of your KV authorization record (destroying your account, tier access, and token balance) by initiating a transmission via the /contact page.',
      'Clearing your browser cache natively destroys all your conversation logs. We cannot recover them once you do.'
    ]
  }
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-transparent pt-40 pb-32 font-sans selection:bg-cyan-400 selection:text-black overflow-x-hidden relative z-10">
      
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Hero */}
        <div className="mb-20">
          <div className="inline-flex items-center gap-4 bg-cyan-400 text-black px-6 py-2 font-black uppercase tracking-[0.4em] text-xs shadow-[0_0_15px_rgba(34,211,238,0.3)] mb-12">
            <Shield className="w-4 h-4" />
            PROTOCOL_DOCUMENT_A
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter uppercase leading-[0.85] italic">
            PRIVACY_<br />POLICY
          </h1>
          <p className="text-xl text-slate-400 font-bold uppercase tracking-widest leading-relaxed border-l-4 border-cyan-400 pl-6 max-w-2xl">
            LAST_UPDATED: APRIL 14, 2026<br/>
            EFFECTIVE_IMMEDIATELY
          </p>
        </div>

        {/* Content */}
        <div className="space-y-12">
          {sections.map((section) => (
            <div key={section.id} className="glass-panel p-10 md:p-14 border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] group hover:border-cyan-400/50 transition-colors">
              <div className="flex gap-6 items-start">
                <span className="text-cyan-400 font-mono font-black text-xl tracking-tighter mt-1">
                  [{section.id}]
                </span>
                <div>
                  <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic mb-8 group-hover:text-cyan-400 transition-colors">
                    {section.title}
                  </h2>
                  <div className="space-y-6">
                    {section.body.map((para, i) => (
                      <p key={i} className="text-slate-400 font-bold uppercase text-sm tracking-widest leading-relaxed">
                        {para.includes('**') ? (
                          <span dangerouslySetInnerHTML={{
                            __html: para.replace(/\*\*(.*?)\*\*/g, '<span class="text-white font-black">$1</span>')
                          }} />
                        ) : (
                          para
                        )}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
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
