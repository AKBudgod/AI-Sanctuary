'use client';

import React from 'react';
import { Brain, Shield, Users } from '@/components/ui/Icons';

export default function AbstractSection() {
  return (
    <div className="space-y-8">
      <h2 className="text-4xl font-bold text-white">Abstract</h2>
      
      <div className="prose prose-invert max-w-none">
        <p className="text-lg text-gray-300 leading-relaxed">
          AI Sanctuary (CYBER) represents a paradigm shift in artificial intelligence development and deployment. 
          By leveraging blockchain technology and decentralized computing, we are building the world's first 
          truly open, transparent, and community-governed AI ecosystem.
        </p>
        
        <p className="text-gray-400 leading-relaxed">
          The current AI landscape is dominated by centralized corporations that control access to the most 
          powerful models, creating barriers to entry and raising concerns about transparency, bias, and 
          data privacy. AI Sanctuary addresses these challenges by creating a decentralized marketplace 
          where AI models can be trained, shared, and monetized in a trustless environment.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <Brain className="w-12 h-12 text-blue-400 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Decentralized AI</h3>
          <p className="text-gray-400">
            Open-source model development powered by distributed computing resources from global contributors.
          </p>
        </div>
        
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <Shield className="w-12 h-12 text-green-400 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Trustless Security</h3>
          <p className="text-gray-400">
            Blockchain-verified model integrity and transparent training data provenance.
          </p>
        </div>
        
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <Users className="w-12 h-12 text-purple-400 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Community Governed</h3>
          <p className="text-gray-400">
            Token holders vote on platform development, model priorities, and treasury allocation.
          </p>
        </div>
      </div>
    </div>
  );
}
