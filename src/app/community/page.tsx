'use client';

import React from 'react';
import Link from 'next/link';
import NewsletterForm from '@/components/ui/NewsletterForm';
import {
  Discord,
  Twitter,
  Telegram,
  GitHub,
  Mail,
  Users,
  MessageSquare,
  Globe,
  Sparkles,
  ChevronRight,
  ExternalLink,
  TikTok
} from '@/components/ui/Icons';

const socialLinks = [
  {
    name: 'Discord',
    description: 'Join 10,000+ developers discussing AI, blockchain, and the future of decentralized intelligence.',
    icon: Discord,
    members: '10,000+',
    color: 'bg-[#5865F2]/20 border-[#5865F2]/50 text-[#5865F2]',
    url: 'https://discord.gg/ai-sanctuary-online',
  },
  {
    name: 'Twitter/X',
    description: 'Follow us for the latest updates on platform releases, partnerships, and community highlights.',
    icon: Twitter,
    members: '25,000+',
    color: 'bg-gray-800/50 border-gray-700 text-white',
    url: 'https://x.com/AI_Sanctuary',
  },
  {
    name: 'TikTok',
    description: 'Daily short-form video updates from the AI Sanctuary team.',
    icon: TikTok,
    members: '10,000+',
    color: 'bg-pink-900/20 border-pink-500/50 text-pink-500',
    url: 'https://ai.sanctuary.online',
  },
  {
    name: 'Telegram',
    description: 'Get instant notifications about token launches, governance proposals, and platform updates.',
    icon: Telegram,
    members: '8,000+',
    color: 'bg-[#0088cc]/20 border-[#0088cc]/50 text-[#0088cc]',
    url: '#',
  },
  {
    name: 'GitHub',
    description: 'Explore our open-source repositories, contribute to the protocol, or build on top of our APIs.',
    icon: GitHub,
    members: '500+',
    color: 'bg-gray-800/50 border-gray-700 text-gray-300',
    url: '#',
  },
  {
    name: 'Forum',
    description: 'In-depth technical discussions on AI models and platform governance.',
    icon: MessageSquare,
    members: '5,000+',
    color: 'bg-indigo-900/20 border-indigo-500/50 text-indigo-400',
    url: '#',
  },
];

const communityPrograms = [
  {
    title: 'Ambassador Program',
    description: 'Represent AI Sanctuary in your region. Earn rewards for organizing events, creating content, and growing the community.',
    icon: Globe,
    status: 'Accepting Applications',
  },
  {
    title: 'Developer Grants',
    description: 'Get funding to build tools, integrations, or AI models on the AI Sanctuary platform. Up to $50,000 per project.',
    icon: Sparkles,
    status: 'Open',
  },
  {
    title: 'Bug Bounty',
    description: 'Help secure the protocol by finding vulnerabilities. Rewards up to $100,000 for critical issues.',
    icon: MessageSquare,
    status: 'Active',
  },
];

const governanceStats = [
  { label: 'Total Proposals', value: '47' },
  { label: 'Voting Participation', value: '68%' },
  { label: 'Treasury Value', value: '$2.4M' },
  { label: 'Active Voters', value: '3,200+' },
];

const recentProposals = [
  {
    id: 'AIP-47',
    title: 'Add DeepSeek-V3 to Model Marketplace',
    status: 'Active',
    votes: { for: 78, against: 12 },
    endsIn: '2 days',
  },
  {
    id: 'AIP-46',
    title: 'Increase Community Treasury Allocation to 20%',
    status: 'Passed',
    votes: { for: 89, against: 8 },
    endsIn: 'Ended',
  },
  {
    id: 'AIP-45',
    title: 'Launch Mobile App Beta Program',
    status: 'Passed',
    votes: { for: 92, against: 5 },
    endsIn: 'Ended',
  },
];

