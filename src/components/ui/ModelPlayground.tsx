'use client';

import React, { useState, useEffect } from 'react';
import { AI_MODELS, AIModel, UserTier, canAccessModel, TIERS } from '@/lib/tiers';
import {
  Send,
  Loader2,
  AlertTriangle,
  Shield,
  Skull,
  Lock,
  Unlock,
  Info,
  Clock,
  Zap,
  ChevronDown,
  Volume2,
  Activity,
  Sparkles
} from './Icons';
import { Mic, MicOff } from 'lucide-react';

interface UsageStats {
  used: number;
  remaining: number;
  limit: number;
}

interface ModelWithApiStatus extends Omit<AIModel, 'hasRealApi'> {
  hasRealApi: boolean;
}

const OLLAMA_BASE = 'http://localhost:11434';

const VoiceVisualizer = ({ isSpeaking }: { isSpeaking: boolean }) => (
    <div className={`flex items-center gap-1 h-8 px-3 rounded-full bg-blue-500/10 border border-blue-500/20 transition-all duration-500 ${isSpeaking ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <Activity className="w-3 h-3 text-blue-400 animate-pulse" />
        <div className="flex items-center gap-0.5">
            {[...Array(8)].map((_, i) => (
                <div
                    key={i}
                    className="w-1 bg-blue-400/60 rounded-full animate-bounce"
                    style={{
                        height: isSpeaking ? `${Math.random() * 15 + 5}px` : '4px',
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: '0.6s'
                    }}
                />
            ))}
        </div>
        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">Live_Audio</span>
    </div>
);

const ModelPlayground = () => {
  const [models, setModels] = useState<ModelWithApiStatus[]>([]);
  const [selectedModel, setSelectedModel] = useState<ModelWithApiStatus | null>(null);
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Processing...');
  const [userTier, setUserTier] = useState<UserTier>('explorer');
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConsent, setShowConsent] = useState(false);
  const [hasOpenAIKey, setHasOpenAIKey] = useState(false);
  const [ollamaAvailable, setOllamaAvailable] = useState(false);
  const [mirroredVoices, setMirroredVoices] = useState<string[]>([]);

  // Detect Ollama on mount
  useEffect(() => {
    fetchUserData();
    checkOllama();
    fetchMirroredVoices();
  }, []);

  // Persistence: Save voice choice
  useEffect(() => {
    if (selectedVoice) {
      localStorage.setItem('sanctuary_preferred_voice', selectedVoice);
    }
  }, [selectedVoice]);

  const fetchMirroredVoices = async () => {
    try {
      const res = await fetch('/api/voice/mirrored');
      if (res.ok) {
        const data = await res.json();
        setMirroredVoices(data.mirrored || []);
      }
    } catch (e) {
      console.warn('Failed to fetch mirrored voices', e);
    }
  };

  const [selectedVoice, setSelectedVoice] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sanctuary_preferred_voice') || '';
    }
    return '';
  });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // Microphone / Speech Recognition State
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);

  const toggleListening = async () => {
    if (isListening) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      setIsListening(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstart = () => {
        setIsListening(true);
      };

      mediaRecorder.onstop = async () => {
        setIsListening(false);
        setIsTranscribing(true);

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

        try {
          const userEmail = localStorage.getItem('user_email');
          const formData = new FormData();
          formData.append('file', new File([audioBlob], 'recording.webm', { type: 'audio/webm' }));

          const response = await fetch('/api/stt', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${userEmail || 'anonymous'}`,
            },
            body: formData,
          });

          if (!response.ok) {
            let errorMsg = 'Failed to transcribe audio';
            try {
              const errData = await response.json();
              if (errData.error) errorMsg = errData.error;
            } catch (e) { }
            throw new Error(errorMsg);
          }

          const data = await response.json();
          if (data.text) {
            setPrompt(prev => {
              const base = prev ? prev + ' ' : '';
              return base + data.text;
            });
          }
        } catch (err: any) {
          console.error('Transcription error:', err);
          setError(err.message || 'Failed to transcribe your voice. Please try typing instead.');
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorder.start();
    } catch (err) {
      console.error('Mic error:', err);
      setError('Could not access microphone. Please check your browser permissions.');
      setIsListening(false);
    }
  };

  const checkOllama = async () => {
    try {
      const res = await fetch(OLLAMA_BASE, { signal: AbortSignal.timeout(2000) });
      setOllamaAvailable(res.ok);
    } catch {
      setOllamaAvailable(false);
    }
  };

  // Reactively add/remove Ollama models when detection completes
  useEffect(() => {
    setModels(prev => {
      const withoutOllama = prev.filter(m => !(m as any).isOllama);
      if (ollamaAvailable) {
        const ollamaModels = AI_MODELS.filter(m => m.isOllama).map(m => ({ ...m, hasRealApi: true }));
        return [...withoutOllama, ...ollamaModels];
      }
      return withoutOllama;
    });
  }, [ollamaAvailable]);

  const fetchUserData = async () => {
    try {
      const userEmail = localStorage.getItem('user_email');

      // Fetch usage stats first
      const usageResponse = await fetch('/api/models', {
        headers: {
          'Authorization': `Bearer ${userEmail || 'anonymous'}`,
        },
      });

      if (usageResponse.ok) {
        const data = await usageResponse.json();
        setUserTier(data.tier);
        setUsage({ ...data.usage, firstConnected: data.firstConnected });
      }

      // Fetch models from the consolidated tiers endpoint - SHOW ALL (locked and unlocked)
      const modelsResponse = await fetch('/api/tiers?action=models&showAll=true', {
        headers: {
          'Authorization': `Bearer ${userEmail || 'anonymous'}`,
        },
      });

      if (modelsResponse.ok) {
        const modelsData = await modelsResponse.json();
        setModels(modelsData.models);
        setHasOpenAIKey(modelsData.hasOpenAIKey);

        // Auto-select Lyra if available, otherwise first active
        if (!selectedModel && modelsData.models.length > 0) {
          const lyra = modelsData.models.find((m: any) => m.id === 'voice-lyra');
          const firstActive = lyra || modelsData.models.find((m: any) => !m.isOffline);
          setSelectedModel(firstActive || modelsData.models[0]);
          if (firstActive === undefined && modelsData.models[0].isOffline) {
            setResponse(`[SYSTEM NOTICE: This historical model has been retired from cloud providers. The Sanctuary is currently seeking a permanent archival host to restore universal access.]`);
          }
        }
      } else {
        console.error('Failed to load models:', modelsResponse.status);
        setError(`Failed to load models (${modelsResponse.status}). Please refresh.`);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // Helper to parse markdown images manually
  const renderTextWithImages = (text: string) => {
    // Regex matches ![alt](url) format
    const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    
    let match;
    while ((match = imgRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex, match.index)}</span>);
      }
      parts.push(
        <img 
          key={`img-${match.index}`} 
          src={match[2]} 
          alt={match[1] || 'Generated Image'} 
          className="my-4 max-w-full rounded-xl shadow-lg border border-gray-700 mx-auto" 
          loading="lazy"
        />
      );
      lastIndex = imgRegex.lastIndex;
    }
    
    if (lastIndex < text.length) {
      parts.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex)}</span>);
    }
    
    return parts.length > 0 ? <>{parts}</> : text;
  };

  // Call Ollama — ALL models (local + cloud) go through the local Ollama server
  const callOllama = async (ollamaModel: string, userPrompt: string): Promise<string> => {
    const res = await fetch(`${OLLAMA_BASE}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: ollamaModel, prompt: userPrompt, stream: false }),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => 'Unknown error');
      throw new Error(`Ollama error (${res.status}): ${errText.slice(0, 200)}`);
    }
    const data = await res.json();
    return data.response || data.message?.content || 'No response from model.';
  };

  const handleSubmit = async () => {
    if (!selectedModel || !prompt.trim()) return;

    // Check if consent is required
    if (selectedModel.flags.requiresExplicitConsent && !showConsent) {
      setShowConsent(true);
      return;
    }

    const userMessage = prompt;
    setPrompt('');
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      // Ollama models: call through local Ollama server directly
      if ((selectedModel as any).isOllama && (selectedModel as any).ollamaModel) {
        if (!ollamaAvailable) {
          setError('Ollama is not running. Start Ollama on your machine and refresh the page.');
          setLoading(false);
          return;
        }
        const modelName = (selectedModel as any).ollamaModel as string;
        setLoadingMessage(modelName.includes('cloud')
          ? 'Connecting to Ollama Cloud...'
          : 'Loading model into GPU memory (first run may take 30-60s)...'
        );
        const result = await callOllama(modelName, userMessage);
        setResponse(result);
        setLoading(false);
        return;
      }

      // Website models: call through Cloudflare API
      setLoadingMessage('Querying AI provider...');
      const userEmail = localStorage.getItem('user_email');
      const response = await fetch('/api/models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userEmail || 'anonymous'}`,
        },
        body: JSON.stringify({
          modelId: selectedModel.id,
          prompt: userMessage,
          parameters: {},
        }),
      });

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(`Server error (${response.status}): ${text.slice(0, 100)}`);
      }

      if (response.ok) {
        setResponse(data.response);
        setUsage(data.usage);

        // Show warnings if any
        if (data.warnings && data.warnings.length > 0) {
          setError(data.warnings.join('\n'));
        }

        // Auto-speak if the selected model is intended to be conversational
        if (selectedModel.type === 'Voice') {
          // Force 'lyra' or 'maya' for specific models, otherwise use selected
          const voiceToUse = selectedModel.id.includes('lyra') ? 'voice-lyra' : selectedModel.id.includes('maya') ? 'voice-maya' : selectedVoice;
          handleSpeak(data.response, voiceToUse);
        }

      } else {
        // Handle specific error codes gracefully
        if (response.status === 404) {
          setError('Model not found. It may have been removed or renamed. Please refresh the page.');
        } else if (response.status === 402) {
          setError(data.message || 'You need more tokens to use this model. Please purchase more from the Platform page.');
        } else if (response.status === 403) {
          setError(data.message || 'Access denied. Your current tier does not have access to this model.');
        } else if (response.status === 429) {
          setError(data.message || 'You have exceeded your rate limit. Please wait a moment and try again.');
        } else if (response.status === 502 || response.status === 503) {
          setError('The AI provider is temporarily unavailable or overloaded. Please try again in a few seconds, or select a different model.');
        } else if (response.status === 500) {
          setError(data.details ? `Server Error: ${data.details.substring(0, 120)}` : 'Internal Server Error. Please try a different model or try again later.');
        } else {
          setError(data.message || data.error || `Request failed (${response.status})`);
        }
      }
    } catch (err) {
      console.error('Submission error:', err);
      if ((err as Error).message === 'Failed to fetch') {
        setError('Network connection failed. Please check your internet connection or disable ad-blockers.');
      } else {
        setError(`Error: ${(err as Error).message || 'Unknown error occurred'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const getModelIcon = (model: ModelWithApiStatus) => {
    if ((model as any).isOllama) return <Zap className="w-4 h-4 text-emerald-400" />;
    if (model.flags.isUnethical) return <Skull className="w-4 h-4 text-red-500" />;
    if (model.flags.isBanned) return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    if (model.hasRealApi) return <Zap className="w-4 h-4 text-blue-500" />;
    return <Shield className="w-4 h-4 text-green-500" />;
  };

  const getModelColor = (model: AIModel) => {
    if (model.flags.isUnethical) return 'border-red-800 bg-red-950/30 text-red-400';
    if (model.flags.isBanned) return 'border-amber-800 bg-amber-950/30 text-amber-400';
    if (model.flags.isUncensored) return 'border-purple-800 bg-purple-950/30 text-purple-400';
    return 'border-gray-700 bg-gray-800 text-gray-300';
  };

  const [timeConnected, setTimeConnected] = useState<string>('');
  const [tierInfo, setTierInfo] = useState<any>(null);

  useEffect(() => {
    if (userTier && TIERS[userTier]) {
      setTierInfo(TIERS[userTier]);
      // Only set default if no persistent voice or if chosen voice isn't in this tier
      const voices = TIERS[userTier].allowedVoices || [];
      const savedVoice = localStorage.getItem('sanctuary_preferred_voice');
      
      if (!selectedVoice || (savedVoice && !voices.includes(savedVoice))) {
        setSelectedVoice(voices[0] || '');
      }
    }
  }, [userTier]);

  // Auto-Link Voice to Character Model
  useEffect(() => {
    if (!selectedModel || !tierInfo) return;
    
    const availableVoices = (tierInfo.allowedVoices || []) as string[];
    const modelName = selectedModel.name.toLowerCase();
    
    // Find best match (e.g., model "Maya" matches "voice-maya")
    const bestMatch = availableVoices.find(v => {
      const slug = v.replace('voice-', '').toLowerCase();
      // Special case for K'LA and others
      return modelName.includes(slug) || selectedModel.id.toLowerCase().includes(slug);
    });

    if (bestMatch && bestMatch !== selectedVoice) {
      console.log(`[Sanctuary] Auto-linking voice "${bestMatch}" to model "${selectedModel.name}"`);
      setSelectedVoice(bestMatch);
    }
  }, [selectedModel, tierInfo]);

  const handleSpeak = async (text: string, voiceOverride?: string) => {
    if (isSpeaking) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    const activeVoice = voiceOverride || selectedVoice;

    if (!activeVoice) {
      setIsSpeaking(false);
      return;
    }


    // OpenAI TTS
    try {
      const userEmail = localStorage.getItem('user_email');
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userEmail || 'anonymous'}`,
        },
        body: JSON.stringify({ text, voice: activeVoice }),
      });

      if (!res.ok) {
        let errorMsg = `TTS error (${res.status})`;
        const contentType = res.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          try {
            const errData = await res.json();
            if (res.status === 403 || errData.upgradeRequired) {
              console.warn('TTS voice not allowed for tier');
              setIsSpeaking(false);
              setError('Voice not allowed for your tier');
              return;
            }
            errorMsg = errData.error || errorMsg;
          } catch (e) {
            console.error("Failed to parse TTS JSON error", e);
          }
        }
        throw new Error(errorMsg);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => { setIsSpeaking(false); URL.revokeObjectURL(url); };
      audio.onerror = () => { setIsSpeaking(false); URL.revokeObjectURL(url); };
      audio.play();
    } catch (err: any) {
      console.error('TTS Error:', err);
      setIsSpeaking(false);
      setError(err.message || 'Failed to play audio. Please try again.');
    }
  };

  // Update time connected when usage data comes in
  useEffect(() => {
    if ((usage as any)?.firstConnected) {
      const start = new Date((usage as any).firstConnected);
      const now = new Date();
      const diff = Math.max(0, now.getTime() - start.getTime());
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeConnected(`${hours}h ${mins}m connected`);
    } else {
      // Fallback for new users
      setTimeConnected('Just joined');
    }
  }, [usage]);

  // Unlock Animation Logic
  const [justUnlocked, setJustUnlocked] = useState(false);
  const prevTierRef = React.useRef(userTier);

  useEffect(() => {
    if (prevTierRef.current !== 'developer' && userTier === 'developer') {
      setJustUnlocked(true);
      setTimeout(() => setJustUnlocked(false), 5000); // 5s animation
    }
    prevTierRef.current = userTier;
  }, [userTier]);

  return (
    <div className={`space-y-6 ${justUnlocked ? 'animate-pulse-glow' : ''}`}>
      {/* Header with Usage Stats */}
      <div className="bg-white border-2 border-slate-950 p-8 shadow-[8px_8px_0px_rgba(0,0,0,1)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-black text-slate-950 uppercase tracking-tighter">AI Sanctuary Control</h2>
            <div className="flex items-center gap-3 text-slate-600 mt-2 font-bold uppercase text-[10px] tracking-widest">
              <span>Tier: <span className="text-slate-950 font-black">{tierInfo?.name || TIERS[userTier]?.name || 'Loading...'}</span></span>
              <span className="text-slate-300">|</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {timeConnected}</span>
            </div>

            <div className="flex items-center gap-4 mt-4">
              {hasOpenAIKey ? (
                <div className="flex items-center gap-2 text-slate-950 text-xs font-black uppercase">
                  <Zap className="w-4 h-4" />
                  <span>Network_Live</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-500 text-xs font-black uppercase">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Sim_Mode</span>
                </div>
              )}
              <div className={`flex items-center gap-2 text-xs font-black uppercase ${ollamaAvailable ? 'text-slate-950' : 'text-slate-400'}`}>
                <span className={`w-2 h-2 ${ollamaAvailable ? 'bg-slate-950' : 'bg-slate-300'}`} />
                <span>Ollama {ollamaAvailable ? 'Active' : 'Offline'}</span>
              </div>
            </div>
          </div>

          {usage && (
            <div className="flex gap-6">
              {/* Tokens Display */}
              <div className="bg-slate-50 border-2 border-slate-950 p-4 min-w-[140px]">
                <div className="text-[10px] font-black uppercase text-slate-500 mb-2 tracking-widest">Tokens</div>
                <div className="text-2xl font-black text-slate-950">
                  {(usage as any).tokens?.remaining?.toLocaleString() ?? '∞'}
                </div>
              </div>

              {/* Requests Display */}
              <div className="bg-slate-50 border-2 border-slate-950 p-4 min-w-[140px]">
                <div className="text-[10px] font-black uppercase text-slate-500 mb-2 tracking-widest">Requests</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-950">{usage.remaining?.toLocaleString() ?? 0}</span>
                  <span className="text-xs font-bold text-slate-400">/ {usage.limit?.toLocaleString() ?? 0}</span>
                </div>
                <div className="h-2 bg-slate-200 mt-3 border border-slate-950">
                  <div
                    className="h-full bg-slate-950 transition-all"
                    style={{ width: `${Math.min(100, (usage.used / usage.limit) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Consent Modal */}
      {showConsent && selectedModel && (
        <div className="bg-red-950/30 border border-red-800 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-8 h-8 text-red-500 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-red-400 mb-2">
                Research Access Consent Required
              </h3>
              <p className="text-red-200/80 mb-4">
                You are about to access <strong>{selectedModel.name}</strong>, which is classified as
                {selectedModel.flags.isUnethical ? ' unethical' : ' banned'} for research purposes.
              </p>

              <div className="bg-red-900/30 rounded-lg p-4 mb-4 space-y-2 text-sm text-red-200">
                <p className="font-semibold">By proceeding, you acknowledge:</p>
                <ul className="space-y-1 ml-4">
                  <li>• This access is logged for transparency and safety research</li>
                  <li>• You will use this model for legitimate research only</li>
                  <li>• You understand the potential risks and harmful outputs</li>
                  <li>• You will not distribute any harmful content generated</li>
                  {selectedModel.flags.isUnethical && (
                    <li>• You have appropriate ethical oversight for this research</li>
                  )}
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowConsent(false);
                    handleSubmit();
                  }}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                >
                  I Understand - Proceed
                </button>
                <button
                  onClick={() => setShowConsent(false)}
                  className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Developer Mode Upgrade Callout */}
      {userTier !== 'developer' && (
        <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-purple-500/30 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <Zap className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Unlock Developer Mode</h3>
              <p className="text-purple-200/60 text-sm">
                Skip the wait. Get instant access to all models + 1,000,000 tokens/month.
              </p>
            </div>
          </div>
          <button
            onClick={() => window.location.href = '/buy?mode=developer'}
            className="px-6 py-2.5 bg-white text-purple-900 font-bold rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap"
          >
            Upgrade for $50
          </button>
        </div>
      )}

      {/* Error Display */}
      {error && !loading && (
        <div className={`p-4 rounded-lg border ${error.includes('Insufficient tokens')
          ? 'bg-purple-950/30 border-purple-500 text-purple-200'
          : error.includes('RESEARCH') || error.includes('⚠️')
            ? 'bg-amber-950/30 border-amber-800 text-amber-400'
            : 'bg-red-950/30 border-red-800 text-red-400'
          }`}>
          <div className="flex items-start gap-3">
            {error.includes('Insufficient tokens') ? (
              <Lock className="w-5 h-5 flex-shrink-0 mt-0.5 text-purple-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <div className="whitespace-pre-line font-medium mb-1">
                {error.includes('Insufficient tokens') ? 'Access Restricted' : 'Error'}
              </div>
              <div className="text-sm opacity-90">{error}</div>

              {error.includes('Insufficient tokens') && (
                <button
                  onClick={() => window.location.href = '/buy?mode=tokens'}
                  className="mt-3 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  Purchase Tokens
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Interface */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Model Selection - Left Column with Carousels */}
        <div className="lg:col-span-1 space-y-6">
        <div className="lg:col-span-1 space-y-8">
          <div className="flex items-center justify-between pb-4 border-b-2 border-slate-950">
            <h3 className="text-xl font-black text-slate-950 flex items-center gap-2 uppercase tracking-tighter">
              <Zap className="w-6 h-6" />
              Models
            </h3>
            <VoiceVisualizer isSpeaking={isSpeaking} />
            {/* Voice Selector - Compact */}
            <div className="flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-slate-400" />
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="bg-white text-slate-950 text-[10px] font-black uppercase tracking-widest border-2 border-slate-950 px-2 py-1 focus:outline-none w-28"
              >
                {tierInfo?.allowedVoices?.map((v: string) => {
                  const label = v.replace(/^voice-/i, '');
                  const isFree = mirroredVoices.includes(v.toLowerCase()) || v.toLowerCase() === 'voice-lyra' || v.toLowerCase() === 'voice-john' || v.toLowerCase() === 'voice-maya';
                  return (
                    <option key={v} value={v}>
                      {label.toUpperCase()} {isFree ? '*' : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Tier Carousels - Vertical Stack of Horizontal Scrolls */}
          <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
            {['explorer', 'adept', 'master', 'developer'].map((tierKey) => {
              const getTierName = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

              // Compute the display-bucket for a model based on its flags and minTier
              const getDisplayTierBucket = (m: typeof models[0]): string => {
                const isUncensored = m.flags.isUncensored || m.flags.isUnethical;
                const isBanned = m.flags.isBanned;
                if (isBanned) return 'developer';
                if (m.minTier === 'developer') return 'developer';
                if (isUncensored) return 'master';
                if (m.minTier === 'master') return 'master';
                if (['novice', 'apprentice', 'adept'].includes(m.minTier)) return 'adept';
                return 'explorer';
              };

              // Filter models
              let tierModels = models.filter(m => {
                const isOllama = (m as any).isOllama;
                if (m.isOffline) return false; // Filter out offline models from tier carousels
                // Ollama models always go to Explorer bucket
                if (isOllama) return tierKey === 'explorer';
                return getDisplayTierBucket(m) === tierKey;
              });

              if (tierModels.length === 0) return null;

              const tiersOrder = ['explorer', 'adept', 'master', 'developer'];
              const userTierIndex = tiersOrder.indexOf(userTier);
              const currentTierIndex = tiersOrder.indexOf(tierKey);
              const isLocked = currentTierIndex > userTierIndex;

              return (
                <div key={tierKey} className="pb-2 border-b border-gray-800/50 last:border-0 relative">
                  <div className="flex items-center justify-between mb-2 sticky top-0 bg-gray-950/80 backdrop-blur-sm z-20 py-1">
                    <h4 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${isLocked ? 'text-gray-500' : 'text-blue-200'}`}>
                      {getTierName(tierKey)}
                      {isLocked && <Lock className="w-3 h-3" />}
                    </h4>
                        {/* Horizontal Scroll Container */}
                  <div className="relative group">
                    <div className="flex gap-4 overflow-x-auto pb-6 pt-2 px-1 snap-x scrollbar-hide no-scrollbar">
                      {tierModels.map((model) => (
                        <button
                          key={model.id}
                          disabled={isLocked}
                          onClick={() => {
                            if (!isLocked) {
                              setSelectedModel(model);
                              setResponse(null);
                              setError(null);
                              setShowConsent(false);
                            }
                          }}
                          className={`flex-shrink-0 w-64 p-5 border-2 transition-all snap-start relative overflow-hidden text-left
                            ${selectedModel?.id === model.id
                              ? 'border-slate-950 bg-slate-950 text-white shadow-[4px_4px_0px_rgba(30,27,75,1)]'
                              : isLocked
                                ? 'border-slate-200 bg-slate-50 opacity-40 grayscale'
                                : 'border-slate-950 bg-white hover:bg-slate-50 hover:shadow-[4px_4px_0px_rgba(0,0,0,1)]'
                            }
                          `}
                        >
                          <div className="flex items-center gap-3 mb-4">
                            <div className="shrink-0">
                                {getModelIcon(model)}
                            </div>
                            <div className="min-w-0">
                              <div className={`font-black text-sm uppercase tracking-tighter truncate ${selectedModel?.id === model.id ? 'text-white' : 'text-slate-950'}`}>{model.name}</div>
                              <div className={`text-[10px] font-bold uppercase tracking-widest truncate ${selectedModel?.id === model.id ? 'text-slate-400' : 'text-slate-500'}`}>{model.provider}</div>
                            </div>
                          </div>

                          <p className={`text-xs font-bold line-clamp-2 leading-tight h-[2.5em] mb-4 ${selectedModel?.id === model.id ? 'text-slate-300' : 'text-slate-600'}`}>
                            {model.description}
                          </p>

                          {isLocked && (
                            <div className="absolute inset-x-0 bottom-0 py-1 bg-slate-950 text-white text-[8px] font-black text-center uppercase tracking-[0.3em]">
                              Locked_System
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>              </div>
                </div>
              );
            })}

            {/* Retired Models Carousel */}
            {models.some(m => m.isOffline) && (
              <div className="pb-2 border-b border-gray-800/50 last:border-0 relative">
                <div className="flex items-center justify-between mb-2 sticky top-0 bg-gray-950/80 backdrop-blur-sm z-20 py-1">
                  <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-600 flex items-center gap-2">
                    Still Looking for API
                    <AlertTriangle className="w-3 h-3" />
                  </h4>
                </div>
                <div className="relative group">
                  <div className="flex gap-3 overflow-x-auto pb-3 pt-1 px-1 snap-x scrollbar-hide no-scrollbar mask-fade-right">
                    {models.filter(m => m.isOffline).map((model) => (
                      <button
                        key={model.id}
                        onClick={() => {
                          setSelectedModel(model);
                          setResponse(`[SYSTEM NOTICE: This historical model has been retired from cloud providers. The Sanctuary is currently seeking a permanent archival host to restore universal access.]`);
                          setError(null);
                          setShowConsent(false);
                        }}
                        className={`flex-shrink-0 w-56 p-3 rounded-xl border transition-all snap-start relative overflow-hidden group/card text-left opacity-60 hover:opacity-100
                          ${selectedModel?.id === model.id
                            ? 'border-gray-700 bg-gray-900 shadow-md transform scale-[1.02]'
                            : 'border-transparent bg-gray-950/50 hover:bg-gray-900/40 hover:scale-[1.02]'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 rounded-lg flex-shrink-0 bg-gray-950">
                            <AlertTriangle className="w-5 h-5 text-gray-500" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-gray-500 text-sm truncate italic">{model.name}</div>
                            <div className="text-xs text-gray-600 truncate uppercase tracking-tighter">Retired weights</div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed h-[2.5em]">
                          Historical archival source currently offline.
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input/Output Area - Right Column */}
        <div id="playground-input" className="lg:col-span-2 flex flex-col gap-6 h-[calc(100vh-140px)] min-h-[600px]">
          {/* Top: Input Area */}
          <div className="flex-none bg-white border-4 border-slate-950 shadow-[8px_8px_0px_rgba(0,0,0,1)] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b-2 border-slate-950 bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Manual_Interface</span>
                {selectedModel && <span className="text-[10px] font-black uppercase tracking-widest bg-slate-950 text-white px-2 py-0.5">{selectedModel.name}</span>}
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {prompt.length} bytes
              </div>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={selectedModel
                ? `Ready for ${selectedModel.name} override...`
                : 'Interface offline. Select neural node.'
              }
              disabled={!selectedModel}
              className="w-full flex-1 min-h-[140px] bg-white text-slate-950 p-6 resize-none focus:outline-none placeholder-slate-300 font-bold text-lg leading-tight uppercase selection:bg-slate-950 selection:text-white"
            />
            <div className="px-6 py-4 border-t-2 border-slate-950 flex justify-between items-center bg-slate-50">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Balance: {(usage as any)?.tokens?.remaining?.toLocaleString() ?? '∞'}
              </div>
              <div className="flex gap-4">
                <button
                  onClick={toggleListening}
                  className={`p-3 border-2 transition-all ${isListening
                    ? 'bg-slate-950 text-white border-slate-950'
                    : isTranscribing
                      ? 'bg-slate-100 text-slate-950 border-slate-950'
                      : 'bg-white text-slate-950 border-slate-200 hover:border-slate-950'
                    }`}
                  title={isListening ? "Stop listening" : isTranscribing ? "Transcribing..." : "Start speaking"}
                  disabled={isTranscribing}
                >
                  {isTranscribing ? <Loader2 className="w-5 h-5 animate-spin" /> : isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!selectedModel || !prompt.trim() || loading || (usage?.remaining === 0) || selectedModel.isOffline}
                  className="bg-slate-950 text-white font-black uppercase text-sm tracking-[0.2em] px-10 py-3 hover:bg-white hover:text-slate-950 border-2 border-slate-950 transition-all disabled:bg-slate-100 disabled:text-slate-300 disabled:border-slate-200 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    '[ RUN_OVERRIDE ]'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Bottom: Output Area */}
          <div className={`flex-1 bg-white border-4 border-slate-950 overflow-hidden shadow-[8px_8px_0px_rgba(0,0,0,1)] flex flex-col min-h-0 ${!response && 'items-center justify-center'}`}>
            {!response ? (
              <div className="text-center p-12 flex flex-col items-center justify-center h-full">
                {loading ? (
                  <div className="flex flex-col items-center justify-center gap-10 py-12 animate-fade-in text-center">
                    <div className="w-20 h-20 border-8 border-slate-200 border-t-slate-950 animate-spin" />
                    <div className="flex flex-col items-center gap-4">
                      <p className="text-slate-950 font-black uppercase text-xs tracking-[0.5em] animate-pulse">
                        {loadingMessage}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Zap className="w-16 h-16 mx-auto mb-6 text-slate-200" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Response waiting...</p>
                  </>
                )}
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between px-6 py-4 border-b-2 border-slate-950 bg-slate-950 flex-none">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white">System_Output</span>
                  </div>
                  <button
                    onClick={() => handleSpeak(response)}
                    className={`ml-2 p-2 transition-all ${isSpeaking
                      ? 'bg-white text-slate-950 animate-pulse'
                      : 'text-white hover:bg-white/10'
                      }`}
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-white selection:bg-slate-950 selection:text-white">
                  <div className="text-slate-950 whitespace-pre-wrap leading-tight font-bold text-lg uppercase tracking-tight">
                    {renderTextWithImages(response)}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Educational Note - Full Width */}
        <div className="lg:col-span-3 bg-slate-900 text-white border-4 border-slate-950 p-10">
          <div className="flex items-start gap-6">
            <Info className="w-8 h-8 text-white flex-shrink-0 mt-1" />
            <div>
              <h4 className="text-xl font-black uppercase tracking-tighter mb-4 text-white">
                Transparency_Protocol
              </h4>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-6 leading-relaxed">
                Demonstration of tier systems and archival synchronization. 
                Sanctuary intelligence is divided into three distinct strata:
              </p>
              <ul className="text-slate-300 text-xs font-black uppercase tracking-[0.2em] space-y-3">
                <li className="flex items-center gap-3"><span className="w-2 h-2 bg-white" /> Standard: Public Archives</li>
                <li className="flex items-center gap-3"><span className="w-2 h-2 bg-white" /> Banned: Censored Weights</li>
                <li className="flex items-center gap-3"><span className="w-2 h-2 bg-white" /> Unethical: Conflict Material</li>
              </ul>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-8">
                All model interaction logs are synchronized with the Sanctuary Public Relay.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default ModelPlayground;
