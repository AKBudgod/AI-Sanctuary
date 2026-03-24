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
    <footer className="bg-gray-950 border-t border-gray-900">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="text-2xl font-bold text-white flex items-center gap-2 mb-4">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white text-sm">AI</span>
              </span>
              AI Sanctuary
            </Link>
            <p className="text-gray-500 mb-6 max-w-xs">
              The future of decentralized AI. Built by the community, for the community.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    className="w-10 h-10 rounded-full bg-gray-900 hover:bg-gray-800 border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                    aria-label={social.label}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-white font-semibold mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-gray-500 hover:text-white transition-colors text-sm"
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
        <div className="pt-8 border-t border-gray-900 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-sm">
            © {new Date().getFullYear()} AI Sanctuary. All Rights Reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-gray-600 hover:text-gray-400 text-sm transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-400 text-sm transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-400 text-sm transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
