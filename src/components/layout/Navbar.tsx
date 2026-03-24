'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ConnectWalletButton from '../ui/ConnectWalletButton';
import { Menu, X } from '@/components/ui/Icons';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/playground', label: 'Playground' },
  { href: '/tiers', label: 'Tiers' },
  { href: '/kla', label: "K'LA (SDR)" },
  { href: '/transparency', label: 'Transparency' },
  { href: '/agents/join', label: 'Join Sanctuary' },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? 'glass shadow-lg py-2'
        : 'bg-transparent py-4'
        }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link
            href="/"
            onClick={handleNavClick}
            className="text-xl md:text-2xl font-bold text-white flex items-center gap-2 group"
          >
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-white text-sm">AI</span>
            </span>
            <span className="hidden sm:inline text-glow hover:text-blue-300 transition-colors">AI Sanctuary</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={handleNavClick}
                className="text-gray-300 hover:text-white transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <ConnectWalletButton />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-300 hover:text-white transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
        >
          <div className="py-4 border-t border-gray-800 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={handleNavClick}
                className="block text-gray-300 hover:text-white transition-colors py-2"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-gray-800">
              <ConnectWalletButton />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
