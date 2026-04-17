'use client';

import React, { useEffect, useState } from 'react';

interface StarProps {
  id: number;
  top: string;
  left: string;
  size: string;
  duration: string;
  delay: string;
  opacity: number;
}

const Star = React.memo(({ top, left, size, duration, delay, opacity }: StarProps) => (
  <div
    className="absolute bg-white rounded-full animate-twinkle"
    style={{
      top,
      left,
      width: size,
      height: size,
      opacity,
      '--twinkle-duration': duration,
      animationDelay: delay,
      boxShadow: `0 0 ${parseFloat(size)*2}px rgba(255,255,255,0.8)`
    } as React.CSSProperties}
  />
));

Star.displayName = 'Star';

export default function GalaxyBackground() {
  const [stars, setStars] = useState<StarProps[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // 300 stars for dense deep space feel
    const starCount = 300; 
    const newStars: StarProps[] = [];
    
    for (let i = 0; i < starCount; i++) {
        // Create variations for foreground vs background stars
        const isForeground = Math.random() > 0.85;
        newStars.push({
            id: i,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            size: isForeground ? `${Math.random() * 2 + 1.5}px` : `${Math.random() * 1 + 0.5}px`,
            duration: `${Math.random() * 4 + 2}s`,
            delay: `${Math.random() * 5}s`,
            opacity: isForeground ? Math.random() * 0.5 + 0.5 : Math.random() * 0.3 + 0.1,
        });
    }
    setStars(newStars);
  }, []);

  if (!mounted) return <div className="fixed inset-0 z-[-1] bg-[#020008]" />;

  return (
    <div className="fixed inset-0 z-[-1] bg-[#020008] overflow-hidden pointer-events-none">
      
      {/* SVG Turbulence Filter for Gas Clouds */}
      <svg className="hidden absolute w-0 h-0">
        <filter id="galaxy-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
        </filter>
      </svg>

      {/* Deep Space Dust Lane */}
      <div className="absolute inset-0 opacity-[0.15] mix-blend-screen animate-float-galaxy"
           style={{ 
             background: 'linear-gradient(45deg, transparent 10%, rgba(34, 211, 238, 0.4) 40%, rgba(168, 85, 247, 0.3) 60%, transparent 90%)',
             filter: 'blur(40px)',
             animationDuration: '60s'
           }} 
      />

      {/* Giant Neon Cyan Nebula (Top Left) */}
      <div 
        className="absolute w-[80vw] h-[80vh] rounded-full mix-blend-screen animate-pulse-glow"
        style={{ 
          top: '-20%', left: '-10%',
          background: 'radial-gradient(circle, rgba(34,211,238,0.2) 0%, rgba(34,211,238,0) 65%)', 
          filter: 'blur(80px)',
          animationDuration: '12s' 
        }}
      />
      
      {/* Giant Deep Purple Nebula (Bottom Right) */}
      <div 
        className="absolute w-[100vw] h-[100vh] rounded-full mix-blend-screen animate-float-galaxy"
        style={{ 
          bottom: '-30%', right: '-20%',
          background: 'radial-gradient(circle, rgba(147,51,234,0.15) 0%, rgba(88,28,135,0) 70%)', 
          filter: 'blur(90px)',
          animationDuration: '40s',
          animationDirection: 'reverse'
        }}
      />

      {/* Galactic Core (Center) */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[40vh] rounded-full mix-blend-screen opacity-20"
        style={{ 
          background: 'radial-gradient(ellipse, rgba(14,165,233,0.15) 0%, transparent 70%)', 
          filter: 'blur(100px)',
          transform: 'translate(-50%, -50%) rotate(-25deg)'
        }}
      />

      {/* Dense Starfield */}
      <div className="absolute inset-0">
        {stars.map((star) => (
          <Star key={star.id} {...star} />
        ))}
      </div>

      {/* Cinema Grain Overlay */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none mix-blend-overlay"
           style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23galaxy-noise)\'/%3E%3C/svg%3E")' }} />
    </div>
  );
}
