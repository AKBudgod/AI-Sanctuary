'use client';

import React from 'react';
import { ExternalLink, Sparkles, Code, Database } from '@/components/ui/Icons';

const models = [
  {
    name: 'LLaMA 3.3',
    provider: 'Meta AI',
    description: 'The latest generation of large language models from Meta AI, offering state-of-the-art performance across reasoning, coding, and multilingual tasks.',
    parameters: '70B',
    type: 'General Purpose',
    icon: Sparkles,
    color: 'from-blue-500 to-blue-600',
    featured: true,
  },
  {
    name: 'Qwen 3',
    provider: 'Alibaba Cloud',
    description: 'A powerful multimodal model series capable of understanding and generating text, images, and audio with exceptional quality.',
    parameters: '72B',
    type: 'Multimodal',
    icon: Database,
    color: 'from-purple-500 to-purple-600',
    featured: false,
  },
  {
    name: 'DeepSeek-V3',
    provider: 'DeepSeek',
    description: 'A strong open-source model with exceptional code intelligence, mathematical reasoning, and instruction following capabilities.',
    parameters: '67B',
    type: 'Code & Reasoning',
    icon: Code,
    color: 'from-green-500 to-green-600',
    featured: false,
  },
  {
    name: 'More Coming Soon',
    provider: 'Community',
    description: 'Our decentralized platform continuously onboard new and powerful open-source models from the community and leading research labs.',
    parameters: '—',
    type: 'Various',
    icon: Sparkles,
    color: 'from-gray-500 to-gray-600',
    featured: false,
  }
];

const FeaturedModels = () => {
  return (
    <section className="relative bg-gray-950 py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative container mx-auto px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <span className="inline-block px-4 py-2 rounded-full bg-gray-900 border border-gray-800 text-gray-400 text-sm mb-4">
              Model Marketplace
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Featured
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                {' '}Models
              </span>
            </h2>
            <p className="text-gray-400 text-lg">
              Access state-of-the-art AI models optimized for our decentralized infrastructure. 
              New models added weekly.
            </p>
          </div>
          <a 
            href="/platform" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-full text-white font-semibold transition-colors"
          >
            View All Models
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Models Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {models.map((model, index) => {
            const Icon = model.icon;
            return (
              <div 
                key={model.name}
                className={`group relative rounded-2xl overflow-hidden transition-all duration-500 hover:scale-[1.02] hover-lift ${
                  model.featured ? 'md:col-span-2 lg:col-span-1' : ''
                }`}
              >
                {/* Card Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 group-hover:border-gray-700 rounded-2xl transition-colors" />
                
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${model.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl`} />

                {/* Content */}
                <div className="relative p-6 h-full flex flex-col">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${model.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    {model.featured && (
                      <span className="px-3 py-1 bg-blue-600/20 text-blue-400 text-xs font-semibold rounded-full border border-blue-600/30">
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Model Info */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all">
                      {model.name}
                    </h3>
                    <p className="text-gray-500 text-sm">{model.provider}</p>
                  </div>

                  {/* Description */}
                  <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-grow">
                    {model.description}
                  </p>

                  {/* Specs */}
                  <div className="flex items-center gap-4 pt-4 border-t border-gray-800">
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider">Parameters</div>
                      <div className="text-white font-semibold">{model.parameters}</div>
                    </div>
                    <div className="h-8 w-px bg-gray-800" />
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider">Type</div>
                      <div className="text-white font-semibold">{model.type}</div>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="mt-4 pt-4">
                    <a 
                      href="/platform" 
                      className="inline-flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors group/link"
                    >
                      Try Model
                      <span className="group-hover/link:translate-x-1 transition-transform">→</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 mb-6">
            Want to add your model to our marketplace?
          </p>
          <a 
            href="/community" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-600/25"
          >
            Become a Provider
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default FeaturedModels;
