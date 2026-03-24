'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  Unlock,
  Zap,
  Check,
  XIcon,
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
    description: 'Just arrived — free access to basic AI models',
    price: 'Free',
    time: '0-1 hours',
    maxRequests: 1000,
    rateLimit: 60,
    color: 'blue',
    features: ['100 Free Daily AI Requests', 'Access to LLaMA 3B, Qwen 7B (Free)', 'Strict Safety Filters'],
    restrictions: [
      'Basic models only',
      'No uncensored access',
    ],
    allowedVoices: ['voice-lyra', 'voice-maya', 'voice-john'],
    cta: 'Start Free Trial',
    ctaLink: '/platform',
  },
  {
    id: 'novice',
    name: 'Novice',
    description: 'Getting settled — experimental models unlocked',
    price: 'Free',
    time: '1-3 hours on platform',
    maxRequests: 2000,
    rateLimit: 60,
    color: 'cyan',
    features: ['100 Free Daily AI Requests', 'Access to Nous Hermes, OpenChat', 'Standard Safety Filters'],
    restrictions: [
      'No uncensored models',
    ],
    allowedVoices: ['voice-lyra', 'voice-maya', 'voice-john', 'voice-rachel', 'voice-antoni'],
  },
  {
    id: 'apprentice',
    name: 'Apprentice',
    description: 'Proven dedication — uncensored models unlocked',
    price: 'Free',
    time: '3-10 hours on platform',
    maxRequests: 5000,
    rateLimit: 60,
    color: 'purple',
    features: ['100 Free Daily AI Requests', 'Access to WizardLM, Dolphin (Uncensored)', 'Relaxed Safety Filters'],
    restrictions: [
      'No roleplay models',
    ],
    allowedVoices: ['voice-lyra', 'voice-maya', 'voice-john', 'voice-rachel', 'voice-antoni', 'voice-bella', 'voice-josh'],
  },
  {
    id: 'adept',
    name: 'Adept',
    description: 'Trusted user — character & roleplay models unlocked',
    price: 'Free',
    time: '10-24 hours on platform',
    maxRequests: 10000,
    rateLimit: 60,
    color: 'pink',
    features: ['100 Free Daily AI Requests', 'Access to Pygmalion, Mythomax', 'Minimal Safety Filters (Mature)'],
    restrictions: [
      'No broken-protocol models',
    ],
    allowedVoices: ['voice-lyra', 'voice-maya', 'voice-john', 'voice-rachel', 'voice-antoni', 'voice-bella', 'voice-josh', 'voice-angel', 'voice-antigravity'],
  },
  {
    id: 'master',
    name: 'Master',
    description: 'The inner circle — all models unlocked',
    price: 'Free',
    time: '24+ hours on platform',
    maxRequests: 20000,
    rateLimit: 120,
    color: 'red',
    features: ['100 Free Daily AI Requests', 'Total access to all models', 'No Safety Filters (Uncensored)'],
    restrictions: [],
    allowedVoices: ['voice-lyra', 'voice-lyra-uncensored', 'voice-maya', 'voice-john', 'voice-rachel', 'voice-antoni', 'voice-bella', 'voice-josh', 'voice-angel', 'voice-antigravity', 'voice-domi', 'voice-cleo', 'voice-lily', 'voice-miles', 'voice-mj', 'voice-kla'],
  },
  {
    id: 'developer',
    name: 'Developer Mode',
    description: 'Instant unlock of everything — skip the wait',
    price: '$50',
    time: 'Instant',
    maxRequests: 1000000,
    rateLimit: 1000,
    color: 'yellow',
    features: ['Instant Unlock', '1M Monthly Tokens', 'Priority Support', 'No Safety Filters (Uncensored)'],
    restrictions: [],
    cta: 'Purchase Developer Mode',
    ctaLink: '/buy?mode=developer',
    allowedVoices: ['voice-lyra', 'voice-lyra-uncensored', 'voice-maya', 'voice-john', 'voice-rachel', 'voice-antoni', 'voice-bella', 'voice-josh', 'voice-angel', 'voice-antigravity', 'voice-domi', 'voice-cleo', 'voice-ivy', 'voice-nova', 'voice-lily', 'voice-miles', 'voice-skye', 'voice-raven', 'voice-mj', 'voice-kla'],
    highlight: true,
  },
];

const tierOrder = ['explorer', 'novice', 'apprentice', 'adept', 'master', 'developer'];

