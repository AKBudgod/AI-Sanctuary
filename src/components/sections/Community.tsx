'use client';

import React from 'react';
import Link from 'next/link';
import { Discord, Twitter, GitHub, MessageSquare, Users, ChevronRight, TikTok } from '@/components/ui/Icons';

const stats = [
  { value: '50K+', label: 'Community Members' },
  { value: '100+', label: 'Contributors' },
  { value: '25+', label: 'Countries' },
  { value: '24/7', label: 'Active Support' },
];

const socials = [
  {
    name: 'Discord',
    description: 'Join discussions and get help',
    members: '10K+',
    icon: Discord,
    url: '#',
    color: 'from-[#5865F2] to-[#4752C4]',
  },
  {
    name: 'Twitter/X',
    description: 'Latest updates and news',
    members: '25K+',
    icon: Twitter,
    url: 'https://x.com/AI_Sanctuary',
    color: 'from-gray-700 to-gray-800',
  },
  {
    name: 'TikTok',
    description: 'Short-form video updates',
    members: '10K+',
    icon: TikTok,
    url: 'https://ai.sanctuary.online',
    color: 'from-pink-600 to-red-500',
  },
  {
    name: 'GitHub',
    description: 'Open source contributions',
    members: '500+',
    icon: GitHub,
    url: '#',
    color: 'from-gray-700 to-gray-800',
  },
  {
    name: 'Forum',
    description: 'Technical discussions',
    members: '5K+',
    icon: MessageSquare,
    url: '#',
    color: 'from-purple-600 to-purple-700',
  },
];

const Community = () => {
  return (
    <section className="relative bg-gray-950 py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative container mx-auto px-6">
        {/* Main CTA Card */}
        <div className="relative rounded-3xl overflow-hidden mb-16">
          {/* Gradient border effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-px rounded-3xl" />

          <div className="relative bg-gray-950 rounded-3xl p-12 md:p-16">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-900/30 border border-purple-800 text-purple-300 text-sm mb-6">
                <Users className="w-4 h-4" />
                Join 50,000+ members worldwide
              </div>

              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                Built by the Community,
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 block mt-2">
                  for the Community
                </span>
              </h2>

              <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed">
                AI Sanctuary is more than a platform—it's a movement. We're dedicated to fostering
                a vibrant community of developers, researchers, and AI enthusiasts shaping the
                future of decentralized intelligence.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/community"
                  className="group bg-white text-gray-900 hover:bg-gray-100 font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 hover:scale-105 inline-flex items-center justify-center gap-2"
                >
                  Join the Community
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/whitepaper#governance"
                  className="bg-transparent border-2 border-gray-700 hover:border-gray-500 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 hover:scale-105"
                >
                  Learn About Governance
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="text-center p-6 rounded-2xl bg-gray-900/50 border border-gray-800 hover:border-gray-700 transition-colors"
            >
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-gray-500 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Social Links */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {socials.map((social) => {
            const Icon = social.icon;
            return (
              <a
                key={social.name}
                href={social.url}
                className="group relative p-6 rounded-2xl bg-gray-900 border border-gray-800 hover:border-gray-700 transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${social.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-gray-500 text-sm">{social.members}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{social.name}</h3>
                <p className="text-gray-400 text-sm">{social.description}</p>
              </a>
            );
          })}
        </div>

        {/* Treasury Info */}
        <div className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-900/30">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Community Treasury</h3>
              <p className="text-gray-400">
                4% of all platform fees fund community-driven initiatives, grants, and platform development.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-3xl font-bold text-white">$2.4M</div>
                <div className="text-gray-500 text-sm">Current Balance</div>
              </div>
              <Link
                href="/community"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition-colors"
              >
                View Proposals
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Community;
