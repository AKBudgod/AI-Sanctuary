'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Sparkles } from '@/components/ui/Icons';
import { useScrollAnimation, useCountUp } from '@/hooks/useScrollAnimation';

const AnimatedStat = ({ value, label, suffix = '' }: { value: number; label: string; suffix?: string }) => {
  const { ref, isVisible } = useScrollAnimation(0.3);
  const { count, startAnimation } = useCountUp(value, 2000);

  useEffect(() => {
    if (isVisible) {
      startAnimation();
    }
  }, [isVisible]);

  return (
    <div ref={ref} className="text-center group cursor-default">
      <div className="text-3xl md:text-4xl font-bold text-white group-hover:text-blue-400 transition-colors">
        {count}{suffix}
      </div>
      <div className="text-gray-500 text-sm mt-1">{label}</div>
    </div>
  );
};

const Hero = () => {
  return (
    <section className="relative min-h-screen bg-gray-950 overflow-hidden">
      {/* Background Effects */}
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Aurora Background */}
        <div className="absolute inset-0 aurora-bg opacity-40" />

        {/* Grid pattern */}
        <div className="absolute inset-0 grid-bg opacity-30" />

        {/* Floating Particles (CSS Only) */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-6 pt-32 pb-20 min-h-screen flex items-center">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-900/30 border border-blue-800 text-blue-300 text-sm mb-8 animate-fade-in-up">
            <Sparkles className="w-4 h-4" />
            <span>The Future of AI is Decentralized</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold leading-tight tracking-tighter mb-8 animate-fade-in-up stagger-1">
            <span className="text-white text-glow">AI </span>
            <span className="gradient-text animate-gradient drop-shadow-lg">
              Sanctuary
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-6 animate-fade-in-up stagger-2 leading-relaxed">
            A community-driven platform for decentralized AI training and interaction,
            built on secure and transparent blockchain technology.
          </p>

          {/* Description */}
          <p className="text-gray-500 max-w-2xl mx-auto mb-12 animate-fade-in-up stagger-3">
            Access 100+ open-source models, contribute compute power, and shape the future
            of AI through community governance.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up stagger-4">
            <Link
              href="/platform"
              className="group bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-600/25 inline-flex items-center gap-2 btn-shine"
            >
              Explore Platform
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/whitepaper"
              className="bg-transparent border-2 border-gray-700 hover:border-gray-500 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 hover:scale-105"
            >
              Read Whitepaper
            </Link>
          </div>

          {/* Animated Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 animate-fade-in-up stagger-5">
            <AnimatedStat value={50} suffix="K+" label="Community Members" />
            <AnimatedStat value={100} suffix="+" label="AI Models" />
            <AnimatedStat value={99} suffix=".9%" label="Uptime" />
            <AnimatedStat value={2.4} suffix="M" label="Treasury" />
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center pt-2">
              <div className="w-1.5 h-3 bg-gray-400 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
