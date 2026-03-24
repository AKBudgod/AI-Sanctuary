'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';

const PayPalCheckout = dynamic(() => import('@/components/ui/PayPalCheckout'), { ssr: false });

const TOKENS_PER_USD = 1000;

const USD_PRESETS = [10, 25, 50, 100];

function BuyPageInner() {
    const searchParams = useSearchParams();
    const [usd, setUsd] = useState(10);
    const [email, setEmail] = useState('');
    const [emailConfirmed, setEmailConfirmed] = useState(false);
    const [mode, setMode] = useState<'tokens' | 'developer'>('tokens');
    const [billingInterval, setBillingInterval] = useState<'month' | 'year' | 'lifetime'>('month');
    const [paySuccess, setPaySuccess] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    const tokens = Math.floor(usd * TOKENS_PER_USD);

    const devPrice = billingInterval === 'month' ? 20 : billingInterval === 'year' ? 50 : 100;
    const devTokens = 100000;

    useEffect(() => {
        const modeParam = searchParams.get('mode');
        if (modeParam === 'developer') setMode('developer');
        const savedEmail = localStorage.getItem('user_email');
        if (savedEmail) { setEmail(savedEmail); setEmailConfirmed(true); }
    }, [searchParams]);

    function handleEmailConfirm() {
        if (!email || !email.includes('@')) return;
        localStorage.setItem('user_email', email);
        setEmailConfirmed(true);
    }

    function handleSuccess(result: any) {
        setPaySuccess(true);
        if (mode === 'tokens') {
            setSuccessMsg(`✅ ${tokens.toLocaleString()} SANC tokens credited to ${email}!`);
        } else {
            setSuccessMsg(`✅ Developer Mode activated for ${email}!`);
        }
    }

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-800">
                <div className="px-6 py-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">Purchase SANC</h1>
                        <p className="text-gray-400">Power your AI research with SANC.</p>
                    </div>

                    {/* Mode Toggle */}
                    <div className="flex gap-1 bg-gray-800 rounded-lg p-1 mb-6">
                        <button
                            onClick={() => { setMode('tokens'); setPaySuccess(false); }}
                            className={`flex-1 py-2.5 rounded-md text-sm font-semibold transition-all ${mode === 'tokens'
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            Buy Tokens
                        </button>
                        <button
                            onClick={() => { setMode('developer'); setPaySuccess(false); }}
                            className={`flex-1 py-2.5 rounded-md text-sm font-semibold transition-all ${mode === 'developer'
                                ? 'bg-purple-600 text-white shadow-lg'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            Developer Mode
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Email Address
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setEmailConfirmed(false); }}
                                    onKeyDown={(e) => e.key === 'Enter' && handleEmailConfirm()}
                                    placeholder="name@example.com"
                                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                                {!emailConfirmed && (
                                    <button
                                        onClick={handleEmailConfirm}
                                        disabled={!email.includes('@')}
                                        className="px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        Set
                                    </button>
                                )}
                                {emailConfirmed && (
                                    <div className="px-3 py-3 bg-emerald-900/30 border border-emerald-700/50 text-emerald-400 rounded-lg text-sm flex items-center">
                                        ✓
                                    </div>
                                )}
                            </div>
                            <p className="mt-1 text-xs text-gray-500">Your tokens will be credited to this email.</p>
                        </div>

                        {/* Tokens Mode */}
                        {mode === 'tokens' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Amount (USD)</label>
                                    <div className="grid grid-cols-4 gap-2 mb-4">
                                        {USD_PRESETS.map((amount) => (
                                            <button
                                                key={amount}
                                                onClick={() => setUsd(amount)}
                                                className={`py-2 rounded-lg text-sm font-semibold transition-all ${usd === amount
                                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-900'
                                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                                                    }`}
                                            >
                                                ${amount}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                        <input
                                            type="number"
                                            min={5}
                                            value={usd}
                                            onChange={(e) => setUsd(Math.max(0, Number(e.target.value)))}
                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-8 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-800/50 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                                    <span className="text-blue-200 text-sm font-medium uppercase tracking-wider mb-1">You Receive</span>
                                    <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                                        {tokens.toLocaleString()}
                                    </span>
                                    <span className="text-gray-400 text-sm mt-1">SANC Credits</span>
                                </div>
                            </>
                        )}

                        {/* Developer Mode */}
                        {mode === 'developer' && (
                            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-800/50 rounded-xl p-6">
                                <div className="flex justify-center mb-6">
                                    <div className="bg-gray-800 p-1 rounded-lg flex flex-wrap justify-center gap-1">
                                        {(['month', 'year', 'lifetime'] as const).map((iv) => (
                                            <button
                                                key={iv}
                                                onClick={() => setBillingInterval(iv)}
                                                className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${billingInterval === iv
                                                    ? iv === 'lifetime' ? 'bg-pink-600 text-white shadow' : 'bg-purple-600 text-white shadow'
                                                    : 'text-gray-400 hover:text-white'
                                                    }`}
                                            >
                                                {iv === 'month' ? 'Monthly ($20)' : iv === 'year' ? 'Yearly ($50)' : 'Lifetime ($100)'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="text-center mb-4">
                                    <span className="text-3xl font-bold text-white">${devPrice}</span>
                                    <span className="text-gray-400 text-sm ml-1">
                                        {billingInterval === 'month' ? '/month' : billingInterval === 'year' ? '/year' : ' (One-Time)'}
                                    </span>
                                </div>
                                <ul className="space-y-3 text-sm">
                                    {[
                                        '100 Free Daily AI Requests',
                                        'Unlimited AI model access',
                                        '100,000 SANC tokens included',
                                        'Priority rate limits (1,000/min)',
                                        'All tiers unlocked immediately',
                                    ].map((f) => (
                                        <li key={f} className="flex items-center gap-2 text-gray-300">
                                            <span className="text-green-400">✓</span> {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* PayPal Checkout */}
                        {emailConfirmed && !paySuccess && (
                            <div className="pt-2">
                                <p className="text-xs text-gray-500 text-center mb-3 uppercase tracking-widest font-bold">Pay with PayPal</p>
                                <PayPalCheckout
                                    amount={mode === 'developer' ? devPrice : usd}
                                    description={
                                        mode === 'developer'
                                            ? `AI Sanctuary Developer Mode (${billingInterval})`
                                            : `${tokens.toLocaleString()} SANC Tokens`
                                    }
                                    tier={mode === 'developer' ? 'developer' : 'tokens'}
                                    email={email}
                                    interval={mode === 'developer' ? billingInterval : undefined}
                                    tokens={mode === 'developer' ? devTokens : tokens}
                                    onSuccess={handleSuccess}
                                />
                            </div>
                        )}

                        {!emailConfirmed && (
                            <div className="py-3 px-4 rounded-xl bg-white/5 border border-white/5 text-center text-sm text-gray-500">
                                Enter and confirm your email above to unlock payment.
                            </div>
                        )}

                        {paySuccess && (
                            <div className="p-4 rounded-xl bg-emerald-900/20 border border-emerald-700/40 text-emerald-400 text-sm font-semibold text-center">
                                {successMsg}
                            </div>
                        )}

                        <div className="pt-4 border-t border-gray-800">
                            <h4 className="text-sm font-semibold text-gray-300 mb-2">Pricing</h4>
                            <p className="text-gray-500 text-sm">$1.00 USD = 1,000 SANC</p>
                            <p className="text-gray-500 text-sm">Developer Mode = $20/mo or $50/yr or $100 lifetime</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function BuyPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-950 text-gray-100 py-12 px-4 flex items-center justify-center">
                <div className="animate-pulse text-gray-400">Loading...</div>
            </div>
        }>
            <BuyPageInner />
        </Suspense>
    );
}
