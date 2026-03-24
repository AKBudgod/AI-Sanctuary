'use client';

import React from 'react';
import { Cpu, Network, Lock, Zap } from '@/components/ui/Icons';

const technologies = [
  {
    icon: Network,
    title: 'Blockchain Layer',
    description: 'Ethereum L2 scaling solution providing fast, low-cost transactions with Ethereum security guarantees.',
    features: ['Optimistic Rollups', 'Sub-second finality', 'EVM compatible'],
    color: 'blue',
  },
  {
    icon: Cpu,
    title: 'Compute Layer',
    description: 'Distributed GPU network for model training and inference, powered by worker node incentives.',
    features: ['Containerized workloads', 'Auto-scaling', 'Multi-GPU support'],
    color: 'purple',
  },
  {
    icon: Lock,
    title: 'Privacy Layer',
    description: 'Zero-knowledge proofs enabling private model inference while maintaining verifiability.',
    features: ['zk-SNARKs', 'Private inference', 'Data sovereignty'],
    color: 'green',
  },
  {
    icon: Zap,
    title: 'AI Engine',
    description: 'Optimized inference engine supporting state-of-the-art open-source models.',
    features: ['LLaMA, Qwen, DeepSeek', 'Quantization', 'Batching optimization'],
    color: 'yellow',
  },
];

export default function TechStack() {
  return (
    <div className="space-y-8">
      <h2 className="text-4xl font-bold text-white">Technology Stack</h2>
      
      <p className="text-gray-400 text-lg">
        AI Sanctuary is built on a modular, scalable architecture designed for enterprise-grade 
        performance while maintaining decentralization.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {technologies.map((tech) => {
          const Icon = tech.icon;
          const colorClasses = {
            blue: 'text-blue-400 border-blue-900/50 bg-blue-950/20',
            purple: 'text-purple-400 border-purple-900/50 bg-purple-950/20',
            green: 'text-green-400 border-green-900/50 bg-green-950/20',
            yellow: 'text-yellow-400 border-yellow-900/50 bg-yellow-950/20',
          }[tech.color];

          return (
            <div 
              key={tech.title} 
              className={`rounded-xl p-6 border ${colorClasses}`}
            >
              <div className="flex items-start gap-4">
                <Icon className="w-10 h-10 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{tech.title}</h3>
                  <p className="text-gray-400 mb-4">{tech.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {tech.features.map((feature) => (
                      <span 
                        key={feature}
                        className="px-3 py-1 bg-gray-900 rounded-full text-sm text-gray-300"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-gray-900 rounded-xl p-8 border border-gray-800">
        <h3 className="text-2xl font-bold text-white mb-6">Architecture Overview</h3>
        <div className="relative">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {['User Interface', 'API Gateway', 'Smart Contracts', 'Compute Nodes'].map((layer, index) => (
              <React.Fragment key={layer}>
                <div className="bg-gray-800 rounded-lg px-6 py-4 text-center w-full md:w-auto">
                  <span className="text-white font-semibold">{layer}</span>
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
    </div>
  );
}
