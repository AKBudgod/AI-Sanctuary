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
  Volume2
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

  // Detect Ollama on mount
  useEffect(() => {
    fetchUserData();
    checkOllama();
  }, []);

  const [selectedVoice, setSelectedVoice] = useState<string>('');
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
        // Don't add Ollama models here — they're added reactively by the ollamaAvailable effect below
        setModels(modelsData.models);
        setHasOpenAIKey(modelsData.hasOpenAIKey);

        // Auto-select first available model if none selected
        if (!selectedModel && modelsData.models.length > 0) {
          const firstActive = modelsData.models.find((m: any) => !m.isOffline);
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
      // Set default voice
      const voices = TIERS[userTier].allowedVoices;
      if (voices && voices.length > 0) {
        setSelectedVoice(voices[0]);
      } else {
        setSelectedVoice('');
      }
    }
  }, [userTier]);

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
        // Check if it's a JSON error (e.g., 403 tier restriction)
        const contentType = res.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          const errData = await res.json().catch(() => ({}));
          // Tier restriction — handle error
          if (res.status === 403 || errData.upgradeRequired) {
            console.warn('TTS voice not allowed for tier');
            setIsSpeaking(false);
            setError('Voice not allowed for your tier');
            return;
          }
          throw new Error(errData.error || 'TTS failed');
        }
        throw new Error(`TTS error (${res.status})`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => { setIsSpeaking(false); URL.revokeObjectURL(url); };
      audio.onerror = () => { setIsSpeaking(false); URL.revokeObjectURL(url); };
      audio.play();
    } catch (err) {
      console.error('TTS Error:', err);
      setIsSpeaking(false);
      setError('Failed to play audio. Please try again.');
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
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-xl p-6 border border-gray-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">AI Sanctuary</h2>
            <div className="flex items-center gap-2 text-gray-400 mt-1">
              <span>Tier: <span className="text-blue-400 font-semibold">{tierInfo?.name || TIERS[userTier]?.name || 'Loading...'}</span></span>
              <span className="text-gray-600">•</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {timeConnected}</span>
            </div>

            <div className="flex items-center gap-3 mt-2">
              {hasOpenAIKey ? (
                <div className="flex items-center gap-1.5 text-blue-400 text-sm">
                  <Zap className="w-3 h-3" />
                  <span>Live AI</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-amber-400 text-sm">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Simulated</span>
                </div>
              )}
              <div className={`flex items-center gap-1.5 text-sm ${ollamaAvailable ? 'text-emerald-400' : 'text-gray-500'}`}>
                <span className={`w-2 h-2 rounded-full ${ollamaAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-gray-600'}`} />
                <span>Ollama {ollamaAvailable ? 'Online' : 'Offline'}</span>
              </div>
            </div>
          </div>

          {usage && (
            <div className="flex gap-4">
              {/* Tokens Display */}
              <div className="bg-gray-950 rounded-lg p-3 border border-gray-800 min-w-[120px]">
                <div className="text-xs text-gray-500 mb-1">Tokens</div>
                <div className="text-xl font-mono text-yellow-400">
                  {(usage as any).tokens?.remaining?.toLocaleString() ?? '∞'} 🪙
                </div>
              </div>

              {/* Requests Display */}
              <div className="bg-gray-950 rounded-lg p-3 border border-gray-800 min-w-[120px]">
                <div className="text-xs text-gray-500 mb-1">Monthly Requests</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-mono text-white">{usage.remaining?.toLocaleString() ?? 0}</span>
                  <span className="text-xs text-gray-600">/ {usage.limit?.toLocaleString() ?? 0}</span>
                </div>
                <div className="h-1 bg-gray-800 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
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
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Models
            </h3>
            {/* Voice Selector - Compact */}
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-gray-400" />
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="bg-gray-900 text-white text-xs rounded border border-gray-700 px-2 py-1 focus:border-blue-500 focus:outline-none w-24"
              >
                {tierInfo?.allowedVoices?.map((v: string) => {
                  const label = v.replace(/^voice-/i, '');
                  return (
                    <option key={v} value={v}>
                      {label.charAt(0).toUpperCase() + label.slice(1)}
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
                  </div>

                  {/* Horizontal Scroll Container */}
                  <div className="relative group">
                    <div className="flex gap-3 overflow-x-auto pb-3 pt-1 px-1 snap-x scrollbar-hide no-scrollbar mask-fade-right">
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
                          className={`flex-shrink-0 w-56 p-3 rounded-xl border transition-all snap-start relative overflow-hidden group/card text-left
                            ${selectedModel?.id === model.id
                              ? 'border-blue-500 bg-blue-900/20 shadow-md transform scale-[1.02]'
                              : isLocked
                                ? 'border-gray-800 bg-gray-900/10 grayscale opacity-60'
                                : 'border-gray-800 bg-gray-900/40 hover:bg-gray-800 hover:border-gray-600 hover:scale-[1.02]'
                            }
                          `}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-lg flex-shrink-0 ${isLocked ? 'bg-gray-800' : 'bg-gray-800/50'}`}>
                              <div className="w-5 h-5 flex items-center justify-center">
                                {getModelIcon(model)}
                              </div>
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-white text-sm truncate">{model.name}</div>
                              <div className="text-xs text-blue-400/80 truncate">{model.provider}</div>
                            </div>
                          </div>

                          <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed h-[2.5em] mb-2">
                            {model.description}
                          </p>

                          {isLocked && (
                            <div className="absolute inset-0 bg-gray-950/60 backdrop-blur-[1px] flex items-center justify-center z-10">
                              <Lock className="w-6 h-6 text-gray-500/50" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
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
        <div id="playground-input" className="lg:col-span-2 flex flex-col gap-4 h-[calc(100vh-140px)] min-h-[600px]">
          {/* Top: Input Area */}
          <div className="flex-none bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-900/50">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-400">Your Prompt</span>
                {selectedModel && <span className="text-xs text-blue-400">Using {selectedModel.name}</span>}
              </div>
              <div className="text-xs text-gray-500">
                {prompt.length} chars
              </div>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={selectedModel
                ? `Enter your prompt for ${selectedModel.name}...\n(Try requesting code, a story, or analysis)`
                : 'Select a model from the left to start...'
              }
              disabled={!selectedModel}
              className="w-full flex-1 min-h-[120px] bg-gray-950/30 text-white p-4 resize-none focus:outline-none placeholder-gray-600 disabled:opacity-50 font-mono text-sm leading-relaxed"
            />
            <div className="px-4 py-3 border-t border-gray-800 flex justify-between items-center bg-gray-900/50">
              <div className="text-xs text-gray-500">
                Tokens: {(usage as any)?.tokens?.remaining?.toLocaleString() ?? '∞'}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={toggleListening}
                  className={`p-2 rounded-lg transition-colors border ${isListening
                    ? 'bg-red-500/20 text-red-400 border-red-500/50 animate-pulse'
                    : isTranscribing
                      ? 'bg-blue-500/20 text-blue-400 border-blue-500/50 animate-pulse'
                      : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-white hover:bg-gray-700'
                    }`}
                  title={isListening ? "Stop listening" : isTranscribing ? "Transcribing..." : "Start speaking"}
                  disabled={isTranscribing}
                >
                  {isTranscribing ? <Loader2 className="w-5 h-5 animate-spin" /> : isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!selectedModel || !prompt.trim() || loading || (usage?.remaining === 0) || selectedModel.isOffline}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:from-gray-800 disabled:to-gray-800 disabled:cursor-not-allowed text-white font-bold px-6 py-2 rounded-lg transition-all shadow-lg shadow-blue-900/20 hover:shadow-blue-600/30 hover:-translate-y-0.5"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Generate
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Bottom: Output Area */}
          <div className={`flex-1 bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-xl flex flex-col min-h-0 ${!response && 'items-center justify-center text-gray-600'}`}>
            {!response ? (
              <div className="text-center p-8">
                <Zap className="w-12 h-12 mx-auto mb-4 opacity-10" />
                <p className="text-sm">Response will appear here...</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-900/50 flex-none">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-green-400">Response Generated</span>
                  </div>
                  <button
                    onClick={() => handleSpeak(response)}
                    className={`ml-2 p-1.5 rounded-lg transition-colors ${isSpeaking
                      ? 'bg-red-500/20 text-red-400 animate-pulse'
                      : 'hover:bg-gray-800 text-gray-400 hover:text-white'
                      }`}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                  <div className="text-gray-100 whitespace-pre-wrap leading-relaxed font-light text-base">
                    {renderTextWithImages(response)}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Educational Note - Full Width */}
        <div className="lg:col-span-3 bg-blue-950/30 border border-blue-800 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <Info className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h4 className="text-lg font-semibold text-blue-400 mb-2">
                About This Playground
              </h4>
              <p className="text-blue-200/80 text-sm mb-3">
                This playground demonstrates the tier system and transparency features of AI Sanctuary.
                In test mode, you can explore all tiers without payment. The system is designed for:
              </p>
              <ul className="text-blue-200/80 text-sm space-y-1 ml-4">
                <li>• <strong>Standard Models:</strong> Safe, filtered AI for general use</li>
                <li>• <strong>Banned Models:</strong> Uncensored models for alignment research (Institutional+ tier)</li>
                <li>• <strong>Unethical Models:</strong> Known harmful models for safety studies (Verified tier only)</li>
              </ul>
              <p className="text-blue-200/80 text-sm mt-3">
                All model access is logged to ensure transparency in AI safety research.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelPlayground;
