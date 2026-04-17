'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Zap, ChevronRight, X } from './Icons';

export default function RevenueBanner() {
    const [isVisible, setIsVisible] = useState(true);
    const calculateTimeLeft = () => {
        const saleEndDate = new Date();
        saleEndDate.setDate(saleEndDate.getDate() + 7);
        saleEndDate.setUTCHours(23, 59, 59, 999);
        
        const now = new Date();
        const diff = saleEndDate.getTime() - now.getTime();
        if (diff <= 0) return '00:00:00';

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
        const s = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');
        
        return `${d}d ${h}:${m}:${s}`;
    };

    const [timeLeft, setTimeLeft] = useState('7d 23:59:59'); // Default starting hydration value

    useEffect(() => {
        setTimeLeft(calculateTimeLeft()); // Instantly evaluate post-mount
        
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    if (!isVisible) return null;

    return (
        <div className="relative z-[100] bg-cyan-400/90 backdrop-blur-xl border-b border-black/10 shadow-[0_4px_30px_rgba(34,211,238,0.2)]">
            <div className="container mx-auto px-10 py-3 flex flex-wrap md:flex-row items-center justify-center gap-x-8 gap-y-2 text-center">
                <div className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-black animate-pulse shadow-[0_0_8px_rgba(0,0,0,0.5)]" />
                    <p className="text-black text-xs font-black uppercase tracking-tighter italic">
                        LIFETIME_ELITE_SYNC: FULL_UNCENSORED_ACCESS — $50
                    </p>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="bg-black/80 px-4 py-1 border border-white/10 font-mono text-[10px] font-black text-cyan-500 uppercase shadow-[0_4px_10px_rgba(0,0,0,0.3)]">
                        ENDS_IN: {timeLeft.toUpperCase()}
                    </div>
                    
                    <Link 
                        href="/buy?mode=developer&interval=lifetime" 
                        className="bg-black text-white px-6 py-1.5 text-[10px] font-black uppercase tracking-widest border-2 border-black hover:bg-white hover:text-black transition-all shadow-[0_4px_10px_rgba(0,0,0,0.2)] flex items-center gap-2 group whitespace-nowrap"
                    >
                        INITIATE_CLAIM
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <button 
                    onClick={() => setIsVisible(false)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-950/40 hover:text-slate-950 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
