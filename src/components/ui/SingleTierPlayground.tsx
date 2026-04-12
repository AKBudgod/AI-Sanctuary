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
    const [selectedVoice, setSelectedVoice] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('sanctuary_preferred_voice') || '';
        }
        return '';
    });
    const [tierInfo, setTierInfo] = useState<any>(null);

    // Auth — email stored in localStorage so API headers carry user identity
    const [userEmail, setUserEmail] = useState<string>('');
    const [emailInput, setEmailInput] = useState<string>('');
    const [passwordInput, setPasswordInput] = useState<string>('');
    const [showEmailInput, setShowEmailInput] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [mirroredVoices, setMirroredVoices] = useState<string[]>([]);

    // Persistence: Save voice choice
    useEffect(() => {
        if (selectedVoice) {
            localStorage.setItem('sanctuary_preferred_voice', selectedVoice);
        }
    }, [selectedVoice]);

    // Initial Data Fetch
    useEffect(() => {
        // Restore saved email first so fetchUserData picks it up
        const saved = localStorage.getItem('user_email');
        if (saved) setUserEmail(saved);
        fetchUserData();
        checkOllama();
        fetchMirroredVoices();
    }, []);

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

    // Update voice options when tier changes
    useEffect(() => {
        if (userTier && TIERS[userTier]) {
            const info = TIERS[userTier] as any;
            setTierInfo(info);
            const voices = info.allowedVoices || ['voice-lyra'];
            
            // Only set default if no persistent voice or if chosen voice isn't in this tier
            const savedVoice = localStorage.getItem('sanctuary_preferred_voice');
            if (!selectedVoice || (savedVoice && !voices.includes(savedVoice))) {
                setSelectedVoice(voices[0]);
            }
        }
    }, [userTier]);

    // Auto-Link Voice to Character Model
    useEffect(() => {
        if (!selectedModel || !tierInfo) return;
        
        const availableVoices = tierInfo.allowedVoices || [];
        const modelName = selectedModel.name.toLowerCase();
        
        // Find best match (e.g., model "Maya" matches "voice-maya")
        const bestMatch = availableVoices.find(v => {
            const slug = v.replace('voice-', '').toLowerCase();
            return modelName.includes(slug) || selectedModel.id.includes(slug);
        });

        if (bestMatch && bestMatch !== selectedVoice) {
            console.log(`[Sanctuary] Auto-linking voice "${bestMatch}" to model "${selectedModel.name}"`);
            setSelectedVoice(bestMatch);
        }
    }, [selectedModel, tierInfo]);

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

        // OpenAI / Neural (Free) TTS via backend
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
                let errorMsg = `TTS error (${res.status})`;
                const contentType = res.headers.get('content-type');
                if (contentType?.includes('application/json')) {
                    try {
                        const errData = await res.json();
                        if (res.status === 403 || errData.upgradeRequired) {
                            console.warn('TTS voice not allowed for tier');
                            setIsSpeaking(false);
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
        <div className="flex flex-col h-screen bg-white overflow-hidden font-sans text-xs">
 
            {/* Top Compact Bar - Ultra Slim (h-12) */}
            <div className="h-12 bg-white border-b-2 border-slate-950 flex items-center justify-between px-4 z-50 relative pointer-events-auto">
                <div className="flex items-center gap-4">
                    <Link href="/" className="flex items-center gap-2 text-slate-950 bg-white border-2 border-slate-950 px-3 py-1 font-black uppercase text-[10px] tracking-widest hover:bg-slate-950 hover:text-white transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:shadow-none translate-y-[-1px]">
                        <ChevronLeft className="w-3 h-3" />
                        <span>Lobby</span>
                    </Link>
                    {/* Model Picker - Scroll Wheel Style - Compact */}
                    <div className="relative model-picker-container">
                        <button
                            onClick={() => setShowModelPicker(!showModelPicker)}
                            className="flex items-center gap-3 bg-white border-2 border-slate-950 text-slate-950 px-4 py-1 transition-all min-w-[200px] justify-between shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:shadow-none translate-y-[-1px] h-8"
                        >
                            <div className="flex items-center gap-2 overflow-hidden">
                                {selectedModel ? getModelIcon(selectedModel) : <Shield className="w-3 h-3 text-slate-400" />}
                                <span className="font-black truncate text-[10px] uppercase tracking-widest">{selectedModel?.name || "Initializing..."}</span>
                            </div>
                            <ChevronDown className={`w-3 h-3 text-slate-950 transition-transform ${showModelPicker ? 'rotate-180' : ''}`} />
                        </button>
 
                        {/* Dropdown Menu - Compact */}
                        {showModelPicker && (
                            <div className="absolute top-full left-0 mt-2 w-64 max-h-80 overflow-y-auto bg-white border-2 border-slate-950 shadow-[4px_4px_0px_rgba(0,0,0,1)] custom-scrollbar z-50 p-1"> p-1">
                                    <button
                                        key={model.id}
                                        onClick={() => {
                                            setSelectedModel(model);
                                            setShowModelPicker(false);
                                            setResponse(null);
                                        }}
                                        className={`w-full text-left p-2 flex items-center gap-3 transition-colors ${selectedModel?.id === model.id
                                            ? 'bg-slate-950 text-white'
                                            : 'hover:bg-slate-50 text-slate-950'
                                            }`}
                                    >
                                        <div className="shrink-0">
                                            {getModelIcon(model)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-black text-[10px] truncate uppercase tracking-widest">
                                                {model.name}
                                            </div>
                                            <div className={`text-[8px] font-bold uppercase tracking-tight ${selectedModel?.id === model.id ? 'text-slate-400' : 'text-slate-500'}`}>{model.provider}</div>
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
                </di                {/* Right Side Stats - Tiny */}
                <div className="flex items-center gap-4">
                    {/* Voice Selector */}
                    {tierInfo && (
                        <div className="hidden md:flex items-center gap-2 bg-white border-2 border-slate-950 px-2 py-0.5 shadow-[2px_2px_0px_rgba(0,0,0,1)] translate-y-[-1px]">
                            <Volume2 className="w-3 h-3 text-slate-950 flex-shrink-0" />
                            <select
                                id="voice-selector"
                                name="voiceSelector"
                                value={selectedVoice}
                                onChange={(e) => setSelectedVoice(e.target.value)}
                                className="bg-transparent text-slate-950 text-[9px] font-black uppercase tracking-widest focus:outline-none max-w-[100px]"
                            >
                                {((tierInfo as any).allowedVoices || ['voice-lyra']).map((v: string) => {
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
                    )}
                    <div className="hidden md:flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-950 bg-white px-3 py-1 border-2 border-slate-950 shadow-[2px_2px_0px_rgba(0,0,0,1)] translate-y-[-1px]">
                        <span className={`w-2 h-2 ${ollamaAvailable ? 'bg-slate-950' : 'bg-slate-200'}`} />
                        Local: {ollamaAvailable ? 'Active' : 'Offline'}
                    </div>
                    {usage && (
                        <div className="flex flex-col items-end leading-none">
                            <span className="text-[12px] font-black text-slate-950">{usage.remaining?.toLocaleString() ?? 0}</span>
                            <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Credits</span>
                        </div>
                    )}
 
                    {/* Email Sign-in Widget */}
                    {userEmail ? (
                        <div className="hidden md:flex items-center gap-2 bg-slate-950 border-2 border-slate-950 px-3 py-1 shadow-[2px_2px_0px_rgba(0,0,0,0.2)]">
                            <span className="text-[9px] text-white font-black uppercase tracking-widest truncate max-w-[100px]" title={userEmail}>{userEmail.split('@')[0]}</span>
                            <button onClick={handleSignOut} className="text-[9px] text-white/50 hover:text-white transition-colors" title="Sign out">✕</button>
                        </div>
                    ) : showEmailInput ? (
                        <div className="flex flex-col bg-white border-2 border-slate-950 p-4 shadow-[8px_8px_0px_rgba(0,0,0,1)] shrink-0 items-center justify-center gap-3 mr-4 z-50 min-w-[280px]">
                            <div className="flex items-center gap-2 w-full pb-2 border-b border-slate-100">
                                <Zap className="w-4 h-4 text-slate-950 shrink-0" />
                                <span className="text-[10px] text-slate-950 font-black uppercase tracking-[0.2em]">Account_Login</span>
                            </div>
                            <input
                                type="email"
                                id="st-email-input"
                                name="email"
                                value={emailInput}
                                onChange={e => setEmailInput(e.target.value)}
                                placeholder="EMAIL ADDRESS"
                                className="w-full bg-slate-50 border-2 border-slate-950 px-3 py-2 text-slate-950 text-[10px] font-black tracking-widest focus:outline-none placeholder:text-slate-300"
                            />
                            <input
                                type="password"
                                id="st-password-input"
                                name="password"
                                value={passwordInput}
                                onChange={e => setPasswordInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSignIn()}
                                placeholder="PASSWORD"
                                className="w-full bg-slate-50 border-2 border-slate-950 px-3 py-2 text-slate-950 text-[10px] font-black tracking-widest focus:outline-none placeholder:text-slate-300"
                            />
                            <div className="flex items-center gap-3 w-full mt-2">
                                <button 
                                    onClick={handleSignIn} 
                                    disabled={isLoggingIn}
                                    className="flex-1 bg-slate-950 text-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-slate-950 border-2 border-slate-950 transition-all shadow-[4px_4px_0px_rgba(0,0,0,0.1)] active:shadow-none"
                                >
                                    {isLoggingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Run_Login'}
                                </button>
                                <button onClick={() => setShowEmailInput(false)} className="text-slate-400 hover:text-slate-950 font-black uppercase text-[10px] tracking-widest px-2">Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowEmailInput(true)}
                            className="hidden md:flex items-center gap-2 text-[10px] text-slate-950 font-black uppercase tracking-widest bg-white border-2 border-slate-950 px-4 py-1.5 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:shadow-none translate-y-[-1px] transition-all"
                        >
                            <span>Sign_In</span>
                        </button>
                    )}
                </div>
            </div>        </div>

            {/* ─── VOICE MODE or STANDARD CHAT ─── */}
            {(() => {
                const voiceProvider = 'Neural (Free)';
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
                        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                            {!response && !loading && (
                                <div className="h-full flex flex-col items-center justify-center opacity-10 select-none">
                                    <Zap className="w-20 h-20 mb-6 text-slate-950" />
                                    <h2 className="text-2xl font-black text-slate-950 uppercase tracking-[0.4em]">Ready_To_Sync</h2>
                                </div>
                            )}
                            {loading && (
                                <div className="h-full flex flex-col items-center justify-center">
                                    <div className="w-20 h-20 border-8 border-slate-100 border-t-slate-950 animate-spin mb-6" />
                                    <p className="text-slate-950 font-black uppercase text-[10px] tracking-[0.5em] animate-pulse">{loadingMessage}</p>
                                </div>
                            )}
                            {response && (
                                <div className="animate-fade-in">
                                    <div className="bg-white border-4 border-slate-950 p-8 shadow-[8px_8px_0px_rgba(0,0,0,1)] selection:bg-slate-950 selection:text-white">
                                        <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-slate-50">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1 bg-slate-950 text-white">
                                                    <Shield className="w-4 h-4" />
                                                </div>
                                                <span className="font-black text-slate-950 text-[10px] uppercase tracking-widest">{selectedModel?.name}</span>
                                            </div>
                                            <button
                                                onClick={() => response && handleSpeak(response)}
                                                className={`p-2 transition-all ${isSpeaking ? 'bg-slate-950 text-white animate-pulse' : 'text-slate-300 hover:text-slate-950'}`}
                                            >
                                                <Volume2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <div className="leading-tight text-slate-950 font-bold text-xl uppercase tracking-tight whitespace-pre-wrap">{renderTextWithImages(response)}</div>
                                    </div>
                                </div>
                            )}
                            {error && (
                                <div className="mt-4 bg-red-900/20 border border-red-500/50 rounded p-2 flex items-center gap-2 text-red-200 justify-center text-xs">
                                    <AlertTriangle className="w-4 h-4 flex-shrink-0" /><p>{error}</p>
                                </div>
                            )}
                        </div>
                        <div className="p-4 pb-8 md:pb-12">
                            <div className="relative bg-white border-4 border-slate-950 shadow-[8px_8px_0px_rgba(0,0,0,1)] flex items-center">
                                <textarea
                                    id="st-chat-prompt"
                                    name="chatPrompt"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
                                    }}
                                    placeholder={`TRANSMIT_TO_${selectedModel?.name?.toUpperCase() || 'AI'}...`}
                                    className="w-full bg-white text-slate-950 p-5 pr-24 min-h-[60px] max-h-40 resize-none focus:outline-none text-xl font-black uppercase tracking-tight placeholder:text-slate-200 selection:bg-slate-950 selection:text-white"
                                />
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading || !prompt.trim() || selectedModel?.isOffline}
                                    className="absolute right-4 bg-slate-950 text-white font-black uppercase text-[10px] tracking-widest px-6 py-3 hover:bg-white hover:text-slate-950 border-2 border-slate-950 transition-all disabled:bg-slate-100 disabled:text-slate-300 disabled:border-slate-200"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '[ RUN ]'}
                                </button>
                            </div>
                            <div className="text-center mt-2 pointer-events-none">
                                <span className="text-[9px] text-gray-500/50 uppercase tracking-widest">AI may not be telling the truth.</span>
                            </div>
                        </div>
                    </div>
                );
            })()}

        </div>
    );
};

export default SingleTierPlayground;
