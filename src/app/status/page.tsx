'use client';

import React from 'react';

export default function StatusPage() {
  return (
    <div className="min-h-screen bg-white pt-40 pb-32 font-sans selection:bg-slate-950 selection:text-white">
      {/* Background Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
           style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="container mx-auto px-6 max-w-4xl text-center relative z-10">
        <div className="inline-block bg-slate-950 text-white px-6 py-2 font-black uppercase tracking-[0.4em] text-xs shadow-[8px_8px_0px_rgba(0,0,0,0.2)] mb-12">
          SYSTEM_PULSE_MONITOR_V4.0
        </div>
        <h1 className="text-7xl md:text-8xl font-black text-slate-950 mb-16 tracking-tighter uppercase leading-none italic">
          NODE_STATUS
        </h1>

        <div className="bg-white p-16 border-8 border-slate-950 shadow-[16px_16px_0px_rgba(0,0,0,1)]">
          <div className="flex flex-col items-center justify-center gap-6 mb-16">
            <div className="w-12 h-12 bg-emerald-500 border-4 border-slate-950 shadow-[4px_4px_0px_rgba(0,0,0,0.2)] animate-pulse" />
            <span className="text-4xl font-black text-slate-950 uppercase tracking-tighter italic">ALL_SYSTEMS_PRIMARY</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            {[
              { label: 'Inference Engine', status: 'ONLINE_SYNC' },
              { label: 'Persona Registry', status: 'ONLINE_SYNC' },
              { label: 'TTS Backbone', status: 'ONLINE_SYNC' },
              { label: 'KV Auth Store', status: 'ONLINE_SYNC' },
            ].map((node) => (
              <div key={node.label} className="p-8 bg-slate-50 border-4 border-slate-950 flex justify-between items-center group hover:bg-slate-950 transition-colors">
                <span className="text-slate-950 font-black uppercase text-xs tracking-widest group-hover:text-white transition-colors">{node.label}</span>
                <span className="text-emerald-600 font-black uppercase text-xs tracking-widest group-hover:text-emerald-400 transition-colors">{node.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
