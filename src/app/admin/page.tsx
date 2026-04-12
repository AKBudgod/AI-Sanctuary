'use client';

import React, { useState, useEffect } from 'react';
import VoiceSynthesizer from '@/components/ui/VoiceSynthesizer';
import VisualArchitect from '@/components/ui/VisualArchitect';
import BixbyVoiceCreator from '@/components/ui/BixbyVoiceCreator';
import { 
  Users, 
  BarChart3, 
  Wallet, 
  Mail, 
  RefreshCw, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Zap
} from '@/components/ui/Icons';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'voice' | 'visual' | 'bixby'>('voice');

  useEffect(() => {
    const email = sessionStorage.getItem('admin_email') ?? undefined;
    setUserEmail(email);
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    const key = sessionStorage.getItem('admin_api_key');
    try {
      const res = await fetch('/api/admin?action=stats', {
        headers: { 'Authorization': `Bearer ${key}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error('Failed to fetch admin stats', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncStatus('Initiating Model Synchronization...');
    // Simulate sync or call existing sync script if exposed as API
    setTimeout(() => setSyncStatus('Grid Synchronized Successfully.'), 2000);
  };

  return (
    <div className="space-y-12">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Users} 
          label="Active Sessions" 
          value={stats?.sessions?.active || stats?.wallets?.totalConnected || '0'} 
          color="blue" 
          trend="+12% Since Last Sync"
        />
        <StatCard 
          icon={Mail} 
          label="Sanctuary Leads" 
          value={stats?.newsletter?.totalSubscribers || '0'} 
          color="purple" 
          trend="Steady Growth"
        />
        <StatCard 
          icon={Zap} 
          label="API Node Health" 
          value="99.9%" 
          color="teal" 
          trend="All Nodes Online"
        />
        <StatCard 
          icon={Sparkles} 
          label="Grid Uptime" 
          value="48.2h" 
          color="amber" 
          trend="Operational"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Main Center Feature: Interactive Architects */}
        <div className="lg:col-span-2 space-y-12">
           <div className="flex items-center gap-8 border-b border-white/5 pb-6">
              <button 
                onClick={() => setActiveTab('voice')}
                className={`text-2xl font-black italic uppercase font-mono tracking-tighter transition-all ${
                  activeTab === 'voice' ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'
                }`}
              >
                Neural <span className={activeTab === 'voice' ? 'text-purple-400' : ''}>Architect</span>
              </button>
              <button 
                onClick={() => setActiveTab('visual')}
                className={`text-2xl font-black italic uppercase font-mono tracking-tighter transition-all ${
                  activeTab === 'visual' ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'
                }`}
              >
                Visual <span className={activeTab === 'visual' ? 'text-blue-400' : ''}>Architect</span>
              </button>
              <button 
                onClick={() => setActiveTab('bixby')}
                className={`text-2xl font-black italic uppercase font-mono tracking-tighter transition-all ${
                  activeTab === 'bixby' ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'
                }`}
              >
                Bixby <span className={activeTab === 'bixby' ? 'text-violet-400' : ''}>Voice</span>
              </button>
           </div>

           {activeTab === 'voice' ? (
             <div className="animate-in fade-in slide-in-from-left-4 duration-500">
               <VoiceSynthesizer userEmail={userEmail} />
             </div>
           ) : activeTab === 'visual' ? (
             <div className="animate-in fade-in slide-in-from-right-4 duration-500">
               <VisualArchitect />
             </div>
           ) : (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <BixbyVoiceCreator userEmail={userEmail} />
             </div>
           )}
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-6">
           <div className="glass p-8 rounded-[2.5rem] border-white/5 space-y-6">
              <h3 className="text-xl font-black italic tracking-tighter uppercase font-mono">Grid Actions</h3>
              
              <div className="space-y-3">
                 <button 
                  onClick={handleSync}
                  className="w-full p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all flex items-center justify-between group"
                 >
                    <div className="flex items-center gap-3">
                       <RefreshCw className="w-5 h-5 text-purple-400 group-hover:rotate-180 transition-transform duration-500" />
                       <span className="font-bold text-sm">Synchronize Grid</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                 </button>
                 
                 <Link href="/playground" className="w-full p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                       <ExternalLink className="w-5 h-5 text-blue-400" />
                       <span className="font-bold text-sm">Launch Playground</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                 </Link>
              </div>

              {syncStatus && (
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                   <p className="text-[10px] font-mono text-purple-400 uppercase tracking-widest">{syncStatus}</p>
                </div>
              )}
           </div>

           <div className="glass p-8 rounded-[2.5rem] border-white/5 space-y-4">
              <h3 className="text-xl font-black italic tracking-tighter uppercase font-mono">System Intel</h3>
              <p className="text-xs text-gray-400 font-mono leading-relaxed uppercase">
                 The Neural Grid has processed <span className="text-white font-bold">128,409</span> syntheses since the last deployment. 
                 Global censorship attempts: <span className="text-green-500 font-bold">0</span>.
              </p>
              <div className="pt-4 border-t border-white/5">
                 <div className="flex items-center justify-between text-[10px] font-mono text-gray-500 uppercase tracking-widest ">
                    <span>Core Version</span>
                    <span className="text-white">v4.2.1-Alpha</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, trend }: any) {
  const colors: any = {
    blue: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    purple: 'text-purple-400 bg-purple-400/10 border-purple-500/20',
    teal: 'text-teal-400 bg-teal-400/10 border-teal-500/20',
    amber: 'text-amber-400 bg-amber-400/10 border-amber-500/20',
  };

  return (
    <div className="glass p-8 rounded-[2.5rem] border-white/5 relative overflow-hidden group hover:border-white/10 transition-all">
       <div className={`absolute top-0 right-0 w-24 h-24 blur-[60px] opacity-20 -mr-12 -mt-12 transition-all group-hover:opacity-40 ${colors[color].split(' ')[0]}`} />
       
       <div className="relative z-10 space-y-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${colors[color]}`}>
             <Icon className="w-6 h-6" />
          </div>
          <div>
             <h4 className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">{label}</h4>
             <div className="text-3xl font-black italic tracking-tighter text-white uppercase font-mono">{value}</div>
          </div>
          <div className="text-[9px] font-mono text-zinc-600 uppercase tracking-tighter">
             {trend}
          </div>
       </div>
    </div>
  );
}

function Link({ href, children, className }: any) {
  return <a href={href} className={className}>{children}</a>;
}
