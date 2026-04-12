'use client';

import React from 'react';
import { Send } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white pt-40 pb-32 font-sans selection:bg-slate-950 selection:text-white">
      {/* Background Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
           style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="container mx-auto px-6 max-w-4xl relative z-10">
        <div className="inline-block bg-slate-950 text-white px-6 py-2 font-black uppercase tracking-[0.4em] text-xs shadow-[8px_8px_0px_rgba(0,0,0,0.2)] mb-12">
          SIGNAL_TRANSMISSION_NODE
        </div>
        
        <h1 className="text-7xl md:text-8xl font-black text-slate-950 mb-16 tracking-tighter uppercase leading-[0.85] italic">
          ESTABLISH_LINK
        </h1>

        <div className="bg-white p-12 border-8 border-slate-950 shadow-[16px_16px_0px_rgba(0,0,0,1)]">
          <p className="text-xl text-slate-500 font-black uppercase tracking-widest leading-tight mb-12 border-l-8 border-slate-950 pl-8">
            REPORT BUGS, REQUEST FEATURES, OR INITIALIZE RAW DATA TRANSMISSION. 
          </p>
          
          <form className="space-y-10" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-4 font-mono">
                [ IDENTIFIER_PAYLOAD / EMAIL ]
              </label>
              <input 
                type="email" 
                className="w-full bg-slate-50 border-4 border-slate-950 p-6 text-xl font-black uppercase tracking-tight outline-none focus:bg-white transition-colors placeholder:text-slate-200" 
                placeholder="USER@NETWORK.STUDIO" 
              />
            </div>
            
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-4 font-mono">
                [ TRANSMISSION_BODY ]
              </label>
              <textarea 
                className="w-full bg-slate-50 border-4 border-slate-950 p-6 text-xl font-black uppercase tracking-tight outline-none focus:bg-white transition-colors h-48 placeholder:text-slate-200 resize-none" 
                placeholder="ENTER_PAYLOAD_HERE..."
              />
            </div>

            <button className="bg-slate-950 text-white font-black text-2xl py-8 px-12 w-full transition-all uppercase tracking-[0.2em] shadow-[12_12px_0px_rgba(0,0,0,0.2)] hover:bg-white hover:text-slate-950 border-4 border-slate-950 flex items-center justify-center gap-6 group">
              INITIATE_TX <Send className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
            </button>
          </form>
        </div>

        <div className="mt-20 text-center">
           <p className="text-[10px] text-slate-300 font-black uppercase tracking-[0.5em]">DIRECT_ENCRYPTED_LINE: +0 000 000 0000</p>
        </div>
      </div>
    </div>
  );
}
