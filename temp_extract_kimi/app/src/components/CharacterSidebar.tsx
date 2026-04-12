import { useState } from 'react';
import { Plus, Sparkles, Heart, MessageCircle, X, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useChatStore } from '@/store/chatStore';
import { usePremiumStore } from '@/store/premiumStore';
import { relationshipLevels } from '@/data/characters';
import { cn } from '@/lib/utils';

interface CharacterSidebarProps {
  onCreateCharacter: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export function CharacterSidebar({ onCreateCharacter, isOpen, onClose }: CharacterSidebarProps) {
  const { characters, currentCharacterId, setCurrentCharacter, theme } = useChatStore();
  usePremiumStore();
  const [filter, setFilter] = useState<string | null>(null);

  const filteredCharacters = filter
    ? characters.filter(c => c.tags.some(t => t.toLowerCase().includes(filter.toLowerCase())))
    : characters;

  const allTags = Array.from(new Set(characters.flatMap(c => c.tags)));

  const getRelationshipColor = (relationship: string) => {
    return relationshipLevels[relationship as keyof typeof relationshipLevels]?.color || 'gray';
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <div className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-80 transition-transform duration-300 ease-in-out",
        "border-r flex flex-col",
        theme === 'light' ? 'bg-white border-gray-200' :
        theme === 'dark' ? 'bg-gray-900 border-gray-800' :
        theme === 'midnight' ? 'bg-slate-950 border-slate-800' :
        'bg-orange-950 border-orange-900',
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        {/* Header */}
        <div className={cn(
          "p-4 border-b flex items-center justify-between",
          theme === 'light' ? 'border-gray-200' :
          theme === 'dark' ? 'border-gray-800' :
          theme === 'midnight' ? 'border-slate-800' :
          'border-orange-900'
        )}>
          <div className="flex items-center gap-2">
            <Sparkles className={cn(
              "w-5 h-5",
              theme === 'sunset' ? 'text-orange-400' : 'text-purple-400'
            )} />
            <h2 className={cn(
              "font-bold text-lg",
              theme === 'light' ? 'text-gray-900' : 'text-white'
            )}>Companions</h2>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onCreateCharacter}
              className={theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-white/10'}
            >
              <Plus className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="lg:hidden"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Filter tags */}
        <div className="p-3">
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-2 pb-2">
              <Badge
                variant={filter === null ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setFilter(null)}
              >
                All
              </Badge>
              {allTags.map(tag => (
                <Badge
                  key={tag}
                  variant={filter === tag ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setFilter(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Character list */}
        <ScrollArea className="flex-1">
          <div className="p-3 space-y-2">
            {filteredCharacters.map(character => (
              <button
                key={character.id}
                onClick={() => {
                  setCurrentCharacter(character.id);
                  onClose();
                }}
                className={cn(
                  "w-full p-3 rounded-xl text-left transition-all duration-200",
                  "hover:scale-[1.02] active:scale-[0.98]",
                  currentCharacterId === character.id
                    ? theme === 'light' ? 'bg-purple-100 border-purple-300' :
                      theme === 'sunset' ? 'bg-orange-900/50 border-orange-700' :
                      'bg-purple-500/20 border-purple-500/50'
                    : theme === 'light' ? 'bg-gray-50 hover:bg-gray-100 border-transparent' :
                      theme === 'dark' ? 'bg-gray-800/50 hover:bg-gray-800 border-transparent' :
                      theme === 'midnight' ? 'bg-slate-900/50 hover:bg-slate-900 border-transparent' :
                      'bg-orange-950/50 hover:bg-orange-950 border-transparent',
                  "border"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <Avatar className="w-14 h-14 ring-2 ring-offset-2 ring-offset-transparent ring-purple-500/40 shadow-lg">
                      <AvatarImage src={character.avatar} className="object-cover" />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-lg">{character.name[0]}</AvatarFallback>
                    </Avatar>
                    {character.relationship === 'intimate' && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center shadow-md">
                        <Heart className="w-3 h-3 text-white fill-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={cn(
                        "font-semibold truncate",
                        theme === 'light' ? 'text-gray-900' : 'text-white'
                      )}>
                        {character.name}
                      </h3>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-xs",
                          getRelationshipColor(character.relationship) === 'pink' && 'border-pink-500 text-pink-400',
                          getRelationshipColor(character.relationship) === 'purple' && 'border-purple-500 text-purple-400',
                          getRelationshipColor(character.relationship) === 'green' && 'border-green-500 text-green-400',
                          getRelationshipColor(character.relationship) === 'blue' && 'border-blue-500 text-blue-400',
                        )}
                      >
                        {relationshipLevels[character.relationship].label}
                      </Badge>
                    </div>
                    
                    <p className={cn(
                      "text-xs line-clamp-2 mt-1",
                      theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                    )}>
                      {character.description}
                    </p>
                    
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Heart className="w-3 h-3 text-red-400" />
                        <span>Lv.{character.level}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MessageCircle className="w-3 h-3 text-blue-400" />
                        <span>{character.xp}/{character.maxXp} XP</span>
                      </div>
                      {character.isPremium && (
                        <div className="flex items-center gap-1 text-xs">
                          <Crown className="w-3 h-3 text-yellow-400" />
                          <span className="text-yellow-400">PREMIUM</span>
                        </div>
                      )}
                      {character.contentRating === 'nsfw' && (
                        <Badge variant="outline" className="text-[10px] border-red-500/50 text-red-400">
                          NSFW
                        </Badge>
                      )}
                    </div>
                    
                    {/* XP Progress bar */}
                    <div className={cn(
                      "w-full h-1 rounded-full mt-2 overflow-hidden",
                      theme === 'light' ? 'bg-gray-200' : 'bg-gray-700'
                    )}>
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                        style={{ width: `${(character.xp / character.maxXp) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className={cn(
          "p-4 border-t text-center text-xs",
          theme === 'light' ? 'border-gray-200 text-gray-500' :
          theme === 'dark' ? 'border-gray-800 text-gray-500' :
          theme === 'midnight' ? 'border-slate-800 text-gray-500' :
          'border-orange-900 text-orange-400/60'
        )}>
          <p>OpenCompanion AI - Chat Freely</p>
        </div>
      </div>
    </>
  );
}
