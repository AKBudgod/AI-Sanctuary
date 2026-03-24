'use client';

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Zap, Target, Mail, X } from "lucide-react";
import dynamic from "next/dynamic";

const PayPalCheckout = dynamic(() => import("@/components/ui/PayPalCheckout"), { ssr: false });

const PLANS = [
    {
        id: "data-miner",
        name: "Data Miner",
        price: 10,
        priceSuffix: "/campaign",
        tagline: "K'LA builds you a pure list of 50 hyper-targeted leads.",
        highlight: false,
        tokens: 0,
        features: [
            "Live Perplexity Internet Search",
            "Find 50 Top Companies in Niche",
            "Export CSV of Contacts",
        ],
    },
    {
        id: "copywriter",
        name: "Copywriter",
        price: 25,
        priceSuffix: "/campaign",
        tagline: "K'LA mines 50 leads AND drafts personalized emails for you to send manually.",
        highlight: false,
        tokens: 0,
        features: [
            "Live Perplexity Internet Search",
            "GPT-4o Deep Context Extraction",
            "Drafted Emails Ready for Export",
        ],
    },
    {
        id: "autonomous-sdr",
        name: "Autonomous SDR",
        price: 50,
        priceSuffix: "/mo",
        tagline: "K'LA runs entirely on autopilot for a month, generating leads and emailing them.",
        highlight: true,
        tokens: 10000,
        interval: "month" as const,
        features: [
            "Daily Automated Cron Lead Search",
            "GPT-4o Personalized Copywriting",
            "Direct Sending via AKBudgod",
            "Anti-Spam Delivery Logic",
            "10,000 SANC Tokens Included",
        ],
    },
];

