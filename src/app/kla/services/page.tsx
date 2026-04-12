'use client';
import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

const PayPalHostedButton = dynamic(() => import('@/components/ui/PayPalHostedButton'), { ssr: false });

const TIERS = [
  {
    id: 'data-miner',
    name: 'Data Miner',
    buttonId: 'NVA2J2MKP8W2U',
    tagline: 'Find your perfect prospects',
    description: 'K\'LA hunts down qualified leads from LinkedIn, web scraping, and social signals — delivering a clean, enriched contact list ready for outreach.',
    color: 'cyan',
    features: [
      'Targeted prospect research',
      'LinkedIn & web data extraction',
      'Contact enrichment (email, role, company)',
      'Delivered as structured CSV / spreadsheet',
      'Custom ICP filtering',
    ],
    badge: null,
  },
  {
    id: 'copywriter',
    name: 'Copywriter',
    buttonId: 'U2FUB5V2YAS4U',
    tagline: 'Words that actually convert',
    description: 'K\'LA writes high-converting cold outreach sequences, landing page copy, and ad scripts — personalized to your brand voice and audience.',
    color: 'fuchsia',
    features: [
      'Cold email sequences (5–10 touch)',
      'LinkedIn DM scripts',
      'Landing page & ad copy',
      'Personalization at scale',
      'A/B variants included',
    ],
    badge: 'Most Popular',
  },
  {
    id: 'autonomous-sdr',
    name: 'Autonomous SDR',
    buttonId: 'NSG8PJZPAEWYY',
    tagline: 'Full outreach on autopilot',
    description: 'K\'LA runs the entire outreach cycle — prospecting, copy, sending, follow-ups, and lead qualification — so you only talk to people ready to buy.',
    color: 'rose',
    features: [
      'Everything in Data Miner + Copywriter',
      'Automated outreach & follow-up sequences',
      'Lead qualification & scoring',
      'Weekly pipeline reports',
      'Real-time Slack / email updates',
    ],
    badge: '🔥 Best Value',
  },
];

const colorMap: Record<string, Record<string, string>> = {
  cyan: {
    border: 'border-cyan-500/40',
    glow: 'shadow-[0_0_40px_rgba(0,240,255,0.08)]',
    badge: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30',
    tag: 'text-cyan-400',
    check: 'text-cyan-400',
    heading: 'from-cyan-300 to-cyan-500',
  },
  fuchsia: {
    border: 'border-fuchsia-500/40',
    glow: 'shadow-[0_0_40px_rgba(255,0,234,0.08)]',
    badge: 'bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/30',
    tag: 'text-fuchsia-400',
    check: 'text-fuchsia-400',
    heading: 'from-fuchsia-300 to-pink-500',
  },
  rose: {
    border: 'border-rose-500/40',
    glow: 'shadow-[0_0_40px_rgba(255,30,86,0.12)]',
    badge: 'bg-rose-500/10 text-rose-400 border border-rose-500/30',
    tag: 'text-rose-400',
    check: 'text-rose-400',
    heading: 'from-rose-300 to-orange-400',
  },
};

export default function KLAServicesPage() {
  return (
    <div className="min-h-screen bg-[#050508] text-gray-100">
      {/* Hero */}
      <div className="relative overflow-hidden py-24 px-6 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-fuchsia-900/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-fuchsia-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 text-xs font-bold uppercase tracking-widest mb-6">
            ✦ K&apos;LA Marketing Intelligence
          </div>
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-white mb-5 leading-[1.05]">
            Let K&apos;LA{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-rose-400">
              grow your business
            </span>
          </h1>
          <p className="text-lg text-gray-400 max-w-xl mx-auto leading-relaxed">
            An AI-native sales engine that prospects, writes, and reaches out — 24/7, with no burnout, no excuses.
          </p>
        </div>
      </div>

      {/* Tiers */}
      <div className="max-w-6xl mx-auto px-6 pb-24 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TIERS.map((tier) => {
            const c = colorMap[tier.color];
            return (
              <div
                key={tier.id}
                className={`group relative flex flex-col rounded-[2.5rem] bg-gray-900/40 backdrop-blur-xl border ${c.border} ${c.glow} p-8 lg:p-10 transition-all duration-500 hover:-translate-y-2 hover:bg-gray-900/60`}
              >
                {/* Premium Glow Overlay */}
                <div className={`absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`} />
                
                {tier.badge && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap shadow-lg ${c.badge} animate-bounce-subtle`}>
                    {tier.badge}
                  </div>
                )}

                <div className="mb-8 relative">
                  <p className={`text-[10px] font-black uppercase tracking-[0.3em] mb-4 ${c.tag}`}>{tier.tagline}</p>
                  <h2 className={`text-4xl font-black text-white hover:text-transparent bg-clip-text bg-gradient-to-r ${c.heading} transition-all duration-500 mb-4 font-mono`}>
                    {tier.name}
                  </h2>
                  <div className="h-px w-12 bg-gray-800 mb-5 group-hover:w-full transition-all duration-700" />
                  <p className="text-sm text-gray-400 leading-relaxed font-medium">{tier.description}</p>
                </div>

                <ul className="space-y-4 mb-10 flex-1 relative">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-gray-300 group/item">
                      <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center bg-gray-950 border border-white/5 group-hover/item:border-${tier.color}-500/50 transition-colors`}>
                        <span className={`text-[10px] ${c.check}`}>✓</span>
                      </div>
                      <span className="group-hover/item:text-white transition-colors">{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="relative">
                  <div className="absolute inset-x-0 -top-8 h-8 bg-gradient-to-t from-gray-900/40 to-transparent pointer-events-none" />
                  <p className="text-[10px] text-gray-600 text-center mb-4 uppercase tracking-[0.2em] font-black">Verified Neural Transaction</p>
                  <div className="rounded-2xl overflow-hidden shadow-2xl transition-transform active:scale-[0.98]">
                    <PayPalHostedButton buttonId={tier.buttonId} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust strip */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 text-sm">Powered by K&apos;LA · AI Sanctuary &copy; {new Date().getFullYear()} · Secure payments via PayPal</p>
        </div>
      </div>
    </div>
  );
}
