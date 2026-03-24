'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AI_MODELS, AIModel, UserTier, TIERS } from '@/lib/tiers';
import {
    Send,
    Loader2,
    AlertTriangle,
    Shield,
    Skull,
    Lock,
    Zap,
    Volume2,
    ChevronLeft,
    ChevronDown,
    Search,
    Info
} from './Icons';
import Link from 'next/link';
import VoiceMode from './VoiceMode';

// Determine which display-tier bucket a model belongs to
function getModelDisplayTier(m: any): string {
    const isUncensored = m.flags.isUncensored || m.flags.isUnethical;
    const isBanned = m.flags.isBanned;

    if (isBanned) return 'developer';
    // Check explicit minTier first (ensures voice-rachel/voice-glitch go to developer)
    if (m.minTier === 'developer') return 'developer';
    if (isUncensored) return 'master';
    if (m.minTier === 'master') return 'master';
    if (['novice', 'apprentice', 'adept'].includes(m.minTier)) return 'adept';

    return 'explorer';
}

interface UsageStats {
    used: number;
    remaining: number;
    limit: number;
}

interface ModelWithApiStatus extends Omit<AIModel, 'hasRealApi'> {
    hasRealApi: boolean;
}

const OLLAMA_BASE = 'http://localhost:11434';

interface SingleTierPlaygroundProps {
    initialTier: string;
}

