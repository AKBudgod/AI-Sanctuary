import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, MessageCircle, Image as ImageIcon, Video, 
  ListTodo, Bell, StickyNote, ChevronRight, Play
} from 'lucide-react';

interface HeroProps {
  onGetStarted: () => void;
}

export function Hero({ onGetStarted }: HeroProps) {
  const phoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!phoneRef.current) return;
      
      const rect = phoneRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const deltaX = (e.clientX - centerX) / 50;
      const deltaY = (e.clientY - centerY) / 50;
      
      phoneRef.current.style.transform = `
        perspective(1000px) 
        rotateX(${-deltaY}deg) 
        rotateY(${deltaX}deg)
      `;
    };

    const handleMouseLeave = () => {
      if (phoneRef.current) {
        phoneRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const features = [
    { icon: MessageCircle, label: 'Voice Chat', color: 'bg-blue-100 text-blue-600' },
    { icon: ImageIcon, label: 'Image Gen', color: 'bg-purple-100 text-purple-600' },
    { icon: Video, label: 'Video Gen', color: 'bg-pink-100 text-pink-600' },
    { icon: ListTodo, label: 'Tasks', color: 'bg-green-100 text-green-600' },
    { icon: Bell, label: 'Reminders', color: 'bg-orange-100 text-orange-600' },
    { icon: StickyNote, label: 'Notes', color: 'bg-yellow-100 text-yellow-600' },
  ];

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Background Decorations */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-primary-300/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-200/5 rounded-full blur-3xl" />
      
      {/* Navigation */}
      <nav className="relative z-10 px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-800">AI Companion</span>
        </div>
        <Button 
          onClick={onGetStarted}
          className="bg-primary-500 hover:bg-primary-600 text-white rounded-full px-6"
        >
          Get Started
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 px-6 py-12 lg:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-primary-500" />
                <span className="text-sm font-medium text-primary-600">AI Companion App</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 leading-tight mb-6">
                Your Personal
                <span className="block text-gradient">AI Assistant</span>
              </h1>
              
              <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto lg:mx-0">
                Experience the next generation of AI interaction with voice conversations, 
                image generation, video creation, and intelligent assistance - all in one app.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  onClick={onGetStarted}
                  size="lg"
                  className="bg-primary-500 hover:bg-primary-600 text-white rounded-full px-8 h-14 text-lg font-semibold shadow-lg hover:shadow-xl"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Chatting
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  className="rounded-full px-8 h-14 text-lg font-semibold border-gray-300 hover:border-primary-500"
                >
                  Watch Demo
                </Button>
              </div>

              {/* Feature Pills */}
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start mt-8">
                {features.map((feature) => (
                  <div
                    key={feature.label}
                    className={`flex items-center gap-2 px-3 py-2 rounded-full ${feature.color}`}
                  >
                    <feature.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{feature.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Phone Mockup */}
            <div className="flex justify-center lg:justify-end">
              <div 
                ref={phoneRef}
                className="relative transition-transform duration-300 ease-out"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Phone Frame */}
                <div className="relative w-[280px] md:w-[320px] bg-gray-900 rounded-[40px] p-3 shadow-2xl">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-gray-900 rounded-b-2xl z-10" />
                  
                  {/* Screen */}
                  <div className="relative bg-white rounded-[32px] overflow-hidden aspect-[9/19]">
                    {/* Status Bar */}
                    <div className="absolute top-0 left-0 right-0 h-12 bg-white z-10 flex items-center justify-between px-6">
                      <span className="text-xs font-semibold text-gray-800">9:41</span>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-2 bg-gray-800 rounded-sm" />
                        <div className="w-3 h-2 bg-gray-800 rounded-sm" />
                        <div className="w-1 h-3 bg-gray-800 rounded-full" />
                      </div>
                    </div>
                    
                    {/* App Content */}
                    <div className="pt-12 h-full bg-gradient-to-b from-gray-50 to-white">
                      {/* Companion Header */}
                      <div className="flex items-center gap-3 px-4 py-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">AI Companion</h3>
                          <p className="text-xs text-gray-500">Online</p>
                        </div>
                      </div>
                      
                      {/* Chat Preview */}
                      <div className="px-4 py-4 space-y-3">
                        <div className="flex justify-end">
                          <div className="bg-primary-500 text-white rounded-2xl rounded-tr-sm px-4 py-2 max-w-[80%]">
                            <p className="text-sm">Generate an image of a sunset</p>
                          </div>
                        </div>
                        <div className="flex">
                          <div className="bg-gray-100 text-gray-800 rounded-2xl rounded-tl-sm px-4 py-2 max-w-[80%]">
                            <p className="text-sm">I'll create that for you!</p>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <div className="bg-primary-500 text-white rounded-2xl rounded-tr-sm px-4 py-2 max-w-[80%]">
                            <p className="text-sm">Remind me at 5pm</p>
                          </div>
                        </div>
                        <div className="flex">
                          <div className="bg-gray-100 text-gray-800 rounded-2xl rounded-tl-sm px-4 py-2 max-w-[80%]">
                            <p className="text-sm">✅ Reminder set!</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Input Bar */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-white border-t border-gray-100">
                        <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
                          <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-sm text-gray-400">Type a message...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Glow Effect */}
                <div className="absolute -inset-4 bg-primary-500/20 rounded-[48px] blur-2xl -z-10 animate-pulse-glow" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="relative z-10 px-6 py-8 border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-gray-800">50K+</div>
              <div className="text-sm text-gray-500">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-800">1M+</div>
              <div className="text-sm text-gray-500">Images Generated</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-800">500K+</div>
              <div className="text-sm text-gray-500">Videos Created</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-800">99%</div>
              <div className="text-sm text-gray-500">Happy Users</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
