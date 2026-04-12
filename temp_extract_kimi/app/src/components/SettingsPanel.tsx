import { Moon, Sun, Stars, Sunset, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useChatStore } from '@/store/chatStore';
import type { Theme } from '@/types';
import { cn } from '@/lib/utils';

const themes: { id: Theme; name: string; icon: React.ReactNode; description: string }[] = [
  {
    id: 'light',
    name: 'Light',
    icon: <Sun className="w-5 h-5" />,
    description: 'Clean and bright',
  },
  {
    id: 'dark',
    name: 'Dark',
    icon: <Moon className="w-5 h-5" />,
    description: 'Easy on the eyes',
  },
  {
    id: 'midnight',
    name: 'Midnight',
    icon: <Stars className="w-5 h-5" />,
    description: 'Deep and mysterious',
  },
  {
    id: 'sunset',
    name: 'Sunset',
    icon: <Sunset className="w-5 h-5" />,
    description: 'Warm and romantic',
  },
];

export function SettingsPanel() {
  const { theme, setTheme } = useChatStore();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Palette className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className={cn(
        theme === 'light' ? 'bg-white' :
        theme === 'dark' ? 'bg-gray-900' :
        theme === 'midnight' ? 'bg-slate-950' :
        'bg-orange-950'
      )}>
        <SheetHeader>
          <SheetTitle className={cn(
            "flex items-center gap-2",
            theme === 'light' ? 'text-gray-900' : 'text-white'
          )}>
            <Palette className="w-5 h-5" />
            Settings
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-8">
          {/* Theme Selection */}
          <div className="space-y-3">
            <Label className={cn(
              "text-sm font-medium flex items-center gap-2",
              theme === 'light' ? 'text-gray-700' : 'text-gray-300'
            )}>
              <Palette className="w-4 h-4" />
              Theme
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={cn(
                    "p-3 rounded-xl border-2 text-left transition-all",
                    theme === t.id
                      ? "border-purple-500 bg-purple-500/10"
                      : theme === 'light'
                      ? "border-gray-200 hover:border-gray-300 bg-gray-50"
                      : "border-gray-700 hover:border-gray-600 bg-gray-800/50"
                  )}
                >
                  <div className={cn(
                    "flex items-center gap-2 mb-1",
                    theme === 'light' ? 'text-gray-900' : 'text-white'
                  )}>
                    {t.icon}
                    <span className="font-medium">{t.name}</span>
                  </div>
                  <p className={cn(
                    "text-xs",
                    theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                  )}>
                    {t.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* About */}
          <div className={cn(
            "p-4 rounded-xl",
            theme === 'light' ? 'bg-gray-100' :
            theme === 'sunset' ? 'bg-orange-900/30' :
            'bg-gray-800/50'
          )}>
            <h4 className={cn(
              "font-semibold mb-2",
              theme === 'light' ? 'text-gray-900' : 'text-white'
            )}>
              About OpenCompanion
            </h4>
            <p className={cn(
              "text-sm",
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            )}>
              An open AI companion platform with no filters or restrictions. 
              Create, customize, and chat freely with your AI companions.
            </p>
            <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
              <span>Version 1.0.0</span>
              <span>•</span>
              <span>Free & Open</span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
