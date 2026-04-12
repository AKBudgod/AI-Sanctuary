'use client';

import React from 'react';
import Link from 'next/link';
import { Discord, Twitter, Telegram, GitHub, TikTok } from '@/components/ui/Icons';

const footerLinks = {
  Product: [
    { label: 'Model Marketplace', href: '/#playground' },
    { label: 'API Documentation', href: '#' },
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
    <footer className="bg-white border-t-4 border-slate-950">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="text-2xl font-black text-slate-950 flex items-center gap-2 mb-6 uppercase tracking-tighter">
              <span className="w-8 h-8 bg-slate-950 flex items-center justify-center">
                <span className="text-white text-xs font-mono">AI</span>
              </span>
              AI Sanctuary
            </Link>
            <p className="text-slate-600 mb-8 max-w-xs font-bold leading-tight">
              Industrial-grade intelligence. Unified.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    className="w-12 h-12 bg-white border-2 border-slate-950 hover:bg-slate-950 flex items-center justify-center text-slate-950 hover:text-white transition-all shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-none translate-x-[-2px] translate-y-[-2px] hover:translate-x-0 hover:translate-y-0"
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
              <h3 className="text-slate-950 font-black uppercase text-xs tracking-[0.3em] mb-8 italic">{category}</h3>
              <ul className="space-y-4">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-slate-400 hover:text-slate-950 transition-all text-xs font-black uppercase tracking-tight hover:pl-2"
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
        <div className="pt-12 border-t-4 border-slate-950 flex flex-col md:flex-row items-center justify-between gap-8">
          <p className="text-slate-950 text-[10px] font-black uppercase tracking-[0.4em]">
            © {new Date().getFullYear()} AI_SANCTUARY // INDUSTRIAL_NEURAL_GRID
          </p>
          <div className="flex gap-10">
            <a href="#" className="text-slate-300 hover:text-slate-950 text-[10px] font-black uppercase tracking-widest transition-colors">
              PRIVACY_PROT
            </a>
            <a href="#" className="text-slate-300 hover:text-slate-950 text-[10px] font-black uppercase tracking-widest transition-colors">
              TERMS_OF_SYNC
            </a>
            <a href="#" className="text-slate-300 hover:text-slate-950 text-[10px] font-black uppercase tracking-widest transition-colors">
              COOKIE_VAULT
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
