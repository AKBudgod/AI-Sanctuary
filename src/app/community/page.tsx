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
  TikTok,
  ArrowRight
} from '@/components/ui/Icons';

const socialLinks = [
  {
    name: 'DISCORD',
    description: 'JOIN 10,000+ DEVELOPERS DISCUSSING AI, BLOCKCHAIN, AND THE FUTURE OF DECENTRALIZED INTELLIGENCE.',
    icon: Discord,
    members: '10,000+',
    color: 'bg-indigo-50 border-slate-950',
    url: 'https://discord.gg/ai-sanctuary-online',
  },
  {
    name: 'TWITTER/X',
    description: 'FOLLOW US FOR THE LATEST UPDATES ON PLATFORM RELEASES, PARTNERSHIPS, AND COMMUNITY HIGHLIGHTS.',
    icon: Twitter,
    members: '25,000+',
    color: 'bg-white border-slate-950',
    url: 'https://x.com/AI_Sanctuary',
  },
  {
    name: 'TIKTOK',
    description: 'DAILY SHORT-FORM VIDEO UPDATES FROM THE AI SANCTUARY TEAM.',
    icon: TikTok,
    members: '10,000+',
    color: 'bg-pink-50 border-slate-950',
    url: 'https://ai.sanctuary.online',
  },
  {
    name: 'TELEGRAM',
    description: 'GET INSTANT NOTIFICATIONS ABOUT TOKEN LAUNCHES, GOVERNANCE PROPOSALS, AND PLATFORM UPDATES.',
    icon: Telegram,
    members: '8,000+',
    color: 'bg-sky-50 border-slate-950',
    url: '#',
  },
];

