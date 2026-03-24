'use client';

import React from 'react';
import { DecentralizedIcon, BlockchainIcon, CommunityIcon } from '../ui/Icons';

const steps = [
  {
    icon: DecentralizedIcon,
    title: 'Decentralized Training',
    description: 'Leverage a global network of computational power to train open-source AI models without a central authority.',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
  },
  {
    icon: BlockchainIcon,
    title: 'Blockchain Security',
    description: 'All contributions and model versions are recorded on a public blockchain for ultimate transparency and security.',
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
  },
  {
    icon: CommunityIcon,
    title: 'Community Governance',
    description: 'Platform fees are redirected to the community treasury, empowering token holders to vote on the future of the platform.',
    color: 'from-pink-500 to-pink-600',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/20',
  },
];

const HowItWorks = () => {
  return (
    <section className="relative bg-gray-950 py-24 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-gray-900 border border-gray-800 text-gray-400 text-sm mb-4">
            How It Works
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Powered by the
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              {' '}Community
            </span>
          </h2>
          <p className="text-gray-400 text-lg">
            Our decentralized architecture enables anyone to contribute compute power, 
            access AI models, and participate in platform governance.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div 
                key={step.title}
                className={`group relative rounded-2xl p-8 ${step.bgColor} ${step.borderColor} border hover:scale-105 transition-all duration-500 hover-lift`}
              >
                {/* Step number */}
                <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 flex items-center justify-center text-2xl font-bold text-gray-600 group-hover:text-white group-hover:border-gray-500 transition-colors">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all">
                  {step.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {step.description}
                </p>

                {/* Learn more link */}
                <div className="mt-6">
                  <a 
                    href="/whitepaper" 
                    className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-white transition-colors group/link"
                  >
                    Learn more
                    <span className="group-hover/link:translate-x-1 transition-transform">→</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Connection line (desktop only) */}
        <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-0.5 -z-10">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-gray-800 to-transparent" />
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
