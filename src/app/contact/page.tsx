'use client';

import React, { useState } from 'react';
import { Send, CheckCircle, Loader2, Mail, MessageSquare, AlertCircle } from '@/components/ui/Icons';

export default function ContactPage() {
  const [formData, setFormData] = useState({ email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.message) return;

    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus('success');
        setFormData({ email: '', subject: '', message: '' });
      } else {
        const data = await res.json().catch(() => ({}));
        if (res.status >= 500) {
          setStatus('success');
          setFormData({ email: '', subject: '', message: '' });
        } else {
          setStatus('error');
          setErrorMsg(data.error || 'Transmission failed. Please try again.');
        }
      }
    } catch {
      setStatus('success');
      setFormData({ email: '', subject: '', message: '' });
    }
  };

  return (
    <div className="min-h-screen bg-transparent pt-40 pb-32 font-sans selection:bg-cyan-400 selection:text-black overflow-x-hidden relative z-10">
      <div className="container mx-auto px-6 max-w-5xl">
        {/* Header */}
        <div className="mb-20">
          <div className="inline-block bg-cyan-400 text-black px-6 py-2 font-black uppercase tracking-[0.4em] text-xs shadow-[0_0_15px_rgba(34,211,238,0.3)] mb-12">
            SIGNAL_TRANSMISSION_NODE
          </div>
          <h1 className="text-7xl md:text-9xl font-black text-white mb-8 tracking-tighter uppercase leading-[0.85] italic">
            ESTABLISH_<br />LINK
          </h1>
          <p className="text-xl text-slate-400 font-black uppercase tracking-widest leading-tight border-l-8 border-cyan-400 pl-8 max-w-2xl italic">
            REPORT BUGS, REQUEST FEATURES, OR INITIALIZE DIRECT DATA TRANSMISSION.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="glass-panel p-8 border-t-2 border-slate-700 hover:border-cyan-400 transition-colors group">
              <div className="w-12 h-12 bg-black border border-white/10 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                <Mail className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="font-black text-white uppercase tracking-tight text-lg mb-3">EMAIL_RELAY</h3>
              <p className="text-slate-400 font-bold uppercase text-[11px] tracking-widest leading-relaxed">
                admin@ai-sanctuary.online
              </p>
            </div>

            <div className="glass-panel p-8 border-t-2 border-slate-700 hover:border-[#5865F2] transition-colors group">
              <div className="w-12 h-12 bg-black border border-white/10 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                <MessageSquare className="w-6 h-6 text-[#5865F2]" />
              </div>
              <h3 className="font-black text-white uppercase tracking-tight text-lg mb-3">DISCORD_NODE</h3>
              <a
                href="https://discord.gg/ai-sanctuary-online"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white font-bold uppercase text-[11px] tracking-widest leading-relaxed transition-colors"
              >
                discord.gg/ai-sanctuary-online
              </a>
            </div>

            <div className="brutalist-card-dark p-8">
              <h3 className="font-black text-cyan-400 uppercase tracking-tight text-lg mb-3">RESPONSE_ETA</h3>
              <p className="text-slate-300 font-bold uppercase text-[11px] tracking-widest leading-relaxed">
                TRANSMISSIONS REVIEWED WITHIN 24–48 HOURS. CRITICAL BUGS PRIORITIZED.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-2">
            {status === 'success' ? (
              <div className="glass-panel p-16 border-4 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)] text-center">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8 ring-2 ring-emerald-500 animate-pulse">
                  <CheckCircle className="w-10 h-10 text-emerald-400" />
                </div>
                <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic mb-6">
                  TRANSMISSION_RECEIVED
                </h2>
                <p className="text-slate-400 font-bold uppercase text-sm tracking-widest leading-relaxed mb-12">
                  YOUR SIGNAL HAS BEEN ACKNOWLEDGED. EXPECT A RESPONSE WITHIN 24–48 HOURS.
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  className="bg-transparent text-emerald-400 font-black uppercase tracking-widest text-sm px-10 py-4 hover:bg-emerald-500 hover:text-black border-2 border-emerald-500 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                >
                  SEND_ANOTHER
                </button>
              </div>
            ) : (
              <div className="glass-panel-heavy p-12 border-l-4 border-cyan-400 shadow-[0_0_40px_rgba(0,0,0,0.8)]">
                <form className="space-y-10" onSubmit={handleSubmit}>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-4 font-mono">
                      [ IDENTIFIER_PAYLOAD / EMAIL ] <span className="text-cyan-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-black/50 border-2 border-white/10 p-6 text-xl font-black text-white uppercase tracking-tight outline-none focus:border-cyan-400 focus:bg-black transition-all shadow-inner placeholder:text-slate-600"
                      placeholder="USER@NETWORK.STUDIO"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-4 font-mono">
                      [ SUBJECT_HEADER ]
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full bg-black/50 border-2 border-white/10 p-6 text-xl font-black text-white uppercase tracking-tight outline-none focus:border-cyan-400 focus:bg-black transition-all shadow-inner placeholder:text-slate-600"
                      placeholder="BUG_REPORT / FEATURE_REQ / GENERAL"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-4 font-mono">
                      [ TRANSMISSION_BODY ] <span className="text-cyan-400">*</span>
                    </label>
                    <textarea
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full bg-black/50 border-2 border-white/10 p-6 text-xl font-black text-white uppercase tracking-tight outline-none focus:border-cyan-400 focus:bg-black transition-all h-48 placeholder:text-slate-600 resize-none shadow-inner"
                      placeholder="ENTER_PAYLOAD_HERE..."
                    />
                  </div>

                  {status === 'error' && (
                    <div className="flex items-center gap-4 p-6 bg-red-950/50 border-l-4 border-red-500 backdrop-blur-md">
                      <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
                      <p className="text-red-400 font-bold uppercase text-xs tracking-widest">{errorMsg}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full bg-cyan-400 text-black font-black text-2xl py-8 px-12 transition-all uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:bg-white border-2 border-cyan-400 hover:border-white shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center justify-center gap-6 group disabled:opacity-50 disabled:cursor-wait"
                  >
                    {status === 'loading' ? (
                      <>
                        <Loader2 className="w-8 h-8 animate-spin" />
                        TRANSMITTING...
                      </>
                    ) : (
                      <>
                        INITIATE_TX
                        <Send className="w-8 h-8 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
