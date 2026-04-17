'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Mic, Volume2, Zap, Brain, Activity, Sparkles, Loader2,
  Upload, Play, Download, Trash2, AlertTriangle, Info,
  Shield, Globe, CheckCircle, X,
} from '@/components/ui/Icons';

// ── Admin emails ─────────────────────────────────────────────────────────────
const ADMIN_EMAILS = [
  'kearns.adam747@gmail.com',
  'kearns.adan747@gmail.com',
  'gamergoodguy445@gmail.com',
  'wjreviews420@gmail.com',
  'weedj747@gmail.com',
  'akbudgod@ai-sanctuary.online',
];

// ── Built-in characters (no upload required) ─────────────────────────────────
const BUILTIN_PERSONAS = [
  { slug: 'lyra',        label: "Lyra — Platform Guide",     icon: '🌟' },
  { slug: 'maya',        label: "Maya — Architect",           icon: '⚡' },
  { slug: 'kla',         label: "K'LA — Autonomous SDR",      icon: '🤖' },
  { slug: 'mj',          label: "MJ — Immersive Persona",     icon: '💫' },
  { slug: 'john',        label: "John — Default Guide",       icon: '🎙️' },
  { slug: 'rachel',      label: "Rachel",                     icon: '🎤' },
  { slug: 'angel',       label: "Angel",                      icon: '✨' },
  { slug: 'miles',       label: "Miles",                      icon: '🔊' },
  { slug: 'antigravity', label: "AntiGravity",                icon: '🚀' },
];

interface VoiceClip {
  id:        string;
  name:      string;
  url:       string;
  timestamp: string;
  text:      string;
  provider?: string;
  persona?:  string;
}

