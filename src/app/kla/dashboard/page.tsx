"use client";

import Head from "next/head";
import { useState, useEffect } from "react";
import { Search, Mail, Target, Plus, Activity, AlertTriangle } from "lucide-react";

export default function KLADashboard() {
  const [niche, setNiche] = useState("");
  const [missions, setMissions] = useState<any[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const email = localStorage.getItem("user_email");
    setUserEmail(email);
    if (email) {
      fetchMissions(email);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchMissions = async (email: string) => {
    try {
      setLoading(true);
      const res = await fetch("/api/kla/missions", {
        headers: { "Authorization": `Bearer ${email}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMissions(data.missions || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const addMission = async (e: any) => {
    e.preventDefault();
    if (!niche || !userEmail) return;
    
    // Optimistic UI update
    const tempId = Date.now();
    setMissions([{ id: tempId, niche, leads: 0, sent: 0, status: "Indexing..." }, ...missions]);
    
    try {
      const res = await fetch("/api/kla/missions", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userEmail}` 
        },
        body: JSON.stringify({ niche })
      });
      if (res.ok) {
        fetchMissions(userEmail);
      }
    } catch (e) {
      console.error(e);
    }
    
    setNiche("");
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans p-8">
      <Head><title>K'LA | Operations Dashboard</title></Head>

      <div className="max-w-6xl mx-auto space-y-12">
        
        {!userEmail && !loading && (
          <div className="p-4 rounded-xl bg-rose-500/20 border border-rose-500/50 flex items-center gap-3 text-rose-300">
             <AlertTriangle className="w-5 h-5" />
             <span>You must sign in on the <a href="/platform" className="underline font-bold hover:text-white">Platform page</a> to construct and manage missions.</span>
          </div>
        )}

        {/* Header */}
        <header className="flex items-center justify-between pb-8 border-b border-white/10">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white mb-2">K'LA Operations HQ</h1>
            <p className="text-neutral-400">Manage your autonomous SDR campaigns and monitor outbound metrics.</p>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <Activity className="w-4 h-4 animate-pulse" />
            <span className="text-sm font-semibold tracking-wide uppercase">K'LA Online</span>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-3 text-neutral-400 mb-4">
              <Target className="w-5 h-5 text-rose-500" /> Active Missions
            </div>
            <div className="text-4xl font-black text-white">{missions.length}</div>
          </div>
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-3 text-neutral-400 mb-4">
              <Search className="w-5 h-5 text-rose-500" /> Leads Mined
            </div>
            <div className="text-4xl font-black text-white">{missions.reduce((acc, m) => acc + (m.leads || 0), 0)}</div>
          </div>
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-3 text-neutral-400 mb-4">
              <Mail className="w-5 h-5 text-rose-500" /> Emails Sent
            </div>
            <div className="text-4xl font-black text-white">{missions.reduce((acc, m) => acc + (m.sent || 0), 0)}</div>
          </div>
        </div>

        {/* New Mission Form */}
        <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10">
          <h2 className="text-2xl font-bold mb-6">Deploy New Mission</h2>
          <form onSubmit={addMission} className="flex gap-4">
            <input 
              type="text" 
              value={niche}
              disabled={!userEmail}
              onChange={(e) => setNiche(e.target.value)}
              placeholder={userEmail ? "e.g. 'B2B SaaS Founders in New York'" : "Sign in to input a target"}
              className="flex-1 px-6 py-4 rounded-xl bg-black/50 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 transition-colors disabled:opacity-50"
            />
            <button type="submit" disabled={!userEmail} className="px-8 py-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              <Plus className="w-5 h-5" /> Start Search
            </button>
          </form>
        </div>

        {/* Missions Table */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Mission Log</h2>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/50">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.05] border-b border-white/10 text-neutral-400 text-sm">
                  <th className="p-4 font-medium">Target Niche</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Leads Mined</th>
                  <th className="p-4 font-medium">Emails Sent</th>
                  <th className="p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {missions.map(mission => (
                  <tr key={mission.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-medium text-white">{mission.niche}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${mission.status === 'Active' || mission.status === 'Indexing...' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                        {mission.status}
                      </span>
                    </td>
                    <td className="p-4 text-neutral-300">{mission.leads}</td>
                    <td className="p-4 text-neutral-300">{mission.sent}</td>
                    <td className="p-4">
                      <button className="text-sm font-semibold text-rose-500 hover:text-rose-400">View Data</button>
                    </td>
                  </tr>
                ))}
                {missions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-neutral-500">No active missions. Give K'LA a target above.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
