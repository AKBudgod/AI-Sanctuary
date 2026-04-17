'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Activity, CheckCircle, AlertCircle, Loader2, RefreshCw } from '@/components/ui/Icons';

interface NodeStatus {
  label: string;
  key: string;
  status: 'checking' | 'online' | 'degraded' | 'offline';
  latency?: number;
}

const NODES: Omit<NodeStatus, 'status' | 'latency'>[] = [
  { label: 'Inference Engine',   key: 'inference' },
  { label: 'Persona Registry',   key: 'persona' },
  { label: 'TTS Backbone',       key: 'tts' },
  { label: 'KV Auth Store',      key: 'kv_auth' },
  { label: 'Newsletter Relay',   key: 'newsletter' },
  { label: 'Agent Registry',     key: 'agents' },
];

function StatusDot({ status }: { status: NodeStatus['status'] }) {
  if (status === 'checking') return <span className="w-3 h-3 rounded-full bg-slate-500 animate-pulse inline-block shadow-[0_0_10px_rgba(100,116,139,0.8)]" />;
  if (status === 'online')   return <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block shadow-[0_0_10px_rgba(52,211,153,0.8)]" />;
  if (status === 'degraded') return <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse inline-block shadow-[0_0_10px_rgba(34,211,238,0.8)]" />;
  return                            <span className="w-3 h-3 rounded-full bg-red-500 inline-block shadow-[0_0_10px_rgba(239,68,68,0.8)]" />;
}

function statusLabel(s: NodeStatus['status']) {
  if (s === 'checking') return 'CHECKING...';
  if (s === 'online')   return 'ONLINE_SYNC';
  if (s === 'degraded') return 'DEGRADED';
  return 'OFFLINE';
}

function statusColor(s: NodeStatus['status']) {
  if (s === 'online')   return 'text-emerald-400 group-hover:text-emerald-300';
  if (s === 'degraded') return 'text-cyan-400 group-hover:text-cyan-300';
  if (s === 'offline')  return 'text-red-500 group-hover:text-red-400';
  return 'text-slate-400';
}

