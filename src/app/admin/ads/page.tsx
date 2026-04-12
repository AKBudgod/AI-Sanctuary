'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Sparkles, 
  Zap,
  Activity, 
  MousePointer2,
  PieChart,
  Layout,
  RefreshCw,
  Plus
} from '@/components/ui/Icons';

type AdCampaign = {
    id: string;
    name: string;
    status: 'active' | 'paused' | 'scheduled';
    impressions: number;
    clicks: number;
    ctr: number;
    budget: string;
    target: string;
};

export default function AdIntelligenceAdminPage() {
    const [apiKey, setApiKey] = useState('');
    const [adminEmail, setAdminEmail] = useState('');
    const [campaigns, setCampaigns] = useState<AdCampaign[]>([
        { id: '1', name: 'Nexus Launch Sprint', status: 'active', impressions: 45209, clicks: 1204, ctr: 2.66, budget: '$50.00/day', target: 'Crypto Niche' },
        { id: '2', name: 'Moltbook Retargeting', status: 'active', impressions: 21890, clicks: 890, ctr: 4.07, budget: '$25.00/day', target: 'AI Developers' },
        { id: '3', name: 'God Mode Flash Sale', status: 'paused', impressions: 128400, clicks: 5402, ctr: 4.21, budget: '$100.00/day', target: 'Power Users' },
    ]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalConversions: 0,
        totalRevenue: 0,
        lastSync: ''
    });

    const fetchStats = async (key: string) => {
        try {
            const res = await fetch(`/api/admin?action=stats`, {
                headers: { 'Authorization': `Bearer ${key}` }
            });
            const data = await res.json();
            if (data.ads) {
                setStats({
                    totalConversions: data.ads.totalConversions,
                    totalRevenue: data.ads.totalRevenue,
                    lastSync: data.ads.lastSync
                });
            }
        } catch (err) {
            console.error('Failed to sync ad stats:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const savedKey = sessionStorage.getItem('admin_api_key');
        const savedEmail = sessionStorage.getItem('admin_email');
        if (savedKey && savedEmail) {
            setApiKey(savedKey);
            setAdminEmail(savedEmail);
            fetchStats(savedKey);
        }
    }, []);

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
        <div className="space-y-12 animate-in fade-in duration-700">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase font-mono text-white">
                        Ad <span className="text-purple-400">Intelligence</span>
                    </h1>
                    <p className="text-gray-500 font-mono text-xs uppercase tracking-widest mt-2">
                        Real-time conversion tracking & campaign management
                    </p>
                </div>
                
                <div className="flex gap-4">
                    <button className="px-6 py-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 text-white font-bold text-sm transition-all flex items-center gap-3">
                      <Plus className="w-4 h-4 text-purple-400" />
                      [ New Campaign ]
                    </button>
                    <button className="px-6 py-3 rounded-2xl bg-purple-600 text-white font-bold text-sm transition-all flex items-center gap-3 shadow-lg shadow-purple-500/20">
                      <RefreshCw className="w-4 h-4" />
                      [ Sync Stats ]
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass p-8 rounded-[2.5rem] border-white/5 space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
                        <MousePointer2 className="w-5 h-5" />
                    </div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Total Conversions (Verified)</h4>
                    <div className="text-3xl font-black italic font-mono text-white tracking-tighter">
                        {loading ? '...' : stats.totalConversions.toLocaleString()}
                    </div>
                    <span className="text-[9px] text-green-500 font-mono uppercase">
                        Real-time Audit Linked
                    </span>
                </div>
                <div className="glass p-8 rounded-[2.5rem] border-white/5 space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
                        <Zap className="w-5 h-5" />
                    </div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Gross Revenue</h4>
                    <div className="text-3xl font-black italic font-mono text-white tracking-tighter">
                        ${loading ? '...' : stats.totalRevenue.toLocaleString()}
                    </div>
                    <span className="text-[9px] text-zinc-600 font-mono uppercase">Consolidated Gateway Flow</span>
                </div>
                <div className="glass p-8 rounded-[2.5rem] border-white/5 space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-4">
                        <Target className="w-5 h-5" />
                    </div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Last Sync</h4>
                    <div className="text-xs font-black italic font-mono text-white tracking-tighter truncate">
                        {loading ? '...' : stats.lastSync ? new Date(stats.lastSync).toLocaleString() : 'No Data Yet'}
                    </div>
                    <span className="text-[9px] text-blue-500 font-mono uppercase">Neural Grid Status: Active</span>
                </div>
            </div>

            <div className="glass p-1 p-8 rounded-[3rem] border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                    <div className="text-[8rem] font-black text-white italic rotate-12 select-none uppercase tracking-tighter">
                        Sandbox Mockup
                    </div>
                </div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                <div className="relative z-10 overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left font-mono">
                        <thead>
                            <tr className="border-b border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                                <th className="px-4 py-6">Campaign</th>
                                <th className="px-4 py-6">Targeting</th>
                                <th className="px-4 py-6">Status</th>
                                <th className="px-4 py-6">Reach</th>
                                <th className="px-4 py-6">CTR</th>
                                <th className="px-4 py-6 text-right">Budget</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {campaigns.map((c) => (
                                <tr key={c.id} className="border-b border-white/5 hover:bg-white/5 transition-all group">
                                    <td className="px-4 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse group-hover:scale-150 transition-all" />
                                            <span className="font-bold text-white uppercase">{c.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-6 text-zinc-400">{c.target}</td>
                                    <td className="px-4 py-6">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${
                                            c.status === 'active' ? 'text-green-400 border-green-500/20 bg-green-500/10' : 'text-zinc-500 border-zinc-500/20 bg-zinc-500/5'
                                        }`}>
                                            {c.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-6 text-blue-400 font-bold">{c.impressions.toLocaleString()}</td>
                                    <td className="px-4 py-6 text-purple-400 font-black italic">{c.ctr}%</td>
                                    <td className="px-4 py-6 text-right text-zinc-500">{c.budget}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
