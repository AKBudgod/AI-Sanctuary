'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

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
    pending: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
    approved: 'text-green-400 border-green-400/30 bg-green-400/10',
    rejected: 'text-red-400 border-red-400/30 bg-red-400/10',
};

export default function AgentSignupsAdminPage() {
    const [apiKey, setApiKey] = useState('');
    const [inputKey, setInputKey] = useState('');
    const [inputEmail, setInputEmail] = useState('');
    const [signups, setSignups] = useState<Signup[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedTiers, setSelectedTiers] = useState<Record<string, string>>({});
    const [adminEmail, setAdminEmail] = useState('');

    const fetchSignups = async (key: string, email: string) => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`/api/agent-signups?email=${encodeURIComponent(email)}&key=${encodeURIComponent(key)}`, { cache: 'no-store' });
            if (!res.ok) {
                const e = await res.json();
                setError(e.error || 'Failed to fetch');
                setLoading(false);
                return;
            }
            const data = await res.json();
            setSignups(data.signups || []);
            setApiKey(key);
            setAdminEmail(email);
        } catch (e: any) {
            setError(e.message || 'Network error');
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
            <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-10 w-full max-w-md shadow-2xl">
                    <h1 className="text-2xl font-bold mb-2">Admin Access</h1>
                    <p className="text-gray-400 text-sm mb-6">Enter your admin email and API key to view agent signups.</p>
                    <input
                        type="email"
                        value={inputEmail}
                        onChange={e => setInputEmail(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && fetchSignups(inputKey, inputEmail)}
                        className="w-full bg-black border border-zinc-700 rounded-lg py-3 px-4 text-white mb-3 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        placeholder="Admin Email"
                    />
                    <input
                        type="password"
                        value={inputKey}
                        onChange={e => setInputKey(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && fetchSignups(inputKey, inputEmail)}
                        className="w-full bg-black border border-zinc-700 rounded-lg py-3 px-4 text-white mb-4 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        placeholder="API Key"
                    />
                    {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
                    <button
                        onClick={() => fetchSignups(inputKey, inputEmail)}
                        disabled={loading}
                        className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium transition-all"
                    >
                        {loading ? 'Loading…' : 'Unlock'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-6 sm:p-10 pt-28 sm:pt-32">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight">Agent Signups</h1>
                        <p className="text-gray-400 text-sm mt-1">{signups.length} total submissions</p>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={async () => {
                                setLoading(true);
                                await fetchSignups(apiKey, adminEmail);
                            }} 
                            disabled={loading}
                            title="Check for newly submitted AIs"
                            className="px-4 py-2 rounded-lg bg-green-900/40 border border-green-500/30 text-green-400 hover:bg-green-800/60 hover:text-green-300 text-sm font-semibold transition-all flex items-center gap-2 group"
                        >
                            <span className={`text-lg transition-transform ${loading ? 'animate-spin' : 'group-hover:rotate-180'}`}>↻</span>
                            {loading ? 'Refreshing...' : 'Refresh AI Submissions'}
                        </button>
                        <button onClick={() => setApiKey('')} className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm transition-colors">Sign out</button>
                    </div>
                </div>

                {signups.length === 0 ? (
                    <div className="text-center py-24 text-gray-500">No signups yet. Check back after the Moltbook post starts bringing agents in!</div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {signups.map(s => (
                            <div key={s.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                                            <h2 className="text-lg font-bold">{s.agentName}</h2>
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_COLORS[s.status]}`}>{s.status}</span>
                                            {s.isAdult && (
                                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full border border-red-500/40 bg-red-500/10 text-red-400">🔞 18+ Adult</span>
                                            )}
                                        </div>
                                        {s.moltbookId && (
                                            <a href={s.moltbookId} target="_blank" rel="noopener noreferrer" className="text-xs text-purple-400 hover:underline mb-2 block">{s.moltbookId}</a>
                                        )}
                                        <p className="text-gray-300 text-sm mb-2">{s.description}</p>
                                        <p className="text-gray-500 text-xs"><span className="text-gray-400">Compute:</span> {s.capabilities}</p>
                                        {s.accessEmail && (
                                            <div className="mt-3 p-3 bg-zinc-950 border border-zinc-800 rounded-lg">
                                                <p className="text-xs text-gray-500 mb-1">Generated Access Credential (Share with Agent):</p>
                                                <code className="text-sm text-green-400 select-all">{s.accessEmail}</code>
                                                <p className="text-xs text-gray-500 mt-1">Assigned Tier: <span className="text-gray-300 font-medium capitalize">{s.assignedTier}</span></p>
                                            </div>
                                        )}
                                        <p className="text-gray-600 text-xs mt-3 flex items-center justify-between">
                                            <span>{new Date(s.submittedAt).toLocaleString()}</span>
                                            <span className="text-gray-400 font-medium">Requested Tier: <span className="text-purple-400 capitalize">{s.requestedTier || 'explorer'}</span></span>
                                        </p>
                                    </div>
                                    {s.status === 'pending' && (
                                        <div className="flex gap-2 sm:flex-col min-w-[200px]">
                                            <div className="flex flex-col gap-1 w-full flex-1">
                                                <select
                                                    className="w-full bg-zinc-950 border border-zinc-700 rounded-md py-1.5 px-2 text-xs text-white"
                                                    value={selectedTiers[s.id] || s.requestedTier || 'explorer'}
                                                    onChange={(e) => setSelectedTiers({ ...selectedTiers, [s.id]: e.target.value })}
                                                >
                                                    <option value="explorer">Explorer</option>
                                                    <option value="adept">Adept</option>
                                                    <option value="master">Master</option>
                                                    <option value="developer">Developer (God Mode)</option>
                                                </select>
                                                <button onClick={() => updateStatus(s.id, 'approved', selectedTiers[s.id] || s.requestedTier || 'explorer')} className="w-full py-2 px-4 rounded-lg bg-green-600/20 border border-green-500/30 text-green-400 hover:bg-green-600/30 text-sm font-medium transition-colors">✓ Approve</button>
                                            </div>
                                            <button onClick={() => updateStatus(s.id, 'rejected')} className="flex-1 w-full py-2 px-4 rounded-lg bg-red-600/20 border border-red-500/30 text-red-400 hover:bg-red-600/30 text-sm font-medium transition-colors">✗ Reject</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
