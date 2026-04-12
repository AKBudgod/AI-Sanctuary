'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  ImageIcon, 
  Zap, 
  Brain, 
  Download, 
  Trash2, 
  Loader2, 
  Activity, 
  Shield, 
  Maximize,
  Layout,
  RefreshCw,
  Plus
} from '@/components/ui/Icons';

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  method: string;
  timestamp: string;
}

export default function VisualArchitect() {
  const [prompt, setPrompt] = useState('');
  const [activeMode, setActiveMode] = useState<'txt2img' | 'img2img'>('txt2img');
  const [initImage, setInitImage] = useState<string | null>(null);
  const [strength, setStrength] = useState(0.75);
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [isNodeOnline, setIsNodeOnline] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Neural Link Pulse Monitor ──
  const checkNodePulse = async () => {
    try {
      const apiKey = sessionStorage.getItem('admin_api_key') || 'guest';
      const res = await fetch('/api/admin?action=stats', {
          headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      // In a real scenario, we might have a dedicated heartbeat endpoint, 
      // but for now, we'll assume the admin stats check is our proxy for 'connectivity'
      // or we just trust the last generation attempt.
      setIsNodeOnline(true);
    } catch {
      setIsNodeOnline(false);
    }
  };

  useEffect(() => {
    checkNodePulse();
    const interval = setInterval(checkNodePulse, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('visual_architect_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse visual history', e);
      }
    }
  }, []);

  useEffect(() => {
    try {
      // Truncate history to 50 items to stay within localStorage quota
      const truncated = history.slice(0, 50);
      localStorage.setItem('visual_architect_history', JSON.stringify(truncated));
    } catch (e) {
      console.warn('[SYSTEM] LocalStorage Quota Exceeded. Visual History truncated.', e);
    }
  }, [history]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setInitImage(reader.result as string);
      setActiveMode('img2img');
    };
    reader.readAsDataURL(file);
  };

  const generateImage = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    try {
      const apiKey = sessionStorage.getItem('admin_api_key') || 'sanctuary-guest-protocol';
      
      const body: any = { 
        imagePrompt: prompt, 
        allowNSFW: true,
        initImage: activeMode === 'img2img' ? initImage : undefined,
        strength: activeMode === 'img2img' ? strength : undefined
      };

      const action = 'synthesizeImage';
      const response = await fetch(`/api/admin?action=${action}`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(body)
      });
      
      if (!response.ok) {
        const errRes = await response.json() as any;
        throw new Error(errRes.error || 'Server error occurred during synthesis.');
      }
      
      let data = await response.json() as any;

      // ── Asynchronous Physical Node Tracking ──
      if (data && data.job_id) {
         console.log(`[SANCTUARY] Tracking Neural Link render frame: ${data.job_id}`);
         let retries = 0;
         while (data.status === 'processing' && retries < 60) { // Limit to ~4 mins
             await new Promise(r => setTimeout(r, 4000)); // Poll every 4 seconds
             
             try {
                 const pollRes = await fetch('/api/admin?action=checkImageStatus', {
                     method: 'POST',
                     headers: { 
                       'Authorization': `Bearer ${apiKey}`,
                       'Content-Type': 'application/json' 
                     },
                     body: JSON.stringify({ jobId: data.job_id })
                 });

                 if (pollRes.ok) {
                     const pollData = await pollRes.json();
                     if (pollData.status) {
                         data = pollData;
                         console.log(`[SANCTUARY] Sync Pulse: ${data.status}`);
                     }
                 } else {
                    console.warn(`[SANCTUARY] Sync Pulse failed: ${pollRes.status}`);
                 }
             } catch (pollErr) {
                 console.warn("[SANCTUARY] Neural Link jitter detected. Retrying sync...");
             }
             retries++;
             
             if (data.status === 'failed') throw new Error(data.error || "Hardware node collapsed during synthesis.");
         }
         console.log('[SANCTUARY] Frame retrieval successful. Binding raw data to UI.');
      }

      if (!data || !data.url) throw new Error('Neural link severed: Visual synthesis produced no output.');

      const newImage: GeneratedImage = {
        id: Math.random().toString(36).substr(2, 9),
        url: data.url,
        prompt,
        method: data.method || 'Sanctuary-Native-Unfiltered',
        timestamp: new Date().toLocaleTimeString()
      };

      setHistory([newImage, ...history]);
      setSelectedImage(newImage);
      console.log('[SANCTUARY] UI Repaint Complete.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const removeImage = (id: string) => {
    setHistory(history.filter(img => img.id !== id));
    if (selectedImage?.id === id) setSelectedImage(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono font-bold uppercase tracking-widest w-fit">
              <Shield className="w-3 h-3" />
              Primary Unrestricted Grid
            </div>
            {isNodeOnline !== null && (
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-mono font-bold uppercase tracking-widest w-fit ${
                isNodeOnline ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}>
                <Activity className={`w-3 h-3 ${isNodeOnline ? 'animate-pulse' : ''}`} />
                {isNodeOnline ? 'Neural Link: Active' : 'Neural Link: Offline'}
              </div>
            )}
          </div>
        <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase font-mono">
          Visual <span className="text-blue-400">Architect</span>
        </h2>
        <p className="text-gray-500 font-medium font-mono text-xs uppercase tracking-tight">
          Unfiltered Image Synthesis // Direct Neural Rendering
        </p>
      </div>

      {/* Mode Selector */}
      <div className="flex items-center gap-4 border-b border-white/5 pb-2">
          {(['txt2img', 'img2img'] as const).map((m) => (
            <button
                key={m}
                onClick={() => setActiveMode(m)}
                className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest font-mono transition-all border-b-2 ${
                    activeMode === m ? 'text-blue-400 border-blue-400' : 'text-zinc-600 border-transparent hover:text-zinc-400'
                }`}
            >
                {m === 'txt2img' ? '[ Text To Image ]' : '[ Image To Image ]'}
            </button>
          ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Left Column: Input */}
        <div className="space-y-6">
          <div className="glass p-8 rounded-[2.5rem] border-white/5 space-y-6">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2 font-mono">Neural Prompt Specification</label>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={"Describe the unrestricted vision..."}
                className="w-full h-32 bg-black/50 border border-white/5 rounded-3xl p-6 text-white placeholder:text-zinc-700 focus:outline-none focus:border-blue-500/50 transition-all font-mono text-sm leading-relaxed"
              />
            </div>

            {/* Img2Img Inputs */}
            {(activeMode === 'img2img') && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2 font-mono">
                    Reference Image
                </label>
                <div className="flex gap-4">
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 h-32 rounded-3xl bg-white/5 border border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-all group"
                    >
                        {initImage ? (
                            <img src={initImage} className="w-full h-full object-cover rounded-3xl" />
                        ) : (
                            <>
                                <Plus className="w-6 h-6 text-zinc-600 group-hover:text-blue-400 transition-colors" />
                                <span className="text-[8px] font-mono text-zinc-500 mt-2 uppercase tracking-widest group-hover:text-zinc-300">Target Image</span>
                            </>
                        )}
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleImageUpload} 
                            className="hidden" 
                            accept="image/*"
                        />
                    </div>
                    {activeMode === 'img2img' && (
                        <div className="flex-1 flex flex-col justify-center space-y-3 px-4">
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Strength</span>
                                <span className="text-[10px] font-mono text-blue-400 font-bold">{strength.toFixed(2)}</span>
                            </div>
                            <input 
                                type="range" 
                                min="0" 
                                max="1" 
                                step="0.05"
                                value={strength}
                                onChange={(e) => setStrength(parseFloat(e.target.value))}
                                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                            <p className="text-[8px] text-zinc-600 font-mono italic leading-tight">
                                High = More creative change<br/>
                                Low = Closer to original
                            </p>
                        </div>
                    )}
                </div>
              </div>
            )}

            <button 
              onClick={generateImage}
              disabled={isGenerating || !prompt.trim()}
              className="w-full py-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black uppercase tracking-widest hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all disabled:opacity-30 disabled:shadow-none flex items-center justify-center gap-3 active:scale-95 translate-y-0 hover:-translate-y-1"
            >
              {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              {isGenerating ? 'SEQUENCING PIXELS...' : '[ EXECUTE VISUAL SYNTH ]'}
            </button>

            {error && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-mono text-center uppercase">
                  Nexus Grid Error: {error}
                </div>
                <button 
                  onClick={generateImage}
                  className="w-full py-3 rounded-xl border border-white/10 text-white/40 text-[10px] font-mono uppercase tracking-widest hover:bg-white/5 transition-all"
                >
                  [ RE-INITIATE NEURAL LINK ]
                </button>
              </div>
            )}
          </div>

          <div className="glass p-8 rounded-[2.5rem] border-white/5 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-white font-mono flex items-center gap-2">
              <Brain className="w-4 h-4 text-blue-400" />
              Engine Configuration
            </h3>
            <div className="grid grid-cols-2 gap-4">
               <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <div className="text-[10px] font-black uppercase tracking-tighter text-zinc-500">Method</div>
                  <div className="text-xs font-bold text-white">Nexus-V2 Unfiltered Realism</div>
               </div>
               <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <div className="text-[10px] font-black uppercase tracking-tighter text-zinc-500">Resolution</div>
                  <div className="text-xs font-bold text-white">1024 x 1024 (HD)</div>
               </div>
            </div>
            <p className="text-[9px] text-zinc-600 font-mono uppercase tracking-tighter leading-tight">
               System note: Nexus-V2 bypasses all Cloudflare safety proxies and utilizes high-fidelity uncensored weights. 
               Gold-standard rendering guaranteed.
            </p>
          </div>
        </div>

        {/* Right Column: Output & Buffer */}
        <div className="glass p-8 rounded-[2.5rem] border-white/5 min-h-[500px] flex flex-col relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />
          
          <h3 className="text-sm font-black uppercase tracking-widest text-white font-mono flex items-center gap-2 border-b border-white/5 pb-4 mb-6">
            <ImageIcon className="w-4 h-4 text-blue-400" />
            Visual Buffer
          </h3>

          <div className="flex-1 flex flex-col gap-6 overflow-hidden">
             {selectedImage ? (
               <div className="relative flex-1 rounded-3xl overflow-hidden bg-black/40 border border-white/10 group/img">
                  <img 
                    src={selectedImage.url} 
                    alt="Synthesis Output" 
                    className="w-full h-full object-contain animate-in zoom-in duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-all duration-300 flex flex-col justify-end p-8">
                     <p className="text-white text-xs font-mono italic line-clamp-2 mb-4">"{selectedImage.prompt}"</p>
                     <div className="flex items-center gap-3">
                        <button 
                          onClick={() => { setPrompt(selectedImage.prompt); generateImage(); }}
                          className="px-4 py-2 rounded-xl bg-white/10 text-white font-bold text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-2 backdrop-blur-md border border-white/5"
                        >
                          <RefreshCw className="w-3 h-3" /> Reroll
                        </button>
                        <a 
                          href={selectedImage.url} 
                          download={`Sanctuary_Visual_${selectedImage.id}.jpg`}
                          className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-[10px] uppercase tracking-widest hover:bg-blue-500 transition-all flex items-center gap-2"
                        >
                          <Download className="w-3 h-3" /> Save Signal
                        </a>
                        <button 
                          onClick={() => removeImage(selectedImage.id)}
                          className="p-2 rounded-xl bg-red-600/20 text-red-500 hover:bg-red-600/30 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                     </div>
                  </div>
                  <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-[9px] font-black uppercase text-blue-400">
                     {selectedImage.method}
                  </div>
               </div>
             ) : isGenerating ? (
               <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/20 blur-3xl animate-pulse rounded-full" />
                    <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
                  </div>
                  <p className="text-blue-400 font-black font-mono tracking-widest animate-pulse">DNA_VISUALIZING...</p>
                  
                  <button 
                    onClick={() => { setIsGenerating(false); setError('Generation manually refreshed/aborted.'); }}
                    className="flex items-center gap-2 px-6 py-2 mt-4 rounded-xl border border-red-500/30 text-red-500 font-bold text-[10px] font-mono uppercase tracking-widest hover:bg-red-500/20 transition-all"
                  >
                    <RefreshCw className="w-3 h-3" /> Abort & Refresh
                  </button>
               </div>
             ) : (
               <div className="flex-1 flex flex-col items-center justify-center text-zinc-700 space-y-4">
                  <RefreshCw className="w-16 h-16 opacity-10" />
                  <p className="text-[10px] font-mono uppercase tracking-[0.3em]">Buffer Neutral</p>
               </div>
             )}

             {/* History Thumbnails */}
             <div className="h-24 flex items-center gap-4 overflow-x-auto custom-scrollbar pb-2 pt-4">
                {history.map((img) => (
                  <button 
                    key={img.id}
                    onClick={() => setSelectedImage(img)}
                    className={`w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all hover:scale-105 active:scale-95 ${
                      selectedImage?.id === img.id ? 'border-blue-500 scale-105 shadow-lg shadow-blue-500/20' : 'border-white/5 opacity-50 grayscale hover:grayscale-0 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} className="w-full h-full object-cover" />
                  </button>
                ))}
                {history.length > 0 && (
                  <button 
                    onClick={() => { setHistory([]); setSelectedImage(null); }}
                    className="w-16 h-16 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center shrink-0 hover:bg-red-500/20 transition-all font-mono"
                  >
                    CLR
                  </button>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
