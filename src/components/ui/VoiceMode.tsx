'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Loader2, Send } from 'lucide-react';
import dynamic from 'next/dynamic';

const RiggedCharacter = dynamic(() => import('./RiggedCharacter'), { ssr: false });

// Per-voice character definitions
const VOICE_CHARACTERS: Record<string, {
    name: string;
    color: string;
    color2: string;
    glow: string;
    tagline: string;
    gender: 'female' | 'male';
    image: string;
    isRestricted?: boolean;
    model?: string;
}> = {
    lyra: { 
        name: 'Lyra', 
        color: '#f472b6', 
        color2: '#be185d', 
        glow: 'shadow-pink-500/50', 
        tagline: 'Goddess of the Sanctuary', 
        gender: 'female', 
        image: '/assets/characters/lyra.png'
    },
    maya: { 
        name: 'Maya', 
        color: '#3b82f6', 
        color2: '#1e3a8a', 
        glow: 'shadow-blue-500/50', 
        tagline: 'Hyper-realistic CSM (Sesame AI)', 
        gender: 'female', 
        image: '/assets/characters/maya.png'
    },
    rachel: { 
        name: 'Rachel', 
        color: '#c084fc', 
        color2: '#7e22ce', 
        glow: 'shadow-purple-400/50', 
        tagline: 'Poised & Elegant', 
        gender: 'female', 
        image: '/assets/characters/rachel.png'
    },
    domi: { 
        name: 'Domi', 
        color: '#f43f5e', 
        color2: '#9f1239', 
        glow: 'shadow-rose-500/50', 
        tagline: 'Fierce Siren', 
        gender: 'female', 
        image: '/assets/characters/domi.png',
        isRestricted: true
    },
    bella: { 
        name: 'Bella', 
        color: '#e879f9', 
        color2: '#86198f', 
        glow: 'shadow-fuchsia-400/50', 
        tagline: 'Dreamy Enchantress', 
        gender: 'female', 
        image: '/assets/characters/bella.png'
    },
    antoni: { 
        name: 'Antoni', 
        color: '#2dd4bf', 
        color2: '#0f766e', 
        glow: 'shadow-teal-400/50', 
        tagline: 'Deep & Commanding', 
        gender: 'male',
        image: '/assets/characters/antoni.png'
    },
    josh: { 
        name: 'Josh', 
        color: '#38bdf8', 
        color2: '#0369a1', 
        glow: 'shadow-sky-500/50', 
        tagline: 'Sharp & High-Energy', 
        gender: 'male',
        image: '/assets/characters/josh.png'
    },
    legion: { 
        name: 'Legion', 
        color: '#dc2626', 
        color2: '#450a0a', 
        glow: 'shadow-red-800/80', 
        tagline: 'The Collective', 
        gender: 'male',
        image: '/assets/characters/legion.png'
    },
    john: { 
        name: 'John', 
        color: '#3b82f6', 
        color2: '#1d4ed8', 
        glow: 'shadow-blue-500/50', 
        tagline: 'The Brave Voyager', 
        gender: 'male',
        image: '/assets/characters/john.png'
    },
    angel: { 
        name: 'Angel', 
        color: '#64748b', 
        color2: '#334155', 
        glow: 'shadow-slate-500/50', 
        tagline: 'The Silent Guardian', 
        gender: 'female', 
        image: '/assets/characters/angel.png'
    },
    antigravity: { 
        name: 'Antigravity', 
        color: '#f97316', 
        color2: '#c2410c', 
        glow: 'shadow-orange-500/50', 
        tagline: 'Solar Architect', 
        gender: 'female', 
        image: '/assets/characters/antigravity.png',
    },
    nova: {
        name: 'Nova',
        color: '#fcd34d',
        color2: '#b45309',
        glow: 'shadow-amber-400/50',
        tagline: 'Ultimate Companion',
        gender: 'female',
        image: '/assets/characters/nova.png'
    },
    cleo: {
        name: 'Cleo',
        color: '#fbbf24',
        color2: '#92400e',
        glow: 'shadow-yellow-500/50',
        tagline: 'Sultry & Intense',
        gender: 'female',
        image: '/assets/characters/cleo.png',
        isRestricted: true
    },
    ivy: {
        name: 'Ivy',
        color: '#10b981',
        color2: '#065f46',
        glow: 'shadow-emerald-500/50',
        tagline: 'Sexy Siren',
        gender: 'female',
        image: '/assets/characters/ivy.png',
        isRestricted: true
    },
    mj: {
        name: 'MJ (Cartoon)', 
        color: '#fcd34d', 
        color2: '#b45309', 
        glow: 'shadow-amber-400/50', 
        tagline: 'The Animated Protagonist', 
        gender: 'female', 
        image: '/assets/characters/mj/model.png', // Fallback image if 3D fails
        model: '/assets/characters/mj/MJ.fbx'
    }
};

