'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from '@/components/ui/Icons';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/playground', label: 'Playground' },
  { href: '/tiers', label: 'Tiers' },
  { href: '/kla', label: "K'LA (SDR)" },
  { href: '/buy?mode=developer&interval=lifetime', label: '💎 ELITE SALE', highlight: true },
];

const ADMIN_EMAILS = [
  'weedj747@gmail.com',
  'wjreviews420@gmail.com',
  'akbudgod@ai-sanctuary.online',
  'gamergoodguy445@gmail.com',
  'kearns.adam747@gmail.com'
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    const savedEmail = localStorage.getItem('user_email');
    if (savedEmail) setUserEmail(savedEmail.toLowerCase());

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isAdminUser = userEmail ? ADMIN_EMAILS.includes(userEmail) : false;

  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav
      className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? 'glass-panel-heavy border-white/10 py-2'
        : 'bg-transparent py-4'
        }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link
            href="/"
            onClick={handleNavClick}
            className="text-xl md:text-2xl font-black text-white flex items-center gap-3 group tracking-tighter"
          >
            <span className="w-10 h-10 bg-cyan-400 flex items-center justify-center group-hover:rotate-6 transition-transform shadow-[0_0_15px_rgba(34,211,238,0.3)]">
              <span className="text-black text-xs font-mono font-black">AI</span>
            </span>
            <span className="hidden sm:inline uppercase">SANCTUARY</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={handleNavClick}
                className={`transition-all relative group font-black text-[11px] uppercase tracking-[0.3em] ${
                  link.highlight 
                    ? 'bg-cyan-400 text-black px-5 py-2.5 border-2 border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)] hover:bg-white' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isAdminUser && (
              <Link
                href="/admin"
                onClick={handleNavClick}
                className="bg-white text-black px-5 py-2.5 border-2 border-white font-black uppercase text-[11px] tracking-[0.2em] hover:bg-cyan-400 hover:border-cyan-400 transition-all"
              >
                ADMIN_CORE
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-4 -mr-2 text-white transition-colors flex items-center justify-center min-w-[44px] min-h-[44px]"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-2xl flex flex-col p-10 pt-32"
            >
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-10 right-10 p-4 border-2 border-white text-white shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              >
                <X className="w-8 h-8" />
              </button>

              <div className="flex flex-col gap-10">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link
                      href={link.href}
                      onClick={handleNavClick}
                      className={`text-6xl block font-black uppercase tracking-tighter leading-none transition-all ${
                        link.highlight
                          ? 'text-cyan-400'
                          : 'text-white hover:text-cyan-400'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
