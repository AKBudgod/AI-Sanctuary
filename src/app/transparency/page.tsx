'use client';

import React from 'react';
import { Building2, Globe, Shield } from 'lucide-react';

export default function TransparencyPage() {
  return (
    <div className="min-h-screen bg-white pt-40 pb-32 font-sans selection:bg-slate-950 selection:text-white overflow-x-hidden">
      <title>MANIFESTO_LOGS | AI_SANCTUARY</title>

      {/* Background Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
           style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      {/* Hero Section */}
      <div className="relative container mx-auto px-6 z-10 mb-32">
        <div className="max-w-5xl mx-auto text-left space-y-12">
          <div className="inline-block bg-slate-950 text-white px-6 py-2 font-black uppercase tracking-[0.4em] text-xs shadow-[8px_8px_0px_rgba(0,0,0,0.2)]">
            PROTOCOL_TRANSPARENCY_V1.0
          </div>
          <h1 className="text-7xl md:text-9xl font-black text-slate-950 mb-6 uppercase tracking-tighter leading-none italic underline decoration-8 underline-offset-8">
            THE_MISSION.
          </h1>
          <p className="text-2xl md:text-3xl text-slate-500 font-black uppercase tracking-widest leading-tight border-l-8 border-slate-950 pl-8 max-w-3xl italic">
            BUILDING THE DECENTRALIZED FUTURE OF ARTIFICIAL INTELLIGENCE. ZERO FILTERS. ZERO GATEKEEPERS.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto space-y-32">

          {/* Mission Block */}
          <div className="bg-white p-12 md:p-20 border-8 border-slate-950 shadow-[16px_16px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all">
            <h2 className="text-4xl font-black text-slate-950 mb-12 uppercase tracking-tighter flex items-center gap-6 italic">
              <div className="w-16 h-16 bg-slate-950 flex items-center justify-center shrink-0">
                <Globe className="w-8 h-8 text-white" />
              </div>
              OUR_MISSION
            </h2>
            <div className="space-y-10 text-slate-500 font-black uppercase text-sm tracking-[0.1em] leading-relaxed">
              <p className="border-l-4 border-slate-100 pl-8">
                AI SANCTUARY WAS BORN FROM A SINGULAR VISION: TO DEMOCRATIZE ACCESS TO STATE-OF-THE-ART ARTIFICIAL INTELLIGENCE. AS CLOSED-SOURCE MODELS BECAME INCREASINGLY RESTRICTIVE AND CENTRALIZED, WE RECOGNIZED THE URGENT NEED FOR A SANCTUARY—A DECENTRALIZED HAVEN WHERE THE OPEN-SOURCE COMMUNITY COULD THRIVE WITHOUT CENSORSHIP OR PROHIBITIVE COSTS.
              </p>
              <p className="border-l-4 border-slate-100 pl-8">
                WE BELIEVE THAT THE FUTURE OF INTELLIGENCE SHOULDN'T BE CONTROLLED BY A HANDFUL OF MEGA-CORPORATIONS. IT SHOULD BELONG TO THE USERS, THE BUILDERS, AND THE VISIONARIES WHO PUSH THE BOUNDARIES OF WHAT IS POSSIBLE.
              </p>
            </div>
          </div>

          {/* Network Block */}
          <div className="bg-white p-12 md:p-20 border-8 border-slate-950 shadow-[16px_16px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all">
            <h2 className="text-4xl font-black text-slate-950 mb-12 uppercase tracking-tighter flex items-center gap-6 italic">
              <div className="w-16 h-16 bg-slate-950 flex items-center justify-center shrink-0">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              THE_NETWORK
            </h2>
            <div className="space-y-10 text-slate-500 font-black uppercase text-sm tracking-[0.1em] leading-relaxed">
              <p className="border-l-4 border-slate-100 pl-8 text-slate-950">
                OUR PLATFORM OPERATES ON A GLOBALLY DISTRIBUTED NETWORK OF COMPUTE PROVIDERS. BY POOLING LATENT GPU POWER FROM AROUND THE WORLD, AI SANCTUARY CREATES A RESILIENT, HIGH-PERFORMANCE INFRASTRUCTURE.
              </p>
              <p className="border-l-4 border-slate-100 pl-8">
                THROUGH OUR UNIQUE TIER SYSTEM, WE GRANT ACCESS TO A VAST MARKETPLACE OF MODELS—FROM UNCENSORED CREATIVE ASSISTANTS TO HIGHLY SPECIALIZED CODING ENGINES. PARTICIPANTS IN THE AI SANCTUARY ECOSYSTEM ARE INCENTIVIZED TO CONTRIBUTE.
              </p>
            </div>
          </div>

          {/* Core Values Grid */}
          <div className="space-y-16 pb-20">
            <h2 className="text-5xl font-black text-slate-950 uppercase tracking-tighter italic flex items-center gap-6">
               <Shield className="w-12 h-12 text-slate-950" />
               CORE_PRINCIPLES
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {[
                { title: 'TRANSPARENCY', desc: 'WE OPERATE ENTIRELY IN THE OPEN. PRICING, MODEL CAPABILITIES, AND ROUTING MECHANICS ARE CLEAR AND VERIFIABLE.' },
                { title: 'PRIVACY_FIRST', desc: 'YOUR DATA IS YOURS. WE UTILIZE ZERO-KNOWLEDGE PRINCIPLES TO ENSURE DATA IS NEVER RETAINED AGAINST YOUR WILL.' },
                { title: 'PERMISSIONLESS', desc: 'NO GATEKEEPERS. ACCESS THE CUTTING-EDGE OF AI FREELY WITHOUT BUREAUCRATIC APPROVAL PROCESSES.' },
                { title: 'COMMUNITY_DRIVEN', desc: 'THE NETWORK DIRECTION IS DICTATED BY PROTOCOL CONSENSUS. GOVERNANCE IS RETURNED TO THE PEOPLE.' },
              ].map((val) => (
                <div key={val.title} className="bg-slate-50 p-10 border-4 border-slate-950 shadow-[8px_8px_0px_rgba(0,0,0,1)]">
                   <h4 className="font-black text-slate-950 mb-6 text-2xl uppercase tracking-tighter italic">[{val.title}]</h4>
                   <p className="text-slate-500 font-black uppercase text-xs tracking-widest leading-relaxed">
                    {val.desc}
                   </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
