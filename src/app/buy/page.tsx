'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Zap, Brain, Target, Mail, Globe, ArrowRight, Star, Shield, Clock } from 'lucide-react';
import PayPalHostedButton from '@/components/ui/PayPalHostedButton';

// ─── Direct Stripe Payment Links (live) ──────────────────────────────────────
const STRIPE_LINKS = {
  credits:        'https://buy.stripe.com/4gM6oH9zZgSR0UH3CjbQY00',
  developer:      'https://buy.stripe.com/5kQaEX7rR7ih5aX0q7bQY01',
  dataMiner:      'https://buy.stripe.com/eVq28r5jJ7ihcDp6OvbQY02',
  copywriter:     'https://buy.stripe.com/4gM9AT9zZgSRgTFgp5bQY03',
  autonomousSdr:  'https://buy.stripe.com/7sY14nfYneKJ9rdc8PbQY04',
};

// ─── Products ─────────────────────────────────────────────────────────────────
const PRODUCTS = [
  // ── AI Sanctuary Platform ──
  {
    section: 'Credits & Developer Mode',
    sectionDesc: 'Fuel your operations or unlock everything, forever.',
    items: [
      {
        id: 'credits',
        name: 'SANC Credits',
        price: 'From $10',
        priceSub: '1,000 credits per $1',
        tagline: 'Power your AI requests',
        description: 'Buy SANC credits to fuel every AI request — chat, image gen, and voice synthesis. Credits never expire and work across all platform tools.',
        features: [
          'Instant credit delivery to your account',
          'No subscription required',
          'Credits never expire',
          'Works across all AI Sanctuary tools',
          '$10 = 10,000 SANC credits',
        ],
        cta: 'Buy Credits',
        href: STRIPE_LINKS.credits,
        highlight: false,
        badge: null,
        icon: Zap,
      },
      {
        id: 'developer',
        name: 'Developer Mode',
        price: '$50',
        priceSub: 'one-time · lifetime access',
        tagline: 'Unlock everything, forever',
        description: "One payment. Lifetime access. Every model, every feature, no filters — permanently unlocked. The unfair advantage for serious builders.",
        features: [
          '100,000 SANC credits included',
          '1M+ credits monthly allocation',
          'All 15+ AI models unlocked instantly',
          'Uncensored voice synthesis',
          'Flux Pro image generation (18+)',
          'Priority compute (1,000 req/min)',
          'Early access to new features',
          'Lifetime — pay once, access forever',
        ],
        cta: 'Unlock Developer Mode',
        href: STRIPE_LINKS.developer,
        highlight: true,
        badge: '⚡ FLASH_SALE_ACTIVE',
        icon: Brain,
      },
    ],
  },
  // ── K'LA Marketing Engine ──
  {
    section: "K'LA — Autonomous Marketing Engine",
    sectionDesc: "K'LA finds your prospects, writes your copy, and runs your outreach.",
    items: [
      {
        id: 'data-miner',
        name: 'Data Miner',
        price: '$10',
        priceSub: 'per campaign',
        tagline: 'Pure prospect intelligence',
        description: "K'LA scans the live internet and mines 50 hyper-targeted leads in your exact niche — enriched with email, role, and company data.",
        features: [
          'Targeted prospect research (50 leads)',
          'LinkedIn & web data extraction',
          'Contact enrichment (email, role, company)',
          'Custom ICP filtering',
          'Delivered as structured CSV',
        ],
        cta: 'Get Data Miner',
        href: STRIPE_LINKS.dataMiner,
        highlight: false,
        badge: null,
        icon: Target,
      },
      {
        id: 'copywriter',
        name: 'Copywriter',
        price: '$25',
        priceSub: 'per campaign',
        tagline: 'Words that convert',
        description: "K'LA mines 50 leads AND writes the entire outreach campaign — personalized 5-touch email sequences, LinkedIn DM scripts, and ad copy.",
        features: [
          'Cold email sequences (5–10 touch)',
          'LinkedIn DM scripts',
          'Landing page & ad copy',
          'Personalization at scale',
          'A/B subject line variants included',
        ],
        cta: 'Get Copywriter',
        href: STRIPE_LINKS.copywriter,
        highlight: true,
        badge: '🔥 ELITE_CHOICE',
        icon: Mail,
      },
      {
        id: 'autonomous-sdr',
        name: 'Autonomous SDR',
        price: '$50',
        priceSub: 'per month',
        tagline: 'Full outreach on autopilot',
        description: "K'LA runs the entire growth engine — prospecting, copywriting, sending, follow-ups, and lead qualification.",
        features: [
          'Everything in Data Miner + Copywriter',
          'Automated outreach & follow-ups',
          'Lead qualification & scoring',
          'Weekly pipeline reports',
          'Real-time updates',
          '24/7 autonomous operation',
        ],
        cta: 'Deploy Autonomous K\'LA',
        href: STRIPE_LINKS.autonomousSdr,
        highlight: false,
        badge: '🤖 FULL_AUTOPILOT',
        icon: Globe,
      },
    ],
  },
];