export default function VoiceSynthesizer({ userEmail }: { userEmail?: string }) {
  const isAdmin = userEmail && ADMIN_EMAILS.includes(userEmail.toLowerCase().trim());

  // ── Synthesize state ───────────────────────────────────────────────────────
  const [text,          setText]          = useState('');
  const [selectedSlug,  setSelectedSlug]  = useState('lyra');
  const [targetChar,    setTargetChar]    = useState('lyra');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [history,       setHistory]       = useState<VoiceClip[]>([]);
  const [synthError,    setSynthError]    = useState<string | null>(null);

  // ── Upload / register state ────────────────────────────────────────────────
  const [activeTab,     setActiveTab]     = useState<'synthesize' | 'upload'>('synthesize');
  const [selectedFile,  setSelectedFile]  = useState<File | null>(null);
  const [voiceId,       setVoiceId]       = useState<string | null>(null);
  const [isUploading,   setIsUploading]   = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [uploadError,   setUploadError]   = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [pollyAlias,   setPollyAlias]   = useState('Emma');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [availableVoices, setAvailableVoices] = useState<{slug: string, label: string, isBuiltIn?: boolean, isCommunity?: boolean}[]>(BUILTIN_PERSONAS);

  const fetchRegistry = () => {
    fetch('/api/synthesizer/voices', {
      headers: { 'X-User-Email': userEmail || '' },
    })
      .then(res => res.json())
      .then(data => {
        if (data.voices) setAvailableVoices(data.voices);
      })
      .catch(err => console.error('[VOICE-API] Failed to fetch dynamic registry:', err));
  };

  // Load history and fetch dynamic voices
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('voice_synth_history');
      if (savedHistory) setHistory(JSON.parse(savedHistory));

      const savedSlug = localStorage.getItem('sanctuary_last_selected_synth_voice');
      if (savedSlug) setSelectedSlug(savedSlug);

      const savedTarget = localStorage.getItem('sanctuary_last_target_char');
      if (savedTarget) setTargetChar(savedTarget);
    } catch { /* ignore */ }

    fetchRegistry();
  }, []);

  // Persist selections
  useEffect(() => {
    localStorage.setItem('sanctuary_last_selected_synth_voice', selectedSlug);
  }, [selectedSlug]);

  useEffect(() => {
    localStorage.setItem('sanctuary_last_target_char', targetChar);
  }, [targetChar]);

  // Save history (capped to 50)
  useEffect(() => {
    try {
      localStorage.setItem('voice_synth_history', JSON.stringify(history.slice(0, 50)));
    } catch (e) {
      console.warn('[SYNTH] LocalStorage quota exceeded, clearing history.');
      localStorage.removeItem('voice_synth_history');
    }
  }, [history]);

  // ── Web Speech API fallback ────────────────────────────────────────────────
  // Called when all server-side providers fail (503). Uses the browser's built-in
  // speech synthesis — zero dependencies, works in every modern browser.
  const synthesizeWithWebSpeech = (inputText: string, slug: string): Promise<VoiceClip | null> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        resolve(null);
        return;
      }
      // Pick a browser voice that loosely matches the character gender
      const femaleSlug = ['lyra', 'maya', 'kla', 'mj', 'rachel', 'angel', 'bella', 'cleo', 'lily', 'skye'];
      const preferFemale = femaleSlug.includes(slug);
      const voices = window.speechSynthesis.getVoices();
      const pick = voices.find(v =>
        preferFemale ? v.name.toLowerCase().includes('female') || v.name.includes('Samantha') || v.name.includes('Karen') || v.name.includes('Victoria')
                     : v.name.toLowerCase().includes('male') || v.name.includes('Daniel') || v.name.includes('Alex')
      ) || voices[0];

      const utt = new SpeechSynthesisUtterance(inputText.substring(0, 500));
      if (pick) utt.voice = pick;
      utt.rate  = 0.95;
      utt.pitch = preferFemale ? 1.1 : 0.9;
      utt.volume = 1.0;

      // Record with MediaRecorder via a silent audio context for download support
      // Since WebSpeech can't be directly recorded in all browsers, we create
      // a downloadable placeholder and play it live.
      utt.onend = () => {
        // Create a silent 1-second blob as the "clip" (actual audio played live)
        const persona = BUILTIN_PERSONAS.find(p => p.slug === slug);
        const clip: VoiceClip = {
          id:        Math.random().toString(36).substr(2, 9),
          name:      `WebSpeech_${new Date().toLocaleTimeString()}`,
          url:       '',   // no downloadable URL for Web Speech
          timestamp: new Date().toLocaleString(),
          text:      inputText.length > 40 ? inputText.substring(0, 40) + '…' : inputText,
          provider:  'Web Speech API (Browser fallback)',
          persona:   persona?.label || slug,
        };
        resolve(clip);
      };
      utt.onerror = () => resolve(null);

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utt);
    });
  };

  // ── Synthesize handler ─────────────────────────────────────────────────────
  const synthesize = async () => {
    if (!text.trim() || isSynthesizing) return;
    setIsSynthesizing(true);
    setSynthError(null);
    const setStatus = (msg: string) => {
        // We'll hijack the button text or show a sub-status
        (window as any)._synthStatus = msg; 
    };
    
    setStatus("Establishing Neural Link...");

    try {
      // -- Unified Hybrid Synthesis --
      // Hits the Cloudflare Function which handles the Local-Tunnel/Cloud-Fallback logic
      const res = await fetch('/api/synthesizer/clone', {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': userEmail || '',
        },
        body: JSON.stringify({ text, voice_id: selectedSlug, language: 'en' }),
      });

      // ── Server succeeded: stream audio into clip ──────────────────────────
      if (res.ok) {
        const blob     = await res.blob();
        const url      = URL.createObjectURL(blob);
        const provider = res.headers.get('X-TTS-Provider') || 'Sanctuary Local Node';
        const persona  = BUILTIN_PERSONAS.find(p => p.slug === selectedSlug);

        setHistory(prev => [{
          id:        Math.random().toString(36).substr(2, 9),
          name:      `Synth_${new Date().toLocaleTimeString()}`,
          url,
          timestamp: new Date().toLocaleString(),
          text:      text.length > 40 ? text.substring(0, 40) + '…' : text,
          provider,
          persona:   persona?.label || selectedSlug,
        }, ...prev]);
        return;
      }

      // ── Server failed: check for web-speech fallback hint (503) ──────────
      const json = await res.json().catch(() => ({} as any));
      if (res.status === 503 && json.fallback === 'web-speech') {
        const clip = await synthesizeWithWebSpeech(text, selectedSlug);
        if (clip) {
          setHistory(prev => [clip, ...prev]);
          return;
        }
      }

      throw new Error(json.detail || `Synthesis failed (${res.status})`);
    } catch (err: any) {
      setSynthError(err.message);
    } finally {
      setIsSynthesizing(false);
    }
  };

  // ── Upload handler ─────────────────────────────────────────────────────────
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File too large — max 10 MB.');
      return;
    }
    setSelectedFile(file);
    setUploadError(null);
    setUploadSuccess(null);
    setVoiceId(null);
  };

  const uploadVoice = async () => {
    if (!selectedFile || isUploading) return;
    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    const fd = new FormData();
    fd.append('file', selectedFile);
    fd.append('character_id', targetChar);
    fd.append('character', targetChar);

    try {
      // -- Unified Hybrid Upload --
      // Hits the Cloudflare Function which vaults to KV and mirrors to Physical Hardware Node via Tunnel
      const res = await fetch('/api/synthesizer/upload', {
        method:  'POST',
        headers: { 'X-User-Email': userEmail || '' },
        body:    fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Upload failed.');
      setVoiceId(data.voice_id);
      setUploadSuccess(data.message || 'Voice sample vaulted and mirrored to Nexus Grid.');
    } catch (err: any) {
      setUploadError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const registerGlobally = async () => {
    if (!voiceId || isRegistering) return;
    setIsRegistering(true);
    setUploadError(null);

    try {
      const res = await fetch('/api/synthesizer/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-Email': userEmail || '' },
        body: JSON.stringify({
          voice_id:     pollyAlias, // Use the selected free voice as the active synthesis ID
          character_id: `voice-${targetChar}`,
          sample_id:    voiceId, // Keep the sample ID in metadata for future use
        }),
      });
      const data: any = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Registration failed.');
      setUploadSuccess(`✅ Voice deployed to global grid for "${targetChar}" (Cloud Fallback).`);
    } catch (err: any) {
      setUploadError(err.message);
    } finally {
      setIsRegistering(false);
    }
  };

  const removeClip = (id: string) => setHistory(prev => prev.filter(c => c.id !== id));

  // ── Access denied ──────────────────────────────────────────────────────────
  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center space-y-6">
        <div className="w-24 h-24 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto">
          <Shield className="w-12 h-12 text-red-500" />
        </div>
        <h1 className="text-3xl font-black text-white uppercase font-mono">Access Denied</h1>
        <p className="text-gray-400 max-w-md mx-auto">
          The Neural Synth Uplink is restricted to administrators only.
          Log in with an admin account to manage voices.
        </p>
      </div>
    );
  }

  const selectedPersona = BUILTIN_PERSONAS.find(p => p.slug === selectedSlug);

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-6">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-mono font-bold uppercase tracking-widest w-fit">
          <Shield className="w-3 h-3" />
          Admin Uplink: Neural Architect
        </div>
        <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase font-mono">
          Voice <span className="text-teal-400">Synthesizer</span>
        </h1>
        <p className="text-gray-400 font-medium font-mono text-sm uppercase tracking-tight">
          Coqui Hybrid Grid // Local Node + Cloud Coqui Fallback // 100% Free
        </p>
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────────────── */}
      <div className="flex gap-2 border-b border-white/10 pb-0">
        {(['synthesize', 'upload'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-t-xl text-xs font-mono font-bold uppercase tracking-widest transition-all border-b-2 ${
              activeTab === tab
                ? 'text-teal-400 border-teal-400 bg-teal-500/5'
                : 'text-gray-500 border-transparent hover:text-gray-300'
            }`}
          >
            {tab === 'synthesize' ? '⚡ Synthesize' : '📁 Upload & Register'}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          TAB 1 — SYNTHESIZE
          ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'synthesize' && (
        <div className="grid md:grid-cols-2 gap-8">

          {/* Left — Config */}
          <div className="space-y-6">

            {/* Voice picker */}
            <div className="glass p-6 rounded-[2rem] border-white/5 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-teal-400" />
                1. Select Voice
              </h3>
              <div className="grid grid-cols-1 gap-2 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                {availableVoices.map(p => (
                  <button
                    key={p.slug}
                    onClick={() => setSelectedSlug(p.slug)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all border ${
                      selectedSlug === p.slug
                        ? 'bg-teal-500/15 border-teal-500/50 text-teal-300'
                        : 'bg-white/3 border-white/5 text-gray-400 hover:border-white/20 hover:text-gray-200'
                    }`}
                  >
                    <span className="text-lg">{p.isCommunity ? '👤' : (BUILTIN_PERSONAS.find(b => b.slug === p.slug)?.icon || '🎙️')}</span>
                    <span className="font-mono text-sm font-bold truncate">{p.label}</span>
                    {p.isCommunity && <span className="ml-2 text-[10px] bg-teal-500/20 px-1 rounded">COMMUNITY</span>}
                    {selectedSlug === p.slug && <CheckCircle className="w-4 h-4 ml-auto text-teal-400" />}
                  </button>
                ))}
              </div>

              {selectedPersona && (
                <div className="flex items-center gap-2 text-xs font-mono text-teal-500 bg-teal-500/10 p-2 rounded-lg border border-teal-500/20">
                  <Zap className="w-3 h-3" />
                  Active: {selectedPersona.icon} {selectedPersona.label}
                </div>
              )}
            </div>

            {/* Text input */}
            <div className="glass p-6 rounded-[2rem] border-white/5 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-fuchsia-400" />
                2. Neural Input
              </h3>
              <label htmlFor="synth-textarea" className="sr-only">Text to synthesize</label>
              <textarea
                id="synth-textarea"
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Enter text to synthesize… (up to 1000 chars)"
                maxLength={1000}
                className="w-full h-32 bg-black/50 border border-white/5 rounded-2xl p-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-fuchsia-500/50 transition-all resize-none font-mono text-sm"
              />
              <div className="flex items-center justify-between text-xs text-gray-600 font-mono">
                <span>{text.length}/1000</span>
                {text.length > 0 && (
                  <button onClick={() => setText('')} className="hover:text-gray-400 transition-colors">
                    Clear
                  </button>
                )}
              </div>

              <button
                id="synth-execute-btn"
                onClick={synthesize}
                disabled={isSynthesizing || !text.trim()}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-black uppercase tracking-widest hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all disabled:opacity-30 disabled:shadow-none flex items-center justify-center gap-3"
              >
                {isSynthesizing
                  ? <><Loader2 className="w-5 h-5 animate-spin" /> SYNTHESIZING…</>
                  : <><Play className="w-5 h-5" /> [ EXECUTE SYNTH ]</>
                }
              </button>
            </div>

            {synthError && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Synthesis Error:</span> {synthError}
                </div>
              </div>
            )}
          </div>

          {/* Right — Output buffer */}
          <div className="glass p-6 rounded-[2rem] border-white/5 flex flex-col min-h-[500px]">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-4 mb-4">
              <Brain className="w-5 h-5 text-blue-400" />
              Neural Buffer
              {history.length > 0 && (
                <span className="ml-auto text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-mono">
                  {history.length}
                </span>
              )}
            </h3>

            {isSynthesizing && (
              <div className="flex-1 flex flex-col items-center justify-center gap-6 py-12">
                <div className="relative">
                  <div className="absolute inset-0 bg-fuchsia-500/20 blur-3xl rounded-full animate-pulse" />
                  <div className="w-24 h-24 border-4 border-fuchsia-500/30 border-t-fuchsia-500 rounded-full animate-spin" />
                  <Activity className="absolute inset-0 m-auto w-10 h-10 text-fuchsia-400 animate-pulse" />
                </div>
                <p className="text-fuchsia-400 font-black font-mono tracking-widest animate-pulse">DNA_SEQUENCING…</p>
              </div>
            )}

            {!isSynthesizing && history.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-gray-600">
                <Info className="w-12 h-12 mb-4 opacity-20" />
                <p className="font-mono text-xs uppercase tracking-widest">Buffer Empty</p>
                <p className="text-xs mt-2 opacity-60">Select a voice and hit Execute Synth</p>
              </div>
            )}

            {!isSynthesizing && history.length > 0 && (
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
                {history.map(clip => (
                  <div key={clip.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono text-gray-500 uppercase">{clip.timestamp}</span>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {clip.url && (
                          <a
                            href={clip.url}
                            download={`${clip.name}.mp3`}
                            className="p-1.5 rounded-lg hover:bg-teal-500/20 text-teal-400 transition-all"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => removeClip(clip.id)}
                          className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition-all"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {clip.persona && (
                      <p className="text-[10px] font-mono text-teal-500 mb-1">{clip.persona}</p>
                    )}
                    <p className="text-sm text-gray-300 italic mb-3 line-clamp-2">"{clip.text}"</p>
                    {clip.url ? (
                      <audio controls src={clip.url} className="w-full h-8 brightness-90 contrast-125 rounded-lg" />
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <Volume2 className="w-3 h-3 text-blue-400" />
                        <span className="text-[10px] font-mono text-blue-400">Played via Browser Web Speech API — not recordable</span>
                      </div>
                    )}
                    {clip.provider && (
                      <p className="text-[9px] font-mono text-gray-600 mt-1 text-right">{clip.provider}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          TAB 2 — UPLOAD & REGISTER
          ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'upload' && (
        <div className="grid md:grid-cols-2 gap-8">

          {/* Left — Upload */}
          <div className="glass p-6 rounded-[2rem] border-white/5 space-y-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Mic className="w-5 h-5 text-teal-400" />
              Upload Voice Sample
            </h3>
            <p className="text-xs text-gray-500 font-mono leading-relaxed">
              Upload a WAV or MP3 bio-signature to vault a new voice in the Nexus Grid.
              The sample is stored and linked to a character for future clone-provider use.
            </p>

            {/* Persona target */}
            <div className="space-y-2">
              <label htmlFor="upload-persona-select" className="text-xs text-gray-400 font-mono uppercase tracking-widest pl-1">
                Assign to character:
              </label>
              <select
                id="upload-persona-select"
                value={targetChar}
                onChange={e => { setTargetChar(e.target.value); setVoiceId(null); setUploadSuccess(null); }}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500/50 appearance-none font-mono text-sm"
              >
                {BUILTIN_PERSONAS.map(p => (
                  <option key={p.slug} value={p.slug}>{p.icon} {p.label}</option>
                ))}
                <option value="custom">── Custom (use file name)</option>
              </select>
            </div>

            {/* File drop zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                selectedFile
                  ? 'border-teal-500/50 bg-teal-500/5'
                  : 'border-white/10 hover:border-white/25 hover:bg-white/2'
              }`}
            >
              <label htmlFor="voice-file-upload" className="sr-only">Upload voice sample file</label>
              <input
                id="voice-file-upload"
                type="file"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".wav,.mp3"
              />
              {selectedFile ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-teal-400 font-bold">
                    <Sparkles className="w-5 h-5" />
                    {selectedFile.name}
                  </div>
                  <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(0)} KB</p>
                  <button
                    onClick={e => { e.stopPropagation(); setSelectedFile(null); setVoiceId(null); setUploadSuccess(null); }}
                    className="text-xs text-gray-500 hover:text-white transition-colors"
                  >
                    Replace Sample
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-10 h-10 text-gray-600 mx-auto" />
                  <p className="text-sm text-gray-400 font-mono uppercase tracking-tighter">
                    Drop .wav / .mp3 bio-signature
                  </p>
                  <p className="text-xs text-gray-600">Max 10 MB</p>
                </div>
              )}
            </div>

            {/* Upload button */}
            {selectedFile && !voiceId && (
              <button
                id="upload-voice-btn"
                onClick={uploadVoice}
                disabled={isUploading}
                className="w-full py-3 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                {isUploading ? 'Vaulting Sample…' : 'Vault to Nexus Grid'}
              </button>
            )}

            {/* Success Feedback */}
            {uploadSuccess && (
              <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm flex items-start gap-3">
                <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Uplink Successful</p>
                  <p className="text-xs opacity-80">{uploadSuccess}</p>
                  <button 
                    onClick={() => setActiveTab('synthesize')}
                    className="mt-3 px-4 py-2 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 text-xs font-black uppercase tracking-widest transition-all"
                  >
                    Go to Synthesizer →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right — How it works */}
          <div className="glass p-6 rounded-[2rem] border-white/5 space-y-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Info className="w-5 h-5 text-fuchsia-400" />
              Sanctuary Zero-Shot Node
            </h3>
            <div className="space-y-4 text-sm text-gray-400 font-mono leading-relaxed">
              <div className="p-4 rounded-xl border border-teal-500/30 bg-teal-500/10 space-y-1">
                <p className="text-teal-400 font-bold">✨ Primary: Sanctuary Local Node</p>
                <p className="text-xs text-teal-200">Zero-shot Coqui XTTS v2 running directly on your hardware. 100% free, flawless voice cloning. Lyra is mapped to your high-fidelity Jenna profile.</p>
              </div>
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 space-y-1">
                <p className="text-purple-400 font-bold">☁️ Cloud Fallback: Coqui XTTS (Cloud)</p>
                <p className="text-xs">If your Local Node is offline, synthesis automatically triggers a high-fidelity Cloud Coqui fallback on the Neural Grid.</p>
              </div>
              <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20 space-y-1">
                <p className="text-cyan-400 font-bold">📂 Automatic Physical Mirroring</p>
                <p className="text-xs text-yellow-200/80">Any voice you upload is instantly mirrored to your Physical Hardware link. Your local PC "learns" the voice as soon as you hit upload.</p>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">Registered Built-in Voices</p>
              <div className="grid grid-cols-3 gap-2">
                {BUILTIN_PERSONAS.map(p => (
                  <div key={p.slug} className="text-center p-2 rounded-xl bg-white/3 border border-white/5">
                    <div className="text-lg mb-1">{p.icon}</div>
                    <div className="text-[10px] font-mono text-gray-400">{p.slug}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
