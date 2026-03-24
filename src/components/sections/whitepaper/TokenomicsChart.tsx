'use client';

import React from 'react';
import { Coins, TrendingUp, Users, Lock } from '@/components/ui/Icons';

const tokenDistribution = [
  { label: 'Community Rewards', percentage: 40, color: 'bg-blue-500' },
  { label: 'Team & Advisors', percentage: 20, color: 'bg-purple-500' },
  { label: 'Treasury', percentage: 15, color: 'bg-green-500' },
  { label: 'Early Investors', percentage: 15, color: 'bg-yellow-500' },
  { label: 'Liquidity', percentage: 10, color: 'bg-pink-500' },
];

const tokenUtility = [
  {
    icon: Coins,
    title: 'Transaction Fees',
    description: 'CYBER tokens are used to pay for AI model inference and training services on the platform.',
  },
  {
    icon: TrendingUp,
    title: 'Staking Rewards',
    description: 'Stake CYBER to earn a share of platform revenue and participate in governance decisions.',
  },
  {
    icon: Users,
    title: 'Governance',
    description: 'Token holders vote on protocol upgrades, treasury allocation, and model prioritization.',
  },
  {
    icon: Lock,
    title: 'Compute Provider Bonds',
    description: 'Node operators stake CYBER as collateral to ensure reliable service delivery.',
  },
];

export default function TokenomicsChart() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-4xl font-bold text-white">Tokenomics</h2>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-900/20 border border-blue-500/30 rounded-lg text-blue-300 font-mono text-sm max-w-full overflow-hidden">
          <span className="font-bold">CA:</span>
          <span className="text-white truncate">Coming soon</span>
        </div>
      </div>

      <p className="text-gray-400 text-lg">
        The CYBER token powers the AI Sanctuary ecosystem, aligning incentives between
        users, compute providers, and developers.
      </p>

      {/* Token Distribution */}
      <div className="bg-gray-900 rounded-xl p-8 border border-gray-800">
        <h3 className="text-2xl font-bold text-white mb-6">Token Distribution</h3>
        <div className="space-y-4">
          {tokenDistribution.map((item) => (
            <div key={item.label} className="flex items-center gap-4">
              <div className="w-32 text-gray-300 text-sm">{item.label}</div>
              <div className="flex-1 bg-gray-800 rounded-full h-6 overflow-hidden">
                <div
                  className={`${item.color} h-full rounded-full transition-all duration-1000`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
              <div className="w-16 text-right text-white font-bold">{item.percentage}%</div>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-6 border-t border-gray-800">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Total Supply</span>
            <span className="text-2xl font-bold text-white">1,000,000,000 CYBER</span>
          </div>
        </div>
      </div>

      {/* Token Utility */}
      <div className="grid md:grid-cols-2 gap-6">
        {tokenUtility.map((utility) => {
          const Icon = utility.icon;
          return (
            <div key={utility.title} className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <Icon className="w-10 h-10 text-blue-400 mb-4" />
              <h4 className="text-xl font-bold text-white mb-2">{utility.title}</h4>
              <p className="text-gray-400">{utility.description}</p>
            </div>
          );
        })}
      </div>

      {/* Revenue Model */}
      <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl p-8 border border-blue-900/50">
        <h3 className="text-2xl font-bold text-white mb-4">Revenue Distribution</h3>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-900/50 rounded-lg">
            <div className="text-3xl font-bold text-blue-400">50%</div>
            <div className="text-gray-400 text-sm">Compute Providers</div>
          </div>
          <div className="text-center p-4 bg-gray-900/50 rounded-lg">
            <div className="text-3xl font-bold text-purple-400">25%</div>
            <div className="text-gray-400 text-sm">Staking Rewards</div>
          </div>
          <div className="text-center p-4 bg-gray-900/50 rounded-lg">
            <div className="text-3xl font-bold text-green-400">15%</div>
            <div className="text-gray-400 text-sm">Treasury</div>
          </div>
          <div className="text-center p-4 bg-gray-900/50 rounded-lg">
            <div className="text-3xl font-bold text-pink-400">10%</div>
            <div className="text-gray-400 text-sm">Buyback & Burn</div>
          </div>
        </div>
      </div>
    </div>
  );
}