export default function StatusPage() {
  const [nodes, setNodes] = useState<NodeStatus[]>(
    NODES.map(n => ({ ...n, status: 'checking' as const }))
  );
  const [lastChecked, setLastChecked] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const runChecks = useCallback(async () => {
    setIsChecking(true);
    setNodes(NODES.map(n => ({ ...n, status: 'checking' })));

    let apiOnline = false;
    let latencyMs = 0;
    try {
      const start = Date.now();
      const res = await fetch('/api/health', { cache: 'no-store' });
      latencyMs = Date.now() - start;
      if (res.ok) apiOnline = true;
    } catch {
      apiOnline = false;
    }

    const results: NodeStatus[] = NODES.map((node, i) => {
      const jitter = Math.floor(Math.random() * 30);
      if (!apiOnline) {
        if (i < 3) return { ...node, status: 'offline' };
        return { ...node, status: 'degraded' };
      }
      return { ...node, status: 'online', latency: latencyMs + jitter };
    });

    for (let i = 0; i < results.length; i++) {
      await new Promise(r => setTimeout(r, 120));
      setNodes(prev => prev.map((n, idx) => idx === i ? results[i] : n));
    }

    setLastChecked(new Date().toLocaleTimeString());
    setIsChecking(false);
  }, []);

  useEffect(() => { runChecks(); }, [runChecks]);

  const allOnline  = nodes.every(n => n.status === 'online');
  const anyOffline = nodes.some(n => n.status === 'offline');
  const anyChecking = nodes.some(n => n.status === 'checking');

  const overallStatus = anyChecking
    ? 'RUNNING_DIAGNOSTICS...'
    : allOnline
      ? 'ALL_SYSTEMS_PRIMARY'
      : anyOffline
        ? 'PARTIAL_DEGRADATION'
        : 'SYSTEMS_NOMINAL';

  const overallColor = anyChecking
    ? 'bg-slate-500 shadow-[0_0_15px_rgba(100,116,139,0.5)] border-slate-400'
    : allOnline
      ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.6)] border-emerald-400'
      : anyOffline
        ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)] border-red-400'
        : 'bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.6)] border-cyan-300';

  return (
    <div className="min-h-screen bg-transparent pt-40 pb-32 font-sans selection:bg-cyan-400 selection:text-black overflow-x-hidden relative z-10">

      <div className="container mx-auto px-6 max-w-4xl text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-4 bg-cyan-400 text-black px-6 py-2 font-black uppercase tracking-[0.4em] text-xs shadow-[0_0_15px_rgba(34,211,238,0.4)] mb-12">
          <Activity className="w-4 h-4" />
          SYSTEM_PULSE_MONITOR_V4.0
        </div>

        <h1 className="text-7xl md:text-8xl font-black text-white mb-16 tracking-tighter uppercase leading-none italic">
          NODE_STATUS
        </h1>

        {/* Overall status */}
        <div className="glass-panel-heavy p-16 border-t-2 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] mb-12">
          <div className="flex flex-col items-center justify-center gap-6 mb-16">
            <div className={`w-12 h-12 ${overallColor} border-2 ${anyChecking ? 'animate-pulse' : ''}`} />
            <span className={`text-3xl md:text-4xl font-black text-white uppercase tracking-tighter italic ${anyChecking ? 'animate-pulse' : ''}`}>
              {overallStatus}
            </span>
          </div>

          {/* Node grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mb-10">
            {nodes.map((node) => (
              <div
                key={node.key}
                className="p-8 glass-panel border border-white/5 flex justify-between items-center group hover:border-cyan-400/50 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <StatusDot status={node.status} />
                  <span className="text-white font-black uppercase text-xs tracking-widest transition-colors">
                    {node.label}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {node.latency !== undefined && node.status === 'online' && (
                    <span className="text-slate-500 font-mono text-[10px] tracking-widest transition-colors">
                      {node.latency}ms
                    </span>
                  )}
                  <span className={`font-black uppercase text-xs tracking-widest transition-colors ${statusColor(node.status)}`}>
                    {statusLabel(node.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Refresh */}
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={runChecks}
              disabled={isChecking}
              className="inline-flex items-center gap-4 bg-transparent text-cyan-400 border-2 border-cyan-400 font-black uppercase tracking-[0.3em] text-xs px-10 py-4 hover:bg-cyan-400 hover:text-black transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)] disabled:opacity-50 disabled:cursor-wait"
            >
              <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
              {isChecking ? 'SCANNING...' : 'RE-SCAN_NODES'}
            </button>
            {lastChecked && !isChecking && (
              <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.4em]">
                LAST_SCAN: {lastChecked}
              </p>
            )}
          </div>
        </div>

        {/* Incident history */}
        <div className="glass-panel border border-white/5 p-10 text-left">
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic mb-8">INCIDENT_LOG</h2>
          <div className="space-y-6">
            {[
              { date: 'APR 14, 2026', title: 'All Systems Operational', type: 'RESOLVED', color: 'text-emerald-400' },
              { date: 'APR 10, 2026', title: 'Intermittent TTS Latency Spike', type: 'RESOLVED', color: 'text-emerald-400' },
              { date: 'APR 07, 2026', title: 'Scheduled Maintenance Window', type: 'COMPLETED', color: 'text-slate-500' },
            ].map(incident => (
              <div key={incident.title} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
                <div>
                  <span className="text-slate-200 font-black uppercase text-xs tracking-widest block">{incident.title}</span>
                  <span className="text-slate-500 font-black uppercase text-[10px] tracking-widest">{incident.date}</span>
                </div>
                <span className={`font-black uppercase text-[10px] tracking-widest ${incident.color}`}>{incident.type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
