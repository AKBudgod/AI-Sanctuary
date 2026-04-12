'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────
interface RegisteredVoice {
  slug: string;
  label: string;
  provider: 'community' | 'builtin';
  sampleUrl?: string;
}

interface VaultEntry {
  name: string;
  slug: string;
  isGlobal: boolean;
  addedAt: string;
  status: 'vaulted' | 'mirrored' | 'error';
}

// ─── Built-in character list for global assignment ───────────────────────────
const BUILTIN_CHARACTERS = [
  { slug: 'lyra',      label: 'Lyra' },
  { slug: 'maya',      label: 'Maya' },
  { slug: 'kla',       label: "K'LA" },
  { slug: 'mj',        label: 'MJ' },
  { slug: 'john',      label: 'John' },
  { slug: 'angel',     label: 'Angel' },
  { slug: 'rachel',    label: 'Rachel' },
  { slug: 'bella',     label: 'Bella' },
  { slug: 'antigravity', label: 'Antigravity' },
  { slug: 'miles',     label: 'Miles' },
  { slug: 'cleo',      label: 'Cleo' },
  { slug: 'lily',      label: 'Lily' },
  { slug: 'skye',      label: 'Skye' },
  { slug: 'raven',     label: 'Raven' },
  { slug: 'custom',    label: '+ New Custom Voice' },
];

