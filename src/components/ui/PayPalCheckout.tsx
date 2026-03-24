'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface PayPalCheckoutProps {
    /** USD amount as a number, e.g. 10 = $10.00 */
    amount: number;
    /** Human-readable description shown in PayPal receipt */
    description: string;
    /** Internal tier identifier, e.g. 'developer', 'data-miner', 'copywriter', 'autonomous-sdr' */
    tier: string;
    /** Email address to credit the purchase to */
    email: string;
    /** Optional: billing interval for dev tier */
    interval?: 'month' | 'year' | 'lifetime';
    /** Optional: SANC tokens to grant */
    tokens?: number;
    /** Called when payment is fully captured and KV is updated */
    onSuccess?: (result: any) => void;
    /** Called on any error */
    onError?: (msg: string) => void;
}

const PAYPAL_CLIENT_ID = 'AQAPArt2QgkA3bItoxo_zRIUQEa0UcB9LnYXcY3gfOiAWIWp0IPRp5kWSW91rHl3twIruZ8aUIkHOOMp';

export default function PayPalCheckout({
    amount,
    description,
    tier,
    email,
    interval,
    tokens,
    onSuccess,
    onError,
}: PayPalCheckoutProps) {
    const [sdkReady, setSdkReady] = useState(false);
    const [sdkError, setSdkError] = useState<string | null>(null);
    const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
    const [statusMsg, setStatusMsg] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const buttonsRef = useRef<any>(null);

    // Load PayPal SDK once
    useEffect(() => {
        const existingScript = document.getElementById('paypal-sdk');
        if (existingScript) {
            if ((window as any).paypal) setSdkReady(true);
            else existingScript.addEventListener('load', () => setSdkReady(true));
            return;
        }

        const script = document.createElement('script');
        script.id = 'paypal-sdk';
        script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD&enable-funding=venmo&disable-funding=credit,card`;
        script.async = true;
        script.onload = () => setSdkReady(true);
        script.onerror = () => setSdkError('Failed to load PayPal SDK. Please refresh.');
        document.body.appendChild(script);
    }, []);

    // Render PayPal buttons once SDK is ready
    useEffect(() => {
        if (!sdkReady || !containerRef.current || !(window as any).paypal) return;

        // Clean up previous instance
        if (buttonsRef.current) {
            try { buttonsRef.current.close(); } catch (_) {}
        }
        containerRef.current.innerHTML = '';

        const paypal = (window as any).paypal;

        buttonsRef.current = paypal.Buttons({
            style: {
                layout: 'vertical',
                color: 'gold',
                shape: 'pill',
                label: 'pay',
                height: 48,
            },

            // Step 1: Create order server-side
            createOrder: async () => {
                setStatus('processing');
                setStatusMsg('Creating secure PayPal order...');
                try {
                    const res = await fetch('/api/purchase/paypal', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            action: 'create-order',
                            amount: amount.toFixed(2),
                            description,
                        }),
                    });
                    const data = await res.json();
                    if (data.error) throw new Error(data.error);
                    setStatus('idle');
                    return data.orderID;
                } catch (err: any) {
                    const msg = err.message || 'Failed to create order';
                    setStatus('error');
                    setStatusMsg(msg);
                    onError?.(msg);
                    throw err;
                }
            },

            // Step 2: User approved — capture & fulfill
            onApprove: async (_data: any) => {
                setStatus('processing');
                setStatusMsg('Verifying payment with PayPal...');
                try {
                    const res = await fetch('/api/purchase/paypal', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            action: 'capture',
                            orderID: _data.orderID,
                            email: email.toLowerCase(),
                            tier,
                            interval,
                            tokens,
                        }),
                    });
                    const result = await res.json();
                    if (result.error) throw new Error(result.error);

                    setStatus('success');
                    setStatusMsg('Payment complete! Your access has been activated.');
                    onSuccess?.(result);
                } catch (err: any) {
                    const msg = err.message || 'Payment verification failed';
                    setStatus('error');
                    setStatusMsg(msg);
                    onError?.(msg);
                }
            },

            onError: (err: any) => {
                const msg = err?.message || 'PayPal encountered an error';
                setStatus('error');
                setStatusMsg(msg);
                onError?.(msg);
            },

            onCancel: () => {
                setStatus('idle');
                setStatusMsg('');
            },
        });

        buttonsRef.current.render(containerRef.current).catch((err: any) => {
            setSdkError('Could not render PayPal buttons: ' + (err?.message || err));
        });

        return () => {
            if (buttonsRef.current) {
                try { buttonsRef.current.close(); } catch (_) {}
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sdkReady, amount, tier, email]);

    return (
        <div className="w-full flex flex-col gap-3">
            {/* Status overlay */}
            {status === 'processing' && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-950/60 border border-blue-700/40">
                    <Loader2 className="w-5 h-5 text-blue-400 animate-spin shrink-0" />
                    <span className="text-blue-300 text-sm">{statusMsg}</span>
                </div>
            )}
            {status === 'success' && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-950/60 border border-emerald-700/40">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span className="text-emerald-300 text-sm font-semibold">{statusMsg}</span>
                </div>
            )}
            {(status === 'error' || sdkError) && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-950/60 border border-red-700/40">
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                    <span className="text-red-300 text-sm">{sdkError || statusMsg}</span>
                </div>
            )}

            {/* PayPal Button Container */}
            {!sdkReady && !sdkError && status !== 'success' && (
                <div className="flex justify-center items-center py-4">
                    <Loader2 className="w-6 h-6 text-neutral-500 animate-spin" />
                </div>
            )}

            <div
                ref={containerRef}
                className={`w-full transition-opacity duration-300 ${status === 'success' ? 'opacity-0 pointer-events-none h-0 overflow-hidden' : 'opacity-100'}`}
            />

            {status === 'success' && (
                <a
                    href="/kla/dashboard"
                    className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-center transition-all block"
                >
                    Go to K'LA Dashboard →
                </a>
            )}
        </div>
    );
}
