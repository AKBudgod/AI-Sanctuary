'use client';

import React from 'react';
import { Vote, MessageSquare, FileText, Scale } from '@/components/ui/Icons';

const governanceFeatures = [
  {
    icon: Vote,
    title: 'On-Chain Voting',
    description: 'All governance decisions are executed through transparent, immutable smart contracts.',
  },
  {
    icon: MessageSquare,
    title: 'Community Proposals',
    description: 'Any token holder can submit proposals for protocol changes or treasury allocations.',
  },
  {
    icon: FileText,
    title: 'Delegation',
    description: 'Token holders can delegate voting power to trusted community representatives.',
  },
  {
    icon: Scale,
    title: 'Quadratic Voting',
    description: 'Prevents whale dominance by making votes increasingly expensive for large holders.',
  },
];

const proposalTypes = [
  {
    type: 'Parameter Changes',
    threshold: '1% of supply',
    quorum: '10% participation',
    examples: ['Fee adjustments', 'Reward rates', 'Slashing conditions'],
  },
  {
    type: 'Treasury Spending',
    threshold: '2% of supply',
    quorum: '15% participation',
    examples: ['Grants', 'Development funding', 'Marketing initiatives'],
  },
  {
    type: 'Protocol Upgrades',
    threshold: '5% of supply',
    quorum: '25% participation',
    examples: ['Smart contract upgrades', 'New features', 'Chain migrations'],
  },
];

export default function GovernanceModel() {
  return (
    <div className="space-y-8">
      <h2 className="text-4xl font-bold text-white">Governance Model</h2>
      
      <p className="text-gray-400 text-lg">
        AI Sanctuary is governed by its community of token holders, ensuring the protocol 
        evolves according to the collective will of its stakeholders.
      </p>

      {/* Governance Features */}
      <div className="grid md:grid-cols-2 gap-6">
        {governanceFeatures.map((feature) => {
          const Icon = feature.icon;
          return (
            <div key={feature.title} className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <Icon className="w-10 h-10 text-purple-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          );
        })}
      </div>

      {/* Proposal Types Table */}
      <div className="bg-gray-900 rounded-xl p-8 border border-gray-800">
        <h3 className="text-2xl font-bold text-white mb-6">Proposal Requirements</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-4 px-4 text-gray-400 font-semibold">Proposal Type</th>
                <th className="text-left py-4 px-4 text-gray-400 font-semibold">Proposal Threshold</th>
                <th className="text-left py-4 px-4 text-gray-400 font-semibold">Quorum Required</th>
                <th className="text-left py-4 px-4 text-gray-400 font-semibold">Examples</th>
              </tr>
            </thead>
            <tbody>
              {proposalTypes.map((type, index) => (
                <tr key={index} className="border-b border-gray-800 last:border-0">
                  <td className="py-4 px-4 text-white font-medium">{type.type}</td>
                  <td className="py-4 px-4 text-gray-400">{type.threshold}</td>
                  <td className="py-4 px-4 text-gray-400">{type.quorum}</td>
                  <td className="py-4 px-4 text-gray-400 text-sm">{type.examples.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Voting Process */}
      <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl p-8 border border-purple-900/50">
        <h3 className="text-2xl font-bold text-white mb-6">Voting Process</h3>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {[
            'Proposal Submission',
            'Discussion Period (7 days)',
            'Voting Period (3 days)',
            'Execution',
          ].map((step, index) => (
            <React.Fragment key={step}>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold mb-2 mx-auto">
                  {index + 1}
                </div>
                <span className="text-gray-300 text-sm">{step}</span>
              </div>
              {index < 3 && (
                <div className="hidden md:block text-gray-600">→</div>
              )}
              {index < 3 && (
                <div className="md:hidden text-gray-600">↓</div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
