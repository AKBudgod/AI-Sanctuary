'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Award, TrendingUp, Zap, User, RefreshCw, Globe } from './Icons';
import PayPalCheckout from './PayPalCheckout';

interface UserDashboardProps {
    initialEmail?: string;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ initialEmail = '' }) => {
    const [email, setEmail] = useState(initialEmail);
    const [password, setPassword] = useState('');
    const [balance, setBalance] = useState<number | null>(null);
    const [tier, setTier] = useState<string>('explorer');
    const [usageUsed, setUsageUsed] = useState<number>(0);
    const [usageLimit, setUsageLimit] = useState<number>(10000);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);

    const searchParams = useSearchParams();

    // Handle Stripe redirect: ?payment_success=true&tokens=XXXX or ?tier=developer
    useEffect(() => {
        const success = searchParams.get('payment_success');
        const tokensParam = searchParams.get('tokens');
        const tierParam = searchParams.get('tier');

        if (success === 'true') {
            if (tierParam === 'developer') {
                setPaymentSuccess('🎉 Developer Mode activated! Your account has been upgraded.');
            } else if (tokensParam) {
                const formatted = parseInt(tokensParam).toLocaleString();
                setPaymentSuccess(`✅ Payment successful! ${formatted} SANC tokens have been credited to your account.`);
            } else {
                setPaymentSuccess('✅ Payment successful! Your account has been updated.');
            }
            // Auto-dismiss after 10 seconds
            const timer = setTimeout(() => setPaymentSuccess(null), 10000);
            return () => clearTimeout(timer);
        }
    }, [searchParams]);

    // Auto-fetch balance on mount if email already known
    useEffect(() => {
        if (email && email.includes('@')) {
            fetchBalance(email);
        }
    }, []);

    // Check localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('user_email');
        if (saved && !email) {
            setEmail(saved);
            fetchBalance(saved);
        }
    }, []);

    // Auto-refresh balance after a payment success (give webhook a moment to process)
    useEffect(() => {
        if (paymentSuccess) {
            const saved = localStorage.getItem('user_email') || email;
            if (saved) {
                const delay = setTimeout(() => fetchBalance(saved), 2000);
                return () => clearTimeout(delay);
            }
        }
    }, [paymentSuccess]);

    const fetchBalance = async (userEmail: string) => {
        if (!userEmail) return;
        setLoading(true);
        setError('');
        try {
            // First, login/verify password
            const loginRes = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail, password }),
            });
            const loginData = await loginRes.json();
            if (!loginRes.ok) {
                setError(loginData.error || 'Identity verification failed');
                setLoading(false);
                return;
            }

            // Fetch balance
            const balanceRes = await fetch(`/api/user/balance?email=${encodeURIComponent(userEmail)}`);
            const balanceData = await balanceRes.json();
            if (balanceRes.ok) {
                setBalance(balanceData.balance);
                setEmail(userEmail);
                localStorage.setItem('user_email', userEmail);
            } else {
                setError(balanceData.error || 'Failed to fetch balance');
            }

            // Fetch tier and usage info from /api/models
            const modelsRes = await fetch('/api/models', {
                headers: { 'Authorization': `Bearer ${userEmail}` }
            });
            if (modelsRes.ok) {
                const modelsData = await modelsRes.json();
                setTier(modelsData.tier || 'explorer');
                setUsageUsed(modelsData.usage?.used ?? 0);
                setUsageLimit(modelsData.usage?.limit ?? 10000);
            }
        } catch (err) {
            setError('Network error checking balance');
        } finally {
            setLoading(false);
        }
    };

    // Human-readable tier display name
    const tierDisplayName = (t: string) => {
        const names: Record<string, string> = {
            explorer: 'Explorer',
            novice: 'Novice',
            apprentice: 'Apprentice',
            adept: 'Adept',
            master: 'Master',
            developer: 'Developer',
            researcher: 'Researcher',
            institutional: 'Institutional',
            verified: 'Verified',
        };
        return names[t] || t.charAt(0).toUpperCase() + t.slice(1);
    };

    const tierColor = (t: string) => {
        if (t === 'developer') return 'text-purple-400';
        if (t === 'master') return 'text-red-400';
        if (t === 'adept') return 'text-orange-400';
        if (t === 'apprentice') return 'text-blue-400';
        if (t === 'novice') return 'text-green-400';
        return 'text-yellow-400'; // explorer
    };

    return (
        <div className="bg-black border border-cyan-500/30 overflow-hidden shadow-[0_0_30px_rgba(0,240,255,0.1)] relative clip-angled-sm">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute inset-0 scanline-anim opacity-50" />

            {/* Payment Success Banner */}
            {paymentSuccess && (
                <div className="relative z-20 bg-green-900/80 border-b border-green-500/50 px-6 py-4 flex items-center justify-between gap-4">
                    <p className="text-green-300 font-mono text-sm font-bold">{paymentSuccess}</p>
                    <button
                        onClick={() => setPaymentSuccess(null)}
                        className="text-green-400 hover:text-white transition-colors font-mono text-lg leading-none"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Header */}
            <div className="p-8 border-b border-cyan-500/30 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 bg-gray-950/80 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <div className="bg-gray-900 border border-cyan-500/50 p-3 clip-angled-sm shadow-[0_0_15px_#00f0ff_inset]">
                        <User className="w-7 h-7 text-cyan-400" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black tracking-widest uppercase text-white mb-1 font-mono">Neural Uplink</h3>
                        <p className="text-cyan-400 text-xs font-mono tracking-widest">
                            {email ? email : 'GUEST_SESSION_ACTIVE'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-5 bg-black px-6 py-3 border border-cyan-500/30 clip-angled-sm">
                    <div className="text-right">
                        <div className="text-[10px] text-fuchsia-400 uppercase tracking-[0.3em] font-bold mb-1 font-mono">CREDITS</div>
                        <div className="text-3xl font-black text-white font-mono drop-shadow-[0_0_8px_#ff00ea]">
                            {balance !== null ? balance.toLocaleString() : '---'} <span className="text-xs font-mono text-fuchsia-400 ml-1">SANC</span>
                        </div>
                    </div>
                    <div className="w-px h-10 bg-cyan-500/30 mx-1"></div>
                    <button
                        onClick={() => fetchBalance(email)}
                        disabled={loading || !email}
                        className="p-3 bg-gray-900 hover:bg-cyan-950 transition-colors duration-300 text-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed group border border-cyan-500/50 clip-angled-sm"
                        title="Sync Data"
                    >
                        <RefreshCw className={`w-5 h-5 group-hover:text-white transition-colors duration-500 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            <div className="p-8 relative z-10 bg-black/60">
                {/* Identity Section - if no email set */}
                {!balance && balance !== 0 && (
                    <div className="mb-10 bg-gray-950 p-8 border border-cyan-500/30 text-center max-w-lg mx-auto relative overflow-hidden clip-angled-sm">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-fuchsia-500/5 pointer-events-none" />
                        <h4 className="text-xl font-black text-white mb-3 uppercase tracking-widest font-mono">Authenticate Vector</h4>
                        <p className="text-cyan-400 mb-6 text-sm leading-relaxed font-mono">Input identifier to establish secure connection to the grid.</p>
                        <div className="flex flex-col gap-3">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="IDENTIFIER (EMAIL)"
                                className="w-full bg-black border border-cyan-500/50 px-5 py-3 text-cyan-400 placeholder-cyan-900 focus:outline-none focus:border-cyan-400 transition-all font-mono clip-angled-sm uppercase"
                            />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && fetchBalance(email)}
                                placeholder="ACCESS KEY"
                                className="w-full bg-black border border-cyan-500/50 px-5 py-3 text-cyan-400 placeholder-cyan-900 focus:outline-none focus:border-cyan-400 transition-all font-mono clip-angled-sm"
                            />
                            <button
                                onClick={() => fetchBalance(email)}
                                disabled={loading || !email || !password}
                                className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase tracking-widest px-8 py-4 transition-all shadow-[0_0_15px_#00f0ff] disabled:opacity-50 hover:-translate-y-0.5 clip-angled-sm font-mono"
                            >
                                {loading ? 'NEURAL SYNC...' : 'ESTABLISH CONNECT'}
                            </button>
                        </div>
                        {error && <p className="text-red-400 text-sm mt-4 font-mono font-bold bg-red-950/50 py-2 border border-red-500/50">{error}</p>}
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Status Card */}
                    <div className="bg-gray-950 p-6 border border-yellow-500/30 hover-lift group clip-angled-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-black border border-yellow-500/50 clip-angled-sm">
                                <Award className="w-5 h-5 text-yellow-400 group-hover:scale-110 transition-transform" />
                            </div>
                            <span className="text-yellow-500/70 text-xs font-bold uppercase tracking-widest font-mono">Clearance Level</span>
                        </div>
                        <div className={`text-3xl font-black tracking-widest text-white mb-2 group-hover:${tierColor(tier)} transition-colors uppercase font-mono ${tierColor(tier)}`}>
                            {tierDisplayName(tier)}
                        </div>
                        <div className="text-xs font-mono text-gray-500 uppercase tracking-wider">{`> ${tier === 'developer' ? 'Full Access Granted' : tier === 'master' ? 'High Clearance Active' : 'Basic Access Configured'}`}</div>
                    </div>

                    {/* Usage Card */}
                    <div className="bg-gray-950 p-6 border border-green-500/30 hover-lift group clip-angled-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-black border border-green-500/50 clip-angled-sm">
                                <TrendingUp className="w-5 h-5 text-green-400 group-hover:scale-110 transition-transform" />
                            </div>
                            <span className="text-green-500/70 text-xs font-bold uppercase tracking-widest font-mono">Bandwidth</span>
                        </div>
                        <div className="flex items-baseline gap-2 mb-2">
                            <div className="text-3xl font-black tracking-widest text-white group-hover:text-green-400 transition-colors font-mono">{usageUsed.toLocaleString()}</div>
                            <div className="text-xs font-bold text-gray-500 font-mono tracking-widest">/ {usageLimit.toLocaleString()}</div>
                        </div>
                        <div className="text-xs font-mono text-gray-500 uppercase tracking-wider">{`> Cycles Used`}</div>
                    </div>

                    {/* Action Card: Upgrade */}
                    <Link href="/buy" className="bg-cyan-950/40 p-6 border border-cyan-500/30 hover-lift flex flex-col justify-center items-center text-center group relative overflow-hidden clip-angled-sm hover:bg-cyan-900/60 transition-colors">
                        <div className="absolute inset-0 scanline-anim opacity-20" />
                        <div className="flex items-center justify-center p-3 bg-black border border-cyan-400/50 mb-4 group-hover:scale-110 group-hover:shadow-[0_0_15px_#00f0ff_inset] transition-all duration-300 clip-angled-sm z-10">
                            <Zap className="w-6 h-6 text-cyan-400" />
                        </div>
                        <h4 className="text-lg font-black text-white uppercase tracking-widest font-mono z-10">Upgrade Link</h4>
                        <span className="text-xs font-bold text-cyan-400 mt-2 block tracking-widest uppercase font-mono z-10">Purchase Tokens &rarr;</span>
                    </Link>

                    {/* Action Card: Web3 (Integrated) */}
                    <Link href="/playground" className="bg-fuchsia-950/20 p-6 border border-fuchsia-500/30 hover-lift flex flex-col justify-center items-center text-center group relative overflow-hidden clip-angled-sm hover:bg-fuchsia-900/30 transition-colors">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/5 rounded-full blur-[40px] pointer-events-none" />
                        <div className="flex items-center justify-center p-3 bg-black border border-fuchsia-400/50 mb-4 group-hover:scale-110 group-hover:shadow-[0_0_15px_#ff00ea_inset] transition-all duration-300 clip-angled-sm z-10">
                            <Globe className="w-6 h-6 text-fuchsia-400" />
                        </div>
                        <h4 className="text-lg font-black text-white uppercase tracking-widest font-mono z-10">Web3 Terminal</h4>
                        <span className="text-xs font-bold text-fuchsia-400 mt-2 block tracking-widest uppercase font-mono z-10">Staking & Rewards &rarr;</span>
                    </Link>
                </div>

                {/* PayPal Developer Mode Upgrade Section */}
                {tier !== 'developer' && (
                    <div className="mt-12 max-w-2xl mx-auto">
                        <PayPalCheckout />
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDashboard;