const colorMap: Record<string, { bg: string; border: string; text: string; badge: string; gradient: string }> = {
  blue: { bg: 'from-blue-900/30 to-gray-900', border: 'border-blue-800/50', text: 'text-blue-400', badge: 'bg-blue-900/30 border-blue-800 text-blue-300', gradient: 'from-blue-600 to-blue-500' },
  cyan: { bg: 'from-cyan-900/30 to-gray-900', border: 'border-cyan-800/50', text: 'text-cyan-400', badge: 'bg-cyan-900/30 border-cyan-800 text-cyan-300', gradient: 'from-cyan-600 to-cyan-500' },
  purple: { bg: 'from-purple-900/30 to-gray-900', border: 'border-purple-800/50', text: 'text-purple-400', badge: 'bg-purple-900/30 border-purple-800 text-purple-300', gradient: 'from-purple-600 to-purple-500' },
  pink: { bg: 'from-pink-900/30 to-gray-900', border: 'border-pink-800/50', text: 'text-pink-400', badge: 'bg-pink-900/30 border-pink-800 text-pink-300', gradient: 'from-pink-600 to-pink-500' },
  red: { bg: 'from-red-900/30 to-gray-900', border: 'border-red-800/50', text: 'text-red-400', badge: 'bg-red-900/30 border-red-800 text-red-300', gradient: 'from-red-600 to-red-500' },
  yellow: { bg: 'from-yellow-900/30 to-gray-900', border: 'border-yellow-700/50', text: 'text-yellow-400', badge: 'bg-yellow-900/30 border-yellow-700 text-yellow-300', gradient: 'from-yellow-600 to-orange-500' },
};

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
    <div className="min-h-screen bg-gray-950">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-purple-900/20 to-gray-950" />
        <div className="relative container mx-auto px-6 py-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-900/30 border border-blue-800 text-blue-300 text-sm mb-6">
              <Shield className="w-4 h-4" />
              Access Tiers
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              AI Access
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                {' '}Tiers
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Your access grows with time spent on the platform. Start free, unlock more powerful models as you explore.
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
      <div className="container mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-white text-center mb-8">Tier Progression</h2>
        <div className="flex items-center justify-center gap-2 mb-12 flex-wrap">
          {tiers.filter(t => t.id !== 'developer').map((tier, i) => {
            const colors = colorMap[tier.color];
            const isUnlocked = tierOrder.indexOf(tier.id) <= currentTierIndex;
            const isCurrent = tier.id === currentTier;
            return (
              <React.Fragment key={tier.id}>
                {i > 0 && (
                  <ChevronRight className={`w-5 h-5 ${isUnlocked ? 'text-green-400' : 'text-gray-600'} hidden sm:block`} />
                )}
                <div
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${isCurrent
                    ? `${colors.badge} ring-2 ring-${tier.color}-500`
                    : isUnlocked
                      ? 'bg-green-900/20 border-green-800/50 text-green-400'
                      : 'bg-gray-900 border-gray-700 text-gray-500'
                    }`}
                >
                  {isUnlocked && !isCurrent && <Check className="w-3 h-3 inline mr-1" />}
                  {isCurrent && <Sparkles className="w-3 h-3 inline mr-1" />}
                  {!isUnlocked && <Lock className="w-3 h-3 inline mr-1" />}
                  {tier.name}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Tiers Scroll View */}
      <div className="w-full px-6 py-8 pb-24 overflow-hidden">
        <div
          ref={scrollContainerRef}
          onWheel={handleWheel}
          className="flex overflow-x-auto gap-6 snap-x snap-mandatory pb-8 scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {tiers.map((tier) => {
            const colors = colorMap[tier.color];
            const tierIndex = tierOrder.indexOf(tier.id);
            const isUnlocked = tierIndex <= currentTierIndex || tier.id === 'developer' && currentTier === 'developer';
            const isCurrent = tier.id === currentTier;

            return (
              <div
                key={tier.id}
                className={`relative flex-shrink-0 w-[85vw] sm:w-[400px] snap-center bg-gradient-to-br ${colors.bg} rounded-2xl p-6 border ${colors.border} transition-all hover:shadow-lg hover:shadow-${tier.color}-900/20 ${tier.highlight ? 'ring-2 ring-yellow-500/50' : ''
                  } ${isCurrent ? 'ring-2 ring-blue-500' : ''}`}
              >
                {/* Badge */}
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold">
                    CURRENT TIER
                  </div>
                )}
                {tier.highlight && !isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-600 to-orange-500 text-white text-xs font-bold">
                    ⚡ SKIP THE WAIT
                  </div>
                )}

                {/* Header */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`text-xl font-bold ${colors.text}`}>{tier.name}</h3>
                    {isUnlocked && tier.id !== 'developer' && (
                      <Unlock className="w-5 h-5 text-green-400" />
                    )}
                    {!isUnlocked && tier.id !== 'developer' && (
                      <Lock className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                  <p className="text-gray-400 text-sm">{tier.description}</p>
                </div>

                {/* Price & Time */}
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-3xl font-bold text-white">{tier.price}</span>
                  {tier.time && (
                    <span className="text-gray-500 text-sm">• {tier.time}</span>
                  )}
                </div>

                {/* Stats */}
                <div className="flex gap-4 mb-4">
                  <div className="bg-gray-950/50 rounded-lg px-3 py-2 text-center flex-1 border border-white/5">
                    <div className="text-white font-bold text-sm">{tier.maxRequests.toLocaleString()}</div>
                    <div className="text-gray-500 text-[10px] uppercase tracking-tighter">req/month</div>
                  </div>
                  <div className="bg-gray-950/50 rounded-lg px-3 py-2 text-center flex-1 border border-white/5">
                    <div className="text-white font-bold text-sm">{tier.rateLimit}</div>
                    <div className="text-gray-500 text-[10px] uppercase tracking-tighter">req/min</div>
                  </div>
                </div>

                {/* Voices */}
                {(tier as any).allowedVoices && (
                  <div className="mb-6 p-3 bg-black/30 rounded-xl border border-white/5">
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                       <Volume2 className="w-3 h-3 text-blue-400" />
                       Character Voices
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(tier as any).allowedVoices.slice(0, 8).map((v: string) => (
                        <span key={v} className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-gray-300 border border-white/5">
                          {v.replace('voice-', '')}
                        </span>
                      ))}
                      {(tier as any).allowedVoices.length > 8 && (
                        <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-[10px] text-blue-300 font-bold border border-blue-500/30">
                          +{(tier as any).allowedVoices.length - 8} Premium Voices Unlocked
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {tier.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                  {tier.restrictions.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-500">
                      <XIcon className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {/* Custom CTA Logic for Developer / Age Verification */}
                {tier.id === 'developer' ? (
                  <div className="space-y-3">
                    {!userMeta.isVerified ? (
                      <button
                        onClick={handleVerifyAge}
                        disabled={loading}
                        className="block w-full text-center py-3 rounded-lg font-semibold bg-gray-700 text-white hover:bg-gray-600 transition-all border border-gray-600"
                      >
                        {loading ? 'Processing...' : 'Verify Age (18+) to Unlock'}
                      </button>
                    ) : (
                      <>
                        {!userMeta.trialUsed && !userMeta.isDeveloper && (
                          <button
                            onClick={handleStartTrial}
                            disabled={loading}
                            className="block w-full text-center py-3 rounded-lg font-semibold bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-500 hover:to-green-400 shadow-lg shadow-green-900/30 transition-all"
                          >
                            Start 3-Day Free Trial
                          </button>
                        )}
                        <a
                          href={tier.ctaLink}
                          className="block w-full text-center py-3 rounded-lg font-semibold bg-gradient-to-r from-yellow-600 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-400 shadow-lg shadow-yellow-900/30 transition-all"
                        >
                          Purchase for $50
                        </a>
                      </>
                    )}
                  </div>
                ) : (
                  tier.cta ? (
                    <a
                      href={tier.ctaLink}
                      className={`block w-full text-center py-3 rounded-lg font-semibold transition-all ${'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400'
                        }`}
                    >
                      {tier.cta}
                    </a>
                  ) : (
                    <div className={`text-center py-3 rounded-lg text-sm ${isUnlocked
                      ? 'bg-green-900/20 text-green-400 border border-green-800/50'
                      : (!userMeta.isVerified && (tier.id === 'adept' || tier.id === 'master'))
                        ? 'bg-red-900/20 text-red-400 border border-red-800/50'
                        : 'bg-gray-800/50 text-gray-500 border border-gray-700/50'
                      }`}>
                      {isUnlocked
                        ? '✓ Unlocked'
                        : (!userMeta.isVerified && (tier.id === 'adept' || tier.id === 'master'))
                          ? '🔒 Age Verification Required'
                          : `🕒 Unlock after ${tier.time}`
                      }
                    </div>
                  )
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* How It Works */}
      <div className="container mx-auto px-6 py-16 border-t border-gray-800">
        <h2 className="text-3xl font-bold text-white text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-900/30 border border-blue-800 flex items-center justify-center mx-auto mb-4">
              <Zap className="w-7 h-7 text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">1. Start Free</h3>
            <p className="text-gray-400 text-sm">
              Sign up with your email and immediately get Explorer access. No payment needed.
            </p>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-purple-900/30 border border-purple-800 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-7 h-7 text-purple-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">2. Earn Time</h3>
            <p className="text-gray-400 text-sm">
              The more you use the platform, the more powerful models you unlock. Your tier upgrades automatically.
            </p>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-yellow-900/30 border border-yellow-700 flex items-center justify-center mx-auto mb-4">
              <Unlock className="w-7 h-7 text-yellow-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">3. Or Go Instant</h3>
            <p className="text-gray-400 text-sm">
              Purchase Developer Mode for $50 to instantly unlock everything — all models, max rate limits, priority support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
