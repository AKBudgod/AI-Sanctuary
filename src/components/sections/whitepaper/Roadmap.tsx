'use client';

import React from 'react';
import { CheckCircle, Circle, Clock } from '@/components/ui/Icons';

const roadmapPhases = [
  {
    phase: 'Phase 1: Foundation',
    status: 'completed',
    timeframe: 'Q4 2025',
    items: [
      'Core team formation',
      'Whitepaper publication',
      'Smart contract development',
      'Testnet launch',
      'Community building initiatives',
    ],
  },
  {
    phase: 'Phase 2: Launch',
    status: 'in_progress',
    timeframe: 'Q1 2026',
    items: [
      'Token generation event',
      'Mainnet deployment',
      'Initial model integrations (LLaMA, Qwen)',
      'Compute provider onboarding',
      'Staking mechanism activation',
    ],
  },
  {
    phase: 'Phase 3: Expansion',
    status: 'upcoming',
    timeframe: 'Q2-Q3 2026',
    items: [
      'Decentralized training marketplace',
      'Mobile app release',
      'Enterprise partnerships',
      'Cross-chain integrations',
      'Advanced privacy features (zk-SNARKs)',
    ],
  },
  {
    phase: 'Phase 4: Maturation',
    status: 'upcoming',
    timeframe: 'Q4 2026+',
    items: [
      'DAO full transition',
      'Custom model creation tools',
      'AI agent marketplace',
      'Global compute network',
      'Research grant program',
    ],
  },
];

export default function Roadmap() {
  return (
    <div className="space-y-8">
      <h2 className="text-4xl font-bold text-white">Roadmap</h2>
      
      <p className="text-gray-400 text-lg">
        Our development roadmap outlines the key milestones on our journey to building 
        the world's premier decentralized AI platform.
      </p>

      <div className="space-y-6">
        {roadmapPhases.map((phase, index) => {
          const StatusIcon = phase.status === 'completed' 
            ? CheckCircle 
            : phase.status === 'in_progress' 
              ? Clock 
              : Circle;
          
          const statusColors = {
            completed: 'text-green-400 border-green-900/50 bg-green-950/20',
            in_progress: 'text-blue-400 border-blue-900/50 bg-blue-950/20',
            upcoming: 'text-gray-500 border-gray-800 bg-gray-900/50',
          }[phase.status];

          const statusLabel = {
            completed: 'Completed',
            in_progress: 'In Progress',
            upcoming: 'Upcoming',
          }[phase.status];

          return (
            <div 
              key={phase.phase} 
              className={`rounded-xl p-6 border ${statusColors}`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <StatusIcon className="w-6 h-6" />
                  <h3 className="text-xl font-bold text-white">{phase.phase}</h3>
                </div>
                <div className="flex items-center gap-4 mt-2 md:mt-0">
                  <span className="px-3 py-1 rounded-full bg-gray-800 text-sm">
                    {statusLabel}
                  </span>
                  <span className="text-gray-400">{phase.timeframe}</span>
                </div>
              </div>
              
              <ul className="grid md:grid-cols-2 gap-2">
                {phase.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-gray-300">
                    <span className={phase.status === 'completed' ? 'text-green-400' : 'text-gray-600'}>
                      {phase.status === 'completed' ? '✓' : '○'}
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="bg-gray-900 rounded-xl p-8 border border-gray-800">
        <h3 className="text-xl font-bold text-white mb-4">Long-term Vision</h3>
        <p className="text-gray-400 leading-relaxed">
          By 2027, AI Sanctuary aims to become the dominant decentralized AI infrastructure, 
          powering millions of AI interactions daily while maintaining complete transparency 
          and community governance. We envision a future where AI development is democratized, 
          accessible, and aligned with human values through decentralized coordination.
        </p>
      </div>
    </div>
  );
}