export default function CommunityPage() {

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-blue-900/20 to-gray-950" />
        <div className="relative container mx-auto px-6 py-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-900/30 border border-purple-800 text-purple-300 text-sm mb-6">
              <Users className="w-4 h-4" />
              50,000+ community members
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Join the
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                {' '}Movement
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
              AI Sanctuary is more than a platform—it's a global community of developers,
              researchers, and AI enthusiasts building the future of decentralized intelligence.
            </p>
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-6">
          {socialLinks.map((social) => {
            const Icon = social.icon;
            return (
              <a
                key={social.name}
                href={social.url}
                className={`group rounded-xl p-6 border ${social.color} hover:scale-[1.02] transition-transform duration-300`}
              >
                <div className="flex items-start justify-between mb-4">
                  <Icon className="w-10 h-10" />
                  <span className="px-3 py-1 rounded-full bg-gray-900/50 text-sm">
                    {social.members} members
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{social.name}</h3>
                <p className="text-gray-300">{social.description}</p>
                <div className="mt-4 flex items-center gap-2 text-sm font-semibold">
                  Join Now
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* Web3 Rewards - NEW */}
      <div className="container mx-auto px-6 py-12">
        <div className="bg-gradient-to-br from-blue-900/20 via-gray-900 to-purple-900/20 rounded-2xl p-8 border border-blue-500/30 relative overflow-hidden group hover:border-blue-500/50 transition-all duration-500 shadow-[0_0_30px_rgba(37,99,235,0.1)]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-blue-500/20 transition-all duration-700" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/30 border border-blue-800 text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">
                <Sparkles className="w-3 h-3" />
                Web3 Incentives
              </div>
              <h2 className="text-3xl font-black text-white mb-4 tracking-tight">Earn SANC While You Chat</h2>
              <p className="text-gray-400 leading-relaxed font-medium">
                Our decentralized rewards protocol tracks your contributions to AI safety and research. 
                Earn **SANC tokens** for testing uncensored models and providing feedback to the community treasury.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <Link href="/playground" className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all hover:-translate-y-1 active:translate-y-0 text-center uppercase tracking-wider text-sm">
                Start Researching
              </Link>
              <div className="text-center text-xs text-gray-500 font-mono tracking-widest uppercase">
                Currently in testnet V2
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Governance Stats */}
      <div className="bg-gray-900/50 py-16 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">Community Governance</h2>
            <p className="text-gray-400 max-w-2xl mx-auto font-medium">
              SANC holders shape the future of AI Sanctuary through on-chain voting.
              Every vote helps decentralize intelligence.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {governanceStats.map((stat) => (
              <div key={stat.label} className="text-center p-6 bg-gray-950 border border-gray-800 rounded-xl hover:border-purple-500/30 transition-colors group">
                <div className="text-3xl md:text-4xl font-black text-white mb-1 group-hover:text-purple-400 transition-colors drop-shadow-[0_0_10px_rgba(168,85,247,0.2)]">{stat.value}</div>
                <div className="text-gray-500 text-xs font-bold uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Recent Proposals */}
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-white uppercase tracking-widest">Active Proposals</h3>
              <a href="#" className="text-blue-400 hover:text-blue-300 font-bold text-sm uppercase tracking-wider inline-flex items-center gap-2">
                View Archive
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            <div className="space-y-4">
              {recentProposals.map((proposal) => (
                <div
                  key={proposal.id}
                  className="bg-gray-950/80 rounded-xl p-6 border border-gray-800 hover:border-blue-500/30 transition-all group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/[0.02] transition-colors" />
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-blue-500 text-xs font-black font-mono tracking-tighter">{proposal.id}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${proposal.status === 'Active'
                            ? 'bg-green-900/40 text-green-400 border border-green-500/30'
                            : 'bg-blue-900/40 text-blue-400 border border-blue-500/30'
                          }`}>
                          {proposal.status}
                        </span>
                      </div>
                      <h4 className="text-xl font-bold text-white group-hover:text-blue-100 transition-colors">{proposal.title}</h4>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase">
                          <span className="text-green-400">For: {proposal.votes.for}%</span>
                          <span className="text-gray-700">|</span>
                          <span className="text-red-400">Against: {proposal.votes.against}%</span>
                        </div>
                        <div className="w-32 h-1.5 bg-gray-900 rounded-full mt-2 overflow-hidden border border-gray-800">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.4)]"
                            style={{ width: `${proposal.votes.for}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                        {proposal.endsIn}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Community Programs */}
      <div className="container mx-auto px-6 py-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">Community Programs</h2>
          <p className="text-gray-400">
            Get involved and earn rewards for contributing to the ecosystem.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {communityPrograms.map((program) => {
            const Icon = program.icon;
            return (
              <div
                key={program.title}
                className="bg-gray-900 rounded-xl p-8 border border-gray-800 hover:border-gray-700 transition-colors"
              >
                <Icon className="w-10 h-10 text-purple-400 mb-4" />
                <div className="inline-block px-3 py-1 bg-green-900/30 text-green-400 text-xs font-semibold rounded-full mb-4">
                  {program.status}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{program.title}</h3>
                <p className="text-gray-400">{program.description}</p>
                <button className="mt-6 text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center gap-2">
                  Learn More
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Newsletter */}
      <div className="container mx-auto px-6 py-16">
        <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-2xl p-12 border border-blue-900/50">
          <div className="max-w-2xl mx-auto text-center">
            <Mail className="w-12 h-12 text-blue-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Stay in the Loop
            </h2>
            <p className="text-gray-300 mb-8">
              Subscribe to our newsletter for weekly updates on platform development,
              governance proposals, and community highlights.
            </p>

            <NewsletterForm />

            <p className="text-gray-500 text-sm mt-4">
              No spam. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </div>

      {/* Events */}
      <div className="container mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Upcoming Events</h2>
            <p className="text-gray-400">Meet the community at these upcoming events</p>
          </div>
          <a href="#" className="mt-4 md:mt-0 text-blue-400 hover:text-blue-300 inline-flex items-center gap-2">
            View All Events
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: 'AI Sanctuary AMA',
              date: 'Feb 15, 2026',
              type: 'Online',
              description: 'Monthly community AMA with the core team. Bring your questions!',
            },
            {
              title: 'ETH Denver Hackathon',
              date: 'Feb 28 - Mar 2, 2026',
              type: 'In-Person',
              description: 'Join us at the largest Ethereum hackathon. $50k in prizes.',
            },
            {
              title: 'Decentralized AI Summit',
              date: 'Mar 20, 2026',
              type: 'Hybrid',
              description: 'Annual gathering of decentralized AI researchers and builders.',
            },
          ].map((event) => (
            <div
              key={event.title}
              className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 bg-purple-900/30 text-purple-400 text-xs font-semibold rounded-full">
                  {event.type}
                </span>
                <span className="text-gray-400 text-sm">{event.date}</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{event.title}</h3>
              <p className="text-gray-400 text-sm">{event.description}</p>
              <button className="mt-4 text-blue-400 hover:text-blue-300 text-sm font-semibold">
                RSVP →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
