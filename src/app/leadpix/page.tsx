'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
    Lock, 
    User,
    Loader2,
    Image as ImageIcon,
    Sparkles,
    ChevronRight,
    ArrowLeft,
    Upload,
    CheckCircle2,
    AlertCircle,
    Activity,
    Trash2,
    RefreshCw,
    Scan,
    FileVideo,
    UserPlus,
    Layout
} from 'lucide-react';
import Link from 'next/link';

const ADMIN_EMAILS = [
    'kearns.adam747@gmail.com',
    'kearns.adan747@gmail.com',
    'gamergoodguy445@gmail.com',
    'wjreviews420@gmail.com',
];

export default function LeadpixPage() {
    const router = useRouter();
    const [email, setEmail] = useState<string>('');
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [swapProgress, setSwapProgress] = useState(0);
    
    // Face Swap State
    const [sourceFace, setSourceFace] = useState<string | null>(null);
    const [targetContent, setTargetContent] = useState<string | null>(null);
    const [targetType, setTargetType] = useState<'image' | 'video'>('image');
    
    const sourceInputRef = useRef<HTMLInputElement>(null);
    const targetInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const saved = localStorage.getItem('user_email');
        if (saved && ADMIN_EMAILS.includes(saved.toLowerCase())) {
            setEmail(saved);
            setIsAuthorized(true);
        } else {
            setIsAuthorized(false);
            // Redirect after a brief delay so the user sees the access denied message or just skip to redirect
            setTimeout(() => router.push('/'), 2000);
        }
    }, [router]);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'source' | 'target') => {
        const file = e.target.files?.[0];
        if (file) {
            if (type === 'target') {
                setTargetType(file.type.startsWith('video') ? 'video' : 'image');
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                if (type === 'source') setSourceFace(reader.result as string);
                else setTargetContent(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSwapRequest = async () => {
        if (!sourceFace || !targetContent) return;
        setLoading(true);
        setResult(null);
        setSwapProgress(10);

        try {
            // Simulated progress
            const interval = setInterval(() => {
                setSwapProgress(prev => (prev < 90 ? prev + 10 : prev));
            }, 800);

            const res = await fetch('/api/leadpix', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${email}`,
                },
                body: JSON.stringify({
                    sourceImage: sourceFace,
                    targetContent: targetContent,
                    targetType: targetType
                }),
            });

            const data = await res.json();
            clearInterval(interval);
            setSwapProgress(100);

            if (res.ok) {
                setResult(data.outputUrl || data.response);
            } else {
                alert(data.error || 'Neural swap failed');
            }
        } catch (err) {
            alert('Uplink failure');
        } finally {
            setLoading(false);
        }
    };

    if (isAuthorized === false) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-red-950/30 border border-red-500/50 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(239,68,68,0.3)] animate-pulse">
                    <Lock className="w-10 h-10 text-red-500" />
                </div>
                <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-4 font-mono">Unauthorized Uplink</h1>
                <p className="text-gray-400 max-w-md mb-8 font-mono text-sm uppercase opacity-60">
                    Neural signature mismatch. Redirecting to surface...
                </p>
            </div>
        );
    }

    if (isAuthorized === null) return null;

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 font-sans selection:bg-cyan-500/30 overflow-hidden flex flex-col">
            {/* Header */}
            <header className="h-20 border-b border-white/5 bg-black/60 backdrop-blur-2xl flex items-center justify-between px-8 shrink-0 z-50">
                <div className="flex items-center gap-6">
                    <Link href="/" className="p-2 hover:bg-white/5 rounded-lg transition-colors group">
                        <ArrowLeft className="w-5 h-5 text-gray-500 group-hover:text-white" />
                    </Link>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-cyan-500 uppercase tracking-widest font-mono">Leadpix AI</span>
                            <span className="px-1.5 py-0.5 bg-red-500/10 border border-red-500/30 text-[10px] text-red-400 font-black rounded uppercase">Admin Exclusive</span>
                        </div>
                        <h1 className="text-xl font-bold tracking-tight">Neural Swap Engine</h1>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end mr-4">
                        <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest leading-none">Admin Node</span>
                        <span className="text-[9px] text-gray-500 font-mono italic">{email}</span>
                    </div>
                    <div className="w-10 h-10 rounded-full border border-cyan-500/30 bg-gray-900 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                        <Activity className="w-5 h-5 text-cyan-400" />
                    </div>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden relative">
                {/* Background Decorations */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(6,182,212,0.03)_0%,_transparent_70%)] pointer-events-none" />
                <div className="absolute top-0 right-0 w-1/3 h-full bg-cyan-500/[0.02] blur-[120px] pointer-events-none" />

                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 relative z-10">
                    <div className="max-w-6xl mx-auto space-y-12">
                        
                        {/* Interface Header */}
                        <div className="text-center space-y-4">
                            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter bg-gradient-to-r from-white via-white to-gray-500 bg-clip-text text-transparent">
                                Neural Meta-Transposer
                            </h2>
                            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.4em] font-mono">
                                Advanced Face-Swap Synthesis Matrix
                            </p>
                        </div>

                        {/* Swap Workspace */}
                        <div className="grid lg:grid-cols-2 gap-8 items-start">
                            {/* Left: Configuration */}
                            <div className="space-y-8 animate-fade-in-left">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Source Face */}
                                    <div className="space-y-4">
                                        <h3 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest flex items-center gap-2">
                                            <UserPlus className="w-3.5 h-3.5" />
                                            1. Source Neural Identity
                                        </h3>
                                        <div 
                                            onClick={() => sourceInputRef.current?.click()}
                                            className={`aspect-square relative border-2 border-dashed rounded-[3rem] p-4 transition-all cursor-pointer group flex flex-col items-center justify-center overflow-hidden ${sourceFace ? 'border-cyan-500/50 bg-cyan-500/5' : 'border-white/5 hover:border-white/10 hover:bg-white/5'}`}
                                        >
                                            <input type="file" ref={sourceInputRef} className="hidden" accept="image/*" onChange={(e) => handleUpload(e, 'source')} />
                                            {sourceFace ? (
                                                <div className="relative w-full h-full">
                                                    <img src={sourceFace} className="w-full h-full object-cover rounded-[2.5rem]" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-[2.5rem]">
                                                        <RefreshCw className="w-8 h-8 text-white" />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center gap-4 text-center p-8">
                                                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                                        <ImageIcon className="w-8 h-8 text-gray-500" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Upload Face</span>
                                                        <p className="text-[9px] text-gray-600 font-mono">CLEAR FRONT PORTRAIT</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Target Content */}
                                    <div className="space-y-4">
                                        <h3 className="text-[10px] font-black text-purple-500 uppercase tracking-widest flex items-center gap-2">
                                            <Layout className="w-3.5 h-3.5" />
                                            2. Target Medium
                                        </h3>
                                        <div 
                                            onClick={() => targetInputRef.current?.click()}
                                            className={`aspect-square relative border-2 border-dashed rounded-[3rem] p-4 transition-all cursor-pointer group flex flex-col items-center justify-center overflow-hidden ${targetContent ? 'border-purple-500/50 bg-purple-500/5' : 'border-white/5 hover:border-white/10 hover:bg-white/5'}`}
                                        >
                                            <input type="file" ref={targetInputRef} className="hidden" accept="image/*,video/*" onChange={(e) => handleUpload(e, 'target')} />
                                            {targetContent ? (
                                                <div className="relative w-full h-full">
                                                    {targetType === 'video' ? (
                                                        <video src={targetContent} className="w-full h-full object-cover rounded-[2.5rem]" muted loop />
                                                    ) : (
                                                        <img src={targetContent} className="w-full h-full object-cover rounded-[2.5rem]" />
                                                    )}
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-[2.5rem]">
                                                        {targetType === 'video' ? <FileVideo className="w-8 h-8 text-white" /> : <ImageIcon className="w-8 h-8 text-white" />}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center gap-4 text-center p-8">
                                                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                                        <FileVideo className="w-8 h-8 text-gray-500" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Upload Target</span>
                                                        <p className="text-[9px] text-gray-600 font-mono">IMAGE OR VIDEO</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Action Console */}
                                <div className="bg-black/40 border border-white/5 rounded-[2.5rem] p-8 space-y-6">
                                    <div className="flex justify-between items-center px-2">
                                        <div className="flex items-center gap-3">
                                            <Scan className="w-4 h-4 text-cyan-500" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Synthesis Pipeline</span>
                                        </div>
                                        {loading && <span className="text-[10px] font-mono text-cyan-400 animate-pulse">{swapProgress}% COMPLETE</span>}
                                    </div>

                                    {loading && (
                                        <div className="h-1 bg-gray-900 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-cyan-500 transition-all duration-500 shadow-[0_0_10px_#00f0ff]" 
                                                style={{ width: `${swapProgress}%` }}
                                            />
                                        </div>
                                    )}

                                    <button 
                                        onClick={handleSwapRequest}
                                        disabled={loading || !sourceFace || !targetContent}
                                        className="w-full py-5 bg-white text-black font-black uppercase tracking-widest rounded-2xl disabled:opacity-10 hover:bg-cyan-500 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-cyan-500/20 flex items-center justify-center gap-3"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                                        Commence Neural Swap
                                    </button>
                                </div>
                            </div>

                            {/* Right: Output */}
                            <div className="space-y-8 animate-fade-in-right">
                                <div className="bg-gray-900/40 border border-white/10 rounded-[4rem] aspect-[4/5] overflow-hidden relative shadow-2xl group">
                                    {!result && !loading && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 space-y-4">
                                            <Activity className="w-16 h-16 opacity-10 animate-pulse" />
                                            <p className="text-xs font-black uppercase tracking-widest opacity-30">Waiting for Uplink...</p>
                                        </div>
                                    )}

                                    {loading && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-6 bg-black/60 backdrop-blur-sm z-20">
                                            <div className="relative">
                                                <div className="w-24 h-24 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
                                                <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-cyan-500 animate-pulse" />
                                            </div>
                                            <div className="text-center space-y-1">
                                                <p className="text-xs font-black text-white uppercase tracking-widest">Mapping Neural Mesh</p>
                                                <p className="text-[9px] text-cyan-500 font-mono animate-pulse uppercase">Alpha Blending Active</p>
                                            </div>
                                        </div>
                                    )}

                                    {result && (
                                        <div className="absolute inset-0 animate-fade-in">
                                            {targetType === 'video' ? (
                                                <video src={result} className="w-full h-full object-cover" controls autoPlay />
                                            ) : (
                                                <img src={result} className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Metrics */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 border border-white/5 p-5 rounded-3xl">
                                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest block mb-2">Neural Resolution</span>
                                        <span className="text-lg font-bold">4096px (Ultra)</span>
                                    </div>
                                    <div className="bg-white/5 border border-white/5 p-5 rounded-3xl">
                                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest block mb-2">Synthesis Time</span>
                                        <span className="text-lg font-bold">~8.4s</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 3px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
                @keyframes fade-in-up { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fade-in-right { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
                @keyframes fade-in-left { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
                .animate-fade-in-up { animation: fade-in-up 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .animate-fade-in-right { animation: fade-in-right 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .animate-fade-in-left { animation: fade-in-left 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .animate-fade-in { animation: fade-in-up 0.5s ease forwards; }
            `}</style>
        </div>
    );
}

