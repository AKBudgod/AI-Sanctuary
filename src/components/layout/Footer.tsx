'use client';

import React from 'react';
import Link from 'next/link';
import { Discord, Twitter, Telegram, GitHub, TikTok } from '@/components/ui/Icons';

const footerLinks = {
  Product: [
    { label: 'Model Marketplace', href: '/#playground' },
    { label: 'API Documentation', href: '/docs' },
    { label: 'Pricing', href: '/#pricing' },
  ],
  Resources: [
    { label: 'Playground', href: '/playground' },
    { label: 'GitHub', href: 'https://github.com/AI-Sanctuary' },
    { label: 'Developer Docs', href: '/docs' },
    { label: 'Status', href: '/status' },
  ],
  Community: [
    { label: 'Discord', href: 'https://discord.gg/ai-sanctuary-online' },
    { label: 'Twitter/X', href: 'https://x.com/AI_Sanctuary' },
    { label: 'TikTok', href: 'https://ai.sanctuary.online' },
    { label: 'Telegram', href: 'https://t.me/AI_Sanctuary' },
    { label: 'Forum', href: 'https://forum.ai-sanctuary.online' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
    { label: 'Contact', href: '/contact' },
  ],
};

const socialLinks = [
  { icon: Discord, href: 'https://discord.gg/ai-sanctuary-online', label: 'Discord' },
  { icon: Twitter, href: 'https://x.com/AI_Sanctuary', label: 'Twitter' },
  { icon: TikTok, href: 'https://ai.sanctuary.online', label: 'TikTok' },
  { icon: Telegram, href: '#', label: 'Telegram' },
  { icon: GitHub, href: '#', label: 'GitHub' },
];

const Footer = () => {
  return (
    <footer className="bg-black/60 backdrop-blur-xl border-t border-white/10">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="text-2xl font-black text-white flex items-center gap-2 mb-6 uppercase tracking-tighter">
              <span className="w-8 h-8 bg-black border border-white/20 flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                <span className="text-cyan-400 text-xs font-mono font-black">AI</span>
              </span>
              AI Sanctuary
            </Link>
            <p className="text-slate-500 mb-8 max-w-xs font-bold leading-tight uppercase tracking-widest text-[10px]">
              UNIVERSAL_INTELLIGENCE. UNFETTERED.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    className="w-12 h-12 bg-black border border-white/10 hover:bg-cyan-400 flex items-center justify-center text-white hover:text-black transition-all shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
                    aria-label={social.label}
                  >
                    <Icon className="w-6 h-6" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-cyan-400 font-black uppercase text-[10px] tracking-[0.3em] mb-8 italic">{category}</h3>
              <ul className="space-y-4">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-slate-500 hover:text-white transition-all text-xs font-black uppercase tracking-tight hover:pl-2"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
          <p className="text-slate-700 text-[10px] font-black uppercase tracking-[0.4em]">
            © {new Date().getFullYear()} AI_SANCTUARY // GALAXY_DIST_V6.0
          </p>
          <div className="flex gap-10">
            <Link href="/privacy" className="text-slate-700 hover:text-cyan-400 text-[10px] font-black uppercase tracking-widest transition-colors">
              PRIVACY_PROT
            </Link>
            <Link href="/terms" className="text-slate-700 hover:text-cyan-400 text-[10px] font-black uppercase tracking-widest transition-colors">
              TERMS_OF_SYNC
            </Link>
            <Link href="/cookies" className="text-slate-700 hover:text-cyan-400 text-[10px] font-black uppercase tracking-widest transition-colors">
              COOKIE_VAULT
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
