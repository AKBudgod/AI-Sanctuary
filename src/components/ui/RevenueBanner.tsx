'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Zap, ChevronRight, X } from './Icons';

export default function RevenueBanner() {
    const [isVisible, setIsVisible] = useState(true);
    const [timeLeft, setTimeLeft] = useState('00:00:00');

    useEffect(() => {
        // 7-day countdown from now for the Lifetime Liquidity Event
        const saleEndDate = new Date();
        saleEndDate.setDate(saleEndDate.getDate() + 7);
        saleEndDate.setUTCHours(23, 59, 59, 999);
        
        const timer = setInterval(() => {
            const now = new Date();
            const diff = saleEndDate.getTime() - now.getTime();
            if (diff <= 0) {
                setTimeLeft('00:00:00');
                return;
            }

            const d = Math.floor(diff / (1000 * 60 * 60 * 24));
            const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
            const s = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');
            
            setTimeLeft(`${d}d ${h}:${m}:${s}`);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    if (!isVisible) return null;

    return (
        <div className="relative z-[100] bg-yellow-400 border-b-4 border-slate-950 shadow-[0px_4px_0px_rgba(0,0,0,0.1)]">
            <div className="container mx-auto px-10 py-3 flex flex-wrap md:flex-row items-center justify-center gap-x-8 gap-y-2 text-center">
                <div className="flex items-center gap-3">
                    <span className="w-3 h-3 bg-slate-950 animate-pulse" />
                    <p className="text-slate-950 text-sm font-black uppercase tracking-tighter italic">
                        LIFETIME_ELITE_SYNC: FULL_UNCENSORED_ACCESS — $50
                    </p>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="bg-slate-950 px-4 py-1 border-2 border-slate-950 font-mono text-xs font-black text-yellow-400 uppercase shadow-[4px_4px_0px_rgba(0,0,0,0.2)]">
                        ENDS_IN: {timeLeft.toUpperCase()}
                    </div>
                    
                    <Link 
                        href="/buy?mode=developer&interval=lifetime" 
                        className="bg-slate-950 text-white px-6 py-1.5 text-xs font-black uppercase tracking-widest border-2 border-slate-950 hover:bg-white hover:text-slate-950 transition-all shadow-[4px_4px_0px_rgba(0,0,0,0.1)] flex items-center gap-2 group whitespace-nowrap"
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