export default function KLAPage() {
    const [selectedPlan, setSelectedPlan] = useState<typeof PLANS[0] | null>(null);
    const [email, setEmail] = useState("");
    const [emailSubmitted, setEmailSubmitted] = useState(false);
    const [paySuccess, setPaySuccess] = useState(false);

    function openPlan(plan: typeof PLANS[0]) {
        setSelectedPlan(plan);
        setEmailSubmitted(false);
        setPaySuccess(false);
        // Pre-fill from localStorage
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("user_email");
            if (saved) setEmail(saved);
        }
    }

    function closeModal() {
        setSelectedPlan(null);
        setEmailSubmitted(false);
        setPaySuccess(false);
    }

    function handleEmailContinue() {
        if (!email || !email.includes("@")) return;
        if (typeof window !== "undefined") {
            localStorage.setItem("user_email", email);
        }
        setEmailSubmitted(true);
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-rose-500/30 font-sans">
            <title>K&apos;LA | The AI Growth Engine</title>

            <main className="max-w-7xl mx-auto px-6 py-24 pt-32 relative">
                {/* Background glow */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-rose-600/20 blur-[120px] rounded-full pointer-events-none" />

                {/* Hero */}
                <div className="relative z-10 text-center max-w-4xl mx-auto space-y-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-rose-400 text-sm tracking-widest font-mono uppercase mb-4">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                        System Online: K&apos;LA
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-neutral-500 drop-shadow-sm">
                        Meet <span className="text-rose-500">K&apos;LA.</span>
                        <br />Your AI SDR.
                    </h1>

                    <p className="text-xl text-neutral-400 leading-relaxed max-w-2xl mx-auto">
                        Stop spamming generic emails. K&apos;LA autonomously scans the live internet, mines high-value leads in your exact niche, reads their recent news, and dispatches hyper-personalized outbound campaigns from{" "}
                        <span className="text-rose-400">AKBudgod@ai-sanctuary.online</span>.
                    </p>

                    <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a
                            href="#pricing"
                            className="px-8 py-4 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-semibold transition-all shadow-[0_0_40px_-5px_theme(colors.rose.600)] hover:shadow-[0_0_60px_-10px_theme(colors.rose.500)]"
                        >
                            Hire K&apos;LA Now
                        </a>
                        <Link
                            href="/kla/dashboard"
                            className="px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all backdrop-blur-sm"
                        >
                            Enter Dashboard
                        </Link>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-3 gap-8 mt-40">
                    <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors group">
                        <Target className="w-10 h-10 text-rose-400 mb-6 group-hover:scale-110 transition-transform" />
                        <h3 className="text-2xl font-bold text-white mb-3">Live Data Mining</h3>
                        <p className="text-neutral-400">Powered by Perplexity, K&apos;LA scrapes the live internet to find fresh, ultra-relevant decision makers in any niche you define.</p>
                    </div>
                    <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors group">
                        <Zap className="w-10 h-10 text-rose-400 mb-6 group-hover:scale-110 transition-transform" />
                        <h3 className="text-2xl font-bold text-white mb-3">Hyper-Personalization</h3>
                        <p className="text-neutral-400">K&apos;LA reads your prospect&apos;s recent news and dynamically injects natural context into every email via GPT-4o. No more generic templates.</p>
                    </div>
                    <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors group">
                        <Mail className="w-10 h-10 text-rose-400 mb-6 group-hover:scale-110 transition-transform" />
                        <h3 className="text-2xl font-bold text-white mb-3">Anti-Spam Logic</h3>
                        <p className="text-neutral-400">Protected by Cloudflare KV, K&apos;LA never emails the same prospect twice and tightly paces her throughput to protect sender reputation.</p>
                    </div>
                </div>

                {/* Pricing Section */}
                <div id="pricing" className="mt-40 pt-20 border-t border-white/10">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Choose Her Mission</h2>
                        <p className="text-lg text-neutral-400">Three distinct service tiers for however you want to scale.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {PLANS.map((plan) => (
                            <div
                                key={plan.id}
                                className={`p-8 rounded-3xl flex flex-col relative overflow-hidden transition-all duration-300 ${
                                    plan.highlight
                                        ? "border border-rose-500/50 bg-[#100505] shadow-[0_0_50px_-15px_theme(colors.rose.500/30)] scale-105 z-10"
                                        : "border border-white/10 bg-black/50 backdrop-blur-md hover:border-white/20"
                                }`}
                            >
                                {plan.highlight && (
                                    <>
                                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-rose-600 to-rose-400" />
                                        <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider">
                                            Most Popular
                                        </div>
                                    </>
                                )}

                                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                                <p className="text-neutral-400 mb-6 text-sm">{plan.tagline}</p>

                                <div className="mb-8 font-mono">
                                    <span className="text-4xl font-black text-white">${plan.price}</span>
                                    <span className="text-neutral-500">{plan.priceSuffix}</span>
                                </div>

                                <ul className="space-y-4 mb-8 flex-1">
                                    {plan.features.map((f) => (
                                        <li key={f} className="flex items-center gap-3 text-neutral-300 text-sm">
                                            <CheckCircle2 className="w-5 h-5 text-rose-500 shrink-0" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => openPlan(plan)}
                                    className={`w-full py-4 rounded-xl font-semibold transition-all mt-auto ${
                                        plan.highlight
                                            ? "bg-rose-600 hover:bg-rose-500 text-white shadow-lg hover:shadow-rose-500/50"
                                            : "bg-white/10 hover:bg-white/20 text-white"
                                    }`}
                                >
                                    {plan.highlight ? "Deploy Autonomous K'LA" : `Select ${plan.name}`}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Checkout Modal */}
            {selectedPlan && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-md"
                    onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
                >
                    <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 w-full max-w-md relative shadow-2xl">
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Plan summary */}
                        <div className="mb-6 text-center">
                            <div className="inline-block px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-widest mb-3">
                                K&apos;LA — {selectedPlan.name}
                            </div>
                            <div className="text-3xl font-black text-white font-mono">
                                ${selectedPlan.price}
                                <span className="text-neutral-500 text-lg font-normal">{selectedPlan.priceSuffix}</span>
                            </div>
                            <p className="text-sm text-neutral-400 mt-2">{selectedPlan.tagline}</p>
                        </div>

                        {!emailSubmitted ? (
                            /* Email collection step */
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-neutral-400 mb-2 font-medium">
                                        Email to activate your K&apos;LA access
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleEmailContinue()}
                                        placeholder="you@example.com"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-rose-500"
                                    />
                                </div>
                                <button
                                    onClick={handleEmailContinue}
                                    disabled={!email.includes('@')}
                                    className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Continue to Payment →
                                </button>
                            </div>
                        ) : (
                            /* PayPal payment step */
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/5 text-sm text-neutral-400">
                                    <span>Purchasing for:</span>
                                    <span className="text-white font-medium">{email}</span>
                                    <button onClick={() => setEmailSubmitted(false)} className="ml-auto text-xs text-rose-400 hover:text-rose-300">
                                        change
                                    </button>
                                </div>

                                <PayPalCheckout
                                    amount={selectedPlan.price}
                                    description={`K'LA ${selectedPlan.name} — AI Sanctuary`}
                                    tier={selectedPlan.id}
                                    email={email}
                                    interval={(selectedPlan as any).interval}
                                    tokens={selectedPlan.tokens || 0}
                                    onSuccess={(result) => {
                                        setPaySuccess(true);
                                    }}
                                    onError={(msg) => {
                                        console.error('PayPal error:', msg);
                                    }}
                                />

                                {paySuccess && (
                                    <div className="text-center pt-2">
                                        <p className="text-emerald-400 text-sm font-semibold mb-3">
                                            ✅ K&apos;LA is now activated for {email}!
                                        </p>
                                        <Link
                                            href="/kla/dashboard"
                                            onClick={closeModal}
                                            className="inline-block px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all"
                                        >
                                            Open K&apos;LA Dashboard →
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}

                        <p className="text-center text-xs text-neutral-600 mt-6">
                            Secured by PayPal · 256-bit encryption
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