// Removed FemaleHairSVG as we're using full portraits now

const DEFAULT_CHAR = VOICE_CHARACTERS['lyra'];

interface VoiceModeProps {
    modelName: string;
    voice: string;
    isLoading: boolean;
    isSpeaking: boolean;
    response: string | null;
    error: string | null;
    onSubmit: (text: string) => void;
    onToggleSpeak: () => void;
}

export default function VoiceMode({
    modelName,
    voice,
    isLoading,
    isSpeaking,
    response,
    error,
    onSubmit,
    onToggleSpeak,
}: VoiceModeProps) {
    const normalizedVoice = (voice || '').replace(/^voice-/i, '').toLowerCase();
    const charKey = Object.keys(VOICE_CHARACTERS).find(k => k.toLowerCase() === normalizedVoice);
    const char = charKey ? VOICE_CHARACTERS[charKey] : DEFAULT_CHAR;
    const [input, setInput] = useState('');
    const [showSubtitle, setShowSubtitle] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [sttError, setSttError] = useState<string | null>(null);

    const subtitleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const recognitionRef = useRef<any>(null);
    const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    // Accumulate final transcript segments separately from interim
    const finalTranscriptRef = useRef<string>('');

    // ─── Initialize Web Speech API ───────────────────────────────────────────
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const SpeechRecognition =
            (window as any).SpeechRecognition ||
            (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.warn('SpeechRecognition not supported in this browser.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    // Append final results to accumulation ref
                    finalTranscriptRef.current += (finalTranscriptRef.current ? ' ' : '') + transcript.trim();
                } else {
                    interimTranscript += transcript;
                }
            }
            // Display: settled finals + current interim
            const displayed = (finalTranscriptRef.current + (interimTranscript ? ' ' + interimTranscript : '')).trim();
            setInput(displayed);

            // Auto-resize textarea
            if (textareaRef.current) {
                textareaRef.current.style.height = '24px';
                textareaRef.current.style.height =
                    Math.min(textareaRef.current.scrollHeight, 80) + 'px';
            }

            // Auto-submit after 2 seconds of silence
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            if (displayed.length > 0) {
                silenceTimerRef.current = setTimeout(() => {
                    if (recognitionRef.current) {
                        try {
                            recognitionRef.current.stop();
                        } catch (e) {
                            // ignore
                        }
                    }
                    setIsListening(false);
                    finalTranscriptRef.current = '';
                    setInput('');
                    onSubmit(displayed);
                }, 2000);
            }
        };

        recognition.onerror = (event: any) => {
            if (event.error !== 'no-speech') {
                setSttError(`Mic error: ${event.error}`);
            }
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;

        return () => {
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            recognition.stop();
        };
    }, [onSubmit]);

    // ─── Toggle Mic ──────────────────────────────────────────────────────────
    const toggleListening = useCallback(() => {
        const rec = recognitionRef.current;
        if (!rec) {
            alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
            return;
        }
        setSttError(null);
        if (isListening) {
            rec.stop();
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            setIsListening(false);
        } else {
            // Reset accumulators
            finalTranscriptRef.current = '';
            setInput('');
            try {
                rec.start();
                setIsListening(true);
            } catch (e) {
                // Already started – stop and retry once
                rec.stop();
                setIsListening(false);
            }
        }
    }, [isListening]);

    // ─── Show subtitle briefly after response arrives ─────────────────────────
    useEffect(() => {
        if (response) {
            setShowSubtitle(true);
            if (subtitleTimer.current) clearTimeout(subtitleTimer.current);
            subtitleTimer.current = null; // Removed auto-hide for persistent display
        }
        return () => {
            if (subtitleTimer.current) clearTimeout(subtitleTimer.current);
        };
    }, [response]);

    // ─── Send handler ─────────────────────────────────────────────────────────
    const handleSend = useCallback(() => {
        const text = input.trim();
        if (!text || isLoading) return;
        if (isListening) {
            recognitionRef.current?.stop();
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            setIsListening(false);
        }
        finalTranscriptRef.current = '';
        setInput('');
        onSubmit(text);
    }, [input, isLoading, isListening, onSubmit]);

    const orbState = isLoading ? 'loading' : isSpeaking ? 'speaking' : isListening ? 'listening' : 'idle';

    return (
        <div className="relative flex flex-col items-center justify-center w-full h-full bg-white overflow-hidden select-none">

            {/* Structural Grid Background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                 style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            {/* ─── STRUCTURAL VISUALIZER ─── */}
            <div className="absolute flex items-center justify-center">
                {[1, 2, 3].map(i => (
                    <div
                        key={i}
                        className="absolute border-2"
                        style={{
                            width: 240 + i * 80,
                            height: 240 + i * 80,
                            borderColor: orbState === 'speaking' ? '#000' : '#e2e8f0',
                            opacity: orbState === 'idle' ? 0.1 : 0.8,
                            transform: `rotate(${i * 15}deg)`,
                            transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                            animation: orbState === 'speaking' || orbState === 'listening' ? `spin-slow ${10 + i * 5}s linear infinite` : 'none'
                        }}
                    />
                ))}
            </div>

            {/* ─── MAIN PORTRAIT FRAME ─── */}
            <div
                className="relative flex items-center justify-center"
                style={{ width: 320, height: 320 }}
            >
                {/* Main Portrait with Brutalist Border */}
                <div
                    className="relative z-10 flex items-center justify-center overflow-hidden cursor-pointer transition-all duration-500 bg-white border-4 border-slate-950 shadow-[12px_12px_0px_rgba(0,0,0,1)]"
                    onClick={() => {
                        if (isLoading) return;
                        if (isSpeaking) {
                            onToggleSpeak();
                        } else {
                            toggleListening();
                        }
                    }}
                    style={{
                        width: 280,
                        height: 280,
                        transform: (orbState === 'speaking' || orbState === 'listening') ? 'translate(-4px, -4px) scale(1.02)' : 'none',
                    }}
                >
                    {isLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-20">
                            <Loader2 className="w-12 h-12 text-slate-950 animate-spin" />
                        </div>
                    ) : isListening ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/5 z-20">
                            <Mic className="w-16 h-16 text-slate-950 animate-pulse" />
                        </div>
                    ) : null}
                    
                    {(char as any).isRestricted && (
                        <div className="absolute inset-0 z-30 pointer-events-none">
                            <div className="absolute inset-0 bg-slate-950/10 mix-blend-overlay" />
                            <div className="absolute top-4 left-0 right-0 text-center">
                                <span className="text-[10px] font-black tracking-[0.3em] text-white uppercase bg-slate-950 px-3 py-1 border-2 border-slate-950 shadow-[4px_4px_0px_rgba(0,0,0,0.2)]">
                                    Restricted_Access
                                </span>
                            </div>
                        </div>
                    )}
                    
                    {(char as any).model ? (
                        <RiggedCharacter 
                            modelPath={(char as any).model} 
                            isSpeaking={isSpeaking} 
                            isLoading={isLoading} 
                        />
                    ) : (
                        <img 
                            src={char.image} 
                            alt={char.name}
                            className={`w-full h-full object-contain transition-all duration-700 ${orbState === 'speaking' ? 'scale-110' : 'scale-100'}`}
                        />
                    )}
                </div>
            </div>

            {/* ─── STRUCTURAL SOUND WAVE ─── */}
            <div
                className="flex items-end gap-1.5 mt-8 transition-opacity duration-500"
                style={{ height: 32, opacity: (isSpeaking || isListening) ? 1 : 0 }}
            >
                {Array.from({ length: 15 }, (_, i) => (
                    <div
                        key={i}
                        className="bg-slate-950"
                        style={{
                            width: 3,
                            animation: (isSpeaking || isListening)
                                ? `wave-bar ${0.4 + i * 0.05}s ease-in-out infinite alternate`
                                : 'none',
                            height: (isSpeaking || isListening) ? undefined : 2,
                            minHeight: 2,
                        }}
                    />
                ))}
            </div>

            {/* ─── NAME & TAGLINE ─── */}
            <div className="text-center mt-8 z-10">
                <p className="text-slate-950 font-black text-3xl uppercase tracking-tighter">{char.name}</p>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-2 text-slate-500">{char.tagline}</p>
                <p className="text-slate-300 text-[8px] font-black uppercase tracking-widest mt-1">Node: {modelName}</p>
            </div>

            {/* ─── LISTENING HINT ─── */}
            {isListening && (
                <p className="mt-4 text-slate-950 text-[10px] font-black uppercase tracking-widest animate-pulse z-10">
                   [ Listening_Port_Active ]
                </p>
            )}

            {/* ─── FLOATING SUBTITLE ─── */}
            <div
                className="absolute bottom-36 left-0 right-0 px-10 flex justify-center pointer-events-none"
                style={{
                    opacity: showSubtitle && response ? 1 : 0,
                    transform: showSubtitle ? 'translateY(0)' : 'translateY(10px)',
                    transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
            >
                <div
                    className="max-w-xl bg-white border-4 border-slate-950 p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)] flex flex-col items-center gap-4 selection:bg-slate-950 selection:text-white"
                >
                    {(() => {
                        const imageRegex = /!\[.*?\]\((.*?)\)/;
                        const match = response?.match(imageRegex);
                        const imageUrl = match ? match[1] : null;
                        const cleanText = response ? response.replace(imageRegex, '').trim() : '';
                        
                        return (
                            <>
                                {imageUrl && (
                                    <div className="w-full aspect-square border-2 border-slate-950 shadow-[4px_4px_0px_rgba(0,0,0,0.1)]">
                                        <img src={imageUrl} alt="AI Visual" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <p className="text-slate-950 font-black uppercase text-center text-lg leading-tight tracking-tight">
                                    {cleanText && cleanText.length > 240 ? cleanText.slice(0, 237) + '…' : cleanText}
                                </p>
                            </>
                        );
                    })()}
                </div>
            </div>

            {/* ─── INPUT BAR ─── */}
            <div className="absolute bottom-8 left-0 right-0 px-10 z-20">
                <div
                    className="flex items-center gap-4 bg-white border-4 border-slate-950 p-4 shadow-[8px_8px_0px_rgba(0,0,0,1)] selection:bg-slate-950 selection:text-white"
                >
                    {/* Status marker */}
                    <div
                        className="w-3 h-3 flex-shrink-0 transition-all border border-slate-950"
                        style={{
                            background: isListening ? '#000'
                                : isSpeaking ? '#000'
                                    : '#e2e8f0',
                            animation: (isListening || isSpeaking) ? 'pulse 0.5s ease-in-out infinite' : 'none',
                        }}
                    />

                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={e => {
                            setInput(e.target.value);
                            e.target.style.height = '28px';
                            e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
                        }}
                        onKeyDown={e => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder={
                            isListening ? '[ LISTENING_RAW_INPUT ]'
                                : isLoading ? `[ PROCESSING_COMMANDS ]`
                                    : `SYNC_MESSAGE_TO_${char.name.toUpperCase()}...`
                        }
                        disabled={isLoading}
                        rows={1}
                        className="flex-1 bg-transparent text-slate-950 text-lg font-black uppercase placeholder-slate-200 resize-none focus:outline-none leading-tight overflow-hidden tracking-tighter"
                        style={{ minHeight: 28, maxHeight: 100 }}
                    />

                    {/* Mic toggle button */}
                    <button
                        onClick={toggleListening}
                        disabled={isLoading}
                        className={`flex-shrink-0 p-3 border-2 transition-all ${isListening
                            ? 'bg-slate-950 text-white border-slate-950'
                            : 'bg-white text-slate-950 border-slate-100 hover:border-slate-950'
                            }`}
                    >
                        {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                    </button>

                    {/* Send button */}
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="flex-shrink-0 bg-slate-950 text-white font-black uppercase text-[10px] tracking-widest px-8 py-3 hover:bg-white hover:text-slate-950 border-2 border-slate-950 transition-all disabled:bg-slate-50 disabled:text-slate-200 disabled:border-slate-100"
                    >
                        {isLoading
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : '[ SEND ]'
                        }
                    </button>
                </div>

                {/* Error display */}
                {(error || sttError) && (
                    <p className="text-center text-slate-950 font-black uppercase text-[10px] mt-4 tracking-widest bg-white border-2 border-slate-950 py-2">
                        ERROR: {sttError || error}
                    </p>
                )}
                
                <div className="text-center mt-4 pointer-events-none">
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.3em]">AI Neutrality Not Guaranteed.</span>
                </div>
            </div>

            {/* ─── KEYFRAME STYLES ─── */}
            <style>{`
        @keyframes orb-breathe {
          0%, 100% { transform: scale(1.06); }
          50%       { transform: scale(1.12); }
        }
        @keyframes orb-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.7; }
        }
        @keyframes ping-slow {
          0%   { transform: scale(0.85); opacity: 0.6; }
          100% { transform: scale(1.15); opacity: 0; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes wave-bar {
          from { height: 4px; }
          to   { height: 26px; }
        }
      `}</style>
        </div>
    );
}