const communityPrograms = [
  {
    title: 'AMBASSADOR_PROG',
    description: 'REPRESENT AI SANCTUARY IN YOUR REGION. EARN REWARDS FOR ORGANIZING EVENTS, CREATING CONTENT, AND GROWING THE COMMUNITY.',
    icon: Globe,
    status: 'ACCEPTING_APPLICATIONS',
  },
  {
    title: 'DEVELOPER_GRANTS',
    description: 'GET FUNDING TO BUILD TOOLS, INTEGRATIONS, OR AI MODELS ON THE AI SANCTUARY PLATFORM. UP TO $50,000 PER PROJECT.',
    icon: Sparkles,
    status: 'OPEN',
  },
  {
    title: 'BUG_BOUNTY',
    description: 'HELP SECURE THE PROTOCOL BY FINDING VULNERABILITIES. REWARDS UP TO $100,000 FOR CRITICAL ISSUES.',
    icon: MessageSquare,
    status: 'ACTIVE',
  },
];

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-white pt-40 pb-32 font-sans selection:bg-slate-950 selection:text-white overflow-x-hidden">
      {/* Background Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
           style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      {/* Hero */}
      <div className="relative container mx-auto px-6 z-10 mb-32">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="inline-flex items-center gap-4 bg-slate-950 text-white px-6 py-2 font-black uppercase tracking-[0.4em] text-xs shadow-[8px_8px_0px_rgba(0,0,0,0.2)]">
            <Users className="w-4 h-4" />
            50,000+ COMMUNITY_NODES_ACTIVE
          </div>
          <h1 className="text-7xl md:text-9xl font-black text-slate-950 mb-12 tracking-tighter uppercase leading-[0.85] italic underline decoration-8 underline-offset-8">
            JOIN_THE<br />MOVEMENT
          </h1>
          <p className="text-2xl md:text-3xl text-slate-500 font-black uppercase tracking-widest leading-tight border-l-8 border-slate-950 pl-8 max-w-3xl italic">
            AI SANCTUARY IS MORE THAN A PLATFORM—IT&apos;S A GLOBAL COMMUNITY BUILDING THE FUTURE OF DECENTRALIZED INTELLIGENCE.
          </p>
        </div>
      </div>

      {/* Social Links */}
      <div className="container mx-auto px-6 relative z-10 mb-40">
        <div className="grid md:grid-cols-2 gap-10">
          {socialLinks.map((social) => {
            const Icon = social.icon;
            return (
              <a
                key={social.name}
                href={social.url}
                className={`group relative bg-white border-4 md:border-8 border-slate-950 p-10 shadow-[12px_12px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[20px_20px_0px_rgba(0,0,0,1)] hover:-translate-x-2 hover:-translate-y-2 cursor-pointer ${social.color}`}
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="w-16 h-16 bg-slate-950 flex items-center justify-center shrink-0 shadow-[4px_4px_0px_rgba(0,0,0,0.2)]">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <span className="font-black uppercase text-[10px] tracking-[0.3em] text-slate-300">
                    {social.members} NODES
                  </span>
                </div>
                <h3 className="text-4xl font-black text-slate-950 mb-6 uppercase tracking-tighter italic">{social.name}</h3>
                <p className="text-slate-500 font-black uppercase text-xs tracking-widest leading-relaxed mb-10 border-l-4 border-slate-200 pl-4">{social.description}</p>
                <div className="flex items-center gap-4 text-slate-950 font-black uppercase tracking-[0.2em] text-sm">
                  INITIATE_SYNC <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* Community Programs */}
      <div className="container mx-auto px-6 relative z-10 mb-40">
        <div className="mb-24">
          <h2 className="text-5xl md:text-7xl font-black text-slate-950 uppercase tracking-tighter italic underline decoration-8 underline-offset-8 mb-8">PROGRAMS</h2>
          <p className="text-xl text-slate-500 font-black uppercase tracking-widest">GET INVOLVED AND EARN REWARDS FOR ECOSYSTEM CONTRIBUTIONS.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {communityPrograms.map((program) => {
            const Icon = program.icon;
            return (
              <div
                key={program.title}
                className="bg-white p-10 border-4 border-slate-950 shadow-[8px_8px_0px_rgba(0,0,0,1)] flex flex-col"
              >
                <div className="w-14 h-14 bg-slate-100 flex items-center justify-center mb-8">
                  <Icon className="w-8 h-8 text-slate-950" />
                </div>
                <div className="inline-block px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-200 mb-6 w-fit">
                  {program.status}
                </div>
                <h3 className="text-2xl font-black text-slate-950 mb-6 uppercase tracking-tight">{program.title}</h3>
                <p className="text-slate-500 font-black uppercase text-[11px] tracking-widest leading-relaxed mb-10 flex-1">{program.description}</p>
                <button className="w-full py-4 text-slate-950 border-4 border-slate-950 font-black uppercase text-xs tracking-[0.3em] hover:bg-slate-950 hover:text-white transition-all shadow-[6px_6px_0px_rgba(0,0,0,0.1)]">
                  LEARN_MORE
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Newsletter */}
      <div className="container mx-auto px-6 relative z-10 mb-40">
        <div className="bg-slate-950 text-white p-16 md:p-32 border-8 border-slate-950 shadow-[24px_24px_0px_rgba(0,0,0,0.1)] text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(45deg, #fff 1px, transparent 1px), linear-gradient(-45deg, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          <div className="relative z-10 max-w-3xl mx-auto">
            <Mail className="w-20 h-20 text-white mx-auto mb-12" />
            <h2 className="text-5xl md:text-7xl font-black mb-8 uppercase tracking-tighter italic underline decoration-8 underline-offset-8">STAY_IN_LOOP</h2>
            <p className="text-xl text-slate-400 font-black uppercase tracking-widest leading-tight mb-16">
              SUBSCRIBE TO OUR NEWSLETTER FOR WEEKLY UPDATES ON PLATFORM DEVELOPMENT, GOVERNANCE, AND HIGHLIGHTS.
            </p>

            <div className="max-w-xl mx-auto">
              <NewsletterForm />
            </div>

            <p className="text-slate-600 font-black uppercase text-[10px] tracking-[0.4em] mt-12">
              ZERO SPAM. SECURE UNLINK AT ANY TIME.
            </p>
          </div>
        </div>
      </div>

      {/* Events */}
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 border-b-8 border-slate-950 pb-12">
          <div>
            <h2 className="text-6xl font-black text-slate-950 mb-6 uppercase tracking-tighter italic">UPCOMING_EVT</h2>
            <p className="text-slate-500 font-black uppercase tracking-widest">MEET THE COMMUNITY AT THESE COORDINATED DEPLOYMENTS.</p>
          </div>
          <a href="#" className="mt-8 md:mt-0 bg-slate-950 text-white px-8 py-3 font-black uppercase text-xs tracking-[0.3em] shadow-[6px_6px_0px_rgba(0,0,0,0.2)] hover:bg-white hover:text-slate-950 border-2 border-slate-950 transition-all flex items-center gap-4">
            VIEW_ALL <ExternalLink className="w-5 h-5" />
          </a>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {[
            {
              title: 'AI SANCTUARY AMA',
              date: 'FEB 15, 2026',
              type: 'ONLINE',
              description: 'MONTHLY COMMUNITY AMA WITH THE CORE TEAM. BRING YOUR QUESTIONS.',
            },
            {
              title: 'ETH DENVER HACK',
              date: 'FEB 28, 2026',
              type: 'IN-PERSON',
              description: 'JOIN US AT THE LARGEST ETHEREUM HACKATHON. $50K IN PRIZES.',
            },
            {
              title: 'NEURAL_SUMMIT',
              date: 'MAR 20, 2026',
              type: 'HYBRID',
              description: 'ANNUAL GATHERING OF DECENTRALIZED AI RESEARCHERS AND BUILDERS.',
            },
          ].map((event) => (
            <div
              key={event.title}
              className="group bg-white p-10 border-4 border-slate-50 hover:border-slate-950 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-slate-50 group-hover:border-slate-950 transition-all">
                <span className="bg-slate-950 text-white px-3 py-1 text-[10px] font-black tracking-widest">
                  {event.type}
                </span>
                <span className="text-slate-300 font-black uppercase text-xs tracking-widest font-mono group-hover:text-slate-950 transition-colors">{event.date}</span>
              </div>
              <h4 className="text-2xl font-black text-slate-950 mb-6 uppercase tracking-tight group-hover:italic">{event.title}</h4>
              <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest leading-relaxed mb-10">{event.description}</p>
              <div className="text-slate-950 font-black uppercase text-[10px] tracking-widest border-b-2 border-slate-950 w-fit">
                RSVP_TO_TX
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
