'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  Volume2, 
  Zap, 
  Brain, 
  Activity, 
  Sparkles, 
  Loader2, 
  Upload, 
  X, 
  Play, 
  Download,
  Trash2,
  AlertTriangle,
  Info,
  Shield,
  Globe
} from '@/components/ui/Icons';

// Admin emails allowed to use the synthesizer
const ADMIN_EMAILS = [
  'kearns.adam747@gmail.com',
  'kearns.adan747@gmail.com',
  'gamergoodguy445@gmail.com',
  'wjreviews420@gmail.com',
  'weedj747@gmail.com'
];

interface VoiceClip {
  id: string;
  name: string;
  url: string;
  timestamp: string;
  text: string;
}

export default function VoiceSynthesizer({ userEmail }: { userEmail?: string }) {
  const isAdmin = userEmail && ADMIN_EMAILS.includes(userEmail);
  const [text, setText] = useState('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [voiceId, setVoiceId] = useState<string | null>(null);
  const [history, setHistory] = useState<VoiceClip[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('voice_synth_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('voice_synth_history', JSON.stringify(history));
  }, [history]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('File size too large. Please use a clip under 10MB.');
        return;
      }
      setSelectedFile(file);
      setError(null);
      setSuccess(null);
    }
  };

  const uploadVoice = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await fetch('/api/synthesizer/upload', {
        method: 'POST',
        headers: { 'X-User-Email': userEmail || '' },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Upload failed. Ensure ElevenLabs API is accessible.');
      }

      const data = await res.json();
      setVoiceId(data.voice_id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const registerGlobally = async () => {
    if (!voiceId) return;
    setIsRegistering(true);
    setSuccess(null);
    try {
      const res = await fetch('/api/synthesizer/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Email': userEmail || ''
        },
        body: JSON.stringify({ 
          voice_id: voiceId,
          character_id: `voice-${selectedFile?.name.split('.')[0].toLowerCase().replace(/\s+/g, '-') || 'custom'}`
        }),
      });

      if (!res.ok) throw new Error('Global registration failed.');
      setSuccess('Voice successfully deployed to the global grid!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsRegistering(false);
    }
  };

  const synthesize = async () => {
    if (!text || (!voiceId && !selectedFile)) return;
    
    setIsSynthesizing(true);
    setError(null);

    try {
      const res = await fetch('/api/synthesizer/clone', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Email': userEmail || ''
        },
        body: JSON.stringify({
          text,
          voice_id: voiceId || 'voice_custom',
          language: 'en'
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Synthesis failed. Check ElevenLabs API status.');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      
      const newClip: VoiceClip = {
        id: Math.random().toString(36).substr(2, 9),
        name: `Synth_${new Date().toLocaleTimeString()}`,
        url,
        timestamp: new Date().toLocaleString(),
        text: text.length > 30 ? text.substring(0, 30) + '...' : text
      };

      setHistory([newClip, ...history]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const removeClip = (id: string) => {
    setHistory(history.filter(c => c.id !== id));
  };

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center space-y-6">
        <div className="w-24 h-24 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto">
          <Shield className="w-12 h-12 text-red-500" />
        </div>
        <h1 className="text-3xl font-black text-white uppercase font-mono">Access Denied</h1>
        <p className="text-gray-400 max-w-md mx-auto">
          The Neural Synth Uplink is restricted to authorized Personnel only. 
          Please log in with an administrator account to add new voices to the Sanctuary.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-mono font-bold uppercase tracking-widest w-fit">
          <Shield className="w-3 h-3" />
          Admin Uplink: Secured
        </div>
        <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase font-mono">
          Neural <span className="text-teal-400">Architect</span>
        </h1>
        <p className="text-gray-400 font-medium font-mono text-sm uppercase tracking-tight">
          Universal Voice Management // Clone and deploy across the Sanctuary
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Column: Configuration */}
        <div className="space-y-6">
          <div className="glass p-6 rounded-[2rem] border-white/5 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Mic className="w-5 h-5 text-teal-400" />
              1. Sample Extraction
            </h3>
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                selectedFile ? 'border-teal-500/50 bg-teal-500/5' : 'border-white/10 hover:border-white/20'
              }`}
            >
              <input 
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
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setVoiceId(null); setSuccess(null); }}
                    className="text-xs text-gray-500 hover:text-white"
                  >
                    Replace Sample
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-10 h-10 text-gray-600 mx-auto" />
                  <p className="text-sm text-gray-400 font-mono uppercase tracking-tighter">
                    Load .wav/ .mp3 Bio-signature
                  </p>
                </div>
              )}
            </div>

            {selectedFile && !voiceId && (
              <button 
                onClick={uploadVoice}
                disabled={isUploading}
                className="w-full py-3 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                {isUploading ? 'Extracting DNA...' : 'Initialize Clone'}
              </button>
            )}

            {voiceId && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono text-teal-500 bg-teal-500/10 p-2 rounded-lg border border-teal-500/20">
                  <CheckCircle className="w-4 h-4" />
                  ID_VERIFIED: {voiceId}
                </div>
                
                <button 
                  onClick={registerGlobally}
                  disabled={isRegistering}
                  className="w-full py-3 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 font-black uppercase tracking-widest text-xs hover:bg-blue-600/30 transition-all flex items-center justify-center gap-2"
                >
                  {isRegistering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                  [ Deploy to Global Grid ]
                </button>

                {success && (
                  <div className="text-[10px] text-green-400 font-mono text-center animate-pulse">
                    SYS_MESSAGE: {success}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="glass p-6 rounded-[2rem] border-white/5 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-fuchsia-400" />
              2. Neural Input
            </h3>
            <textarea 
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text to synthesize..."
              className="w-full h-32 bg-black/50 border border-white/5 rounded-2xl p-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-fuchsia-500/50 transition-all"
            />
            <button 
              onClick={synthesize}
              disabled={isSynthesizing || !text || (!voiceId && !selectedFile)}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-black uppercase tracking-widest hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all disabled:opacity-30 disabled:shadow-none flex items-center justify-center gap-3"
            >
              {isSynthesizing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
              {isSynthesizing ? 'SYNTHESIZING...' : '[ EXECUTE SYNTH ]'}
            </button>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Protocol Error:</span> {error}
                <p className="text-xs mt-1 opacity-70">Check ElevenLabs API status and credits.</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Output Buffer */}
        <div className="glass p-6 rounded-[2rem] border-white/5 h-full flex flex-col min-h-[400px]">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-4">
            <Volume2 className="w-5 h-5 text-blue-400" />
            Neural Buffer
          </h3>

          {isSynthesizing && (
            <div className="flex-1 flex flex-col items-center justify-center gap-6 py-12">
              <div className="relative">
                <div className="absolute inset-0 bg-fuchsia-500/20 blur-3xl rounded-full animate-pulse" />
                <div className="w-24 h-24 border-4 border-fuchsia-500/30 border-t-fuchsia-500 rounded-full animate-spin" />
                <Activity className="absolute inset-0 m-auto w-10 h-10 text-fuchsia-400 animate-pulse" />
              </div>
              <p className="text-fuchsia-400 font-black font-mono tracking-widest animate-pulse">DNA_SEQUENCING...</p>
            </div>
          )}

          {!isSynthesizing && history.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-gray-600">
              <Info className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-mono text-xs uppercase tracking-widest">Buffer Empty</p>
            </div>
          )}

          {!isSynthesizing && history.length > 0 && (
            <div className="flex-1 overflow-y-auto space-y-4 mt-6 pr-2 custom-scrollbar">
              {history.map((clip) => (
                <div key={clip.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-gray-500 uppercase">{clip.timestamp}</span>
                    <div className="flex items-center gap-2">
                      <a href={clip.url} download={`${clip.name}.wav`} className="p-1.5 rounded-lg hover:bg-teal-500/20 text-teal-400 transition-all opacity-0 group-hover:opacity-100">
                        <Download className="w-4 h-4" />
                      </a>
                      <button onClick={() => removeClip(clip.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition-all opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 line-clamp-2 italic mb-4">"{clip.text}"</p>
                  <audio controls src={clip.url} className="w-full h-8 brightness-90 contrast-125 rounded-lg" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Internal missing icons
const CheckCircle = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