function BuyPageInner() {
  const searchParams = useSearchParams();
  const [paySuccess, setPaySuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (searchParams.get('payment_success') === 'true') {
      setPaySuccess(true);
      const tier = searchParams.get('tier');
      const tokens = searchParams.get('tokens');
      if (tier === 'developer') {
        setSuccessMsg('✅ Developer Mode activated! Your account is now fully unlocked. Redirecting...');
      } else if (tokens) {
        setSuccessMsg(`✅ ${Number(tokens).toLocaleString()} SANC tokens credited to your account!`);
      } else {
        setSuccessMsg('✅ Payment received! Your purchase is being processed.');
      }
      setTimeout(() => { window.location.href = '/platform'; }, 4000);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-white text-slate-950 font-sans selection:bg-slate-950 selection:text-white overflow-x-hidden">
      <title>PURCHASE_PROTOCOLS | AI_SANCTUARY</title>
      <meta name="description" content="Buy SANC credits, unlock Developer Mode for lifetime access, or hire K'LA." />

      {/* Background Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
           style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-24 pt-40">

        {/* Success Banner */}
        {paySuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-md px-6">
            <div className="bg-white border-8 border-slate-950 p-12 max-w-md w-full text-center shadow-[16px_16px_0px_rgba(0,0,0,1)]">
              <div className="w-20 h-20 bg-slate-950 flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-black text-slate-950 mb-4 uppercase tracking-tighter italic">TX_SUCCESSFUL_SYNC</h2>
              <p className="text-slate-500 font-black uppercase text-xs tracking-widest leading-relaxed mb-6">{successMsg}</p>
              <div className="text-[10px] text-slate-300 font-black uppercase tracking-[0.4em] animate-pulse">RELOAD_INITIALIZED...</div>
            </div>
          </div>
        )}

        {/* Hero */}
        <div className="max-w-4xl space-y-12 mb-40">
          <div className="inline-block bg-slate-950 text-white px-6 py-2 font-black uppercase tracking-[0.4em] text-xs shadow-[8px_8px_0px_rgba(0,0,0,0.2)]">
            GATEWAY_SECURED: STRIPE_PROTOCOL_V4
          </div>
          <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-slate-950 uppercase leading-[0.85]">
            POWER_YOUR_AI.<br />
            <span className="italic underline decoration-8 underline-offset-10">AT_ANY_SCALE.</span>
          </h1>
          <p className="text-2xl text-slate-500 font-black uppercase tracking-widest leading-tight border-l-8 border-slate-950 pl-8 max-w-2xl italic">
            ONE STOP FOR EVERYTHING. CREDITS, LIFETIME ACCESS, OR FULL AUTONOMOUS MARKETING. CHOOSE YOUR WEAPON.
          </p>
        </div>

        {/* Product Sections */}
        {PRODUCTS.map((section) => (
          <div key={section.section} className="mb-40">
            {/* Section Header */}
            <div className="mb-16">
              <h2 className="text-5xl font-black text-slate-950 uppercase tracking-tighter italic underline decoration-8 underline-offset-8 mb-6">{section.section.toUpperCase()}</h2>
              <p className="text-slate-500 font-black uppercase text-xs tracking-[0.2em]">{section.sectionDesc.toUpperCase()}</p>
            </div>

            {/* Cards */}
            <div className={`grid gap-12 ${section.items.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.id}
                    className={`relative flex flex-col bg-white border-4 border-slate-950 p-10 transition-all duration-300 shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:shadow-[16px_16px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] ${item.highlight ? 'ring-8 ring-yellow-400' : ''}`}>

                    {/* Badge */}
                    {item.badge && (
                      <div className="absolute -top-6 left-10 bg-slate-950 text-white px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] shadow-[4px_4px_0px_rgba(0,0,0,0.2)]">
                        {item.badge}
                      </div>
                    )}

                    {/* Icon + Name */}
                    <div className="flex items-start gap-4 mb-10">
                      <div className="w-16 h-16 bg-slate-950 flex items-center justify-center shrink-0 shadow-[4px_4px_0px_rgba(0,0,0,0.1)]">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <div className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300 mb-2">[{item.tagline.toUpperCase()}]</div>
                        <h3 className="text-3xl font-black text-slate-950 uppercase tracking-tight italic">{item.name}</h3>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mb-10 pb-8 border-b-2 border-slate-50">
                      <span className="text-6xl font-black text-slate-950 tracking-tighter">{item.price}</span>
                      <span className="text-slate-300 font-black uppercase text-xs ml-4 tracking-widest">{item.priceSub}</span>
                    </div>

                    {/* Description */}
                    <p className="text-slate-500 font-black uppercase text-[12px] tracking-widest leading-tight mb-10 italic border-l-4 border-slate-100 pl-4">{item.description.toUpperCase()}</p>

                    {/* Features */}
                    <ul className="space-y-4 mb-14 flex-1">
                      {item.features.map((f) => (
                        <li key={f} className="flex items-start gap-4 text-xs font-black uppercase text-slate-950 tracking-wide">
                          <div className="w-4 h-4 bg-slate-950 shrink-0 mt-0.5" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <div className="space-y-6">
                      <a href={item.href} target="_blank" rel="noopener noreferrer"
                        className="w-full py-6 bg-slate-950 text-white font-black uppercase tracking-widest text-sm border-4 border-slate-950 transition-all text-center flex items-center justify-center gap-4 shadow-[6px_6px_0px_rgba(0,0,0,0.2)] hover:bg-white hover:text-slate-950">
                        {item.cta.toUpperCase()} <ArrowRight className="w-6 h-6" />
                      </a>

                      {(item.id === 'credits' || item.id === 'developer') && (
                        <div className="pt-8 border-t-2 border-slate-50">
                           <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300 mb-4 text-center">— ALTERNATIVE_TX_METHOD —</p>
                           <PayPalHostedButton 
                             buttonId="QDGMJKWQXFY8C" 
                             clientId="BAA00t_vYRf8Bwm9ScbFILaSUO2AkCOz9tNaejLAtJ7mfUQ25oWhDW3R031gJCxHF006NKzy6JqD_Q1eRI"
                           />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Trust Strip */}
        <div className="mt-40 pt-24 border-t-8 border-slate-950">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: Shield, label: 'BANK_GRADE_SEC', sub: 'STRIPE_SYNC_ACTIVE' },
              { icon: Zap, label: 'INSTANT_DELIVERY', sub: 'SYNC_UPON_SUCCESS' },
              { icon: Clock, label: 'LIFETIME_CREDITS', sub: 'ZERO_EXPIRATION_NODE' },
              { icon: Star, label: 'SATISFACTION_MAX', sub: 'DIRECT_LINE_SUPPORT' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="p-8 bg-slate-50 border-4 border-slate-950 shadow-[6px_6px_0px_rgba(0,0,0,1)]">
                <div className="w-12 h-12 bg-slate-950 flex items-center justify-center mb-6">
                   <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-slate-950 text-sm font-black uppercase tracking-tighter mb-2">{label}</div>
                <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-none">{sub}</div>
              </div>
            ))}
          </div>

          <div className="mt-24 space-y-6 text-slate-400 font-black uppercase text-[10px] tracking-widest text-center">
            <p>ALL PAYMENTS PROCESSED VIA STRIPE. SECURE NEURAL TUNNEL ACTIVE. AI SANCTUARY NEVER STORES SENSITIVE DATA.</p>
            <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-8">
               <a href="mailto:AKBudgod@ai-sanctuary.online" className="text-slate-950 hover:underline">SUPPORT@AI-SANCTUARY.ONLINE</a>
               <span className="hidden sm:inline text-slate-100">|</span>
               <Link href="/platform" className="text-slate-950 hover:underline">PLATFORM_HUB</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function BuyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="font-black text-slate-950 text-2xl uppercase tracking-[0.4em] animate-pulse">LOAD_BUY_SYNC...</div>
      </div>
    }>
      <BuyPageInner />
    </Suspense>
  );
}
