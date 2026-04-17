'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Code, Cpu, Shield, Zap, ChevronRight, ExternalLink, Terminal, Globe, BookOpen } from '@/components/ui/Icons';

const sections = [
  {
    id: 'quickstart',
    title: 'QUICKSTART',
    icon: Zap,
    content: [
      {
        heading: 'AUTHENTICATION',
        body: `Every request to the AI Sanctuary API requires a valid session token. Obtain your token from the /buy page after purchasing a tier.`,
        code: `// Set your token in the Authorization header
fetch('https://ai-sanctuary.online/api/ai', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_SESSION_TOKEN'
  },
  body: JSON.stringify({
    model: 'meta-llama/llama-3.3-70b-instruct',
    messages: [{ role: 'user', content: 'Hello, Sanctuary.' }]
  })
})`,
      },
      {
        heading: 'RESPONSE FORMAT',
        body: 'All responses follow the OpenAI-compatible chat completion format, making migration from existing AI providers seamless.',
        code: `{
  "id": "cmpl-abc123",
  "object": "chat.completion",
  "model": "meta-llama/llama-3.3-70b-instruct",
  "choices": [{
    "index": 0,
    "message": {
      "role": "assistant",
      "content": "Signal received. Ready to operate."
    },
    "finish_reason": "stop"
  }]
}`,
      },
    ],
  },
  {
    id: 'models',
    title: 'MODEL_REGISTRY',
    icon: Cpu,
    content: [
      {
        heading: 'LIST AVAILABLE MODELS',
        body: 'Retrieve the full list of models accessible on your current tier. Models are categorized by capability and restriction level.',
        code: `GET /api/models

// Response
{
  "models": [
    {
      "id": "meta-llama/llama-3.3-70b-instruct",
      "name": "LLaMA 3.3 70B",
      "context_length": 128000,
      "tier_required": "explorer"
    },
    ...
  ]
}`,
      },
      {
        heading: 'TIER ACCESS LEVELS',
        body: 'Different tiers unlock different model categories. Join /buy to upgrade.',
        code: `// Tier hierarchy:
// Explorer  → Standard open-source models
// Novice    → Extended context + creative models  
// Apprentice→ Roleplay-capable models
// Adept     → Uncensored & unrestricted models
// Master    → Full archive access + image gen
// Developer → All models + API priority + admin`,
      },
    ],
  },
  {
    id: 'tts',
    title: 'VOICE_SYNTHESIS',
    icon: Globe,
    content: [
      {
        heading: 'TEXT-TO-SPEECH API',
        body: 'Generate speech from text using our neural TTS backbone. Supports multiple voices and custom voice clones.',
        code: `POST /api/tts
{
  "text": "Initiating neural synthesis.",
  "voice": "lyra",        // Built-in voices: lyra, john, nova
  "model": "eleven_flash_v2_5",
  "output_format": "mp3_44100_128"
}

// Returns: audio/mpeg stream`,
      },
      {
        heading: 'CUSTOM VOICE CLONING',
        body: 'Upload a voice sample to clone. Available on Adept tier and above via the Admin Panel\'s Bixby Voice Creator.',
        code: `POST /api/voice/clone
Content-Type: multipart/form-data

voice_sample: <audio_file>   // WAV, MP3, WebM
voice_name: "my_custom_voice"
description: "Optional description"

// Returns: { voice_id: "custom_abc123" }`,
      },
    ],
  },
  {
    id: 'security',
    title: 'SECURITY_PROTOCOL',
    icon: Shield,
    content: [
      {
        heading: 'RATE LIMITS',
        body: 'Rate limits are applied per session token. Exceeding limits returns a 429 response with a Retry-After header.',
        code: `// Headers returned on every request:
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 847
X-RateLimit-Reset: 1712345678

// 429 Response body:
{
  "error": "rate_limit_exceeded",
  "retry_after": 45,
  "message": "Slot limit reached. Reset in 45 seconds."
}`,
      },
      {
        heading: 'DATA PRIVACY',
        body: 'AI Sanctuary operates on a zero-retention policy. Conversation history is stored client-side only unless you explicitly enable cloud sync.',
        code: `// All conversation data is scoped to your browser's
// localStorage by default. Nothing is sent to our
// servers beyond the current inference request.
//
// To enable cross-device sync (Adept+ tier):
fetch('/api/history', {
  method: 'POST',
  body: JSON.stringify({ action: 'enable_sync' })
})`,
      },
    ],
  },
];

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('quickstart');

  const current = sections.find(s => s.id === activeSection)!;

  return (
    <div className="min-h-screen bg-transparent pt-40 pb-32 font-sans selection:bg-cyan-400 selection:text-black overflow-x-hidden relative z-10">

      <div className="container mx-auto px-6 max-w-7xl">
        {/* Header */}
        <div className="mb-20 max-w-5xl">
          <div className="inline-flex items-center gap-4 bg-cyan-400 text-black px-6 py-2 font-black uppercase tracking-[0.4em] text-xs shadow-[0_0_15px_rgba(34,211,238,0.3)] mb-12">
            <BookOpen className="w-4 h-4" />
            DEVELOPER_NEXUS_V3.0
          </div>
          <h1 className="text-7xl md:text-9xl font-black text-white mb-8 tracking-tighter uppercase leading-[0.85] italic">
            API_DOCS
          </h1>
          <p className="text-2xl text-slate-400 font-black uppercase tracking-widest leading-tight border-l-8 border-cyan-400 pl-8 max-w-3xl italic">
            INTEGRATE UNCENSORED AI INTO YOUR APPLICATIONS VIA THE SANCTUARY REST API.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar nav */}
          <aside className="lg:w-72 shrink-0">
            <div className="sticky top-32 space-y-3 glass-panel p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-6 border-b border-white/10 pb-4">NAVIGATION</p>
              {sections.map(s => {
                const Icon = s.icon;
                const active = s.id === activeSection;
                return (
                  <button
                    key={s.id}
                    onClick={() => setActiveSection(s.id)}
                    className={`w-full flex items-center gap-4 p-4 border-l-4 font-black uppercase text-[11px] tracking-widest text-left transition-all ${
                      active
                        ? 'bg-white/10 text-cyan-400 border-cyan-400 shadow-[inset_4px_0_10px_rgba(34,211,238,0.1)]'
                        : 'bg-transparent text-slate-400 border-transparent hover:border-white/30 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    {s.title}
                  </button>
                );
              })}

              <div className="pt-8 space-y-4 mt-8 border-t border-white/10">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-4">RESOURCES</p>
                <a href="https://github.com/AI-Sanctuary" target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-3 text-slate-400 hover:text-cyan-400 font-black uppercase text-[11px] tracking-widest transition-colors group">
                  <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  GitHub Repo
                </a>
                <Link href="/status"
                      className="flex items-center gap-3 text-slate-400 hover:text-cyan-400 font-black uppercase text-[11px] tracking-widest transition-colors group">
                  <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  System Status
                </Link>
                <Link href="/playground"
                      className="flex items-center gap-3 text-slate-400 hover:text-cyan-400 font-black uppercase text-[11px] tracking-widest transition-colors group">
                  <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Live Playground
                </Link>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0 glass-panel-heavy p-8 md:p-16 shadow-[0_15px_40px_rgba(0,0,0,0.8)] border-t-4 border-cyan-400">
            <div className="mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic box-decoration-clone inline-block">
                {current.title}
              </h2>
            </div>

            <div className="space-y-16">
              {current.content.map((block, i) => (
                <div key={i} className="border-l-4 border-white/20 pl-6 md:pl-10">
                  <h3 className="text-2xl font-black text-cyan-400 uppercase tracking-tighter italic mb-4">
                    {block.heading}
                  </h3>
                  <p className="text-slate-300 font-bold uppercase text-xs tracking-widest leading-relaxed mb-8">
                    {block.body}
                  </p>
                  {block.code && (
                    <div className="bg-black/80 text-slate-100 p-6 md:p-8 border-l-4 border-cyan-400 shadow-[0_0_15px_rgba(0,0,0,1)] overflow-x-auto relative group">
                      <div className="absolute inset-0 bg-cyan-400/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                        <Terminal className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400 font-mono text-[10px] font-black uppercase tracking-widest">TERMINAL_OUTPUT</span>
                      </div>
                      <pre className="font-mono text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {block.code}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Next section link */}
            {sections.findIndex(s => s.id === activeSection) < sections.length - 1 && (
              <div className="mt-20 pt-12 border-t border-white/10">
                <button
                  onClick={() => {
                    const idx = sections.findIndex(s => s.id === activeSection);
                    setActiveSection(sections[idx + 1].id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex items-center gap-4 bg-transparent text-cyan-400 font-black uppercase tracking-[0.3em] text-xs px-10 py-5 border-2 border-cyan-400 hover:bg-cyan-400 hover:text-black transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)] group"
                >
                  NEXT_SECTION
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