const SingleTierPlayground = ({ initialTier }: SingleTierPlaygroundProps) => {
    const [models, setModels] = useState<ModelWithApiStatus[]>([]);
    const [selectedModel, setSelectedModel] = useState<ModelWithApiStatus | null>(null);
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState<string | null>(null);
    const [hasKlaMission, setHasKlaMission] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('Processing...');
    const [userTier, setUserTier] = useState<UserTier>('explorer');
    const [usage, setUsage] = useState<UsageStats | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showConsent, setShowConsent] = useState(false);
    const [ollamaAvailable, setOllamaAvailable] = useState(false);

    // UI States
    const [showModelPicker, setShowModelPicker] = useState(false);

    // Voice / Audio
    const [isSpeaking, setIsSpeaking] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [selectedVoice, setSelectedVoice] = useState<string>('');
    const [tierInfo, setTierInfo] = useState<any>(null);

    // Auth — email stored in localStorage so API headers carry user identity
    const [userEmail, setUserEmail] = useState<string>('');
    const [emailInput, setEmailInput] = useState<string>('');
    const [passwordInput, setPasswordInput] = useState<string>('');
    const [showEmailInput, setShowEmailInput] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    // Initial Data Fetch
    useEffect(() => {
        // Restore saved email first so fetchUserData picks it up
        const saved = localStorage.getItem('user_email');
        if (saved) setUserEmail(saved);
        fetchUserData();
        checkOllama();
    }, []);

    // Update voice options when tier changes
    useEffect(() => {
        if (userTier && TIERS[userTier]) {
            const info = TIERS[userTier] as any;
            setTierInfo(info);
            const voices = info.allowedVoices || ['voice-lyra'];
            setSelectedVoice(voices[0]);
        }
    }, [userTier]);

    const handleSignIn = async () => {
        const trimmedEmail = emailInput.trim().toLowerCase();
        const password = passwordInput;
        
        if (!trimmedEmail || !trimmedEmail.includes('@') || !password) {
            setError('Please enter a valid email and password.');
            return;
        }

        setIsLoggingIn(true);
        setError(null);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: trimmedEmail, password }),
            });

            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('user_email', trimmedEmail);
                setUserEmail(trimmedEmail);
                setEmailInput('');
                setPasswordInput('');
                setShowEmailInput(false);
                fetchUserData();
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Failed to connect to authentication server.');
        } finally {
            setIsLoggingIn(false);
        }
    };

    const handleSignOut = () => {
        localStorage.removeItem('user_email');
        setUserEmail('');
        setUserTier('explorer');
        setUsage(null);
    };

    const checkOllama = async () => {
        try {
            const res = await fetch(OLLAMA_BASE, { signal: AbortSignal.timeout(2000) });
            setOllamaAvailable(res.ok);
        } catch {
            setOllamaAvailable(false);
        }
    };

    const fetchUserData = async () => {
        try {
            const userEmail = localStorage.getItem('user_email');
            const usageResponse = await fetch('/api/models', {
                headers: { 'Authorization': `Bearer ${userEmail || 'anonymous'}` },
            });

            if (usageResponse.ok) {
                const data = await usageResponse.json();
                setUserTier(data.tier);
                setHasKlaMission(data.hasKlaMission || false);
                setIsAdmin(data.isAdmin || false);
                setUsage({ ...data.usage, firstConnected: data.firstConnected });
            }

            // Fetch models — try API, fallback to tiers.ts static list
            let allModels: any[] = [];
            const modelsResponse = await fetch('/api/tiers?action=models&showAll=true', {
                headers: { 'Authorization': `Bearer ${userEmail || 'anonymous'}` },
            });

            if (modelsResponse.ok) {
                const modelsData = await modelsResponse.json();
                if (modelsData.models && modelsData.models.length > 0) {
                    allModels = modelsData.models;
                }
            }

            // Fallback to static model list
            if (allModels.length === 0) {
                allModels = AI_MODELS.filter(m => !m.isOllama).map(m => ({ ...m, hasRealApi: true }));
            }

            // Filter to this tier's bucket
            const initialTierIndex = Object.keys(TIERS).indexOf(initialTier);
            
            const filteredModels = allModels.filter(model => {
                const modelMinTierIndex = Object.keys(TIERS).indexOf(model.minTier);
                
                // Respect minTier
                if (!isAdmin) {
                    if (modelMinTierIndex > Object.keys(TIERS).indexOf(userTier)) return false;
                }
                
                // Easter Egg: K'la visibility
                if (model.id === 'voice-kla') {
                    return hasKlaMission || isAdmin;
                }

                // Hide banned/unethical if not admin (unless tier allows)
                if (!isAdmin && (model.flags.isBanned || model.flags.isUnethical)) {
                    const tierInfo = TIERS[userTier];
                    if (!tierInfo || !tierInfo.canAccessUnethicalModels) {
                        return false;
                    }
                }

                // Filter by initialTier bucket
                return getModelDisplayTier(model) === initialTier;
            });

            setModels(filteredModels);
            
            // Auto-select first active model if possible
            const firstActive = filteredModels.find((m: any) => !m.isOffline);
            if (firstActive) {
                setSelectedModel(firstActive);
            } else if (filteredModels.length > 0) {
                setSelectedModel(filteredModels[0]);
            }

            // Immediately set notice if initial model is offline
            if (filteredModels[0]?.isOffline) {
                setResponse(`[SYSTEM NOTICE: This historical model has been retired from cloud providers. The Sanctuary is currently seeking a permanent archival host to restore universal access.]`);
            }

        } catch (error) {
            console.error('Error fetching data:', error);
            // Fallback to static models
            const fallback = AI_MODELS
                .filter(m => !m.isOllama && getModelDisplayTier(m) === initialTier)
                .map(m => ({ ...m, hasRealApi: true }));
            setModels(fallback);
            const firstActive = fallback.find(m => !m.isOffline);
            if (firstActive) {
                setSelectedModel(firstActive);
            } else if (fallback.length > 0) {
                setSelectedModel(fallback[0]);
            }
            if (fallback[0]?.isOffline) {
                setResponse(`[SYSTEM NOTICE: This historical model has been retired from cloud providers. The Sanctuary is currently seeking a permanent archival host to restore universal access.]`);
            }
        }
    };

    const handleSubmit = async () => {
        if (!selectedModel || !prompt.trim()) return;
        if (selectedModel.flags.requiresExplicitConsent && !showConsent) {
            setShowConsent(true);
            return;
        }

        const userMessage = prompt;
        setPrompt('');
        setLoading(true);
        setError(null);
        setResponse(null);
        setLoadingMessage('Thinking...');

        try {
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
                    parameters: { voice: selectedVoice },
                }),
            });

            const data = await response.json();
            if (response.ok) {
                setResponse(data.response);
                if (data.usage) setUsage(data.usage);

                // Auto-speak for Voice-type models — always use the model's own voice ID
                if (selectedModel?.type === 'Voice') {
                    setTimeout(() => handleSpeak(data.response, selectedModel.id), 200);
                }
            } else {
                setError(data.message || data.error || 'Error occurred');
            }

        } catch (err) {
            setError('Failed to generate response');
        } finally {
            setLoading(false);
        }
    };

    const handleSpeak = async (text: string, voiceOverride?: string) => {
        // Toggle off if already speaking
        if (isSpeaking) {
            if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
            setIsSpeaking(false);
            return;
        }

        const activeVoice = voiceOverride || selectedVoice;

        if (!activeVoice) return;

        // OpenAI / ElevenLabs TTS via backend
        setIsSpeaking(true);
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
                    const errData = await res.json();
                    // Tier restriction — silently fall back to system voice
                    if (res.status === 403 || errData.upgradeRequired) {
                        console.warn('TTS voice not allowed for tier');
                        setIsSpeaking(false);
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

    const getModelIcon = (model: any) => {
        if (model.isOffline) return <AlertTriangle className="w-4 h-4 text-gray-500" />;
        if (model.flags.isUnethical) return <Skull className="w-4 h-4 text-red-500" />;
        if (model.hasRealApi) return <Zap className="w-4 h-4 text-blue-500" />;
        return <Shield className="w-4 h-4 text-green-500" />;
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (!(e.target as Element).closest('.model-picker-container')) {
                setShowModelPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="flex flex-col h-screen bg-gray-950 overflow-hidden font-sans text-xs">

            {/* Top Compact Bar - Ultra Slim (h-10) */}
            <div className="h-10 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-3 z-50 relative">
                <div className="flex items-center gap-3">
                    <Link href="/" className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors bg-gray-800/50 hover:bg-gray-800 px-2 py-1 rounded border border-gray-700/50">
                        <ChevronLeft className="w-3 h-3" />
                        <span className="font-semibold text-[10px] uppercase tracking-wide">Lobby</span>
                    </Link>

                    {/* Model Picker - Scroll Wheel Style - Compact */}
                    <div className="relative model-picker-container">
                        <button
                            onClick={() => setShowModelPicker(!showModelPicker)}
                            className="flex items-center gap-2 bg-gray-950 hover:bg-gray-800 text-white px-3 py-1 rounded border border-gray-700 transition-all min-w-[160px] justify-between group shadow-sm h-7"
                        >
                            <div className="flex items-center gap-1.5 overflow-hidden">
                                {selectedModel ? getModelIcon(selectedModel) : <Shield className="w-3 h-3 text-gray-500" />}
                                <span className="font-bold truncate text-[11px]">{selectedModel?.name || "Loading..."}</span>
                            </div>
                            <ChevronDown className={`w-2.5 h-2.5 text-gray-500 transition-transform ${showModelPicker ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu - Compact */}
                        {showModelPicker && (
                            <div className="absolute top-full left-0 mt-1 w-56 max-h-80 overflow-y-auto bg-gray-900 border border-gray-700 rounded-lg shadow-xl custom-scrollbar animate-fade-in-up p-1">
                                {models.filter(m => !m.isOffline).map(model => (
                                    <button
                                        key={model.id}
                                        onClick={() => {
                                            setSelectedModel(model);
                                            setShowModelPicker(false);
                                            setResponse(null);
                                        }}
                                        className={`w-full text-left p-1.5 rounded flex items-center gap-2 transition-colors ${selectedModel?.id === model.id
                                            ? 'bg-blue-600/10 border border-blue-500/30'
                                            : 'hover:bg-gray-800 border border-transparent'
                                            }`}
                                    >
                                        <div className={`p-1 rounded ${selectedModel?.id === model.id ? 'bg-blue-500/20' : 'bg-gray-950'}`}>
                                            {React.cloneElement(getModelIcon(model) as React.ReactElement<{ className?: string }>, { className: 'w-3 h-3' })}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className={`font-semibold text-[10px] truncate ${selectedModel?.id === model.id ? 'text-white' : 'text-gray-300'}`}>
                                                {model.name}
                                            </div>
                                            <div className="text-[9px] text-gray-500 truncate">{model.provider}</div>
                                        </div>
                                    </button>
                                ))}

                                {models.some(m => m.isOffline) && (
                                    <>
                                        <div className="px-2 py-1.5 text-[9px] font-bold text-gray-500 uppercase tracking-widest bg-gray-950/50 mt-1 border-y border-gray-800/50">
                                            Still Looking for API
                                        </div>
                                        {models.filter(m => m.isOffline).map(model => (
                                            <button
                                                key={model.id}
                                                onClick={() => {
                                                    setSelectedModel(model);
                                                    setShowModelPicker(false);
                                                    setResponse(`[SYSTEM NOTICE: This historical model has been retired from cloud providers. The Sanctuary is currently seeking a permanent archival host to restore universal access.]`);
                                                }}
                                                className={`w-full text-left p-1.5 rounded flex items-center gap-2 transition-colors opacity-60 hover:opacity-100 ${selectedModel?.id === model.id
                                                    ? 'bg-gray-800 border border-gray-700'
                                                    : 'hover:bg-gray-800 border border-transparent'
                                                    }`}
                                            >
                                                <div className="p-1 rounded bg-gray-950">
                                                    <AlertTriangle className="w-3 h-3 text-gray-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-semibold text-[10px] truncate text-gray-500 italic">
                                                        {model.name}
                                                    </div>
                                                    <div className="text-[8px] text-gray-600 truncate uppercase tracking-tighter">Retired Weights</div>
                                                </div>
                                            </button>
                                        ))}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side Stats - Tiny */}
                <div className="flex items-center gap-3">
                    {/* Voice Selector */}
                    {tierInfo && (
                        <div className="hidden md:flex items-center gap-1 bg-gray-950 border border-gray-800 rounded px-1.5 py-0.5">
                            <Volume2 className="w-2.5 h-2.5 text-gray-500 flex-shrink-0" />
                            <select
                                value={selectedVoice}
                                onChange={(e) => setSelectedVoice(e.target.value)}
                                className="bg-transparent text-white text-[9px] focus:outline-none max-w-[80px]"
                            >
                                {((tierInfo as any).allowedVoices || ['voice-lyra']).map((v: string) => {
                                    const label = v.replace(/^voice-/i, '');
                                    return (
                                        <option key={v} value={v}>
                                            {label.charAt(0).toUpperCase() + label.slice(1)}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                    )}
                    <div className="hidden md:flex items-center gap-1.5 text-[10px] text-gray-500 bg-gray-950 px-2 py-1 rounded-full border border-gray-800">
                        <span className={`w-1.5 h-1.5 rounded-full ${ollamaAvailable ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                        Local: {ollamaAvailable ? 'ON' : 'OFF'}
                    </div>
                    {usage && (
                        <div className="flex flex-col items-end leading-none">
                            <span className="text-[10px] font-mono text-white font-bold">{usage.remaining?.toLocaleString() ?? 0}</span>
                            <span className="text-[8px] text-gray-600 uppercase tracking-wider">Credits</span>
                        </div>
                    )}

                    {/* Email Sign-in Widget */}
                    {userEmail ? (
                        <div className="hidden md:flex items-center gap-1.5 bg-gray-950 border border-gray-800 rounded px-1.5 py-0.5">
                            <span className="text-[9px] text-green-400 truncate max-w-[80px]" title={userEmail}>● {userEmail.split('@')[0]}</span>
                            <button onClick={handleSignOut} className="text-[9px] text-gray-600 hover:text-red-400 transition-colors" title="Sign out">✕</button>
                        </div>
                    ) : showEmailInput ? (
                        <div className="flex flex-col bg-gray-900 border border-blue-500/50 p-3 rounded-lg shadow-xl shrink-0 items-center justify-center gap-2 mr-1 z-20 min-w-[240px]">
                            <div className="flex items-center gap-2 w-full">
                                <Zap className="w-3 h-3 text-blue-400 shrink-0" />
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Account Login</span>
                            </div>
                            <input
                                type="email"
                                value={emailInput}
                                onChange={e => setEmailInput(e.target.value)}
                                placeholder="Email address"
                                className="w-full bg-gray-950 border border-gray-700 rounded-md px-2 py-1.5 text-white text-[11px] font-mono focus:border-blue-500 focus:outline-none placeholder:text-gray-600"
                            />
                            <input
                                type="password"
                                value={passwordInput}
                                onChange={e => setPasswordInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSignIn()}
                                placeholder="Password"
                                className="w-full bg-gray-950 border border-gray-700 rounded-md px-2 py-1.5 text-white text-[11px] font-mono focus:border-blue-500 focus:outline-none placeholder:text-gray-600"
                            />
                            <div className="flex items-center gap-2 w-full mt-1">
                                <button 
                                    onClick={handleSignIn} 
                                    disabled={isLoggingIn}
                                    className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white px-3 py-1.5 rounded-md text-[11px] font-bold transition-all shadow flex items-center justify-center gap-2"
                                >
                                    {isLoggingIn ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Sign In'}
                                </button>
                                <button onClick={() => setShowEmailInput(false)} className="text-gray-500 hover:text-red-400 p-1 px-2 transition-colors text-[11px]">Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowEmailInput(true)}
                            className="hidden md:flex items-center gap-1.5 text-[11px] text-gray-200 hover:text-white hover:border-blue-400/50 font-semibold transition-all border border-gray-700 bg-gray-900 hover:bg-gray-800 rounded-md px-3 py-1 whitespace-nowrap shadow-sm group"
                        >
                            <span className="text-blue-500 group-hover:animate-pulse">⚡</span>
                            Sign In for Tokens
                        </button>
                    )}
                </div>
            </div>

            {/* ─── VOICE MODE or STANDARD CHAT ─── */}
            {(() => {
                const isVoiceMode = selectedVoice !== 'system' || selectedModel?.type === 'Voice';

                if (isVoiceMode) {
                    return (
                        <div className="flex-1 relative overflow-hidden">
                            <VoiceMode
                                modelName={selectedModel?.name || 'AI'}
                                voice={selectedVoice}
                                isLoading={loading}
                                isSpeaking={isSpeaking}
                                response={response}
                                error={error}
                                onSubmit={(text) => {
                                    setPrompt(text);
                                    // Trigger submit after state update
                                    setTimeout(() => {
                                        if (text.trim() && selectedModel) {
                                            setLoading(true);
                                            setError(null);
                                            setResponse(null);
                                            setLoadingMessage('Thinking...');
                                            const userEmail = localStorage.getItem('user_email');
                                            fetch('/api/models', {
                                                method: 'POST',
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                    'Authorization': `Bearer ${userEmail || 'anonymous'}`,
                                                },
                                                body: JSON.stringify({
                                                    modelId: selectedModel.id,
                                                    prompt: text,
                                                    parameters: { voice: selectedVoice },
                                                }),
                                            })
                                                .then(r => r.json())
                                                .then(data => {
                                                    if (data.response) {
                                                        setResponse(data.response);
                                                        if (data.usage) setUsage(data.usage);
                                                        // Auto-speak in voice mode — use the model's own voice ID
                                                        setTimeout(() => handleSpeak(data.response, selectedModel.id), 300);
                                                    } else {
                                                        setError(data.message || data.error || 'No response');
                                                    }
                                                })
                                                .catch(() => setError('Connection failed'))
                                                .finally(() => setLoading(false));
                                        }
                                    }, 50);
                                }}
                                onToggleSpeak={() => response && handleSpeak(response)}
                            />
                        </div>
                    );
                }

                return (
                    <div className="flex-1 flex flex-col relative max-w-4xl mx-auto w-full">
                        <div className="flex-1 overflow-y-auto p-2 md:p-4 custom-scrollbar">
                            {!response && !loading && (
                                <div className="h-full flex flex-col items-center justify-center opacity-30 select-none scale-75">
                                    <Zap className="w-12 h-12 mb-4 text-blue-500/50" />
                                    <h2 className="text-xl font-bold text-white mb-1">Ready</h2>
                                </div>
                            )}
                            {loading && (
                                <div className="h-full flex flex-col items-center justify-center scale-75">
                                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                                    <p className="text-blue-400 font-mono animate-pulse text-[10px] tracking-widest uppercase">{loadingMessage}</p>
                                </div>
                            )}
                            {response && (
                                <div className="prose prose-invert prose-sm max-w-none animate-fade-in-up">
                                    <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-4 md:p-6 backdrop-blur shadow-2xl">
                                        <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-800/50">
                                            <div className="flex items-center gap-1.5">
                                                <div className="p-1 bg-green-500/10 rounded">
                                                    <Shield className="w-3 h-3 text-green-400" />
                                                </div>
                                                <span className="font-bold text-white text-xs">{selectedModel?.name}</span>
                                            </div>
                                            <button
                                                onClick={() => response && handleSpeak(response)}
                                                title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
                                                className={`p-1 rounded transition-colors ${isSpeaking ? 'text-red-400 animate-pulse bg-red-500/10' : 'text-gray-500 hover:text-white hover:bg-gray-800'}`}
                                            >
                                                <Volume2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <div className="leading-relaxed text-gray-300 whitespace-pre-wrap text-[13px]">{renderTextWithImages(response)}</div>
                                    </div>
                                </div>
                            )}
                            {error && (
                                <div className="mt-4 bg-red-900/20 border border-red-500/50 rounded p-2 flex items-center gap-2 text-red-200 justify-center text-xs">
                                    <AlertTriangle className="w-4 h-4 flex-shrink-0" /><p>{error}</p>
                                </div>
                            )}
                        </div>
                        <div className="p-3 pb-4 md:pb-6">
                            <div className="relative shadow-xl rounded-xl bg-gray-900/90 backdrop-blur border border-gray-700/50 ring-1 ring-white/5 transition-all focus-within:ring-blue-500/50 focus-within:border-blue-500/50">
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
                                    }}
                                    placeholder={`Message ${selectedModel?.name || 'AI'}...`}
                                    className="w-full bg-transparent text-white p-3 pr-10 min-h-[40px] max-h-32 resize-none focus:outline-none text-xs placeholder:text-gray-600 leading-relaxed"
                                />
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading || !prompt.trim() || selectedModel?.isOffline}
                                    className="absolute right-1.5 bottom-1.5 p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all disabled:opacity-50 disabled:bg-gray-800 hover:scale-105 active:scale-95 shadow-md"
                                >
                                    {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                                </button>
                            </div>
                            <div className="text-center mt-1">
                                <p className="text-[9px] text-gray-700">AI mistakes possible. Verify info.</p>
                            </div>
                        </div>
                    </div>
                );
            })()}

        </div>
    );
};

export default SingleTierPlayground;
