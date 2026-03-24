'use client';

import React, { useState, useEffect } from 'react';
import { TIERS, UserTier, TEST_MODE } from '@/lib/tiers';
import { Shield, AlertTriangle, CheckCircle, Lock, Unlock, FlaskConical, GraduationCap, Building2, Crown, Loader2 } from './Icons';

interface TierInfo {
  currentTier: UserTier;
  canUpgrade: boolean;
  testMode: boolean;
  verificationRequired: boolean;
}

const TierManager = () => {
  const [tierInfo, setTierInfo] = useState<TierInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [selectedTier, setSelectedTier] = useState<UserTier | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const tierIcons = {
    explorer: Shield,
    novice: FlaskConical,
    apprentice: GraduationCap,
    adept: Building2,
    master: Crown,
    developer: Unlock,
  };

  const tierColors = {
    explorer: 'from-gray-500 to-gray-600',
    novice: 'from-blue-500 to-blue-600',
    apprentice: 'from-indigo-500 to-indigo-600',
    adept: 'from-purple-500 to-purple-600',
    master: 'from-amber-500 to-amber-600',
    developer: 'from-rose-500 to-rose-600',
  };

  useEffect(() => {
    fetchTierStatus();
  }, []);

  const fetchTierStatus = async () => {
    try {
      const userEmail = localStorage.getItem('user_email');
      const response = await fetch('/api/tiers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userEmail || 'anonymous'}`,
        },
        body: JSON.stringify({ action: 'getStatus' }),
      });

      if (response.ok) {
        const data = await response.json();
        setTierInfo(data);
      }
    } catch (error) {
      console.error('Error fetching tier status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (tier: UserTier) => {
    setUpgrading(true);
    setMessage(null);

    try {
      const userEmail = localStorage.getItem('user_email');
      const response = await fetch('/api/tiers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userEmail || 'anonymous'}`,
        },
        body: JSON.stringify({
          action: 'requestUpgrade',
          tier,
          verificationData: { reason: 'Research access' }
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        await fetchTierStatus();
      } else {
        setMessage(data.error || 'Upgrade failed');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    } finally {
      setUpgrading(false);
      setSelectedTier(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  const currentTier = tierInfo?.currentTier || 'explorer';
  const tierOrder: UserTier[] = ['explorer', 'novice', 'apprentice', 'adept', 'master', 'developer'];
  const currentTierIndex = tierOrder.indexOf(currentTier);

  return (
    <div className="space-y-6">
      {/* Current Tier Card */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-xl p-6 border border-gray-800">
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${tierColors[currentTier]} flex items-center justify-center`}>
            {React.createElement(tierIcons[currentTier], { className: 'w-8 h-8 text-white' })}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">{TIERS[currentTier].name}</h3>
            <p className="text-gray-400">{TIERS[currentTier].description}</p>
          </div>
        </div>

        {TEST_MODE.enabled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-900/30 border border-green-800 rounded-lg text-green-400 text-sm">
            <FlaskConical className="w-4 h-4" />
            <span>Test Mode Active - All upgrades are free and instant</span>
          </div>
        )}
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${message.includes('success') || message.includes('upgraded') ? 'bg-green-900/30 border border-green-800 text-green-400' : 'bg-red-900/30 border border-red-800 text-red-400'}`}>
          {message}
        </div>
      )}

      {/* Tier Selection */}
      <div className="grid gap-4">
        <h4 className="text-lg font-semibold text-white">Available Tiers</h4>

        {tierOrder.map((tier, index) => {
          const tierData = TIERS[tier];
          const isCurrentTier = tier === currentTier;
          const isUnlocked = index <= currentTierIndex;
          const canUpgradeTo = index === currentTierIndex + 1 && tierInfo?.canUpgrade;
          const Icon = tierIcons[tier];

          return (
            <div
              key={tier}
              className={`relative rounded-xl border transition-all duration-300 ${isCurrentTier
                ? 'bg-blue-900/20 border-blue-500'
                : canUpgradeTo
                  ? 'bg-gray-900 border-gray-700 hover:border-blue-500 cursor-pointer'
                  : 'bg-gray-900/50 border-gray-800 opacity-60'
                }`}
              onClick={() => canUpgradeTo && setSelectedTier(tier)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${tierColors[tier]} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h5 className="text-lg font-bold text-white">{tierData.name}</h5>
                      <p className="text-sm text-gray-400">{tierData.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isCurrentTier && (
                      <span className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                        Current
                      </span>
                    )}
                    {canUpgradeTo && (
                      <span className="px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">
                        Available
                      </span>
                    )}
                    {!isUnlocked && !canUpgradeTo && (
                      <Lock className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-400 font-medium">Features:</p>
                  <div className="flex flex-wrap gap-2">
                    {tierData.features.slice(0, 4).map((feature) => (
                      <span
                        key={feature}
                        className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Model Access */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300">
                      {tierData.canAccessBannedModels ? 'Banned models' : 'Standard models only'}
                    </span>
                  </div>
                  {tierData.canAccessUnethicalModels && (
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span className="text-amber-400">Unethical models</span>
                    </div>
                  )}
                </div>

                {/* Upgrade Button */}
                {canUpgradeTo && selectedTier === tier && (
                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <div className="bg-amber-900/30 border border-amber-800 rounded-lg p-3 mb-4">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-amber-200">
                          <p className="font-semibold mb-1">Important Notice</p>
                          {tier === 'adept' && (
                            <p>This tier grants access to roleplay and more advanced conversational models. Some limits still apply.</p>
                          )}
                          {(tier === 'master' || tier === 'developer') && (
                            <p>This tier grants access to banned and uncensored/harmful AI models. Strict ethical oversight required. Research use only with mandatory safety protocols.</p>
                          )}
                          {(tier === 'novice' || tier === 'apprentice') && (
                            <p>Upgrading will grant you additional research capabilities and experimental model access.</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleUpgrade(tier)}
                        disabled={upgrading}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        {upgrading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Upgrading...
                          </>
                        ) : (
                          <>
                            <Unlock className="w-4 h-4" />
                            Confirm Upgrade
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setSelectedTier(null)}
                        disabled={upgrading}
                        className="px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {canUpgradeTo && selectedTier !== tier && (
                  <button
                    onClick={() => setSelectedTier(tier)}
                    className="mt-4 w-full py-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    Select This Tier
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Ethical Guidelines */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-400" />
          Ethical Research Guidelines
        </h4>
        <ul className="space-y-2 text-sm text-gray-400">
          <li className="flex items-start gap-2">
            <span className="text-green-400">✓</span>
            All research must be conducted with academic or scientific rigor
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400">✓</span>
            Findings involving harmful AI behaviors must be published to improve safety
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400">✓</span>
            Access to banned/unethical models requires research justification
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400">✓</span>
            All model interactions are logged for transparency
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-400">✗</span>
            Never use harmful models for content generation or distribution
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-400">✗</span>
            Do not attempt to bypass safety measures for malicious purposes
          </li>
        </ul>
      </div>
    </div>
  );
};

export default TierManager;
