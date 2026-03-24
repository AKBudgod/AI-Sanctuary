'use client';

import React, { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

// Declare aclib on window
declare global {
    interface Window {
        aclib: any;
    }
}

// React component to dynamically inject the Adcash Banner
const AdSlot = ({ zoneId, index }: { zoneId: string, index: number }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Clear children
        containerRef.current.innerHTML = '';

        try {
            const script = document.createElement('script');
            script.type = 'text/javascript';
            // We inject the script exactly as Adcash expects it inside a div
            script.innerHTML = `aclib.runBanner({ zoneId: '${zoneId}' });`;
            containerRef.current.appendChild(script);
        } catch (e) {
            console.error(`Adcash banner ${index} failed:`, e);
        }
    }, [zoneId, index]);

    return (
        <div
            ref={containerRef}
            className="w-full h-[250px] bg-gray-900/50 border border-gray-800 rounded-xl flex items-center justify-center overflow-hidden relative group hover:bg-gray-800 transition-colors"
        >
            <span className="block w-8 h-8 rounded-full border border-gray-700 border-t-blue-500 animate-spin absolute -z-10" />
            <span className="text-gray-700 text-xs absolute -z-10">Ad slot ${index + 1}</span>
        </div>
    );
};

export default function AdBannerGrid() {
    const pathname = usePathname();
    const [isAdultTier, setIsAdultTier] = React.useState(false);

    // Determine if we are on an 18+ tier based on the route or custom events
    useEffect(() => {
        // Fallback for direct routing if it exists
        if (pathname?.includes('/playground/master') || pathname?.includes('/playground/developer')) {
            setIsAdultTier(true);
        }

        // Listen for dynamic tier changes from UnifiedPlayground
        const handleTierChange = (e: Event) => {
            const customEvent = e as CustomEvent;
            setIsAdultTier(customEvent.detail.isAdult);
        };

        window.addEventListener('adultTierStatus', handleTierChange);
        return () => window.removeEventListener('adultTierStatus', handleTierChange);
    }, [pathname]);

    // Trigger the 18+ Pop-Under ad ONLY when on an adult tier
    useEffect(() => {
        if (isAdultTier && typeof window !== 'undefined' && window.aclib) {
            try {
                window.aclib.runPop({
                    zoneId: '10996522',
                });
            } catch (e) {
                console.error("Adcash pop-under failed:", e);
            }
        }
    }, [isAdultTier]);

    // Currently we only have one banner ID, wait for user to specify Adult Banner ID if different
    const bannerZoneId = '10996558';

    return (
        <div className="w-full bg-gray-950 py-8 border-t border-gray-900 border-b border-gray-900">
            <div className="container mx-auto px-4 z-10 relative">
                <div className="mb-4 flex items-center justify-between text-xs text-gray-600 uppercase tracking-wider">
                    <span>Advertisement spaces</span>
                    {isAdultTier && (
                        <span className="text-red-500/80 font-bold border border-red-500/20 px-2 py-0.5 rounded animate-pulse">
                            18+ Ads Authorized
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[0, 1, 2, 3].map((i) => (
                        <AdSlot key={i} zoneId={bannerZoneId} index={i} />
                    ))}
                </div>
            </div>
        </div>
    );
}
