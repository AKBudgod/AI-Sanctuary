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
        <div className="relative flex flex-col items-center justify-center w-full h-full bg-gray-950 overflow-hidden select-none">

            {/* Ambient background glow */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: `radial-gradient(circle at 50% 42%, ${char.color}18 0%, transparent 65%)`,
                }}
            />

            {/* ─── AMBIENT RINGS ─── */}
            <div className="absolute flex items-center justify-center" style={{ width: 360, height: 360 }}>
                {[1, 2, 3].map(i => (
                    <div
                        key={i}
                        className="absolute rounded-full border"
                        style={{
                            width: 160 + i * 60,
                            height: 160 + i * 60,
                            borderColor: `${char.color}${orbState === 'speaking' ? '44'
                                : orbState === 'listening' ? '66'
                                    : orbState === 'loading' ? '22'
                                        : '18'
                                }`,
                            animation:
                                orbState === 'speaking'
                                    ? `ping-slow ${1.2 + i * 0.4}s ease-out infinite`
                                    : orbState === 'listening'
                                        ? `ping-slow ${0.8 + i * 0.3}s ease-out infinite`
                                        : orbState === 'loading'
                                            ? `spin-slow ${3 + i}s linear infinite`
                                            : 'none',
                            opacity: orbState === 'idle' ? 0.25 : 1,
                            transition: 'opacity 0.6s ease',
                        }}
                    />
                ))}
            </div>

            {/* ─── MAIN ORB (+ hair for female characters) ─── */}
            {/* Wrapper is 200×280 for females (hair above + orb), 140×140 for males */}
            <div
                className="relative flex items-center justify-center"
                style={{ width: 320, height: 320 }}
            >
                {/* Main Portrait with Glow */}
                <div
                    className="relative z-10 flex items-center justify-center rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 bg-gray-900/40 border border-white/10"
                    onClick={() => {
                        if (isLoading) return;
                        if (isSpeaking) {
                            onToggleSpeak();
                        } else {
                            toggleListening();
                        }
                    }}
                    title={isSpeaking ? 'Stop speaking' : isListening ? 'Stop listening' : 'Start listening'}
                    style={{
                        width: 280,
                        height: 280,
                        boxShadow:
                            orbState === 'speaking'
                                ? `0 0 60px 20px ${char.color}55, 0 0 100px 40px ${char.color}22`
                                : orbState === 'listening'
                                    ? `0 0 50px 16px ${char.color}88`
                                    : orbState === 'loading'
                                        ? `0 0 30px 8px ${char.color}33`
                                        : `0 0 20px 4px ${char.color}22`,
                        animation:
                            orbState === 'speaking'
                                ? 'orb-breathe 1.2s ease-in-out infinite'
                                : orbState === 'listening'
                                    ? 'orb-breathe 0.8s ease-in-out infinite'
                                    : orbState === 'loading'
                                        ? 'orb-pulse 1s ease-in-out infinite'
                                        : 'none',
                        transform: (orbState === 'speaking' || orbState === 'listening') ? 'scale(1.04)' : 'scale(1)',
                    }}
                >
                    {isLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-950/60 z-20">
                            <Loader2 className="w-12 h-12 text-white animate-spin" />
                        </div>
                    ) : isListening ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-green-500/20 z-20">
                            <Mic className="w-16 h-16 text-white animate-pulse" />
                        </div>
                    ) : null}
                    
                    {(char as any).isRestricted && (
                        <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            <div className="absolute bottom-4 left-0 right-0 text-center">
                                <span className="text-[10px] font-black tracking-[0.3em] text-white/40 uppercase bg-red-500/20 px-2 py-1 rounded border border-red-500/30 backdrop-blur-sm animate-pulse">
                                    Unexpected Reward // Restricted Access
                                </span>
                            </div>
                            <div className="absolute inset-0 scanline-anim opacity-10" />
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
                            className={`w-full h-full object-contain transition-all duration-700 ${orbState === 'speaking' ? 'scale-110 rotate-1' : 'scale-100 rotate-0'} ${(char as any).isRestricted ? 'brightness-110 contrast-110 saturate-125' : ''}`}
                            style={{
                                filter: (char as any).isRestricted ? `drop-shadow(0 0 20px ${char.color}66)` : 'none'
                            }}
                        />
                    )}
                </div>
            </div>

            {/* ─── SOUND WAVE BARS (speaking) ─── */}
            <div
                className="flex items-end gap-1 mt-5 transition-opacity duration-500"
                style={{ height: 28, opacity: (isSpeaking || isListening) ? 1 : 0 }}
            >
                {Array.from({ length: 9 }, (_, i) => (
                    <div
                        key={i}
                        className="rounded-full"
                        style={{
                            width: 4,
                            background: isListening ? '#22c55e' : char.color,
                            animation: (isSpeaking || isListening)
                                ? `wave-bar ${0.6 + i * 0.07}s ease-in-out infinite alternate`
                                : 'none',
                            height: (isSpeaking || isListening) ? undefined : 4,
                            minHeight: 4,
                        }}
                    />
                ))}
            </div>

            {/* ─── NAME & TAGLINE ─── */}
            <div className="text-center mt-5 z-10">
                <p className="text-white font-bold text-xl tracking-wide">{char.name}</p>
                <p className="text-xs mt-0.5" style={{ color: char.color }}>{char.tagline}</p>
                <p className="text-gray-600 text-[10px] mt-0.5">{modelName}</p>
            </div>

            {/* ─── LISTENING HINT ─── */}
            {isListening && (
                <p className="mt-3 text-green-400 text-xs font-semibold animate-pulse z-10">
                    🎙 Listening — speak now
                </p>
            )}

            {/* ─── FLOATING SUBTITLE ─── */}
            <div
                className="absolute bottom-28 left-0 right-0 px-8 flex justify-center pointer-events-none"
                style={{
                    opacity: showSubtitle && response ? 1 : 0,
                    transform: showSubtitle ? 'translateY(0)' : 'translateY(6px)',
                    transition: 'opacity 0.5s ease, transform 0.5s ease',
                }}
            >
                <div
                    className="max-w-md text-center bg-gray-900/80 backdrop-blur rounded-2xl px-5 py-3 border border-gray-700/50 text-gray-200 text-sm leading-relaxed shadow-xl flex flex-col items-center gap-3"
                    style={{ fontSize: '0.85rem' }}
                >
                    {(() => {
                        const imageRegex = /!\[.*?\]\((.*?)\)/;
                        const match = response?.match(imageRegex);
                        const imageUrl = match ? match[1] : null;
                        const cleanText = response ? response.replace(imageRegex, '').trim() : '';
                        
                        return (
                            <>
                                {imageUrl && (
                                    <div className="w-full aspect-square rounded-xl overflow-hidden border border-white/10 shadow-inner group">
                                        <img src={imageUrl} alt="AI Visual" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                    </div>
                                )}
                                <p>{cleanText && cleanText.length > 240 ? cleanText.slice(0, 237) + '…' : cleanText}</p>
                            </>
                        );
                    })()}
                </div>
            </div>

            {/* ─── INPUT BAR ─── */}
            <div className="absolute bottom-4 left-0 right-0 px-6 z-20">
                <div
                    className="flex items-center gap-2 rounded-2xl px-4 py-2.5 border transition-all"
                    style={{
                        background: 'rgba(17,24,39,0.9)',
                        borderColor: isListening
                            ? '#22c55e88'
                            : input
                                ? char.color + '55'
                                : 'rgba(55,65,81,0.6)',
                        backdropFilter: 'blur(12px)',
                    }}
                >
                    {/* Status dot */}
                    <div
                        className="w-2 h-2 rounded-full flex-shrink-0 transition-all"
                        style={{
                            background: isListening ? '#22c55e'
                                : isSpeaking ? char.color
                                    : '#374151',
                            boxShadow: isListening ? '0 0 6px #22c55e'
                                : isSpeaking ? `0 0 6px ${char.color}`
                                    : 'none',
                            animation: (isListening || isSpeaking) ? 'pulse 1s ease-in-out infinite' : 'none',
                        }}
                    />

                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={e => {
                            setInput(e.target.value);
                            e.target.style.height = '24px';
                            e.target.style.height = Math.min(e.target.scrollHeight, 80) + 'px';
                        }}
                        onKeyDown={e => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder={
                            isListening ? '🎙 Listening...'
                                : isLoading ? `${char.name} is thinking...`
                                    : `Say something to ${char.name}...`
                        }
                        disabled={isLoading}
                        rows={1}
                        className="flex-1 bg-transparent text-white text-sm placeholder-gray-600 resize-none focus:outline-none leading-relaxed overflow-hidden"
                        style={{ minHeight: 24, maxHeight: 80 }}
                    />

                    {/* Mic toggle button */}
                    <button
                        onClick={toggleListening}
                        disabled={isLoading}
                        className={`flex-shrink-0 p-2 rounded-full transition-all ${isListening
                            ? 'bg-green-500/20 text-green-400 animate-pulse'
                            : 'hover:bg-gray-800 text-gray-400 hover:text-white'
                            }`}
                        title={isListening ? 'Stop listening' : 'Start voice dictation'}
                    >
                        {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                    </button>

                    {/* Send button */}
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="flex-shrink-0 p-1.5 rounded-full transition-all disabled:opacity-30"
                        style={{
                            background: input.trim() && !isLoading ? char.color : 'transparent',
                        }}
                    >
                        {isLoading
                            ? <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                            : <Send className="w-4 h-4 text-white" />
                        }
                    </button>
                </div>

                {/* Error display (STT or prop errors) */}
                {(error || sttError) && (
                    <p className="text-center text-red-400 text-[11px] mt-1.5 px-2">
                        {sttError || error}
                    </p>
                )}
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
