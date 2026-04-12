'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BarChart3, 
  Users, 
  Settings, 
  Mic, 
  LayoutDashboard, 
  ShieldCheck, 
  LogOut,
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  Lock
} from '@/components/ui/Icons';

// Admin emails allowed access
const ADMIN_EMAILS = [
  'kearns.adam747@gmail.com',
  'wjreviews420@gmail.com',
  'weedj747@gmail.com',
  'gamergoodguy445@gmail.com',
  'akbudgod@ai-sanctuary.online'
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminApiKey, setAdminApiKey] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    // Check for existing session
    const savedKey = sessionStorage.getItem('admin_api_key');
    const savedEmail = sessionStorage.getItem('admin_email');
    if (savedKey && savedEmail) {
      setAdminApiKey(savedKey);
      setAdminEmail(savedEmail);
      setIsAdmin(ADMIN_EMAILS.includes(savedEmail.toLowerCase()));
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (ADMIN_EMAILS.includes(adminEmail.toLowerCase()) && adminApiKey) {
      sessionStorage.setItem('admin_api_key', adminApiKey);
      sessionStorage.setItem('admin_email', adminEmail);
      setIsAdmin(true);
      setLoginError('');
    } else {
      setLoginError('Access denied. Authorization failure.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_api_key');
    sessionStorage.removeItem('admin_email');
    setIsAdmin(false);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen aurora-bg flex items-center justify-center p-6">
        <div className="w-full max-w-md glass p-10 rounded-[2.5rem] border-white/10 shadow-2xl relative overflow-hidden group">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/20 blur-[100px] rounded-full group-hover:bg-purple-500/30 transition-all duration-700" />
          
          <div className="relative z-10 space-y-8">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/20">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase font-mono">
                Nexus <span className="text-purple-400">Control</span>
              </h1>
              <p className="text-gray-400 text-sm font-mono uppercase tracking-widest">Administrator Verification Required</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <input
                  type="email"
                  placeholder="Admin Identification (Email)"
                  className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-purple-500/50 transition-all font-mono text-sm"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <input
                  type="password"
                  placeholder="Access Credential (API Key)"
                  className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-purple-500/50 transition-all font-mono text-sm"
                  value={adminApiKey}
                  onChange={(e) => setAdminApiKey(e.target.value)}
                  required
                />
              </div>
              
              {loginError && (
                <p className="text-red-400 text-xs text-center font-mono animate-shake">{loginError}</p>
              )}

              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-black uppercase tracking-widest hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                [ Verify Access ]
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>

            <p className="text-[10px] text-gray-500 text-center uppercase tracking-tighter font-mono">
              Secured by AI Sanctuary Neural Protocol v4.2
            </p>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Agent Signups', path: '/admin/agents', icon: Users },
    { name: 'Ad Intelligence', path: '/admin/ads', icon: BarChart3 },
    { name: 'Neural Synthesis', path: '/playground?admin=true', icon: BrainCircuit },
  ];

  return (
    <div className="min-h-screen bg-[#050510] text-white flex overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-72' : 'w-20'
        } shrink-0 bg-black/20 border-r border-white/5 backdrop-blur-3xl transition-all duration-500 relative flex flex-col`}
      >
        <div className="p-6 flex items-center gap-4 border-b border-white/5 h-24">
          <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          {isSidebarOpen && (
            <div className="overflow-hidden whitespace-nowrap">
              <h2 className="font-black text-lg italic tracking-tighter uppercase font-mono leading-none">
                Vault <span className="text-purple-400">Admin</span>
              </h2>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Hyper-Scale Grid</span>
            </div>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all group ${
                pathname === item.path 
                  ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]' 
                  : 'text-gray-500 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <item.icon className={`w-5 h-5 shrink-0 ${pathname === item.path ? 'text-purple-400 scale-110' : 'group-hover:scale-110 transition-transform'}`} />
              {isSidebarOpen && <span className="font-bold text-sm tracking-tight">{item.name}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-4">
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="w-full py-2 flex items-center justify-center bg-white/5 rounded-xl text-gray-500 hover:text-white transition-colors"
          >
            <TrendingUp className={`w-4 h-4 transition-transform ${isSidebarOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isSidebarOpen && (
            <div className="bg-black/40 rounded-2xl p-4 border border-white/5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-gray-400">
                  {adminEmail[0]?.toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-white truncate">{adminEmail}</p>
                  <p className="text-[9px] text-purple-400 uppercase font-mono tracking-tighter">Omni-System Access</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest transition-all border border-red-500/10"
              >
                Terminate Session
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-y-auto custom-scrollbar">
        {/* Top Header */}
        <header className="h-24 sticky top-0 bg-[#050510]/80 backdrop-blur-xl border-b border-white/5 z-50 flex items-center justify-between px-10">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest font-mono">
              System // <span className="text-white">{navItems.find(i => i.path === pathname)?.name || 'Command'}</span>
            </h3>
          </div>
          
          <div className="flex items-center gap-6">
             <div className="hidden md:flex flex-col items-end">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Neural Load</span>
                <div className="h-1 w-24 bg-zinc-800 rounded-full overflow-hidden mt-1">
                   <div className="h-full w-2/3 bg-purple-500 animate-pulse" />
                </div>
             </div>
             <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer">
                <Settings className="w-5 h-5" />
             </div>
          </div>
        </header>

        {/* Content Container */}
        <div className="p-10 pb-24">
           {children}
        </div>
        
        {/* Background Decorative Elements */}
        <div className="fixed top-0 right-0 w-1/3 h-1/3 bg-purple-600/5 blur-[150px] pointer-events-none -z-10" />
        <div className="fixed bottom-0 left-0 w-1/4 h-1/4 bg-blue-600/5 blur-[150px] pointer-events-none -z-10" />
      </main>
    </div>
  );
}
