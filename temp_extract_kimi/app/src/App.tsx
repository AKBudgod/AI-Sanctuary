import { useState, useEffect } from 'react';
import { Menu, Sparkles, Crown, Shield, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CharacterSidebar } from '@/components/CharacterSidebar';
import { ChatInterface } from '@/components/ChatInterface';
import { CreateCharacterModal } from '@/components/CreateCharacterModal';
import { SettingsPanel } from '@/components/SettingsPanel';
import { AdminPanel } from '@/components/AdminPanel';
import { ImageGenerator } from '@/components/ImageGenerator';
import { useChatStore } from '@/store/chatStore';
import { usePremiumStore } from '@/store/premiumStore';
import { cn } from '@/lib/utils';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [imageGeneratorOpen, setImageGeneratorOpen] = useState(false);
  const { theme } = useChatStore();
  const { isPremium, isAdmin, getRemainingCustomChars, getRemainingNsfwImages } = usePremiumStore();

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, [theme]);

  const getBackgroundStyle = () => {
    switch (theme) {
      case 'light':
        return 'bg-gray-100';
      case 'dark':
        return 'bg-gray-950';
      case 'midnight':
        return 'bg-slate-950';
      case 'sunset':
        return 'bg-gradient-to-br from-orange-950 via-purple-950 to-slate-950';
      default:
        return 'bg-gray-950';
    }
  };

  return (
    <div className={cn(
      "h-screen w-screen overflow-hidden flex",
      getBackgroundStyle()
    )}>
      {/* Character Sidebar */}
      <CharacterSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onCreateCharacter={() => {
          setSidebarOpen(false);
          setCreateModalOpen(true);
        }}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className={cn(
          "lg:hidden p-4 border-b flex items-center justify-between",
          theme === 'light' ? 'bg-white border-gray-200' :
          theme === 'dark' ? 'bg-gray-900 border-gray-800' :
          theme === 'midnight' ? 'bg-slate-900 border-slate-800' :
          'bg-orange-950/80 border-orange-900 backdrop-blur'
        )}>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span className={cn(
              "font-bold",
              theme === 'light' ? 'text-gray-900' : 'text-white'
            )}>
              OpenCompanion
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isPremium() && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setImageGeneratorOpen(true)}
                className="text-purple-400"
              >
                <ImageIcon className="w-5 h-5" />
              </Button>
            )}
            <AdminPanel />
            <SettingsPanel />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Desktop Header */}
        <div className={cn(
          "hidden lg:flex p-4 border-b items-center justify-between",
          theme === 'light' ? 'bg-white border-gray-200' :
          theme === 'dark' ? 'bg-gray-900 border-gray-800' :
          theme === 'midnight' ? 'bg-slate-900 border-slate-800' :
          'bg-orange-950/80 border-orange-900 backdrop-blur'
        )}>
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-purple-400" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className={cn(
                  "font-bold text-xl",
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                )}>
                  OpenCompanion
                </h1>
                {isAdmin() ? (
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
                    <Shield className="w-3 h-3 mr-1" />
                    ADMIN
                  </Badge>
                ) : isPremium() ? (
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">
                    <Crown className="w-3 h-3 mr-1" />
                    PREMIUM
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">
                    FREE
                  </Badge>
                )}
              </div>
              <p className={cn(
                "text-xs",
                theme === 'light' ? 'text-gray-500' : 'text-gray-400'
              )}>
                {isPremium() 
                  ? `${getRemainingCustomChars()} custom chars • ${getRemainingNsfwImages()} NSFW credits` 
                  : 'Upgrade for custom uploads & NSFW'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isPremium() && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setImageGeneratorOpen(true)}
                className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                AI Images
              </Button>
            )}
            <AdminPanel />
            <SettingsPanel />
          </div>
        </div>

        {/* Chat Interface */}
        <ChatInterface onOpenSidebar={() => setSidebarOpen(true)} />
      </div>

      {/* Create Character Modal */}
      <CreateCharacterModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

      {/* Image Generator Modal */}
      <ImageGenerator
        isOpen={imageGeneratorOpen}
        onClose={() => setImageGeneratorOpen(false)}
      />
    </div>
  );
}

export default App;
