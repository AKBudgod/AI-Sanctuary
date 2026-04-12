'use client';

import React from 'react';

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gray-950 pt-32 pb-20">
      <div className="container mx-auto px-6 max-w-4xl">
        <h1 className="text-5xl font-black text-white mb-8 tracking-tighter uppercase font-mono">
          Developer Nexus
        </h1>
        <div className="grid md:grid-cols-2 gap-8 text-left">
           <div className="p-8 bg-gray-900/50 rounded-2xl border border-white/5">
             <h3 className="text-white font-bold mb-4 text-xl">API Reference</h3>
             <p className="text-gray-500 text-sm mb-4">Integrate uncensored AI into your applications via REST and WebSockets.</p>
             <code className="bg-black p-2 rounded text-blue-400 text-xs block">GET /api/models</code>
           </div>
           <div className="p-8 bg-gray-900/50 rounded-2xl border border-white/5">
             <h3 className="text-white font-bold mb-4 text-xl">SANC Protocol</h3>
             <p className="text-gray-500 text-sm mb-4">Learn how the SANC token powers the decentralized compute grid.</p>
             <code className="bg-black p-2 rounded text-purple-400 text-xs block">npm install @sanctuary/sdk</code>
           </div>
        </div>
      </div>
    </div>
  );
}
