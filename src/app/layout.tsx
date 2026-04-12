import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/ui/ScrollToTop";
import ActivityTracker from "@/components/ui/ActivityTracker";
import PlatformStatusBanner from "@/components/ui/PlatformStatusBanner";
import RouteScrollReset from "@/components/ui/RouteScrollReset";
import RevenueBanner from "@/components/ui/RevenueBanner";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "AI Sanctuary | Uncensored Decentralized Intelligence",
  description: "Chat with completely uncensored, open-source AI models. Voice cloning, image generation, and a decentralized neural network powered by the SANC token.",
  keywords: "uncensored AI, decentralized AI, roleplay AI, Llama 3, Flux Pro, open source models, AI voice cloning, AI marketing agent, autonomous SDR, digital sales director, search ads automation, Google Ads AI, uncensored chatbots, decentralized intelligence",
  openGraph: {
    title: "AI Sanctuary - Decentralized Intelligence",
    description: "Access completely uncensored AI models and voice cloning. No corporate filters.",
    type: "website",
    siteName: "AI Sanctuary",
    images: [{ url: '/community_preview.png', width: 1200, height: 630, alt: 'AI Sanctuary' }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Sanctuary",
    description: "The uncensored hub for decentralized AI models.",
    images: ['/community_preview.png'],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AI Sanctuary',
  },
};

// Next.js 14+ recommended approach for viewport
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // CACHE BUST: 2026-03-30T17:21:00 [NUCLEAR_CACHE_BUST]
  console.log('Antigravity System Initialize... v5.0 [PLATFORM_RECOVERY]');
  
  return (
    <html lang="en">
      <head>
        {/* Absolute System Stability & UI Compatibility Layer v11.0 [GHOST_SHIELD] */}
        <script 
          id="system-stability-v11"
          data-cache-bust={Date.now()}
          dangerouslySetInnerHTML={{ __html: `
            // V11: Ghost Shield [STABILITY_RECOVERY_PROTOCOL]
            (function() {
              if (typeof window === 'undefined') return;
              window.__SYSTEM_STABILITY_V10__ = true;
              
              // --- 1. GLOBAL ERROR SUPPRESSION (INJECT.JS MITIGATION) ---
              window.addEventListener('error', function(e) {
                const msg = e.message || "";
                if (msg.includes('className.indexOf') || msg.includes('target.className') || msg.includes('indexOf is not a function')) {
                  console.warn('[GHOST_SHIELD] Intercepted third-party script crash (className conflict). Recovery successful.');
                  e.preventDefault();
                  e.stopPropagation();
                  return true;
                }
              }, true);

              // --- 2. SVG PROXY SHIELD (ADVANCED CLASSNAME TRAP) ---
              try {
                if (typeof SVGElement !== 'undefined') {
                  const originalDescriptor = Object.getOwnPropertyDescriptor(SVGElement.prototype, 'className');
                  
                  Object.defineProperty(SVGElement.prototype, 'className', {
                    get: function() {
                      const baseVal = this.getAttribute('class') || "";
                      // Return a string-like Proxy to decoy poorly written third-party scripts
                      return new Proxy(new String(baseVal), {
                        get(target, prop) {
                          if (prop === 'baseVal' || prop === 'animVal') return baseVal;
                          const val = target[prop];
                          return typeof val === 'function' ? val.bind(String(baseVal)) : val;
                        },
                        // Ensure it serializes to a string correctly
                        [Symbol.toPrimitive]: () => baseVal,
                        toString: () => baseVal,
                        valueOf: () => baseVal
                      });
                    },
                    set: function(v) {
                      const str = typeof v === 'string' ? v : (v && v.baseVal) || "";
                      this.setAttribute('class', str);
                    },
                    configurable: true
                  });

                  // Patch SVGAnimatedString prototype just in case
                  if (typeof SVGAnimatedString !== 'undefined') {
                    ['indexOf', 'includes', 'split', 'match', 'replace', 'toLowerCase'].forEach(m => {
                      if (!SVGAnimatedString.prototype[m]) {
                        SVGAnimatedString.prototype[m] = function() {
                          const val = String(this.baseVal || "");
                          return val[m].apply(val, arguments);
                        };
                      }
                    });
                  }
                }
              } catch (e) {
                console.warn('[GHOST_SHIELD] Shielding conflict:', e);
              }

              // --- 3. LOCALSTORAGE GUARD (QUOTA PROTECTION) ---
              try {
                const getStorageSize = () => {
                  let total = 0;
                  for (let x in localStorage) {
                    if (localStorage.hasOwnProperty(x)) {
                      total += (localStorage[x].length + x.length) * 2;
                    }
                  }
                  return total;
                };

                const quotaThreshold = 100 * 1024 * 1024; // 100MB
                if (getStorageSize() > quotaThreshold) {
                  console.log('[GHOST_SHIELD] Storage Quota Warning (100MB Ceiling).');
                  const keys = [];
                  for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && (key.includes('_history') || key.includes('_sample') || key.includes('_history_'))) {
                      keys.push(key);
                    }
                  }
                  keys.forEach(k => {
                    localStorage.removeItem(k);
                    if (getStorageSize() < 2 * 1024 * 1024) return;
                  });
                }
              } catch (e) {}

              console.log('[GHOST_SHIELD] Absolute System Stability (v11.0) Active.');
            })();
          ` }} 
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="AI Sanctuary" />
        {/* Google Tag (gtag.js) - Placeholder for G-TRACKING_ID */}
        <script async src={`https://www.googletagmanager.com/gtag/js?id=G-TRACKING_ID&cb=${Date.now()}`}></script>
        <script dangerouslySetInnerHTML={{ __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-TRACKING_ID');
        ` }} />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-white text-slate-950`}
      >
        <Suspense fallback={null}>
          <RevenueBanner />
        </Suspense>
        <RouteScrollReset />
        <div className="flex flex-col min-h-screen">
          <ActivityTracker />
          <PlatformStatusBanner />
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
          <ScrollToTop />
        </div>
        
        {/* Roku Pixel Code - Restored */}
        <script dangerouslySetInnerHTML={{
          __html: `
          !function(e,r){if(!e.rkp){var t=e.rkp=function(){
          var e=Array.prototype.slice.call(arguments)
          ;e.push(Date.now()),t.eventProcessor?t.eventProcessor.apply(t,e):t.queue.push(e)
          };t.initiatorVersion="1.0",t.queue=[],t.load=function(e){
          var t=r.createElement("script");t.async=!0,t.src=e
          ;var n=r.getElementsByTagName("script")[0]
          ;(n?n.parentNode:r.body).insertBefore(t,n)},rkp.load("https://cdn.ravm.tv/ust/dist/rkp.loader.js")}
          }(window,document);
          rkp("init","PaccF3MrBxXh"),rkp('event', 'PAGE_VIEW');
        ` }} />
      </body>
    </html>
  );
}
