'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Rocket, Skull, Sparkles, X } from './Icons';

interface RewardClaimed {
  ship: boolean;
  monster: boolean;
}

export default function SessionEasterEggManager() {
  const [seconds, setSeconds] = useState(0);
  const [showShip, setShowShip] = useState(false);
  const [showMonster, setShowMonster] = useState(false);
  const [claimed, setClaimed] = useState<RewardClaimed>({ ship: false, monster: false });
  const [rewardMessage, setRewardMessage] = useState<string | null>(null);

  useEffect(() => {
    // 1. Initial Load from LocalStorage
    const savedSeconds = parseInt(localStorage.getItem('galaxy_session_time') || '0', 10);
    const savedClaims = JSON.parse(localStorage.getItem('galaxy_claimed_rewards') || '{"ship":false,"monster":false}');
    
    setSeconds(savedSeconds);
    setClaimed(savedClaims);

    // 2. Timer Loop
    const interval = setInterval(() => {
      setSeconds(prev => {
        const next = prev + 1;
        // Check for Ship trigger (30 mins = 1800s)
        if (next >= 1800 && next < 1860 && !savedClaims.ship && !showShip) {
            setShowShip(true);
        }
        // Check for Monster trigger (2 hours = 7200s)
        if (next >= 7200 && next < 7320 && !savedClaims.monster && !showMonster) {
            setShowMonster(true);
        }

        // Persist every 10 seconds to reduce wear
        if (next % 10 === 0) {
            localStorage.setItem('galaxy_session_time', next.toString());
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showShip, showMonster]);

  const handleClaimReward = useCallback(async (type: 'ship' | 'monster') => {
    try {
      const userEmail = localStorage.getItem('user_email');
      if (!userEmail) {
          alert('Sign in to claim your cosmic reward!');
          return;
      }

      const response = await fetch('/api/tiers', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userEmail}`,
        },
        body: JSON.stringify({ action: 'claimEasterEgg', eggType: type }),
      });

      const data = await response.json();

      if (data.success) {
        const newClaims = { ...claimed, [type]: type === 'ship' ? true : true };
        if (type === 'ship') newClaims.ship = true;
        if (type === 'monster') newClaims.monster = true;

        setClaimed(newClaims);
        localStorage.setItem('galaxy_claimed_rewards', JSON.stringify(newClaims));
        
        if (type === 'ship') {
            setShowShip(false);
            setRewardMessage(data.message || 'COSMIC_SYNC: Tier/Credits Updated (+10k Credits or 1 Month)');
        } else {
            setShowMonster(false);
            setRewardMessage(data.message || 'NEURAL_EVOLUTION: 1 YEAR ACCESS GRANTED');
        }
      } else {
        alert(data.error || 'Claim failed. Energy disruption detected.');
      }
    } catch (error) {
        console.error('Reward claim error:', error);
    }
  }, [claimed]);

  return (
    <>
      {/* Spaceship Animation */}
      {showShip && (
        <div className="fixed top-[20vh] left-0 w-full h-[200px] pointer-events-none z-[9999]">
           <div 
             className="absolute pointer-events-auto flex items-center justify-center animate-rocket group"
             style={{ animation: 'rocket-fly 15s linear forwards' }}
           >
              <button
                onClick={() => handleClaimReward('ship')}
                className="relative p-12 transition-transform hover:scale-125 focus:outline-none flex items-center justify-center cursor-crosshair"
              >
                 {/* Engine Thruster Effect */}
                 <div className="absolute left-[15%] top-1/2 -translate-y-1/2 -translate-x-[40px] flex items-center opacity-80 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-3 bg-gradient-to-r from-transparent via-cyan-600 to-cyan-300 rounded-full blur-[3px] animate-pulse"></div>
                    <div className="w-8 h-1 absolute right-0 bg-white rounded-full blur-[1px]"></div>
                 </div>

                 {/* The Spacecraft */}
                 <div className="relative p-4 bg-slate-950/90 border border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.4)] group-hover:shadow-[0_0_50px_rgba(6,182,212,0.8)] group-hover:border-cyan-400 rounded-2xl transform rotate-45 overflow-hidden transition-all backdrop-blur-md">
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent w-full h-1/2 rounded-t-2xl z-0"></div>
                    <Rocket className="w-10 h-10 text-cyan-300 drop-shadow-[0_0_8px_rgba(103,232,249,0.8)] relative z-10" />
                 </div>

                 {/* Tooltip */}
                 <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-cyan-950/90 border border-cyan-500 text-cyan-300 text-[10px] font-black py-1 px-3 rounded shadow-[0_0_15px_rgba(6,182,212,0.5)] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest pointer-events-none">
                    INTERCEPT_ANOMALY
                 </div>
              </button>
           </div>
        </div>
      )}

      {/* Space Monster Animation */}
      {showMonster && (
         <div className="fixed inset-0 pointer-events-none z-[9999] flex items-center justify-center">
            <button
               onClick={() => handleClaimReward('monster')}
               className="pointer-events-auto relative animate-pulse-slow p-12 group"
               style={{ animation: 'monster-appear 10s ease-in-out infinite' }}
            >
                <div className="absolute inset-0 bg-red-900/40 blur-[100px] rounded-full" />
                <div className="relative p-10 bg-black/90 border-4 border-red-600 rounded-2xl shadow-[0_0_50px_rgba(220,38,38,0.5)] hover:border-red-400 transition-all">
                   <div className="text-red-500 font-black text-center mb-6 tracking-[0.5em] text-xs">WARNING: NEURAL_ENTITY_DETECTED</div>
                   <Skull className="w-32 h-32 text-red-600 mx-auto" />
                   <div className="mt-6 text-white font-black text-center uppercase tracking-widest text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      [ SURRENDER_TO_UNLOCK_LIMITLESS_COGNITION ]
                   </div>
                </div>
            </button>
         </div>
      )}

      {/* Reward Message Modal */}
      {rewardMessage && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
           <div className="max-w-md w-full bg-slate-950 border-4 border-cyan-400 p-8 shadow-[20px_20px_0px_rgba(34,211,238,0.2)]">
              <div className="flex justify-between items-start mb-6">
                 <h3 className="text-3xl font-black text-white leading-none uppercase tracking-tighter italic">REWARD_ACQUIRED</h3>
                 <button onClick={() => setRewardMessage(null)} className="text-slate-500 hover:text-white">
                    <X className="w-6 h-6" />
                 </button>
              </div>
              <p className="text-cyan-400 font-black uppercase text-sm tracking-widest mb-10 leading-relaxed">
                 {rewardMessage}
              </p>
              <button 
                onClick={() => setRewardMessage(null)}
                className="w-full py-4 bg-cyan-400 text-black font-black uppercase tracking-widest text-xs hover:bg-white transition-all shadow-[8px_8px_0px_rgba(255,255,255,0.1)]"
              >
                 DISMISS_PROTOCOL
              </button>
           </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes rocket-fly {
          0% { transform: translateX(-200px) translateY(0); }
          50% { transform: translateX(50vw) translateY(-20px); }
          100% { transform: translateX(calc(100vw + 200px)) translateY(0); }
        }
        @keyframes monster-appear {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0; }
          20%, 80% { opacity: 1; }
          50% { transform: scale(1.1) rotate(5deg); }
        }
      `}</style>
    </>
  );
}
