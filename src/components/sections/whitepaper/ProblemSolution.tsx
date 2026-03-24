'use client';

import React from 'react';
import { XCircle, CheckCircle } from '@/components/ui/Icons';

const problems = [
  'Centralized control of AI by a few tech giants',
  'Black-box algorithms with no transparency',
  'Expensive API costs limiting accessibility',
  'Data privacy concerns and misuse risks',
  'Limited community participation in AI development',
];

const solutions = [
  'Decentralized infrastructure owned by the community',
  'Open-source models with verifiable training data',
  'Competitive marketplace reducing costs by 80%',
  'Privacy-preserving computation via zk-SNARKs',
  'Token incentives for contributors and validators',
];

export default function ProblemSolution() {
  return (
    <div className="space-y-8">
      <h2 className="text-4xl font-bold text-white">Problem & Solution</h2>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Problems */}
        <div className="bg-red-950/30 border border-red-900/50 rounded-xl p-8">
          <h3 className="text-2xl font-bold text-red-400 mb-6 flex items-center gap-3">
            <XCircle className="w-8 h-8" />
            The Problem
          </h3>
          <ul className="space-y-4">
            {problems.map((problem, index) => (
              <li key={index} className="flex items-start gap-3 text-gray-300">
                <span className="text-red-500 mt-1">•</span>
                {problem}
              </li>
            ))}
          </ul>
        </div>

        {/* Solutions */}
        <div className="bg-green-950/30 border border-green-900/50 rounded-xl p-8">
          <h3 className="text-2xl font-bold text-green-400 mb-6 flex items-center gap-3">
            <CheckCircle className="w-8 h-8" />
            Our Solution
          </h3>
          <ul className="space-y-4">
            {solutions.map((solution, index) => (
              <li key={index} className="flex items-start gap-3 text-gray-300">
                <span className="text-green-500 mt-1">✓</span>
                {solution}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-gray-900 rounded-xl p-8 border border-gray-800">
        <h3 className="text-2xl font-bold text-white mb-4">Market Opportunity</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-400 mb-2">$200B+</div>
            <div className="text-gray-400">AI Market by 2025</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-400 mb-2">$50B+</div>
            <div className="text-gray-400">Decentralized Compute</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-400 mb-2">10M+</div>
            <div className="text-gray-400">Potential Users</div>
          </div>
        </div>
      </div>
    </div>
  );
}
