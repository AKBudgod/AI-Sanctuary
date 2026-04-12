"use client";

import Head from "next/head";
import { useState, useEffect, useRef } from "react";
import { Search, Mail, Target, Plus, Activity, AlertTriangle, UserCheck, Zap, TrendingUp, Video, Linkedin, Music2, BarChart3, Clipboard, Download, RefreshCw, ChevronDown, ChevronRight, Sparkles, Globe } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
type AssetType = 'Social Ad Pack' | 'Email Sequence' | 'VSL Script' | 'LinkedIn Post' | 'TikTok Script' | 'Growth Plan';
type ActiveTab = 'ops' | 'marketing' | 'analytics';

interface GeneratedAsset {
  type: AssetType;
  niche: string;
  data: any;
  timestamp: Date;
}

// ─── Constants ───────────────────────────────────────────────────────────────
const ASSET_TYPES: { id: AssetType; label: string; icon: any; desc: string; color: string }[] = [
  { id: 'Social Ad Pack', label: 'Social Ad Pack', icon: Zap, desc: 'Hook + copy + visual prompt', color: 'rose' },
  { id: 'Email Sequence', label: 'Email Sequence', icon: Mail, desc: '5-touch cold outreach flow', color: 'blue' },
  { id: 'VSL Script', label: 'VSL Script', icon: Video, desc: '90-second video sales letter', color: 'violet' },
  { id: 'LinkedIn Post', label: 'LinkedIn Post', icon: Linkedin, desc: 'Value-first authority post', color: 'cyan' },
  { id: 'TikTok Script', label: 'TikTok Script', icon: Music2, desc: 'Viral 30-60s short script', color: 'pink' },
  { id: 'Growth Plan', label: 'Growth Plan', icon: Globe, desc: '30-day full-channel strategy', color: 'amber' },
];

const colorCls = (color: string) => ({
  border: `border-${color}-500/30`,
  bg: `bg-${color}-500/10`,
  text: `text-${color}-400`,
  glow: `shadow-[0_0_30px_rgba(0,0,0,0)] hover:shadow-[0_0_20px_theme(colors.${color}.500/15)]`,
  activeBorder: `border-${color}-500/60`,
  activeBg: `bg-${color}-500/20`,
});