// ─── Component ───────────────────────────────────────────────────────────────
export default function BixbyVoiceCreator({ userEmail }: { userEmail?: string }) {
  const [step, setStep] = useState<'select' | 'record' | 'preview' | 'uploading' | 'done'>('select');
  const [selectedChar, setSelectedChar] = useState<string | null>(null);
  const [customName, setCustomName] = useState('');
  const [isGlobal, setIsGlobal] = useState(true);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [vault, setVault] = useState<VaultEntry[]>([]);
  const [registeredVoices, setRegisteredVoices] = useState<RegisteredVoice[]>([]);
  const [activeSection, setActiveSection] = useState<'upload' | 'vault'>('upload');
  const [purging, setPurging] = useState(false);
  const [purgeResult, setPurgeResult] = useState<string | null>(null);
  
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load registered voices from API
  useEffect(() => {
    fetch('/api/synthesizer/voices')
      .then(r => r.json())
      .then(data => setRegisteredVoices(data?.voices || []))
      .catch(() => {});
  }, []);

  const charName = selectedChar === 'custom' ? customName : (BUILTIN_CHARACTERS.find(c => c.slug === selectedChar)?.label || '');

  // ─── Purge All Voices ─────────────────────────────────────────────────────
  const purgeAllVoices = async () => {
    if (!confirm('⚠️ This will permanently delete ALL custom voice samples from the Nexus Grid. Are you sure?')) return;
    setPurging(true);
    setPurgeResult(null);
    try {
      const key = sessionStorage.getItem('admin_api_key') || '';
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'purgeVoices' }),
      });
      const data = await res.json();
      if (data.success) {
        setPurgeResult(`✅ ${data.message}`);
        setVault([]);
        setRegisteredVoices([]);
      } else {
        setPurgeResult(`❌ ${data.error || 'Purge failed'}`);
      }
    } catch (e: any) {
      setPurgeResult(`❌ Network error: ${e.message}`);
    }
    setPurging(false);
  };

  // ─── File Upload Handler ──────────────────────────────────────────────────
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setAudioFile(f);
    setAudioUrl(URL.createObjectURL(f));
    setStep('preview');
  };


  // ─── Upload Handler ───────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!audioFile || !charName || !userEmail) return;
    setStep('uploading');
    setResult(null);

    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('name', selectedChar === 'custom' ? customName : selectedChar!);
    formData.append('email', userEmail);
    formData.append('isGlobal', isGlobal ? 'true' : 'false');

    try {
      const res = await fetch('/api/voice/add', { method: 'POST', body: formData });
      const data = await res.json();

      if (res.ok && data.success) {
        const voiceSlug = selectedChar === 'custom' ? customName.toLowerCase() : selectedChar!;
        // Lock this voice in for the user immediately
        localStorage.setItem('sanctuary_preferred_voice', `voice-${voiceSlug}`);
        
        setResult({ success: true, message: `✅ "${charName}" vaulted in Nexus Grid${isGlobal ? ' (Global)' : ''} and mirrored to hardware node.` });
        setVault(prev => [{
          name: charName,
          slug: voiceSlug,
          isGlobal,
          addedAt: new Date().toLocaleString(),
          status: 'mirrored',
        }, ...prev]);
      } else {
        setResult({ success: false, message: data.error || 'Upload failed. Check console.' });
      }
    } catch (err: any) {
      setResult({ success: false, message: err.message || 'Network error.' });
    }
    setStep('done');
  };

  // ─── Reset ────────────────────────────────────────────────────────────────
  const reset = () => {
    setStep('select');
    setSelectedChar(null);
    setCustomName('');
    setAudioFile(null);
    setAudioUrl(null);
    setResult(null);
  };

  // ─── UI ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black italic tracking-tighter uppercase font-mono">
            Bixby <span className="text-violet-400">Voice</span> Creator
          </h2>
          <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mt-1">
            Clone & vault community voices → Neural Grid
          </p>
          {purgeResult && (
            <p className={`mt-2 text-xs font-mono font-bold ${purgeResult.includes('❌') ? 'text-red-400' : 'text-green-400'}`}>
              {purgeResult}
            </p>
          )}
        </div>
        {/* Section tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={purgeAllVoices}
            disabled={purging}
            className="mr-4 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 disabled:opacity-50"
          >
            {purging ? 'Purging...' : '🔥 Purge Voices'}
          </button>
          {(['upload', 'vault'] as const).map(s => (
            <button
              key={s}
              onClick={() => setActiveSection(s)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeSection === s
                  ? 'bg-violet-500/20 border border-violet-500/40 text-violet-300'
                  : 'bg-white/5 border border-white/5 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {s === 'upload' ? '⬆ Upload Voice' : '🗄 Vault Registry'}
            </button>
          ))}
        </div>
      </div>

      {activeSection === 'upload' && (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* LEFT: Upload Flow */}
          <div className="glass p-8 rounded-[2rem] border border-white/5 space-y-6">
            
            {/* Step 1: Character Selection */}
            {step === 'select' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 font-mono">
                  Step 1 — Select Character
                </h3>
                <div className="grid grid-cols-3 gap-2 max-h-[260px] overflow-y-auto pr-1">
                  {BUILTIN_CHARACTERS.map(char => (
                    <button
                      key={char.slug}
                      onClick={() => setSelectedChar(char.slug)}
                      className={`p-3 rounded-xl border text-xs font-black uppercase tracking-wider transition-all ${
                        selectedChar === char.slug
                          ? 'bg-violet-500/20 border-violet-500/50 text-violet-300'
                          : 'bg-white/5 border-white/5 text-zinc-400 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      {char.label}
                    </button>
                  ))}
                </div>

                {selectedChar === 'custom' && (
                  <input
                    type="text"
                    placeholder="Custom voice name..."
                    value={customName}
                    onChange={e => setCustomName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/50"
                  />
                )}

                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <input
                    type="checkbox"
                    id="global-check"
                    checked={isGlobal}
                    onChange={e => setIsGlobal(e.target.checked)}
                    className="w-4 h-4 accent-violet-500"
                  />
                  <label htmlFor="global-check" className="text-xs font-mono text-zinc-300 uppercase tracking-wider cursor-pointer">
                    Register as <span className="text-violet-400 font-black">Global</span> voice (available to all users)
                  </label>
                </div>

                <button
                  onClick={() => setStep('record')}
                  disabled={!selectedChar || (selectedChar === 'custom' && !customName.trim())}
                  className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-black uppercase tracking-widest transition-all"
                >
                  Continue →
                </button>
              </div>
            )}

            {/* Step 2: Upload */}
            {step === 'record' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center gap-3">
                  <button onClick={() => setStep('select')} className="text-zinc-500 hover:text-white transition-colors text-sm">← Back</button>
                  <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 font-mono">
                    Step 2 — Provide Audio File for <span className="text-violet-400">{charName}</span>
                  </h3>
                </div>

                <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20 text-xs font-mono text-violet-300 space-y-1">
                  <p className="font-black uppercase tracking-wider">📋 Recording Tips</p>
                  <p>• Use a quiet room — 10-30 seconds of clear speech works best</p>
                  <p>• WAV, MP3, or WebM format accepted</p>
                  <p>• Speak naturally at a normal pace</p>
                </div>

                {/* Upload file */}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-4 rounded-xl border-2 border-dashed border-white/10 hover:border-violet-500/50 text-zinc-400 hover:text-violet-300 transition-all text-sm font-black uppercase tracking-widest"
                  >
                    📁 Upload Audio File
                  </button>
                </div>


              </div>
            )}

            {/* Step 3: Preview & Confirm */}
            {step === 'preview' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center gap-3">
                  <button onClick={() => setStep('record')} className="text-zinc-500 hover:text-white transition-colors text-sm">← Back</button>
                  <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 font-mono">
                    Step 3 — Preview & Confirm
                  </h3>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Character</span>
                    <span className="text-sm font-black text-violet-300">{charName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">File</span>
                    <span className="text-xs font-mono text-zinc-300">{audioFile?.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Scope</span>
                    <span className={`text-xs font-black uppercase ${isGlobal ? 'text-green-400' : 'text-yellow-400'}`}>
                      {isGlobal ? '🌐 Global (All Users)' : '👤 User-Specific'}
                    </span>
                  </div>
                </div>

                {audioUrl && (
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-3">Preview</p>
                    <audio controls src={audioUrl} className="w-full" />
                  </div>
                )}

                <button
                  onClick={handleUpload}
                  className="w-full py-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-black uppercase tracking-widest transition-all"
                >
                  🚀 Vault to Neural Grid
                </button>
              </div>
            )}

            {/* Uploading */}
            {step === 'uploading' && (
              <div className="flex flex-col items-center justify-center py-16 space-y-6 animate-in fade-in duration-300">
                <div className="w-16 h-16 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
                <div className="text-center space-y-2">
                  <p className="text-white font-black text-lg uppercase font-mono">Vaulting Voice...</p>
                  <p className="text-xs text-zinc-500 font-mono">Encoding → KV Nexus → Hardware Mirror</p>
                </div>
              </div>
            )}

            {/* Done */}
            {step === 'done' && result && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className={`p-6 rounded-2xl border ${
                  result.success
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-red-500/10 border-red-500/30'
                }`}>
                  <p className={`text-sm font-mono ${result.success ? 'text-green-300' : 'text-red-300'}`}>
                    {result.message}
                  </p>
                </div>
                <button
                  onClick={reset}
                  className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-black uppercase tracking-widest transition-all"
                >
                  + Add Another Voice
                </button>
              </div>
            )}
          </div>

          {/* RIGHT: Registered Voices */}
          <div className="glass p-8 rounded-[2rem] border border-white/5 space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 font-mono">
              Active Voice Registry
            </h3>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {registeredVoices.length === 0 ? (
                <div className="text-center py-12 text-zinc-600 font-mono text-sm">
                  No community voices registered yet.
                </div>
              ) : (
                registeredVoices.map(v => (
                  <div key={v.slug} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 group hover:border-white/10 transition-all">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${v.provider === 'community' ? 'bg-violet-400' : 'bg-teal-400'}`} />
                      <div>
                        <p className="text-sm font-black text-white">{v.label}</p>
                        <p className="text-[10px] font-mono text-zinc-600 uppercase">{v.slug} · {v.provider}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded-lg ${
                      v.provider === 'community'
                        ? 'bg-violet-500/10 text-violet-400'
                        : 'bg-teal-500/10 text-teal-400'
                    }`}>
                      {v.provider}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Vault Registry Tab */}
      {activeSection === 'vault' && (
        <div className="glass p-8 rounded-[2rem] border border-white/5 space-y-6 animate-in fade-in duration-300">
          <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 font-mono">
            Session Vault Log
          </h3>
          {vault.length === 0 ? (
            <div className="text-center py-20 text-zinc-600 font-mono text-sm">
              No voices vaulted this session. Upload a voice recording to get started.
            </div>
          ) : (
            <div className="space-y-3">
              {vault.map((v, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="space-y-1">
                    <p className="text-sm font-black text-white">{v.name}</p>
                    <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                      Slug: {v.slug} · Added: {v.addedAt}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {v.isGlobal && (
                      <span className="text-[10px] font-mono bg-green-500/10 border border-green-500/20 text-green-400 px-2 py-1 rounded-lg uppercase">Global</span>
                    )}
                    <span className={`text-[10px] font-mono uppercase px-2 py-1 rounded-lg ${
                      v.status === 'mirrored' ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20' :
                      v.status === 'vaulted' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' :
                      'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {v.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
