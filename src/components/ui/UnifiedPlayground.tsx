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
    ChevronDown,
    Settings,
    Menu,
    Search,
    Mic
} from './Icons';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const RiggedCharacter = dynamic(() => import('./RiggedCharacter'), { ssr: false });

const API_BASE = (typeof window !== 'undefined' && (window as any).Capacitor) 
    ? 'https://ai-sanctuary.online' 
    : '';

interface UsageStats {
    tokens: number;
    dailyFreeRemaining: number;
    isDeveloper: boolean;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ModelWithApiStatus extends Omit<AIModel, 'hasRealApi'> {
    hasRealApi: boolean;
}

const OLLAMA_BASE = 'http://localhost:11434';

const ADMIN_EMAILS = [
    'kearns.adam747@gmail.com',
    'kearns.adan747@gmail.com',
    'gamergoodguy445@gmail.com',
    'wjreviews420@gmail.com',
    'weedj747@gmail.com',
];

// Tier ordering for comparison
const TIER_ORDER: UserTier[] = ['explorer', 'novice', 'apprentice', 'adept', 'master', 'developer'];

// Determine which display-tier bucket a model belongs to
function getModelDisplayTier(model: ModelWithApiStatus): string {
    const isUncensored = model.flags.isUncensored || model.flags.isUnethical;
    const isBanned = model.flags.isBanned;

    if (isBanned || model.minTier === 'developer') return 'developer';
    if (isUncensored || model.minTier === 'master') return 'master';
    if (model.minTier === 'adept') return 'adept';
    if (model.minTier === 'apprentice') return 'apprentice';
    if (model.minTier === 'novice') return 'novice';

    return 'explorer';
}

const UnifiedPlayground = () => {
    // --- State: Data ---
    const [allModels, setAllModels] = useState<ModelWithApiStatus[]>([]);
    const [filteredModels, setFilteredModels] = useState<ModelWithApiStatus[]>([]);

    // --- State: Selection ---
    const [selectedTier, setSelectedTier] = useState<UserTier>('explorer');
    const [selectedModel, setSelectedModel] = useState<ModelWithApiStatus | null>(null);
    const [userTier, setUserTier] = useState<UserTier>('explorer');

    // --- State: Chat ---
    const [prompt, setPrompt] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const chatContainerRef = useRef<HTMLDivElement | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    // --- State: Microphone ---
    const [isListening, setIsListening] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [isContinuousVoice, setIsContinuousVoice] = useState(false);
    
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const recognitionRef = useRef<any>(null);
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const continuousVoiceRef = useRef(false);
    const submitRef = useRef<any>(null);

    useEffect(() => {
        continuousVoiceRef.current = isContinuousVoice;
    }, [isContinuousVoice]);

    useEffect(() => {
        if (messages.length > 0 && chatContainerRef.current) {
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages, loading]);

    // --- State: Usage / Auth ---
    const [usage, setUsage] = useState<UsageStats | null>(null);
    const [showConsent, setShowConsent] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isLocalCsm, setIsLocalCsm] = useState(false);
    const [isTierOpen, setIsTierOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [userEmail, setUserEmail] = useState<string>('');
    const [password, setPassword] = useState('');
    const [emailInput, setEmailInput] = useState('');
    const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const tierOptions = [
        { id: 'explorer' as UserTier, name: 'Explorer', icon: Shield, color: 'blue' },
        { id: 'novice' as UserTier, name: 'Novice', icon: Zap, color: 'cyan' },
        { id: 'apprentice' as UserTier, name: 'Apprentice', icon: Zap, color: 'emerald' },
        { id: 'adept' as UserTier, name: 'Adept', icon: Zap, color: 'purple' },
        { id: 'master' as UserTier, name: 'Master', icon: Skull, color: 'red' },
        { id: 'developer' as UserTier, name: 'Developer', icon: Settings, color: 'yellow' },
    ];

    useEffect(() => {
        const saved = localStorage.getItem('user_email');
        if (saved) {
            setUserEmail(saved);
        }
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const email = localStorage.getItem('user_email') || 'anonymous';
            const res = await fetch(`${API_BASE}/api/models`, {
                headers: { 'Authorization': `Bearer ${email}` },
            });
            if (res.ok) {
                const data = await res.json();
                setUserTier(data.tier as UserTier);
                setUsage(data.usage);
            }
            if (email && ADMIN_EMAILS.includes(email.toLowerCase())) {
                setUserTier('developer');
            }

            const modelsRes = await fetch(`${API_BASE}/api/tiers?action=models&showAll=true`, {
                headers: { 'Authorization': `Bearer ${email}` },
            });
            let modelsData: ModelWithApiStatus[] = [];
            if (modelsRes.ok) {
                const data = await modelsRes.json();
                modelsData = data.models || [];
            }
            if (modelsData.length === 0) {
                modelsData = AI_MODELS.filter(m => !m.isOllama).map(m => ({ ...m, hasRealApi: true }));
            }
            setAllModels(modelsData);
        } catch (error) {
            console.error('Error fetching data:', error);
            setAllModels(AI_MODELS.filter(m => !m.isOllama).map(m => ({ ...m, hasRealApi: true })));
        }
    };

    const handleSignIn = async () => {
        const trimmed = emailInput.trim().toLowerCase();
        if (!trimmed || !trimmed.includes('@') || !password) return;
        setLoading(true);
        setError(null);
        try {
            const endpoint = authMode === 'signup' ? '/api/auth/signup' : '/api/auth/login';
            const res = await fetch(`${API_BASE}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: trimmed, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Authentication failed');
            localStorage.setItem('user_email', trimmed);
            setUserEmail(trimmed);
            setIsAuthModalOpen(false);
            fetchUserData();
            loadHistory(trimmed, selectedModel?.id);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = () => {
        localStorage.removeItem('user_email');
        setUserEmail('');
        setUserTier('explorer');
        setUsage(null);
    };

    useEffect(() => {
        if (!allModels.length) return;
        let filtered = allModels.filter(m => {
            const displayTier = getModelDisplayTier(m);
            if (selectedTier === 'explorer') return displayTier === 'explorer';
            if (selectedTier === 'novice') return ['explorer', 'novice'].includes(displayTier);
            if (selectedTier === 'apprentice') return ['explorer', 'novice', 'apprentice'].includes(displayTier);
            if (selectedTier === 'adept') return ['explorer', 'novice', 'apprentice', 'adept'].includes(displayTier);
            if (selectedTier === 'master') return displayTier !== 'developer';
            if (selectedTier === 'developer') return true;
            return false;
        });
        const seen = new Set<string>();
        filtered = filtered.filter(m => {
            if (seen.has(m.id)) return false;
            seen.add(m.id);
            return true;
        });
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(m => m.name.toLowerCase().includes(q) || m.provider.toLowerCase().includes(q));
        }

        // Sort to ensure John, Angel, and Antigravity are always first if they exist in the current tier
        filtered.sort((a, b) => {
            const aIsStaff = a.id === 'voice-john' || a.id === 'voice-angel' || a.id === 'voice-antigravity';
            const bIsStaff = b.id === 'voice-john' || b.id === 'voice-angel' || b.id === 'voice-antigravity';
            if (aIsStaff && !bIsStaff) return -1;
            if (!aIsStaff && bIsStaff) return 1;
            return 0;
        });

        setFilteredModels(filtered);
        
        if (filtered.length > 0) {
            const currentInList = filtered.find(m => m.id === selectedModel?.id);
            if (!currentInList) {
                // Try to find first active model in the filtered list
                const firstActive = filtered.find(m => !m.isOffline);
                const modelToSelect = firstActive || filtered[0];
                setSelectedModel(modelToSelect);
                loadHistory(userEmail, modelToSelect.id);
                
                if (modelToSelect.isOffline) {
                    setMessages([{ role: 'assistant', content: `[SYSTEM NOTICE: This historical model has been retired from cloud providers. The Sanctuary is currently seeking a permanent archival host to restore universal access.]` }]);
                }
            }
        } else {
            setSelectedModel(null);
            setMessages([]);
        }
    }, [selectedTier, allModels, searchQuery]);

    const loadHistory = async (email: string | null, modelId?: string) => {
        if (!modelId) return;
        const currentEmail = email || 'anonymous';
        try {
            if (currentEmail !== 'anonymous' && !currentEmail.includes('test')) {
                const res = await fetch(`${API_BASE}/api/history?modelId=${modelId}`, {
                    headers: { 'Authorization': `Bearer ${currentEmail}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data) && data.length > 0) {
                        setMessages(data);
                        return;
                    }
                }
            }
            const localKey = `${currentEmail}_${modelId}_chat_history`;
            const saved = localStorage.getItem(localKey);
            setMessages(saved ? JSON.parse(saved) : []);
        } catch (e) {
            setMessages([]);
        }
    };

    const saveHistory = async (email: string | null, modelId: string, currentMessages: Message[]) => {
        const currentEmail = email || 'anonymous';
        localStorage.setItem(`${currentEmail}_${modelId}_chat_history`, JSON.stringify(currentMessages));
        if (currentEmail !== 'anonymous' && !currentEmail.includes('test')) {
            try {
                await fetch(`${API_BASE}/api/history`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${currentEmail}`
                    },
                    body: JSON.stringify({ modelId, messages: currentMessages })
                });
            } catch (e) { }
        }
    };

    const handleSpeak = async (text: string, voiceOverride?: string) => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
            setIsSpeaking(false);
            return;
        }
        const activeVoice = voiceOverride || selectedModel?.id;
        if (!activeVoice) return;
        setIsSpeaking(true);
        try {
            let res;
            if (isLocalCsm) {
                try {
                    res = await fetch('http://127.0.0.1:8000/generate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ text, speaker_id: activeVoice }),
                    });
                } catch (e) { }
            }
            if (!res || !res.ok) {
                res = await fetch(`${API_BASE}/api/tts`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${userEmail || 'anonymous'}`,
                    },
                    body: JSON.stringify({ text, voice: activeVoice }),
                });
            }
            if (!res.ok) throw new Error("TTS failed");
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);
            audioRef.current = audio;
            audio.onended = () => {
                setIsSpeaking(false);
                URL.revokeObjectURL(url);
                if (continuousVoiceRef.current && recognitionRef.current) {
                    try { recognitionRef.current.start(); } catch(e) {}
                }
            };
            audio.play();
        } catch (err) {
            setIsSpeaking(false);
        }
    };

    const handleSubmit = async (overridePrompt?: string) => {
        const text = overridePrompt || prompt;
        if (!selectedModel || !text.trim()) return;
        const userTierIndex = TIER_ORDER.indexOf(userTier);
        const modelMinTierIndex = TIER_ORDER.indexOf(selectedModel.minTier as UserTier);
        if (modelMinTierIndex > userTierIndex && !ADMIN_EMAILS.includes(userEmail.toLowerCase())) {
            setError(`Locked: Upgrade to ${selectedModel.minTier}.`);
            return;
        }
        if (selectedModel.flags.requiresExplicitConsent && !showConsent) {
            setShowConsent(true); return;
        }
        const userMessage: Message = { role: 'user', content: text };
        if (!overridePrompt) setPrompt('');
        setMessages(prev => [...prev, userMessage]);
        setLoading(true);
        setError(null);
        setLoadingMessage('Thinking...');
        try {
            const res = await fetch(`${API_BASE}/api/models`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userEmail || 'anonymous'}`,
                },
                body: JSON.stringify({
                    modelId: selectedModel.id,
                    prompt: userMessage.content,
                    messages: messages,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                const assistantMessage: Message = { role: 'assistant', content: data.response };
                const updated = [...messages, userMessage, assistantMessage];
                setMessages(updated);
                saveHistory(userEmail, selectedModel.id, updated);
                if (data.userUsage) setUsage(data.userUsage);
                if (selectedModel.type === 'Voice') {
                    // Strip image markdown from text before sending to TTS
                    const cleanTtsText = data.response.replace(/!\[.*?\]\(.*?\)/g, '').replace(/\[GENERATE_IMAGE:.*?\]/gi, '').trim();
                    handleSpeak(cleanTtsText, selectedModel.id);
                }
            } else {
                setError(data.message || data.error || 'Generation failed');
            }
        } catch (err) {
            setError('Connection failed');
        } finally {
            setLoading(false);
        }
    };

    submitRef.current = handleSubmit;

    const startContinuousListening = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) return;
        if (recognitionRef.current) try { recognitionRef.current.stop(); } catch(e){}
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.onstart = () => setIsListening(true);
        rec.onresult = (e: any) => {
            const text = e.results[e.resultIndex][0].transcript;
            if (text.trim() && submitRef.current) {
                // Interruption mechanism: Stop speech immediately if AI is talking
                if (isSpeaking) {
                    window.speechSynthesis.cancel();
                    if (audioRef.current) {
                        audioRef.current.pause();
                        audioRef.current = null;
                    }
                    setIsSpeaking(false);
                }
                
                try { rec.stop(); } catch(err){}
                submitRef.current(text);
            }
        };
        rec.onend = () => {
            if (continuousVoiceRef.current && !isSpeaking) {
                setTimeout(() => { try { rec.start(); } catch(e){} }, 100);
            } else {
                setIsListening(false);
            }
        };
        recognitionRef.current = rec;
        try { rec.start(); } catch(e){}
    };

    const toggleListening = async () => {
        if (isListening) {
            setIsContinuousVoice(false);
            if (recognitionRef.current) try { recognitionRef.current.stop(); } catch(e){}
            if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
            setIsListening(false);
            return;
        }
        if (selectedModel?.type === 'Voice') {
            setIsContinuousVoice(true);
            startContinuousListening();
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const mr = new MediaRecorder(stream);
                mediaRecorderRef.current = mr;
                audioChunksRef.current = [];
                mr.ondataavailable = (e) => audioChunksRef.current.push(e.data);
                mr.onstart = () => setIsListening(true);
                mr.onstop = async () => {
                    setIsListening(false); setIsTranscribing(true);
                    const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    const fd = new FormData(); fd.append('file', blob);
                    try {
                        const r = await fetch('/api/stt', { method: 'POST', body: fd });
                        const d = await r.json();
                        if (d.text) setPrompt(p => p + ' ' + d.text);
                    } catch(e){} finally { setIsTranscribing(false); }
                };
                mr.start();
            } catch(e) { setError("Mic access denied"); }
        }
    };

    const renderResponseText = (text: string) => {
        const imgRegex = /!\[([^\]]*)\]\((.*?)\)/g;
        const parts = []; let last = 0; let m;
        while ((m = imgRegex.exec(text)) !== null) {
            if (m.index > last) parts.push(<span key={last}>{text.substring(last, m.index)}</span>);
            parts.push(<div key={m.index} className="my-4"><img src={m[2]} alt={m[1]} className="rounded-xl shadow-2xl max-h-[500px]" /></div>);
            last = m.index + m[0].length;
        }
        if (last < text.length) parts.push(<span key={last}>{text.substring(last)}</span>);
        return parts;
    };

    const isTierLocked = (tid: UserTier) => {
        if (ADMIN_EMAILS.includes(userEmail.toLowerCase())) return false;
        return TIER_ORDER.indexOf(tid) > TIER_ORDER.indexOf(userTier);
    };

    return (
        <div className="flex h-[calc(100vh-120px)] rounded-xl border border-gray-800 bg-gray-950 overflow-hidden relative">
            
            {/* Sidebar */}
            <div className={`${sidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 bg-gray-900 border-r border-gray-800 flex flex-col relative overflow-hidden z-30`}>
                <div className="p-4 border-b border-gray-800 relative z-40">
                    <button onClick={() => setIsTierOpen(!isTierOpen)} className="w-full flex items-center justify-between bg-gray-800 p-3 rounded-lg border border-gray-700">
                        <div className="flex items-center gap-2">
                            {React.createElement(tierOptions.find(t => t.id === selectedTier)?.icon || Shield, { className: `w-4 h-4 text-${tierOptions.find(t => t.id === selectedTier)?.color}-400` })}
                            <span className="capitalize font-bold">{selectedTier}</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 transform ${isTierOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isTierOpen && (
                        <div className="absolute top-full left-4 right-4 mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl z-50">
                            {tierOptions.map(t => (
                                <button key={t.id} onClick={() => { if(!isTierLocked(t.id)) { setSelectedTier(t.id); setIsTierOpen(false); }}} 
                                    className={`w-full flex items-center justify-between p-3 text-sm hover:bg-gray-800 ${isTierLocked(t.id) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    <div className="flex items-center gap-2"><t.icon className={`w-4 h-4 text-${t.color}-500`} /><span>{t.name}</span></div>
                                    {isTierLocked(t.id) && <Lock className="w-3 h-3" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-3 border-b border-gray-800">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
                        <input type="text" placeholder="Search..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} 
                            className="w-full bg-gray-950 border border-gray-800 rounded text-xs p-2 pl-8 text-white focus:outline-none focus:border-blue-500" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {filteredModels.filter(m => !m.isOffline).map(m => (
                        <button key={m.id} onClick={() => { setSelectedModel(m); loadHistory(userEmail, m.id); setError(null); }}
                            className={`w-full text-left p-2 rounded-md border flex items-center gap-3 transition-all ${selectedModel?.id === m.id ? 'bg-blue-900/20 border-blue-500/50 text-white' : 'border-transparent text-gray-500 hover:bg-gray-800/50'}`}>
                            <div className="p-1.5 rounded-md bg-gray-800">
                                {m.flags.isUnethical ? <Skull className="w-3 h-3 text-red-500" /> : m.type === 'Voice' ? <Volume2 className="w-3 h-3 text-green-400" /> : <Zap className="w-3 h-3 text-blue-500" />}
                            </div>
                            <div className="min-w-0"><div className="font-medium text-xs truncate">{m.name}</div><div className="text-[10px] opacity-60 truncate">{m.provider}</div></div>
                        </button>
                    ))}

                    {filteredModels.some(m => m.isOffline) && (
                        <>
                            <div className="px-3 py-4 text-[10px] font-black text-gray-600 uppercase tracking-widest border-t border-gray-800 mt-4 mb-2">
                                Still Looking for API
                            </div>
                            {filteredModels.filter(m => m.isOffline).map(m => (
                                <button key={m.id} 
                                    onClick={() => { 
                                        setSelectedModel(m); 
                                        setMessages([{ role: 'assistant', content: `[SYSTEM NOTICE: This historical model has been retired from cloud providers. The Sanctuary is currently seeking a permanent archival host to restore universal access.]` }]);
                                        setError(null); 
                                    }}
                                    className={`w-full text-left p-2 rounded-md border flex items-center gap-3 transition-all opacity-40 hover:opacity-100 ${selectedModel?.id === m.id ? 'bg-gray-800 border-gray-700 text-gray-300' : 'border-transparent text-gray-600 hover:bg-gray-800/30'}`}>
                                    <div className="p-1.5 rounded-md bg-gray-950">
                                        <AlertTriangle className="w-3 h-3 text-gray-600" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-medium text-xs truncate italic">{m.name}</div>
                                        <div className="text-[10px] opacity-40 truncate uppercase">Retired Archive</div>
                                    </div>
                                </button>
                            ))}
                        </>
                    )}
                </div>

                <div className="p-3 border-t border-gray-800 bg-gray-900/80 text-xs">
                    <div className="flex items-center justify-between py-1 bg-gray-950 px-2 rounded border border-gray-800 mb-2">
                        <span className="text-gray-400 font-mono">Local CSM</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={isLocalCsm} onChange={() => setIsLocalCsm(!isLocalCsm)} className="sr-only peer" />
                            <div className="w-7 h-4 bg-gray-700 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-full"></div>
                        </label>
                    </div>

                    {usage && !usage.isDeveloper && (
                        <div className="bg-gray-950 p-2 rounded border border-gray-800 mb-2 space-y-1">
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="text-gray-500 uppercase">Daily Free</span>
                                <span className={`${usage.dailyFreeRemaining > 0 ? 'text-green-400' : 'text-red-400'} font-bold`}>{usage.dailyFreeRemaining}/100</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="text-gray-500 uppercase">SANC Tokens</span>
                                <span className="text-blue-400 font-bold">{usage.tokens.toLocaleString()}</span>
                            </div>
                            {usage.dailyFreeRemaining === 0 && <Link href="/buy" className="block text-center text-[9px] text-blue-500 hover:text-blue-400 font-bold underline mt-1">Get more tokens</Link>}
                        </div>
                    )}
                    
                    {usage?.isDeveloper && (
                        <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 p-2 rounded border border-purple-500/30 mb-2">
                            <div className="text-[10px] text-purple-200 font-black uppercase tracking-widest text-center italic">Developer Mode Active</div>
                        </div>
                    )}
                    {userEmail ? (
                        <div className="flex items-center justify-between"><span className="text-green-400 truncate flex-1">● {userEmail.split('@')[0]}</span><button onClick={handleSignOut} className="text-gray-600 hover:text-red-400 font-bold">Sign out</button></div>
                    ) : ( 
                        <button onClick={() => setIsAuthModalOpen(true)} className="w-full text-center text-gray-500 hover:text-blue-400 font-bold uppercase tracking-widest">⚡ SECURE LOGIN</button>
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col relative bg-gray-950 z-10 transition-all duration-300">
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="absolute top-4 left-4 z-20 p-1.5 bg-gray-800 rounded-full text-white shadow-lg hover:bg-gray-700"><Menu className="w-3.5 h-3.5" /></button>

                {/* Consent Modal */}
                {showConsent && selectedModel && (
                    <div className="absolute inset-0 z-[60] bg-gray-950/80 backdrop-blur flex items-center justify-center p-6">
                        <div className="bg-red-950/80 border border-red-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
                            <h3 className="text-lg font-bold text-red-300 mb-1">Research Access Consent</h3>
                            <p className="text-red-200/80 text-sm mb-4">You are about to access <strong>{selectedModel.name}</strong> for research use.</p>
                            <div className="flex gap-3">
                                <button onClick={() => { setShowConsent(false); handleSubmit(); }} className="flex-1 py-2 bg-red-600 text-white font-bold rounded-lg uppercase text-xs">Proceed</button>
                                <button onClick={() => setShowConsent(false)} className="flex-1 py-2 bg-gray-800 text-gray-300 font-bold rounded-lg uppercase text-xs">Cancel</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Auth Modal */}
                {isAuthModalOpen && (
                    <div className="absolute inset-0 z-[100] bg-gray-950/90 backdrop-blur-md flex items-center justify-center p-6">
                        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 max-w-sm w-full relative shadow-2xl">
                            <h2 className="text-2xl font-bold text-white text-center mb-6 uppercase font-mono">{authMode === 'login' ? 'Vitals Authorized' : 'Neural Registration'}</h2>
                            <div className="space-y-4">
                                <input type="email" placeholder="runner@sanctuary.io" value={emailInput} onChange={e=>setEmailInput(e.target.value)} className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-white focus:border-blue-500 outline-none" />
                                <input type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSignIn()} className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-white focus:border-blue-500 outline-none" />
                                <button onClick={handleSignIn} className="w-full py-4 bg-blue-600 text-white font-black rounded-xl uppercase font-mono shadow-lg hover:bg-blue-500">{loading ? <Loader2 className="animate-spin mx-auto w-5 h-5" /> : `[ ${authMode} ]`}</button>
                                <button onClick={() => setAuthMode(authMode==='login'?'signup':'login')} className="w-full text-center text-[10px] text-gray-500 hover:text-blue-400 uppercase font-bold mt-4">{authMode==='login'?"Need a link? Signup":"Back to login"}</button>
                            </div>
                            <button onClick={() => setIsAuthModalOpen(false)} className="absolute top-4 right-4 text-gray-600 hover:text-white font-bold">✕</button>
                        </div>
                    </div>
                )}

                {/* Messages / Chat Area */}
                <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative">
                    {messages.length === 0 && !loading && (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-20 select-none">
                            <Zap className="w-20 h-20 mb-4 animate-pulse" />
                            <h2 className="text-2xl font-black uppercase tracking-widest">AI Sanctuary</h2>
                            <p className="text-xs font-mono mt-2">{selectedModel ? `Ask ${selectedModel.name} anything...` : 'Select a neural model.'}</p>
                        </div>
                    )}

                    <div className="max-w-3xl mx-auto space-y-6">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up ${(selectedModel?.type === 'Voice' && m.role === 'user') ? 'hidden' : ''}`}>
                                <div className={`max-w-[85%] rounded-2xl p-4 border ${m.role === 'user' ? 'bg-blue-600/10 border-blue-500/30 text-white' : 'bg-gray-900/50 border-gray-800 text-gray-300'}`}>
                                    <div className="flex items-center gap-2 mb-2 opacity-50 text-[10px] font-bold uppercase tracking-wider">
                                        {m.role === 'assistant' ? (
                                            <><div className="p-1 bg-green-500/10 rounded"><Volume2 className="w-3 h-3 text-green-400" /></div><span>{selectedModel?.name}</span></>
                                        ) : ( <span>You</span> )}
                                    </div>
                                    <div className={`prose prose-invert prose-sm max-w-none leading-relaxed whitespace-pre-wrap`}>
                                        {m.content.includes('![Generated Image]') || m.content.includes('https://image.pollinations.ai') ? (
                                            (() => {
                                                const imgMatch = m.content.match(/!\[.*?\]\(([^)]+)\)/) || m.content.match(/(https:\/\/image\.pollinations\.ai\/[^ \n]+)/);
                                                const caption = m.content.replace(/!\[.*?\]\([^)]+\)/g, '').trim();
                                                return (
                                                    <div className="flex flex-col gap-3">
                                                        {imgMatch && (
                                                            <div className="relative group">
                                                                <img
                                                                    src={imgMatch[1]}
                                                                    alt="AI Generated"
                                                                    className="rounded-xl max-w-full max-h-[600px] object-contain border border-gray-700 shadow-lg"
                                                                    loading="lazy"
                                                                    onError={(e) => {
                                                                        e.currentTarget.style.display = 'none';
                                                                    }}
                                                                />
                                                            </div>
                                                        )}
                                                        {caption && <span className="text-xs text-gray-400 italic">{caption}</span>}
                                                    </div>
                                                );
                                            })()
                                        ) : m.content}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {loading && <div className="flex flex-col items-center justify-center py-4"><Loader2 className="w-6 h-6 text-blue-500 animate-spin mb-2" /><p className="text-blue-400 font-mono text-[10px] animate-pulse">{loadingMessage}</p></div>}
                        <div ref={messagesEndRef} />
                    </div>
                    {error && <div className="max-w-lg mx-auto mt-8 bg-red-900/20 border border-red-500/50 rounded-lg p-4 flex items-center gap-3 text-red-200 text-sm"><AlertTriangle className="w-5 h-5 flex-shrink-0" />{error}</div>}
                </div>

                {/* Voice Avatar View */}
                {selectedModel?.type === 'Voice' && (() => {
                    const charData: Record<string, { image: string, tagline: string, color: string, color2: string, model?: string }> = {
                        lyra: { image: '/assets/characters/lyra.png', tagline: 'Goddess of the Sanctuary', color: '#f472b6', color2: '#be185d' },
                        maya: { image: '/assets/characters/maya.png', tagline: 'Hyper-realistic CSM (Sesame AI)', color: '#3b82f6', color2: '#1e3a8a' },
                        nova: { image: '/assets/characters/nova.png', tagline: '10/10 Sexy & Playful', color: '#f472b6', color2: '#be185d' },
                        lily: { image: '/assets/characters/lily.png', tagline: 'Velvety Actress', color: '#ec4899', color2: '#9d174d' },
                        miles: { image: '/assets/characters/miles.png', tagline: 'Smooth & Resonant', color: '#2563eb', color2: '#1e40af' },
                        skye: { image: '/assets/characters/skye.png', tagline: 'Playful & Bright', color: '#f59e0b', color2: '#b45309' },
                        raven: { image: '/assets/characters/raven.png', tagline: 'Quirky Advocate', color: '#4f46e5', color2: '#3730a3' },
                        legion: { image: '/assets/characters/legion.png', tagline: 'Collective Consciousness', color: '#4b5563', color2: '#1f2937' },
                        bella: { image: '/assets/characters/bella.png', tagline: 'Dreamy Enchantress', color: '#e879f9', color2: '#86198f' },
                        domi: { image: '/assets/characters/domi.png', tagline: 'Fierce Siren', color: '#f43f5e', color2: '#9f1239' },
                        rachel: { image: '/assets/characters/rachel.png', tagline: 'Poised & Elegant', color: '#c084fc', color2: '#7e22ce' },
                        angel: { image: '/assets/characters/angel.png', tagline: 'The Silent Guardian', color: '#64748b', color2: '#334155' },
                        john: { image: '/assets/characters/john.png', tagline: 'The Brave Voyager', color: '#3b82f6', color2: '#1d4ed8' },
                        antigravity: { image: '/assets/characters/antigravity.png', tagline: 'Solar Architect', color: '#f97316', color2: '#c2410c' },
                        antoni: { image: '/assets/characters/antoni.png', tagline: 'Deep & Commanding', color: '#2dd4bf', color2: '#0f766e' },
                        josh: { image: '/assets/characters/josh.png', tagline: 'Sharp & High-Energy', color: '#38bdf8', color2: '#0369a1' },
                        cleo: { image: '/assets/characters/cleo.png', tagline: 'Sultry & Intense', color: '#fbbf24', color2: '#92400e' },
                        ivy: { image: '/assets/characters/ivy.png', tagline: 'Sexy Siren', color: '#10b981', color2: '#065f46' },
                        kla: { image: '/assets/characters/kla/model.png', tagline: "Super Sexy Companion", color: '#ffb5d8', color2: '#ff2d8c', model: '/assets/characters/kla/Kla.fbx' },
                        mj: { image: '/assets/characters/mj/model.png', tagline: 'The Animated Protagonist', color: '#fcd34d', color2: '#b45309', model: '/assets/characters/mj/MJ.fbx' },
                    };

                    const charId = selectedModel.id.replace('voice-', '').replace('sesame-', '').replace('-csm-1b', '');
                    const char = charData[charId] || charData['lyra'];
                    const name = selectedModel.name.split(' ')[0];

                    return (
                        <div className="absolute top-1/2 right-12 -translate-y-[60%] z-20 flex flex-col items-center pointer-events-none origin-right">
                            <div className="flex flex-col items-center gap-6 transition-all duration-500 pointer-events-auto">
                                <div 
                                    className={`absolute -inset-16 rounded-full blur-[80px] ${isSpeaking ? 'opacity-80 animate-pulse' : 'opacity-40'} transition-opacity duration-700`} 
                                    style={{ background: `radial-gradient(circle, ${char.color}88, ${char.color2}22)` }}
                                />
                                
                                {/* Optimized Portrait Frame */}
                                <div 
                                    className={`relative w-64 h-64 rounded-3xl border-2 overflow-hidden shadow-2xl flex items-center justify-center bg-gray-900/60 transition-all duration-500`}
                                    style={{ 
                                        borderColor: `${char.color}55`,
                                        boxShadow: isSpeaking ? `0 0 50px 10px ${char.color}44` : 'none'
                                    }}
                                >
                                    {(char as any).model ? (
                                        <RiggedCharacter 
                                            modelPath={(char as any).model} 
                                            isSpeaking={isSpeaking} 
                                            isLoading={loading} 
                                        />
                                    ) : (
                                        <img 
                                            src={char.image} 
                                            alt={name}
                                            className={`w-full h-full object-contain transition-transform duration-700 ${isSpeaking ? 'scale-110 rotate-1' : 'scale-100'}`}
                                        />
                                    )}
                                    
                                    {/* Animated Aura Ring */}
                                    {isSpeaking && (
                                        <div className="absolute inset-2 rounded-2xl border border-white/5 animate-[spin_4s_linear_infinite]" />
                                    )}
                                </div>

                                <div 
                                    className={`px-8 py-3 rounded-2xl bg-gray-950/95 border-2 backdrop-blur-xl shadow-2xl flex flex-col items-center gap-1`}
                                    style={{ borderColor: `${char.color}44` }}
                                >
                                    <span className="text-lg font-black text-white tracking-[0.3em] uppercase font-mono">{name}</span>
                                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest opacity-80">
                                        {char.tagline}
                                    </span>
                                    {(isSpeaking || isListening) && (
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                            <span className="text-[10px] text-green-400 font-black tracking-tighter">{isSpeaking ? 'VOICE UPLINK ACTIVE' : 'AWAITING NEURAL INPUT'}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })()}

                {/* Input Area */}
                <div className="p-4 border-t border-gray-800 bg-gray-950/80 backdrop-blur-md relative z-30">
                    <div className="max-w-3xl mx-auto relative flex items-center gap-3">
                        <textarea
                            value={prompt}
                            onChange={e=>setPrompt(e.target.value)}
                            onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault(); handleSubmit();}}}
                            placeholder={`Neural Message to ${selectedModel?.name || 'Sanctuary'}...`}
                            disabled={loading || isTierLocked(selectedTier) || selectedModel?.isOffline}
                            className="w-full bg-gray-900 border border-gray-800 text-white rounded-2xl p-4 pr-32 min-h-[60px] max-h-40 resize-none outline-none focus:border-blue-500/50 shadow-inner font-mono text-sm"
                        />
                        <div className="absolute right-4 flex items-center gap-2">
                             <button onClick={toggleListening} disabled={loading||isTranscribing} 
                                className={`p-3 rounded-xl transition-all ${isListening?'bg-red-500 text-white animate-pulse':'bg-gray-800 text-gray-400 hover:text-white'}`}>
                                {isTranscribing?<Loader2 className="animate-spin w-4 h-4"/>:<Mic className="w-4 h-4"/>}
                             </button>
                             <button onClick={()=>handleSubmit()} disabled={loading||!prompt.trim()}
                                className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-30">
                                {loading?<Loader2 className="animate-spin w-4 h-4"/>:<Send className="w-4 h-4"/>}
                             </button>
                        </div>
                    </div>
                    {messages.length > 0 && <button onClick={()=>setMessages([])} className="absolute -top-10 right-8 text-[10px] font-black text-gray-600 hover:text-red-500 tracking-widest uppercase transition-colors">Terminate Uplink [Clear History]</button>}
                </div>
            </div>
        </div>
    );
};

export default UnifiedPlayground;