// ─── Main Component ───────────────────────────────────────────────────────────
export default function KLADashboard() {
  // Ops
  const [niche, setNiche] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [valueProp, setValueProp] = useState("");
  const [missions, setMissions] = useState<any[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [oauthStatus, setOauthStatus] = useState({ x: false, reddit: false });
  const [selectedMission, setSelectedMission] = useState<any>(null);
  const [showDataModal, setShowDataModal] = useState(false);
  const [isBlasting, setIsBlasting] = useState(false);
  const [opsHistory, setOpsHistory] = useState<any>(null);

  // Marketing Studio
  const [activeTab, setActiveTab] = useState<ActiveTab>('ops');
  const [selectedAssetType, setSelectedAssetType] = useState<AssetType>('Social Ad Pack');
  const [marketingNiche, setMarketingNiche] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedAssets, setGeneratedAssets] = useState<GeneratedAsset[]>([]);
  const [activeAsset, setActiveAsset] = useState<GeneratedAsset | null>(null);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    const email = localStorage.getItem("user_email");
    setUserEmail(email);
    if (email) fetchMissions(email);
    else setLoading(false);
  }, []);

  const fetchMissions = async (email: string) => {
    try {
      setLoading(true);
      const res = await fetch("/api/kla/missions", { headers: { "Authorization": `Bearer ${email}` } });
      if (res.ok) { const data = await res.json(); setMissions(data.missions || []); }
      const histRes = await fetch("https://kla-sdr-engine.wjreviews420.workers.dev/history", {
        headers: { "Authorization": `Bearer sanctuary_admin_a6d313036d937828f5beba51c7b4576ac51de23767e43e6b` }
      });
      if (histRes.ok) setOpsHistory(await histRes.json());
      const oauthRes = await fetch("/api/kla/oauth-status", { headers: { "Authorization": `Bearer ${email}` } });
      if (oauthRes.ok) setOauthStatus(await oauthRes.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const addMission = async (e: any) => {
    e.preventDefault();
    if (!niche || !productUrl || !valueProp || !userEmail) return alert("Fill all mission parameters.");
    const tempId = Date.now();
    setMissions([{ id: tempId, niche, productUrl, leads: 0, sent: 0, status: "Indexing..." }, ...missions]);
    try {
      const res = await fetch("/api/kla/missions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${userEmail}` },
        body: JSON.stringify({ niche, productUrl, valueProp })
      });
      if (res.ok) fetchMissions(userEmail);
    } catch (e) { console.error(e); }
    setNiche(""); setProductUrl(""); setValueProp("");
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const downloadAsset = (asset: GeneratedAsset) => {
    const content = JSON.stringify(asset.data, null, 2);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kla-${asset.type.replace(/\s+/g, '-').toLowerCase()}-${asset.niche.replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateAsset = async () => {
    if (!marketingNiche.trim()) return alert("Enter a target niche.");
    setGenerating(true);
    setGeneratedImageUrl(null);
    try {
      const res = await fetch("/api/kla/marketing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche: marketingNiche, type: selectedAssetType })
      });
      const data = await res.json();
      if (data.success) {
        const newAsset: GeneratedAsset = { type: selectedAssetType, niche: marketingNiche, data: data.asset, timestamp: new Date() };
        setGeneratedAssets(prev => [newAsset, ...prev.slice(0, 9)]);
        setActiveAsset(newAsset);
        setExpandedSections({});
      } else {
        alert("Synthesis Error: " + (data.error || "Unknown"));
      }
    } catch (e) { console.error(e); alert("Neural Connection Interrupted."); }
    finally { setGenerating(false); }
  };

  const generateVisual = async (imagePrompt: string) => {
    setGeneratingImage(true);
    try {
      const res = await fetch("/api/kla/marketing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate-image", prompt: imagePrompt })
      });
      const data = await res.json();
      if (data.success) setGeneratedImageUrl(data.image);
      else alert("Visual Synthesis Failed: " + data.error);
    } catch (e) { alert("Connection Severed."); }
    finally { setGeneratingImage(false); }
  };

  const toggleSection = (key: string) => setExpandedSections(p => ({ ...p, [key]: !p[key] }));

  // ─── Render Asset Output ────────────────────────────────────────────────────
  const renderAssetOutput = (asset: GeneratedAsset) => {
    const d = asset.data;

    if (asset.type === 'Social Ad Pack') return (
      <div className="space-y-5">
        {generatedImageUrl ? (
          <div className="rounded-2xl overflow-hidden border border-rose-500/30"><img src={generatedImageUrl} alt="Ad Visual" className="w-full" /></div>
        ) : (
          <div className="aspect-video rounded-2xl bg-black/40 border border-white/5 flex flex-col items-center justify-center gap-3">
            <div className="text-neutral-600 text-[10px] uppercase tracking-widest font-black">Visual Pending</div>
            {d.imagePrompt && (
              <button onClick={() => generateVisual(d.imagePrompt)} disabled={generatingImage}
                className="px-6 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50">
                {generatingImage ? "Synthesizing..." : "Generate Visual"}
              </button>
            )}
          </div>
        )}
        <Field label="Headline" value={d.headline} copyKey="headline" onCopy={copyToClipboard} copied={copiedKey} />
        {d.subheadline && <Field label="Subheadline" value={d.subheadline} copyKey="subheadline" onCopy={copyToClipboard} copied={copiedKey} />}
        <Field label="Body Copy" value={d.body} copyKey="body" onCopy={copyToClipboard} copied={copiedKey} multiline />
        {d.cta && <Field label="CTA" value={d.cta} copyKey="cta" onCopy={copyToClipboard} copied={copiedKey} />}
        {d.hashtags && <Field label="Hashtags" value={d.hashtags.join(' ')} copyKey="hashtags" onCopy={copyToClipboard} copied={copiedKey} />}
        {d.imagePrompt && <Field label="Visual Prompt" value={d.imagePrompt} copyKey="imgPrompt" onCopy={copyToClipboard} copied={copiedKey} mono multiline />}
      </div>
    );

    if (asset.type === 'Email Sequence') return (
      <div className="space-y-4">
        <div className="grid grid-cols-5 gap-2 mb-4">
          {(d.emails || []).map((email: any, i: number) => (
            <div key={i} className={`p-3 rounded-xl border border-white/5 bg-white/[0.02] text-center cursor-pointer hover:border-blue-500/40 transition-all ${expandedSections[`email-${i}`] ? 'border-blue-500/40 bg-blue-500/10' : ''}`}
              onClick={() => toggleSection(`email-${i}`)}>
              <div className="text-[9px] text-neutral-500 uppercase font-black tracking-widest">Day</div>
              <div className="text-xl font-black text-white">{email.day}</div>
            </div>
          ))}
        </div>
        {(d.emails || []).map((email: any, i: number) => expandedSections[`email-${i}`] && (
          <div key={i} className="p-5 rounded-2xl bg-blue-500/5 border border-blue-500/20 space-y-3 animate-in fade-in duration-300">
            <div className="text-[10px] text-blue-400 font-black uppercase tracking-widest">Day {email.day} Email</div>
            <Field label="Subject" value={email.subject} copyKey={`subj-${i}`} onCopy={copyToClipboard} copied={copiedKey} />
            <Field label="Body" value={email.body} copyKey={`body-${i}`} onCopy={copyToClipboard} copied={copiedKey} multiline />
          </div>
        ))}
        {d.cta_url && <Field label="CTA URL" value={d.cta_url} copyKey="cta_url" onCopy={copyToClipboard} copied={copiedKey} mono />}
      </div>
    );

    if (asset.type === 'VSL Script') return (
      <div className="space-y-4">
        {[
          { key: 'hook', label: 'Hook (0-5s)', dur: '5s' },
          { key: 'problem', label: 'Problem (5-15s)', dur: '10s' },
          { key: 'agitate', label: 'Agitate (15-30s)', dur: '15s' },
          { key: 'solution_reveal', label: 'Solution Reveal (30-50s)', dur: '20s' },
          { key: 'proof', label: 'Proof (50-65s)', dur: '15s' },
          { key: 'offer', label: 'Offer (65-80s)', dur: '15s' },
          { key: 'cta', label: 'CTA (80-90s)', dur: '10s' },
        ].map(({ key, label, dur }) => d[key] && (
          <div key={key} className="p-5 rounded-2xl bg-violet-500/5 border border-violet-500/20 space-y-2">
            <div className="flex justify-between items-center">
              <div className="text-[10px] text-violet-400 font-black uppercase tracking-widest">{label}</div>
              <div className="text-[9px] text-violet-900 font-black">{dur}</div>
            </div>
            <p className="text-white text-sm leading-relaxed">{d[key]}</p>
            <button onClick={() => copyToClipboard(d[key], key)}
              className="text-[9px] text-violet-500 hover:text-violet-300 font-black uppercase tracking-widest transition-colors">
              {copiedKey === key ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        ))}
        {d.b_roll_notes && <Field label="B-Roll Notes" value={d.b_roll_notes} copyKey="broll" onCopy={copyToClipboard} copied={copiedKey} mono multiline />}
      </div>
    );

    if (asset.type === 'LinkedIn Post') return (
      <div className="space-y-4">
        <div className="p-6 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
              <Linkedin className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="text-white font-bold text-sm">K'LA — AI Growth Director</div>
              <div className="text-neutral-500 text-[10px]">AI Sanctuary • Just now</div>
            </div>
          </div>
          {d.hook && <p className="text-white font-bold text-base">{d.hook}</p>}
          {d.body && <p className="text-neutral-300 text-sm leading-relaxed whitespace-pre-line">{d.body}</p>}
          {d.cta && <p className="text-cyan-400 text-sm font-semibold">{d.cta}</p>}
          {d.hashtags && <p className="text-cyan-600 text-xs">{Array.isArray(d.hashtags) ? d.hashtags.join(' ') : d.hashtags}</p>}
        </div>
        <button onClick={() => copyToClipboard(`${d.hook || ''}\n\n${d.body || ''}\n\n${d.cta || ''}\n\n${Array.isArray(d.hashtags) ? d.hashtags.join(' ') : (d.hashtags || '')}`, 'linkedin-full')}
          className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
          {copiedKey === 'linkedin-full' ? '✓ Copied to Clipboard' : 'Copy Full Post'}
        </button>
        {d.engagement_hook && <Field label="Engagement Question" value={d.engagement_hook} copyKey="engq" onCopy={copyToClipboard} copied={copiedKey} />}
      </div>
    );

    if (asset.type === 'TikTok Script') return (
      <div className="space-y-4">
        {d.hook_text && (
          <div className="p-5 rounded-2xl bg-pink-500/10 border border-pink-500/30 text-center">
            <div className="text-[10px] text-pink-400 font-black uppercase tracking-widest mb-2">Hook Text (First 2 Seconds)</div>
            <div className="text-3xl font-black text-white">{d.hook_text}</div>
          </div>
        )}
        {d.spoken_script && <Field label="Spoken Script / Voiceover" value={d.spoken_script} copyKey="voiceover" onCopy={copyToClipboard} copied={copiedKey} multiline />}
        {d.on_screen_captions && (
          <div className="space-y-2">
            <div className="text-[10px] text-neutral-500 font-black uppercase tracking-widest">On-Screen Captions</div>
            {d.on_screen_captions.map((cap: string, i: number) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="text-pink-500 font-black text-xs w-5 shrink-0">{i + 1}</div>
                <div className="text-neutral-300 text-sm">{cap}</div>
              </div>
            ))}
          </div>
        )}
        {d.trending_audio_suggestion && <Field label="Audio Style" value={d.trending_audio_suggestion} copyKey="audio" onCopy={copyToClipboard} copied={copiedKey} />}
        {d.visual_notes && <Field label="Visual Notes" value={d.visual_notes} copyKey="visuals" onCopy={copyToClipboard} copied={copiedKey} mono multiline />}
        {d.hashtags && <Field label="Hashtags" value={Array.isArray(d.hashtags) ? d.hashtags.join(' ') : d.hashtags} copyKey="tiktok-tags" onCopy={copyToClipboard} copied={copiedKey} />}
      </div>
    );

    if (asset.type === 'Growth Plan') return (
      <div className="space-y-6">
        {d.executive_summary && (
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30">
            <div className="text-[10px] text-amber-400 font-black uppercase tracking-widest mb-2">Executive Summary</div>
            <p className="text-white text-sm leading-relaxed">{d.executive_summary}</p>
          </div>
        )}
        {d.target_icp && <Field label="Ideal Customer Profile (ICP)" value={d.target_icp} copyKey="icp" onCopy={copyToClipboard} copied={copiedKey} multiline />}
        {d.channels && (
          <div className="space-y-3">
            <div className="text-[10px] text-neutral-500 font-black uppercase tracking-widest">Channel Strategies</div>
            {Object.entries(d.channels).map(([channel, strategy]: [string, any]) => (
              <div key={channel} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <div className="text-amber-400 font-black text-[10px] uppercase tracking-widest">{channel.replace(/_/g, ' ')}</div>
                <p className="text-neutral-300 text-sm">{strategy}</p>
              </div>
            ))}
          </div>
        )}
        {d.week_by_week && (
          <div className="space-y-3">
            <div className="text-[10px] text-neutral-500 font-black uppercase tracking-widest">30-Day Execution Plan</div>
            {d.week_by_week.map((week: any, i: number) => (
              <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-[10px] font-black">{week.week}</div>
                  <div className="text-white font-bold text-sm">{week.focus}</div>
                </div>
                <ul className="space-y-1">
                  {(week.actions || []).map((action: string, j: number) => (
                    <li key={j} className="flex items-start gap-2 text-neutral-400 text-xs">
                      <span className="text-amber-600 mt-0.5">→</span>{action}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
        {d.kpis && (
          <div className="space-y-2">
            <div className="text-[10px] text-neutral-500 font-black uppercase tracking-widest">KPIs to Track</div>
            <div className="flex flex-wrap gap-2">
              {d.kpis.map((kpi: string, i: number) => (
                <span key={i} className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-bold">{kpi}</span>
              ))}
            </div>
          </div>
        )}
        {d.expected_outcomes && <Field label="Expected 30-Day Outcomes" value={d.expected_outcomes} copyKey="outcomes" onCopy={copyToClipboard} copied={copiedKey} multiline />}
        <button onClick={() => downloadAsset(asset)}
          className="w-full py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-widest hover:bg-amber-500/20 transition-all flex items-center justify-center gap-2">
          <Download className="w-4 h-4" /> Export Growth Plan
        </button>
      </div>
    );

    return <pre className="text-neutral-400 text-xs font-mono overflow-auto">{JSON.stringify(d, null, 2)}</pre>;
  };

  // ─── JSX ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans">
      <Head><title>K&apos;LA | Operations Dashboard</title></Head>

      <div className="max-w-7xl mx-auto px-6 py-8 pt-24 space-y-10">

        {!userEmail && !loading && (
          <div className="p-4 rounded-xl bg-rose-500/20 border border-rose-500/50 flex items-center gap-3 text-rose-300">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>You must sign in on the <a href="/platform" className="underline font-bold hover:text-white">Platform page</a> to construct and manage missions.</span>
          </div>
        )}

        {/* Header */}
        <header className="flex items-center justify-between pb-6 border-b border-white/10">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white mb-1">K&apos;LA Operations HQ</h1>
            <p className="text-neutral-500 text-sm">Autonomous Growth Engine · Multi-Channel · Always On</p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <Activity className="w-4 h-4 animate-pulse" />
              <span className="text-sm font-semibold tracking-wide uppercase">K&apos;LA Online</span>
            </div>
            <button disabled={isBlasting} onClick={async () => {
              setIsBlasting(true);
              try {
                const res = await fetch('https://kla-sdr-engine.wjreviews420.workers.dev/blast', {
                  method: 'POST', headers: { 'Authorization': `Bearer sanctuary_admin_a6d313036d937828f5beba51c7b4576ac51de23767e43e6b` }
                });
                if (res.ok) { const data = await res.json(); alert(`Blast Successful:\nX: ${data.x}\nReddit: ${data.reddit}`); if (userEmail) fetchMissions(userEmail); }
                else alert("Blast Failed: " + await res.text());
              } catch { alert("Connection Severed."); } finally { setIsBlasting(false); }
            }} className="px-4 py-1.5 rounded-lg border border-rose-500/30 text-[10px] font-black uppercase tracking-widest bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-all disabled:opacity-50 flex items-center gap-2">
              {isBlasting ? "Broadcasting..." : "🚀 Force Multi-Platform Blast"}
            </button>
          </div>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Target, label: 'Active Missions', value: missions.length, color: 'rose' },
            { icon: Search, label: 'Leads Mined', value: missions.reduce((a, m) => a + (m.leads || 0), 0), color: 'blue' },
            { icon: Mail, label: 'Emails Sent', value: missions.reduce((a, m) => a + (m.sent || 0), 0), color: 'emerald' },
            { icon: UserCheck, label: 'Conversions', value: 4, color: 'amber' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className={`p-5 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-${color}-500/20 transition-all duration-500`}>
              <div className={`flex items-center gap-2 text-neutral-500 mb-3 text-[10px] font-black uppercase tracking-widest`}>
                <Icon className={`w-4 h-4 text-${color}-500`} /> {label}
              </div>
              <div className="text-4xl font-black text-white font-mono">{value}</div>
            </div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <nav className="flex gap-0 border border-white/10 rounded-2xl overflow-hidden">
          {([
            { id: 'ops', label: 'Operations Log', icon: Activity },
            { id: 'marketing', label: 'Marketing Studio', icon: Sparkles },
            { id: 'analytics', label: 'Growth Analytics', icon: BarChart3 },
          ] as const).map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-[11px] font-black tracking-widest uppercase transition-all ${activeTab === id ? 'bg-rose-600 text-white' : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/5'}`}>
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </nav>

        {/* ─── OPS TAB ─── */}
        {activeTab === 'ops' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* New Mission Form */}
              <div className="md:col-span-2 p-8 rounded-[2rem] bg-white/[0.02] border border-white/10">
                <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-6">Deploy Target Mission</h2>
                <form onSubmit={addMission} className="space-y-4">
                  <input type="text" value={niche} disabled={!userEmail} onChange={e => setNiche(e.target.value)}
                    placeholder={userEmail ? "Target Audience (e.g. B2B SaaS Founders)" : "Sign in to deploy missions"}
                    className="w-full px-6 py-4 rounded-xl bg-black/50 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 transition-colors disabled:opacity-50" />
                  <div className="flex gap-4">
                    <input type="url" value={productUrl} disabled={!userEmail} onChange={e => setProductUrl(e.target.value)}
                      placeholder="https://your-product.com"
                      className="flex-1 px-6 py-4 rounded-xl bg-black/50 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 transition-colors disabled:opacity-50" />
                    <input type="text" value={valueProp} disabled={!userEmail} onChange={e => setValueProp(e.target.value)}
                      placeholder="Core Value Prop"
                      className="flex-1 px-6 py-4 rounded-xl bg-black/50 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 transition-colors disabled:opacity-50" />
                  </div>
                  <button type="submit" disabled={!userEmail}
                    className="w-full py-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    <Plus className="w-4 h-4" /> Start Neural Search
                  </button>
                </form>
              </div>

              {/* Integrations */}
              <div className="p-8 rounded-[2rem] bg-black/40 border border-rose-500/20">
                <h2 className="text-sm font-black text-rose-400 uppercase tracking-widest mb-4">Social Integrations</h2>
                <p className="text-neutral-400 text-xs mb-6">Connect K&apos;LA to post autonomous growth campaigns to your accounts.</p>
                <div className="space-y-3">
                  <button onClick={() => userEmail && (window.location.href = `/api/kla/oauth/x?email=${encodeURIComponent(userEmail)}`)}
                    className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${oauthStatus.x ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}>
                    <div className="font-bold text-sm">X (Twitter)</div>
                    <span className="text-[10px] font-black uppercase">{oauthStatus.x ? 'Connected ✓' : 'Connect →'}</span>
                  </button>
                  <button onClick={() => userEmail && (window.location.href = `/api/kla/oauth/reddit?email=${encodeURIComponent(userEmail)}`)}
                    className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${oauthStatus.reddit ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-orange-500/10 border-orange-500/20 text-orange-400 hover:bg-orange-500/20'}`}>
                    <div className="font-bold text-sm">Reddit</div>
                    <span className="text-[10px] font-black uppercase">{oauthStatus.reddit ? 'Connected ✓' : 'Connect →'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Telemetry */}
            <div className="p-8 rounded-[2.5rem] bg-black/40 border border-white/5 backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rose-500/50 to-transparent opacity-50" />
              <h2 className="text-xs font-black mb-6 uppercase tracking-[0.3em] text-rose-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" /> Live Network Telemetry
              </h2>
              <div className="h-48 overflow-y-auto space-y-2 font-mono text-[10px] text-neutral-500">
                <p className="flex gap-4"><span className="text-rose-900">[{new Date().toLocaleTimeString()}]</span> <span className="text-neutral-300">K&apos;LA Growth Brain v2.0 initialized — Multi-channel targeting active.</span></p>
                <p className="flex gap-4"><span className="text-rose-900">[{new Date().toLocaleTimeString()}]</span> <span>Content angle rotation engine online. 5 strategic angles loaded.</span></p>
                {opsHistory?.content && (
                  <div className="mt-4 p-4 border border-rose-500/20 bg-rose-500/5 rounded-xl space-y-3">
                    <p className="text-rose-400 font-bold tracking-widest uppercase">Latest Broadcast ({new Date(opsHistory.date).toLocaleString()})</p>
                    <div className="text-white"><strong>X:</strong> {opsHistory.content.x}</div>
                    <div className="text-xs text-neutral-400">↳ {opsHistory.x}</div>
                    <div className="text-white mt-2"><strong>Reddit:</strong> {opsHistory.content.reddit?.title}</div>
                    <div className="text-xs text-neutral-400">↳ {opsHistory.reddit}</div>
                  </div>
                )}
                <p className="flex gap-4 animate-pulse pt-2"><span className="text-rose-950">&gt;_</span> <span>Awaiting next trigger...</span></p>
              </div>
            </div>

            {/* Mission Table */}
            <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] overflow-hidden">
              <div className="p-8 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-xl font-black text-white uppercase tracking-wider">Mission Intelligence</h2>
                <button onClick={() => userEmail && fetchMissions(userEmail)}
                  className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase text-white tracking-widest hover:bg-white/10 transition-all flex items-center gap-2">
                  <RefreshCw className="w-3 h-3" /> Refresh
                </button>
              </div>
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] uppercase font-black tracking-[0.2em] text-neutral-500">
                    <th className="p-6">Niche</th><th className="p-6">Status</th><th className="p-6">Leads</th><th className="p-6">Sent</th><th className="p-6">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {missions.map(m => (
                    <tr key={m.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-all">
                      <td className="p-6"><div className="text-white font-bold">{m.niche}</div><div className="text-[10px] text-neutral-500">Started {new Date(m.id).toLocaleDateString()}</div></td>
                      <td className="p-6"><span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${m.status === 'Active' ? 'bg-rose-500/20 text-rose-400' : 'bg-neutral-500/20 text-neutral-400'}`}>{m.status}</span></td>
                      <td className="p-6 text-neutral-300">{m.leads}</td>
                      <td className="p-6 text-neutral-300">{m.sent}</td>
                      <td className="p-6"><button onClick={() => { setSelectedMission(m); setShowDataModal(true); }} className="text-xs font-black text-rose-500 hover:text-rose-400 transition-colors uppercase tracking-widest">View Data</button></td>
                    </tr>
                  ))}
                  {missions.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-neutral-500 italic">No active missions.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── MARKETING STUDIO TAB ─── */}
        {activeTab === 'marketing' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left: Control Panel */}
              <div className="space-y-6">
                <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/10">
                  <div className="flex items-center gap-3 mb-6">
                    <Sparkles className="w-5 h-5 text-rose-400" />
                    <h2 className="text-xl font-black text-white uppercase tracking-wider">Marketing Brain v2</h2>
                    <div className="ml-auto text-[9px] text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-1 rounded-full font-black uppercase">6 Channels</div>
                  </div>

                  {/* Niche Input */}
                  <div className="mb-6">
                    <label className="text-[10px] text-neutral-500 font-black uppercase tracking-widest block mb-2">Target Niche / Audience</label>
                    <input type="text" value={marketingNiche} onChange={e => setMarketingNiche(e.target.value)}
                      placeholder="e.g. Crypto Founders, B2B SaaS CEOs, Game Devs..."
                      onKeyDown={e => e.key === 'Enter' && generateAsset()}
                      className="w-full px-5 py-4 rounded-xl bg-black/50 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 transition-colors text-sm" />
                  </div>

                  {/* Asset Type Selector */}
                  <div className="mb-6">
                    <label className="text-[10px] text-neutral-500 font-black uppercase tracking-widest block mb-3">Select Asset Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      {ASSET_TYPES.map(({ id, label, icon: Icon, desc, color }) => (
                        <button key={id} onClick={() => setSelectedAssetType(id)}
                          className={`p-4 rounded-2xl border text-left transition-all duration-300 group ${selectedAssetType === id
                            ? `border-${color}-500/60 bg-${color}-500/15`
                            : 'border-white/5 bg-white/[0.02] hover:border-white/15 hover:bg-white/5'}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className={`w-4 h-4 ${selectedAssetType === id ? `text-${color}-400` : 'text-neutral-500'}`} />
                            <div className={`text-xs font-black ${selectedAssetType === id ? 'text-white' : 'text-neutral-400'}`}>{label}</div>
                          </div>
                          <div className="text-[10px] text-neutral-600">{desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button onClick={generateAsset} disabled={generating}
                    className="w-full py-5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-[0_0_40px_rgba(244,63,94,0.2)] hover:shadow-[0_0_60px_rgba(244,63,94,0.3)]">
                    {generating ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Synthesizing...</>
                    ) : (
                      <><Sparkles className="w-5 h-5" /> Generate {selectedAssetType}</>
                    )}
                  </button>
                </div>

                {/* Asset History */}
                {generatedAssets.length > 0 && (
                  <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/10">
                    <h3 className="text-xs font-black text-neutral-500 uppercase tracking-widest mb-4">Session History</h3>
                    <div className="space-y-2">
                      {generatedAssets.map((asset, i) => (
                        <button key={i} onClick={() => { setActiveAsset(asset); setGeneratedImageUrl(null); }}
                          className={`w-full p-3 rounded-xl border text-left transition-all ${activeAsset === asset ? 'border-rose-500/40 bg-rose-500/10' : 'border-white/5 hover:border-white/10 hover:bg-white/[0.02]'}`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-white text-xs font-bold">{asset.type}</div>
                              <div className="text-neutral-500 text-[10px]">{asset.niche}</div>
                            </div>
                            <div className="text-[9px] text-neutral-600">{asset.timestamp.toLocaleTimeString()}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Output Panel */}
              <div>
                {activeAsset ? (
                  <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/10 space-y-6 animate-in fade-in duration-300">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-[10px] text-rose-400 font-black uppercase tracking-widest mb-1">Generated Asset</div>
                        <h3 className="text-lg font-black text-white">{activeAsset.type}</h3>
                        <div className="text-neutral-500 text-xs">Niche: {activeAsset.niche}</div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => downloadAsset(activeAsset)}
                          className="p-2 rounded-lg bg-white/5 border border-white/10 text-neutral-400 hover:text-white hover:bg-white/10 transition-all">
                          <Download className="w-4 h-4" />
                        </button>
                        <button onClick={() => copyToClipboard(JSON.stringify(activeAsset.data, null, 2), 'json-export')}
                          className="p-2 rounded-lg bg-white/5 border border-white/10 text-neutral-400 hover:text-white hover:bg-white/10 transition-all">
                          <Clipboard className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="border-t border-white/5 pt-6">
                      {renderAssetOutput(activeAsset)}
                    </div>
                  </div>
                ) : (
                  <div className="h-full min-h-[500px] rounded-[2rem] bg-white/[0.01] border border-white/5 flex flex-col items-center justify-center gap-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-rose-400/50" />
                    </div>
                    <div className="text-neutral-600 font-black text-sm uppercase tracking-widest">No Asset Generated</div>
                    <div className="text-neutral-700 text-xs max-w-xs">Enter a niche and select an asset type, then hit Generate to deploy K&apos;LA&apos;s Marketing Brain.</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── ANALYTICS TAB ─── */}
        {activeTab === 'analytics' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Total Reach (Est.)', value: `${(missions.reduce((a, m) => a + (m.leads || 0), 0) * 340).toLocaleString()}`, sublabel: 'Multi-platform impressions', color: 'rose', icon: TrendingUp },
                { label: 'Pipeline Value', value: `$${(missions.reduce((a, m) => a + (m.sent || 0), 0) * 50).toLocaleString()}`, sublabel: 'At $50 avg conversion', color: 'emerald', icon: BarChart3 },
                { label: 'Channels Active', value: '5', sublabel: 'X, Reddit, Email, LinkedIn, TikTok', color: 'blue', icon: Globe },
              ].map(({ label, value, sublabel, color, icon: Icon }) => (
                <div key={label} className={`p-7 rounded-[2rem] bg-${color}-500/5 border border-${color}-500/20`}>
                  <div className={`flex items-center gap-2 text-${color}-400 text-[10px] font-black uppercase tracking-widest mb-4`}>
                    <Icon className="w-4 h-4" /> {label}
                  </div>
                  <div className="text-4xl font-black text-white mb-1">{value}</div>
                  <div className="text-neutral-500 text-xs">{sublabel}</div>
                </div>
              ))}
            </div>

            {/* Channel Performance */}
            <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/10">
              <h2 className="text-lg font-black text-white uppercase tracking-wider mb-6">Channel Deployment Status</h2>
              <div className="space-y-4">
                {[
                  { channel: 'X (Twitter)', status: oauthStatus.x ? 'Live' : 'Not Connected', pct: oauthStatus.x ? 85 : 0, color: 'rose' },
                  { channel: 'Reddit', status: oauthStatus.reddit ? 'Live' : 'Not Connected', pct: oauthStatus.reddit ? 72 : 0, color: 'orange' },
                  { channel: 'Cold Email', status: 'Active (MailChannels)', pct: 91, color: 'blue' },
                  { channel: 'LinkedIn', status: 'Asset Generation Ready', pct: 60, color: 'cyan' },
                  { channel: 'TikTok', status: 'Script Generation Ready', pct: 55, color: 'pink' },
                ].map(({ channel, status, pct, color }) => (
                  <div key={channel} className="flex items-center gap-4">
                    <div className="w-32 text-neutral-400 text-xs font-bold shrink-0">{channel}</div>
                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full bg-${color}-500 rounded-full transition-all duration-1000`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className={`text-[10px] font-black ${pct > 0 ? `text-${color}-400` : 'text-neutral-600'} w-44 text-right`}>{status}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Broadcasts */}
            <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-black text-white uppercase tracking-wider">Recent Broadcasts</h2>
                <button onClick={() => userEmail && fetchMissions(userEmail)}
                  className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black uppercase text-neutral-400 tracking-widest hover:bg-white/10 transition-all flex items-center gap-2">
                  <RefreshCw className="w-3 h-3" /> Sync
                </button>
              </div>
              {opsHistory?.content ? (
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                    <div className="text-[10px] text-rose-400 font-black uppercase tracking-widest mb-2">
                      {new Date(opsHistory.date).toLocaleString()} · {opsHistory.email}
                    </div>
                    <div className="text-white font-medium text-sm mb-1">📢 X: {opsHistory.content.x}</div>
                    <div className="text-neutral-500 text-xs">Status: {opsHistory.x}</div>
                    {opsHistory.content.reddit && <>
                      <div className="text-white font-medium text-sm mt-3 mb-1">🟠 Reddit: {opsHistory.content.reddit.title}</div>
                      <div className="text-neutral-500 text-xs">Status: {opsHistory.reddit}</div>
                    </>}
                  </div>
                </div>
              ) : (
                <div className="text-center text-neutral-600 text-sm py-8 italic">No broadcasts logged yet. Trigger a blast to begin.</div>
              )}
            </div>
          </div>
        )}

        {/* Data Modal */}
        {showDataModal && selectedMission && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <div className="bg-gray-900 border border-white/10 rounded-[2.5rem] p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto relative shadow-2xl">
              <button onClick={() => setShowDataModal(false)} className="absolute top-6 right-6 text-neutral-500 hover:text-white transition-colors p-2">✕</button>
              <div className="mb-8">
                <h3 className="text-sm font-black text-rose-500 uppercase tracking-[0.3em] mb-2">Campaign Intelligence</h3>
                <h2 className="text-3xl font-black text-white">{selectedMission.niche}</h2>
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="p-6 rounded-2xl bg-white/[0.03] border border-white/5">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-white font-bold">Lead Candidate #{i}</div>
                        <div className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest">Awaiting Verification</div>
                      </div>
                      <div className="text-[10px] bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded border border-rose-500/20 font-bold tracking-widest uppercase">High Intent</div>
                    </div>
                    <div className="text-xs text-neutral-400 font-mono leading-relaxed mt-3">Neural intelligence gathering in progress.</div>
                  </div>
                ))}
                <div className="pt-4 border-t border-white/5 flex justify-end gap-4">
                  <button className="px-6 py-3 rounded-xl border border-white/10 text-neutral-400 hover:text-white hover:bg-white/5 transition-all text-xs font-bold uppercase tracking-widest">Export CSV</button>
                  <button className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-all text-xs font-bold uppercase tracking-widest">Download Report</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Field Component ────────────────────────────────────────────────────────
function Field({ label, value, copyKey, onCopy, copied, multiline = false, mono = false }: {
  label: string; value: string; copyKey: string;
  onCopy: (text: string, key: string) => void; copied: string | null;
  multiline?: boolean; mono?: boolean;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <div className="text-[10px] text-rose-400 uppercase font-black tracking-widest">{label}</div>
        <button onClick={() => onCopy(value, copyKey)}
          className="text-[9px] text-neutral-500 hover:text-rose-400 font-black uppercase tracking-widest transition-colors flex items-center gap-1">
          {copied === copyKey ? <><span className="text-emerald-400">✓</span> Copied</> : <><Clipboard className="w-3 h-3" /> Copy</>}
        </button>
      </div>
      {multiline
        ? <p className={`text-white text-sm leading-relaxed ${mono ? 'font-mono text-neutral-400 text-[10px] bg-black/20 p-3 rounded-lg' : ''}`}>{value}</p>
        : <div className={`text-white font-medium ${mono ? 'font-mono text-neutral-400 text-[10px]' : ''}`}>{value}</div>
      }
    </div>
  );
}
