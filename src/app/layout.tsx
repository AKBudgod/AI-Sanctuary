import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/ui/ScrollToTop";
import ActivityTracker from "@/components/ui/ActivityTracker";
import PlatformStatusBanner from "@/components/ui/PlatformStatusBanner";
import RouteScrollReset from "@/components/ui/RouteScrollReset";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "AI Sanctuary | Uncensored Decentralized Intelligence",
  description: "Chat with completely uncensored, open-source AI models. Voice cloning, image generation, and a decentralized neural network powered by the SANC token.",
  keywords: "uncensored AI, decentralized AI, roleplay AI, Llama 3, Flux Pro, open source models, AI voice cloning",
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
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // CACHE BUST: 2026-03-16T15:29:38
  console.log('Antigravity System Initialize...');
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-gray-950 text-gray-100 cyber-grid`}
      >
        <RouteScrollReset />
        <div className="flex flex-col min-h-screen scanlines">
          <ActivityTracker />
          <PlatformStatusBanner />
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
          <ScrollToTop />
        </div>
        {/* Adcash Monetization Scripts */}
        <script id="aclib" type="text/javascript" src="//acscdn.com/script/aclib.js" />
        <script id="ymdw0krm4a" dangerouslySetInnerHTML={{ __html: `(function(k,h,l,f,e){f=k.createElement(h),e=k.getElementsByTagName(h)[0],f.async=1,f.src=l,e.parentNode.insertBefore(f,e)})(document,"script","https://acscdn.com/script/suv4.js");` }} />
        <script dangerouslySetInnerHTML={{ __html: `(function(){window.adcashSettings=window.adcashSettings||{};adcashSettings.zoneId="ymdw0krm4a"})()` }} />

        {/* Roku Pixel Code */}
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
