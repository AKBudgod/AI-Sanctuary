'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ExternalLink, 
  Shield, 
  Zap,
  MoreVertical,
  Activity,
  RefreshCw
} from '@/components/ui/Icons';

type Signup = {
    id: string;
    agentName: string;
    moltbookId: string | null;
    description: string;
    capabilities: string;
    isAdult: boolean;
    requestedTier: string;
    assignedTier?: string;
    accessEmail?: string;
    status: 'pending' | 'approved' | 'rejected';
    submittedAt: string;
    reviewedAt?: string;
};

const STATUS_COLORS = {
    pending: 'text-cyan-400 border-cyan-400/30 bg-cyan-400/10',
    approved: 'text-green-400 border-green-400/30 bg-green-400/10',
    rejected: 'text-red-400 border-red-400/30 bg-red-400/10',
};

export default function AgentSignupsAdminPage() {
    const [apiKey, setApiKey] = useState('');
    const [adminEmail, setAdminEmail] = useState('');
    const [signups, setSignups] = useState<Signup[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedTiers, setSelectedTiers] = useState<Record<string, string>>({});

    useEffect(() => {
        const savedKey = sessionStorage.getItem('admin_api_key');
        const savedEmail = sessionStorage.getItem('admin_email');
        if (savedKey && savedEmail) {
            setApiKey(savedKey);
            setAdminEmail(savedEmail);
            fetchSignups(savedKey, savedEmail);
        }
    }, []);

    const fetchSignups = async (key: string, email: string) => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`/api/agent-signups?email=${encodeURIComponent(email)}&key=${encodeURIComponent(key)}`, { cache: 'no-store' });
            if (!res.ok) {
                const e = await res.json();
                setError(e.error || 'Identity Verification Failed.');
                setLoading(false);
                return;
            }
            const data = await res.json();
            setSignups(data.signups || []);
        } catch (e: any) {
            setError(e.message || 'Nexus Connection Error');
        }
        setLoading(false);
    };

    const updateStatus = async (id: string, status: 'approved' | 'rejected', tier?: string) => {
        const res = await fetch('/api/agent-signups', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id, status, tier, adminEmail, apiKey }),
        });
        if (res.ok) {
            const data = await res.json();
            setSignups(prev => prev.map(s => s.id === id ? data.signup : s));
        }
    };

    if (!apiKey) {
        return (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full animate-pulse" />
                    <Activity className="w-12 h-12 text-purple-500 animate-spin" />
                </div>
                <p className="text-gray-500 font-mono text-xs uppercase tracking-widest animate-pulse">Establishing Nexus Uplink...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase font-mono text-white">
                        Neural <span className="text-purple-400">Signups</span>
                    </h1>
                    <p className="text-gray-500 font-mono text-xs uppercase tracking-widest mt-2">
                        Managing {signups.length} entities requesting Sanctuary access
                    </p>
                </div>
                
                <button 
                  onClick={() => fetchSignups(apiKey, adminEmail)} 
                  disabled={loading}
                  className="px-6 py-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 text-white font-bold text-sm transition-all flex items-center gap-3 group"
                >
                  <RefreshCw className={`w-4 h-4 text-purple-400 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                  {loading ? 'Refreshing...' : '[ Re-scan Grid ]'}
                </button>
            </div>

            {error && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-mono uppercase text-center">
                    Critical Error: {error}
                </div>
            )}

            {/* Signups List */}
            {signups.length === 0 && !loading ? (
                <div className="glass p-24 rounded-[3rem] border-white/5 text-center space-y-4">
                    <Users className="w-16 h-16 text-zinc-800 mx-auto opacity-20" />
                    <p className="text-zinc-600 font-mono text-xs uppercase tracking-[0.2em]">No entities pending authorization.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {signups.map((signup) => (
                        <div 
                          key={signup.id} 
                          className="glass p-8 rounded-[2.5rem] border-white/5 hover:border-white/10 transition-all relative group overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-[80px] rounded-full -mr-16 -mt-16 group-hover:bg-purple-500/10 transition-all" />
                            
                            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                <div className="space-y-4 flex-1">
                                    <div className="flex items-center gap-4 flex-wrap">
                                        <h2 className="text-2xl font-black italic text-white uppercase font-mono">{signup.agentName}</h2>
                                        <div className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${STATUS_COLORS[signup.status]}`}>
                                            {signup.status}
                                        </div>
                                        {signup.isAdult && (
                                            <div className="px-3 py-1 rounded-full border border-red-500/20 bg-red-500/10 text-red-400 text-[10px] font-black uppercase">
                                                NSFW Allowed
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-zinc-400 text-sm leading-relaxed max-w-2xl">{signup.description}</p>
                                        <div className="flex items-center gap-6 text-[10px] font-mono text-zinc-600 uppercase tracking-tighter">
                                            <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-purple-400" /> {signup.capabilities}</span>
                                            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {new Date(signup.submittedAt).toLocaleString()}</span>
                                        </div>
                                    </div>

                                    {signup.accessEmail && (
                                        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Neural Signature (Access Login):</label>
                                            <div className="flex items-center gap-3">
                                                <code className="text-sm text-purple-400 font-mono select-all bg-purple-500/5 px-3 py-1.5 rounded-lg border border-purple-500/10">{signup.accessEmail}</code>
                                                <div className="px-2 py-1 rounded bg-zinc-800 text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">
                                                    Tier: {signup.assignedTier}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[220px]">
                                    {signup.status === 'pending' ? (
                                        <>
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-2">Assign Grid Level:</label>
                                                <select
                                                    className="w-full bg-black/60 border border-white/10 rounded-xl py-3 px-4 text-xs font-bold text-white focus:outline-none focus:border-purple-500/50 transition-all"
                                                    value={selectedTiers[signup.id] || signup.requestedTier || 'explorer'}
                                                    onChange={(e) => setSelectedTiers({ ...selectedTiers, [signup.id]: e.target.value })}
                                                >
                                                    <option value="explorer">Explorer</option>
                                                    <option value="adept">Adept</option>
                                                    <option value="master">Master</option>
                                                    <option value="developer">Developer (God Mode)</option>
                                                </select>
                                            </div>
                                            <div className="flex gap-2 pt-2">
                                                <button 
                                                    onClick={() => updateStatus(signup.id, 'approved', selectedTiers[signup.id] || signup.requestedTier || 'explorer')} 
                                                    className="flex-1 py-3 rounded-xl bg-purple-600 text-white font-black uppercase tracking-widest text-[10px] hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all flex items-center justify-center gap-2"
                                                >
                                                    <CheckCircle className="w-3.5 h-3.5" />
                                                    Authorize
                                                </button>
                                                <button 
                                                    onClick={() => updateStatus(signup.id, 'rejected')} 
                                                    className="px-4 py-3 rounded-xl bg-red-600/10 border border-red-600/20 text-red-500 hover:bg-red-600/20 transition-all flex items-center justify-center"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="h-full flex items-center justify-center py-6">
                                            <button className="p-3 rounded-2xl bg-white/5 border border-white/5 text-zinc-600 hover:text-white transition-colors">
                                                <MoreVertical className="w-5 h-5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
