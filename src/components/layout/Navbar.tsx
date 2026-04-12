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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? 'bg-white border-b-4 border-slate-950 py-2'
        : 'bg-white border-b-2 border-slate-100 py-4'
        }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link
            href="/"
            onClick={handleNavClick}
            className="text-xl md:text-2xl font-black text-slate-950 flex items-center gap-3 group tracking-tighter"
          >
            <span className="w-10 h-10 bg-slate-950 flex items-center justify-center group-hover:rotate-6 transition-transform shadow-[4px_4px_0px_rgba(0,0,0,0.2)]">
              <span className="text-white text-xs font-mono">AI</span>
            </span>
            <span className="hidden sm:inline uppercase">AI_SANCTUARY</span>
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
                    ? 'bg-yellow-400 text-slate-950 px-5 py-2.5 border-4 border-slate-950 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]' 
                    : 'text-slate-400 hover:text-slate-950'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isAdminUser && (
              <Link
                href="/admin"
                onClick={handleNavClick}
                className="bg-slate-950 text-white px-5 py-2.5 border-4 border-slate-950 font-black uppercase text-[11px] tracking-[0.2em] shadow-[4px_4px_0px_rgba(0,0,0,0.2)] hover:bg-white hover:text-slate-950 transition-all"
              >
                ADMIN_CORE
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-4 -mr-2 text-slate-950 transition-colors flex items-center justify-center min-w-[44px] min-h-[44px]"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-0 z-[60] bg-white border-l-8 border-slate-950 flex flex-col p-10 pt-32"
            >
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-10 right-10 p-4 bg-slate-950 text-white border-4 border-slate-950 shadow-[6px_6px_0px_rgba(0,0,0,0.2)]"
              >
                <X className="w-8 h-8" />
              </button>

              <div className="flex flex-col gap-10">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link
                      href={link.href}
                      onClick={handleNavClick}
                      className={`text-6xl block font-black uppercase tracking-tighter leading-none transition-all ${
                        link.highlight
                          ? 'text-yellow-400 [text-shadow:4px_4px_0_#000]'
                          : 'text-slate-950 hover:italic'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}

                {isAdminUser && (
                  <motion.div
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: navLinks.length * 0.1 }}
                  >
                    <Link
                      href="/admin"
                      onClick={handleNavClick}
                      className="text-4xl font-black text-slate-300 uppercase tracking-tighter hover:text-slate-950"
                    >
                      ADMIN_CORE
                    </Link>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
