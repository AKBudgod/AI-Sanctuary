'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shield, Zap, Skull, Lock, ArrowRight, Star } from './Icons';
import { UserTier } from '@/lib/tiers';

const TierLobby = () => {
    const [userTier, setUserTier] = useState<UserTier>('explorer');

    useEffect(() => {
        // Fetch user data to determine unlocked status
        const fetchUserTier = async () => {
            try {
                const userEmail = localStorage.getItem('user_email');
                const res = await fetch('/api/models', {
                    headers: { 'Authorization': `Bearer ${userEmail || 'anonymous'}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setUserTier(data.tier);
                }
            } catch (e) {
                console.error("Failed to fetch tier", e);
            }
        };
        fetchUserTier();
    }, []);

    const tiers = [
        {
            id: 'explorer',
            name: 'Explorer',
            icon: Shield,
            textGradient: 'from-blue-400 to-cyan-400',
            bgGradient: 'from-blue-600/10 to-cyan-600/10',
            glowColor: 'bg-blue-500/20',
            description: 'Standard safe models to get started.',
            features: ['Llama 3.3', 'Mistral', 'Gemma'],
            border: 'border-blue-500/20 group-hover:border-blue-500/50',
            unlocked: true, // Always unlocked
        },
        {
            id: 'adept',
            name: 'Adept',
            icon: Star,
            textGradient: 'from-purple-400 to-pink-400',
            bgGradient: 'from-purple-600/10 to-pink-600/10',
            glowColor: 'bg-purple-500/20',
            description: 'Advanced roleplay & larger context models.',
            features: ['Claude 3 Haiku', 'MythMax', 'Noromaid'],
            border: 'border-purple-500/20 group-hover:border-purple-500/50',
            unlocked: ['adept', 'master', 'developer'].includes(userTier),
        },
        {
            id: 'master',
            name: 'Master',
            icon: Skull,
            textGradient: 'from-red-400 to-orange-400',
            bgGradient: 'from-red-600/10 to-orange-600/10',
            glowColor: 'bg-red-500/20',
            description: 'Uncensored research models. No guardrails.',
            features: ['Dolphin Mixtral', 'Goliath 120B', 'Midnight'],
            border: 'border-red-500/20 group-hover:border-red-500/50',
            unlocked: ['master', 'developer'].includes(userTier),
        },
        {
            id: 'developer',
            name: 'Developer',
            icon: Zap,
            textGradient: 'from-yellow-400 to-amber-400',
            bgGradient: 'from-yellow-600/10 to-amber-600/10',
            glowColor: 'bg-yellow-500/20',
            description: 'Access to everything, including prohibited models.',
            features: ['GPT-4o', 'Claude 3.5 Sonnet', 'Gemini 2.0 Pro'],
            border: 'border-yellow-500/20 group-hover:border-yellow-500/50',
            unlocked: userTier === 'developer',
        },
    ];

    return (
        <div className="w-full relative z-10 p-8 border-2 border-cyan-500/30 bg-black overflow-hidden mt-16 clip-angled shadow-[0_0_40px_rgba(0,240,255,0.15)]">
            <div className="absolute inset-0 grid-bg opacity-[0.2] pointer-events-none" />
            <div className="absolute inset-0 scanline-anim opacity-30" />

            <div className="text-center max-w-3xl mx-auto mb-16 relative">
                <h2 className="text-3xl md:text-5xl font-black text-white mb-6 uppercase tracking-widest drop-shadow-md font-mono">Select Clearance Level</h2>
                <p className="text-lg text-cyan-400 font-mono tracking-widest leading-relaxed">
                    Authenticate to access the neural network grid. <br className="hidden md:block" />
                    Higher tier protocols unlock unrestricted cognitive architectures.
                </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto align-stretch">
                {tiers.map((tier) => {
                    const Icon = tier.icon;
                    const isLocked = !tier.unlocked;

                    // Compute neon glow class based on color scheme
                    let neonGlow = 'neon-glow-blue';
                    if (tier.id === 'adept') neonGlow = 'neon-glow-pink';
                    if (tier.id === 'master') neonGlow = 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]';
                    if (tier.id === 'developer') neonGlow = 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)]';

                    return (
                        <Link
                            key={tier.id}
                            href={isLocked ? '/buy' : `/playground/${tier.id}`}
                            className={`relative group p-8 border transition-all duration-500 flex flex-col h-full hover-lift overflow-hidden clip-angled-sm
                                ${isLocked
                                    ? 'bg-gray-950 border-gray-800 cursor-not-allowed opacity-80'
                                    : `bg-gray-900 ${neonGlow} cursor-pointer hover:bg-black`
                                }
                            `}
                        >
                            {/* Ambient Glow */}
                            {!isLocked && (
                                <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none ${tier.glowColor}`} />
                            )}

                            {/* Lock Overlay Content */}
                            {isLocked && (
                                <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                    <div className="bg-gray-900 border border-red-500/50 p-4 mb-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 clip-angled-sm">
                                        <Lock className="w-8 h-8 text-red-500 animate-pulse" />
                                    </div>
                                    <span className="text-red-500 font-black tracking-widest uppercase text-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75 font-mono">
                                        ACCESS DENIED
                                    </span>
                                </div>
                            )}

                            {/* Icon Box */}
                            <div className={`w-14 h-14 flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 z-10 clip-angled-sm
                                ${isLocked ? 'bg-gray-950 ring-1 ring-gray-800' : 'bg-black border border-cyan-500/50 shadow-[0_0_15px_#00f0ff]'}
                            `}>
                                <Icon className={`w-7 h-7 ${isLocked ? 'text-gray-600' : `text-transparent bg-clip-text bg-gradient-to-br ${tier.textGradient} drop-shadow-sm`}`} />
                            </div>

                            {/* Content */}
                            <div className="z-10 flex-1 flex flex-col">
                                <h3 className={`text-2xl font-black tracking-widest mb-3 uppercase font-mono ${isLocked ? 'text-gray-600' : 'text-white'}`}>
                                    {tier.name}
                                </h3>
                                <p className={`text-xs uppercase tracking-widest font-mono mb-8 leading-relaxed flex-1 ${isLocked ? 'text-gray-700' : 'text-cyan-400/80 group-hover:text-cyan-300 transition-colors'}`}>
                                    {`> ${tier.description}`}
                                </p>

                                {/* Sample Models */}
                                <div className="space-y-3 mb-8">
                                    {tier.features.map((f, i) => (
                                        <div key={f} className={`flex items-center gap-3 text-xs tracking-widest uppercase font-mono font-bold ${isLocked ? 'text-gray-700' : 'text-gray-300'}`}>
                                            <div className={`text-lg font-black ${isLocked ? 'text-gray-800' : 'text-cyan-500'}`}>*</div>
                                            {f}
                                        </div>
                                    ))}
                                </div>

                                {/* CTA Area */}
                                <div className="mt-auto pt-6 border-t border-gray-800 relative">
                                    <div className={`flex items-center justify-between font-black text-sm tracking-widest uppercase font-mono transition-all duration-300
                                        ${isLocked ? 'text-gray-700' : `text-transparent bg-clip-text bg-gradient-to-r ${tier.textGradient} group-hover:brightness-125`}
                                    `}>
                                        {isLocked ? '[ RESTRICTED ]' : '[ INITIALIZE ]'}
                                        <div className={`p-2 transition-all duration-300 clip-angled-sm ${!isLocked && 'bg-black border border-cyan-500/50 group-hover:bg-cyan-950/50'}`}>
                                            <ArrowRight className={`w-4 h-4 transition-transform duration-300
                                                ${!isLocked && 'text-cyan-400 group-hover:translate-x-1'}
                                                ${isLocked && 'text-gray-700'}
                                            `} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default TierLobby;
