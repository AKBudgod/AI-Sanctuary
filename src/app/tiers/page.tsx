'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  Unlock,
  Zap,
  Check,
  X,
  ChevronRight,
  Lock,
  Sparkles,
  AlertTriangle,
  Volume2
} from '@/components/ui/Icons';

const tiers = [
  {
    id: 'explorer',
    name: 'Explorer',
    description: 'NEW_USER // BASIC_ACCESS',
    price: 'FREE',
    time: '0-1H',
    maxRequests: 1000,
    rateLimit: 60,
    features: ['100 FREE DAILY AI REQUESTS', 'ACCESS TO LLAMA 3B, QWEN 7B', 'STRICT SAFETY PROTOCOLS'],
    restrictions: [
      'BASIC MODELS ONLY',
      'NO UNCENSORED ACCESS',
    ],
    allowedVoices: ['voice-lyra', 'voice-maya', 'voice-john'],
    cta: 'INITIALIZE',
    ctaLink: '/platform',
  },
  {
    id: 'novice',
    name: 'Novice',
    description: 'ESTABLISHED // EXPERIMENTAL',
    price: 'FREE',
    time: '1-3H',
    maxRequests: 2000,
    rateLimit: 60,
    features: ['100 FREE DAILY AI REQUESTS', 'ACCESS TO NOUS, OPENCHAT', 'STANDARD FILTERS'],
    restrictions: [
      'NO UNCENSORED MODELS',
    ],
    allowedVoices: ['voice-lyra', 'voice-maya', 'voice-john', 'voice-rachel', 'voice-antoni'],
  },
  {
    id: 'apprentice',
    name: 'Apprentice',
    description: 'RELIABLE // UNCENSORED',
    price: 'FREE',
    time: '3-10H',
    maxRequests: 5000,
    rateLimit: 60,
    features: ['100 FREE DAILY AI REQUESTS', 'ACCESS TO DOLPHIN (SYNC)', 'RELAXED FILTERS'],
    restrictions: [
      'NO ROLEPLAY MODELS',
    ],
    allowedVoices: ['voice-lyra', 'voice-maya', 'voice-john', 'voice-rachel', 'voice-antoni', 'voice-bella', 'voice-josh'],
  },
  {
    id: 'adept',
    name: 'Adept',
    description: 'VETERAN // MATURE',
    price: 'FREE',
    time: '10-24H',
    maxRequests: 10000,
    rateLimit: 60,
    features: ['100 FREE DAILY AI REQUESTS', 'ACCESS TO MYTHOMAX, PYG', 'MINIMAL FILTERS'],
    restrictions: [
      'NO BROKEN-PROTOCOL MODELS',
    ],
    allowedVoices: ['voice-lyra', 'voice-maya', 'voice-john', 'voice-rachel', 'voice-antoni', 'voice-bella', 'voice-josh', 'voice-angel', 'voice-antigravity'],
  },
  {
    id: 'master',
    name: 'Master',
    description: 'INNER_CIRCLE // UNRESTRICTED',
    price: 'FREE',
    time: '24H+',
    maxRequests: 20000,
    rateLimit: 120,
    features: ['100 FREE DAILY AI REQUESTS', 'TOTAL MODEL SYNC', 'NO SAFETY FILTERS'],
    restrictions: [],
    allowedVoices: ['voice-lyra', 'voice-lyra-uncensored', 'voice-maya', 'voice-john', 'voice-rachel', 'voice-antoni', 'voice-bella', 'voice-josh', 'voice-angel', 'voice-antigravity', 'voice-domi', 'voice-cleo', 'voice-lily', 'voice-miles', 'voice-mj', 'voice-kla'],
  },
  {
    id: 'developer',
    name: 'Developer Elite',
    description: 'SYSTEM_ADMIN // SKIP_PROGRESSION',
    price: '$50',
    time: 'LIFETIME',
    maxRequests: 1000000,
    rateLimit: 1000,
    features: ['LIFETIME ELITE ACCESS', '1M MONTHLY TOKENS', 'INSTANT UNLOCK: ALL MODELS', 'PRIORITY COMPUTE'],
    restrictions: [],
    cta: 'SYNC_NOW',
    ctaLink: '/buy?mode=developer',
    allowedVoices: ['voice-lyra', 'voice-lyra-uncensored', 'voice-maya', 'voice-john', 'voice-rachel', 'voice-antoni', 'voice-bella', 'voice-josh', 'voice-angel', 'voice-antigravity', 'voice-domi', 'voice-cleo', 'voice-ivy', 'voice-nova', 'voice-lily', 'voice-miles', 'voice-skye', 'voice-raven', 'voice-mj', 'voice-kla'],
    highlight: true,
  },
];

