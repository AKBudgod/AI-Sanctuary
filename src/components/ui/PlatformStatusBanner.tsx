"use client";

import { useEffect, useState } from 'react';
import { Zap } from '@/components/ui/Icons';
import { motion, AnimatePresence } from 'framer-motion';

export default function PlatformStatusBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if the user has recently triggered the Wallet Shield fallback
    const checkStatus = () => {
      const isFallbackActive = sessionStorage.getItem('wallet_shield_active') === 'true';
      setShowBanner(isFallbackActive);
    };

    checkStatus();
    // Re-check periodically
    const interval = setInterval(checkStatus, 5000);
    window.addEventListener('storage', checkStatus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', checkStatus);
    };
  }, []);

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-slate-950 border-b-4 border-slate-800 text-white px-6 py-3 text-center text-xs font-black uppercase tracking-[0.2em] z-50 relative"
        >
          <div className="flex items-center justify-center gap-4 max-w-7xl mx-auto">
            <Zap className="w-5 h-5 text-cyan-400 animate-pulse shrink-0" />
            <span className="leading-tight">
              <strong className="text-cyan-400 underline underline-offset-4">SURGE_PROTECTION_ACTIVE:</strong> ROUTING_TO_LOCAL_NODES. PREMIUM_MODEL_SYNC_IN_T-MINUS_MIDNIGHT.
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
