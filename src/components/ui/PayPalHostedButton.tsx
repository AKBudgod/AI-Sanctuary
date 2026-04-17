'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Loader2 } from '@/components/ui/Icons';

interface PayPalHostedButtonProps {
  buttonId: string;
  clientId: string;
  className?: string;
}

export default function PayPalHostedButton({ buttonId, clientId, className }: PayPalHostedButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If window.paypal already has HostedButtons, we're ready
    if ((window as any).paypal?.HostedButtons) {
      setIsLoaded(true);
      renderButton();
      return;
    }

    const scriptId = 'paypal-hosted-buttons-sdk';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&components=hosted-buttons&enable-funding=venmo&currency=USD`;
      script.async = true;
      document.body.appendChild(script);
    }

    const handleLoad = () => {
      setIsLoaded(true);
      renderButton();
    };

    const handleError = () => {
      setError('Failed to load PayPal secure link. Please check your connection.');
    };

    script.addEventListener('load', handleLoad);
    script.addEventListener('error', handleError);

    return () => {
      script.removeEventListener('load', handleLoad);
      script.removeEventListener('error', handleError);
    };
  }, [buttonId, clientId]);

  const renderButton = () => {
    if (containerRef.current && (window as any).paypal?.HostedButtons) {
      try {
        containerRef.current.innerHTML = ''; // Clear previous if any
        (window as any).paypal.HostedButtons({
          hostedButtonId: buttonId,
        }).render(`#${containerRef.current.id}`);
      } catch (err) {
        console.error('PayPal Render Error:', err);
      }
    }
  };

  return (
    <div className={`w-full flex flex-col items-center gap-4 ${className}`}>
      {!isLoaded && !error && (
        <div className="flex flex-col items-center gap-3 p-8 border border-white/5 bg-white/5 rounded-3xl animate-pulse w-full max-w-sm">
          <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500">Syncing Secure PayPal Portal...</span>
        </div>
      )}

      {error && (
        <div className="p-4 border border-red-500/30 bg-red-500/10 rounded-2xl text-red-400 text-xs font-mono text-center w-full max-w-sm">
          {error}
        </div>
      )}

      <div 
        ref={containerRef}
        id={`paypal-container-${buttonId}`}
        className={`w-full max-w-md min-h-[50px] transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
}