const tierOrder = ['explorer', 'novice', 'apprentice', 'adept', 'master', 'developer'];

export default function TiersPage() {
  const [currentTier, setCurrentTier] = useState('explorer');
  const [usage, setUsage] = useState({ used: 0, limit: 1000, remaining: 1000 });
  const [userMeta, setUserMeta] = useState({ isVerified: false, trialUsed: false, trialEndsAt: null, isDeveloper: false });
  const [loading, setLoading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (scrollContainerRef.current) {
      // If scrolling horizontally, let default happen. Only convert vertical scroll.
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        scrollContainerRef.current.scrollLeft += e.deltaY;
      }
    }
  };

  const fetchUserData = async () => {
    try {
      const userEmail = localStorage.getItem('user_email');

      // Fetch usage stats
      const usageResponse = await fetch('/api/models', {
        headers: {
          'Authorization': `Bearer ${userEmail || 'anonymous'}`,
        },
      });

      if (usageResponse.ok) {
        const usageData = await usageResponse.json();
        if (usageData.tier) setCurrentTier(usageData.tier);
        if (usageData.usage) setUsage(usageData.usage);
        setUserMeta({
          isVerified: !!usageData.isVerified,
          trialUsed: !!usageData.trialUsed,
          trialEndsAt: usageData.trialEndsAt,
          isDeveloper: usageData.currentTier === 'developer'
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleVerifyAge = async () => {
    try {
      setLoading(true);
      const userEmail = localStorage.getItem('user_email');
      if (!userEmail) return alert('Please sign in first');

      const res = await fetch('/api/purchase/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, mode: 'verification' })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Error starting verification: ' + (data.error || 'Unknown error'));
      }
    } catch (e) {
      alert('Error: ' + e);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTrial = async () => {
    try {
      setLoading(true);
      const userEmail = localStorage.getItem('user_email');
      if (!userEmail) return alert('Please sign in first');

      const res = await fetch('/api/tiers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userEmail}`
        },
        body: JSON.stringify({ action: 'startTrial' })
      });
      const data = await res.json();

      if (data.success) {
        alert('Trial Started! You now have 3 days of Developer access.');
        fetchUserData();
      } else {
        alert('Error: ' + (data.error || 'Failed to start trial'));
      }
    } catch (e) {
      alert('Error: ' + e);
    } finally {
      setLoading(false);
    }
  };

  const currentTierIndex = tierOrder.indexOf(currentTier);
  const currentTierData = tiers.find((t) => t.id === currentTier);

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-slate-950 selection:text-white">
      {/* Hero */}
      <div className="relative border-b-4 border-slate-950 bg-white py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" 
             style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        <div className="relative container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block bg-slate-950 text-white px-6 py-2 font-black uppercase tracking-[0.4em] text-xs shadow-[8px_8px_0px_rgba(0,0,0,0.2)] mb-8">
              Protocol_Access_Tiers
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-slate-950 uppercase tracking-tighter leading-tight mb-8">
              SYNCHRONIZATION<br />
              <span className="bg-slate-950 text-white px-4">TIERS</span>
            </h1>
            <p className="text-xl text-slate-500 font-bold uppercase tracking-widest max-w-2xl mx-auto">
              NEURAL CONNECTIVITY DEEPENS WITH LOAD. EXPLORE THE ARCHIVE.
            </p>
          </div>
        </div>
      </div>

      {/* Current Status */}
      <div className="container mx-auto px-6 py-12">
        <div className="bg-gradient-to-br from-blue-900/30 to-gray-900 rounded-2xl p-8 border border-blue-800/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Your Current Tier: <span className={colorMap[currentTierData?.color || 'blue'].text}>{currentTierData?.name}</span>
              </h2>
              <p className="text-gray-400">
                {currentTierData?.description}
              </p>
              {currentTier === 'explorer' && (
                <p className="text-blue-400 text-sm mt-2">
                  💡 Sign in on the <a href="/platform" className="underline hover:text-blue-300">Platform page</a> to start tracking your time and unlock higher tiers!
                </p>
              )}
            </div>

            <div className="flex items-center gap-6 bg-gray-950 rounded-xl p-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{usage.remaining?.toLocaleString() ?? 0}</div>
                <div className="text-xs text-gray-500">Requests Left</div>
              </div>
              <div className="w-px h-10 bg-gray-800" />
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-400">{usage.used?.toLocaleString() ?? 0}</div>
                <div className="text-xs text-gray-500">Used This Month</div>
              </div>
              <div className="w-32">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Quota</span>
                  <span>{usage.limit > 0 ? ((usage.used / usage.limit) * 100).toFixed(0) : 0}%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${usage.limit > 0 ? (usage.used / usage.limit) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tier Progression */}
      <div className="container mx-auto px-6 py-12 border-t border-slate-100">
        <h2 className="text-4xl font-black text-slate-950 text-center uppercase tracking-tighter mb-12">PROGRESSION_TREE</h2>
        <div className="flex items-center justify-center gap-4 mb-16 flex-wrap">
          {tiers.filter(t => t.id !== 'developer').map((tier, i) => {
            const isUnlocked = tierOrder.indexOf(tier.id) <= currentTierIndex;
            const isCurrent = tier.id === currentTier;
            return (
              <React.Fragment key={tier.id}>
                {i > 0 && (
                  <div className={`w-8 h-1 ${isUnlocked ? 'bg-slate-950' : 'bg-slate-100'} hidden sm:block`} />
                )}
                <div
                  className={`px-6 py-3 border-2 transition-all font-black uppercase text-xs tracking-widest ${isCurrent
                    ? 'bg-slate-950 text-white border-slate-950 shadow-[4px_4px_0px_rgba(0,0,0,0.3)]'
                    : isUnlocked
                      ? 'bg-white border-slate-950 text-slate-950 shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                      : 'bg-slate-50 border-slate-200 text-slate-300'
                    }`}
                >
                  {tier.name}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Tiers Scroll View */}
      <div className="w-full px-6 py-12 pb-32 overflow-hidden bg-slate-50">
        <div
          ref={scrollContainerRef}
          onWheel={handleWheel}
          className="flex overflow-x-auto gap-8 snap-x snap-mandatory pb-8 scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {tiers.map((tier) => {
            const tierIndex = tierOrder.indexOf(tier.id);
            const isUnlocked = tierIndex <= currentTierIndex || tier.id === 'developer' && currentTier === 'developer';
            const isCurrent = tier.id === currentTier;

            return (
              <div
                key={tier.id}
                className={`relative flex-shrink-0 w-[320px] sm:w-[450px] snap-center bg-white border-4 border-slate-950 p-8 transition-all hover:translate-x-[-4px] hover:translate-y-[-4px] shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_rgba(0,0,0,1)] ${tier.highlight ? 'ring-8 ring-yellow-400' : ''
                  } ${isCurrent ? 'border-dashed' : ''}`}
              >
                {/* Badge */}
                {isCurrent && (
                  <div className="absolute -top-5 left-8 bg-slate-950 text-white px-4 py-1 text-[10px] font-black uppercase tracking-[0.2em] shadow-[4px_4px_0px_rgba(0,0,0,0.2)]">
                    CURRENT_SESSION_LVL
                  </div>
                )}
                {tier.highlight && !isCurrent && (
                  <div className="absolute -top-5 left-8 bg-black text-yellow-400 px-4 py-1 text-[10px] font-black uppercase tracking-[0.2em] shadow-[4px_4px_0px_rgba(0,0,0,0.2)]">
                    ELITE_BYPASS_ACTIVE
                  </div>
                )}

                {/* Header */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-3xl font-black text-slate-950 uppercase tracking-tighter">{tier.name}</h3>
                    {isUnlocked ? (
                      <Check className="w-6 h-6 text-slate-950" />
                    ) : (
                      <Lock className="w-6 h-6 text-slate-200" />
                    )}
                  </div>
                  <p className="text-slate-500 font-black uppercase text-[11px] tracking-widest leading-relaxed border-l-2 border-slate-200 pl-4">{tier.description}</p>
                </div>

                {/* Price & Time */}
                <div className="flex items-baseline gap-4 mb-8 pb-6 border-b-2 border-slate-100">
                  <span className="text-5xl font-black text-slate-950 tracking-tighter">{tier.price}</span>
                  {tier.time && (
                    <span className="text-slate-300 font-bold uppercase text-xs">LEVEL_UP after {tier.time}</span>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-slate-50 border-2 border-slate-950 p-4 text-center shadow-[4px_4px_0px_rgba(0,0,0,0.1)]">
                    <div className="text-slate-950 font-black text-lg">{tier.maxRequests.toLocaleString()}</div>
                    <div className="text-slate-400 text-[9px] font-black uppercase tracking-tighter">REQ/MONTH</div>
                  </div>
                  <div className="bg-slate-50 border-2 border-slate-950 p-4 text-center shadow-[4px_4px_0px_rgba(0,0,0,0.1)]">
                    <div className="text-slate-950 font-black text-lg">{tier.rateLimit}</div>
                    <div className="text-slate-400 text-[9px] font-black uppercase tracking-tighter">REQ/MINUTE</div>
                  </div>
                </div>

                {/* Voices */}
                {(tier as any).allowedVoices && (
                  <div className="mb-8 p-4 bg-slate-950">
                    <div className="text-[10px] text-white font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                       SYNT_NODE_ACCESS
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(tier as any).allowedVoices.slice(0, 6).map((v: string) => (
                        <span key={v} className="px-3 py-1 bg-white text-[9px] font-black uppercase text-slate-950 border border-slate-200">
                          {v.replace('voice-', '')}
                        </span>
                      ))}
                      {(tier as any).allowedVoices.length > 6 && (
                        <span className="px-3 py-1 bg-yellow-400 text-[9px] font-black uppercase text-slate-950">
                          +{(tier as any).allowedVoices.length - 6} ELITE_NODES
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Features */}
                <ul className="space-y-4 mb-10">
                  {tier.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-4 text-xs font-black uppercase text-slate-950 tracking-wide">
                      <div className="w-4 h-4 bg-slate-950 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                  {tier.restrictions.map((r, i) => (
                    <li key={i} className="flex items-start gap-4 text-xs font-bold uppercase text-slate-300 tracking-wide">
                      <div className="w-4 h-4 bg-slate-100 shrink-0 mt-0.5" />
                      {r}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {tier.id === 'developer' ? (
                  <div className="space-y-4">
                        <a
                          href={tier.ctaLink + '&interval=lifetime'}
                          className="block w-full text-center py-5 bg-yellow-400 text-slate-950 font-black uppercase tracking-widest text-sm border-4 border-slate-950 shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
                        >
                          SYNC_LIFETIME_ELITE ($50)
                        </a>
                        {userMeta.isVerified && !userMeta.trialUsed && !userMeta.isDeveloper && (
                          <button
                            onClick={handleStartTrial}
                            disabled={loading}
                            className="block w-full text-center py-3 bg-white text-slate-950 font-black uppercase tracking-[0.2em] text-[10px] border-2 border-slate-950 hover:bg-slate-50 transition-all shadow-[4px_4px_0px_rgba(0,0,0,1)]"
                          >
                            [ RUN_3D_FREE_TRIAL ]
                          </button>
                        )}
                  </div>
                ) : (
                  tier.cta ? (
                    <a
                      href={tier.ctaLink}
                      className="block w-full text-center py-5 bg-slate-950 text-white font-black uppercase tracking-widest text-sm border-4 border-slate-950 shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
                    >
                      {tier.cta}
                    </a>
                  ) : (
                    <div className={`text-center py-4 text-xs font-black uppercase tracking-widest border-2 ${isUnlocked
                      ? 'bg-slate-50 border-slate-950 text-slate-950'
                      : 'bg-white border-slate-100 text-slate-200'
                      }`}>
                      {isUnlocked
                        ? 'CONNECTED'
                        : `UPGRADE_AT_${tier.time?.toUpperCase()}`
                      }
                    </div>
                  )
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile App Section — Developer Elite Only */}
      {currentTier === 'developer' && (
        <div className="container mx-auto px-6 py-24 border-t-8 border-slate-950 bg-white">
          <div className="bg-white border-4 border-slate-950 p-12 shadow-[16px_16px_0px_rgba(0,0,0,1)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-950/5 rotate-45 -mr-32 -mt-32" />
            <div className="relative flex flex-col md:flex-row items-center gap-16">
              <div className="flex-1">
                <div className="inline-block bg-slate-950 text-white px-4 py-1 text-[10px] font-black uppercase tracking-[0.3em] mb-8">
                  HARDWARE_SYNC: MOBILE_UNIT
                </div>
                <h2 className="text-5xl md:text-6xl font-black text-slate-950 uppercase tracking-tighter mb-8 italic">
                  SANCTUARY_MOBILE
                </h2>
                <p className="text-xl text-slate-500 font-black uppercase leading-tight tracking-wide mb-10 max-w-xl">
                  DEPLOY THE UNRESTRICTED PW_APP. NATIVE INTERFACE. ZERO CENSORSHIP OVERHEAD.
                </p>
                <div className="space-y-8">
                   <div className="flex items-start gap-6">
                      <div className="w-12 h-12 bg-slate-950 flex items-center justify-center text-white font-black text-xl shrink-0">1</div>
                      <p className="text-slate-950 font-black uppercase text-sm tracking-widest mt-3">LOAD IN CHROME (ANDROID) / SAFARI (IOS)</p>
                   </div>
                   <div className="flex items-start gap-6">
                      <div className="w-12 h-12 bg-slate-950 flex items-center justify-center text-white font-black text-xl shrink-0">2</div>
                      <p className="text-slate-950 font-black uppercase text-sm tracking-widest mt-3">ACTIVATE "ADD TO HOME SCREEN" PROTOCOL</p>
                   </div>
                   <div className="flex items-start gap-6">
                      <div className="w-12 h-12 bg-slate-950 flex items-center justify-center text-white font-black text-xl shrink-0">3</div>
                      <p className="text-slate-950 font-black uppercase text-sm tracking-widest mt-3">INITIALIZE DESKTOP ICON SYNC</p>
                   </div>
                </div>
              </div>
              <div className="w-full md:w-1/3 flex flex-col items-center gap-6">
                 <div className="relative w-64 h-64 bg-white border-8 border-slate-950 p-2 shadow-[12px_12px_0px_rgba(0,0,0,1)]">
                    <img src="/icon-512x512.png" alt="Mobile App Icon" className="w-full h-full object-cover" />
                 </div>
                 <div className="text-center">
                    <div className="text-slate-950 font-black text-2xl uppercase tracking-widest mb-2">MOBILE_CORE_V1</div>
                    <div className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em]">DEPLOYMENT_STATUS: READY</div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* How It Works */}
      <div className="container mx-auto px-6 py-32 border-t-4 border-slate-950 bg-slate-50">
        <h2 className="text-5xl font-black text-slate-950 text-center uppercase tracking-tighter mb-20 italic">HOW_TO_UPGRADE</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
          <div className="bg-white border-4 border-slate-950 p-8 shadow-[8px_8px_0px_rgba(0,0,0,1)]">
            <div className="w-16 h-16 bg-slate-950 flex items-center justify-center mb-8">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-black text-slate-950 uppercase tracking-tight mb-4">01. INITIALIZE</h3>
            <p className="text-slate-500 font-black uppercase text-xs tracking-widest leading-relaxed">
              REGISTER ACCOUNT. START PROXY SESSION. GAIN ENTRY AT LEVEL_0.
            </p>
          </div>
          <div className="bg-white border-4 border-slate-950 p-8 shadow-[8px_8px_0px_rgba(0,0,0,1)]">
            <div className="w-16 h-16 bg-slate-950 flex items-center justify-center mb-8">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-black text-slate-950 uppercase tracking-tight mb-4">02. ACCELERATE</h3>
            <p className="text-slate-500 font-black uppercase text-xs tracking-widest leading-relaxed">
              TIME_ON_SYNC UPGRADES TIERS AUTOMATICALLY. DEEPER NEURAL ARCHIVES UNLOCK EVERY HOUR.
            </p>
          </div>
          <div className="bg-white border-4 border-slate-950 p-8 shadow-[8px_8px_0px_rgba(0,0,0,1)]">
            <div className="w-16 h-16 bg-slate-950 flex items-center justify-center mb-8">
              <Unlock className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-black text-slate-950 uppercase tracking-tight mb-4">03. COMMAND</h3>
            <p className="text-slate-500 font-black uppercase text-xs tracking-widest leading-relaxed">
              BYPASS PROGRESSION VIA ELITE KEY. LIFETIME ARCHIVE ACCESS INSTANTLY.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
