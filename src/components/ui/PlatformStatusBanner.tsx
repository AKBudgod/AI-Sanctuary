"use client";

import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';
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
          className="bg-purple-900/90 border-b border-purple-500/50 text-purple-100 px-4 py-2 text-center text-sm font-medium z-50 relative shadow-[0_0_15px_rgba(168,85,247,0.4)] backdrop-blur-md"
        >
          <div className="flex items-center justify-center gap-2 max-w-7xl mx-auto">
            <Zap className="w-4 h-4 text-purple-400 animate-pulse" />
            <span>
              <strong>Surge Protection Active:</strong> Due to extremely high demand, the Sanctuary is currently routing requests to free local models. Premium models will automatically resume at Midnight UTC.
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
