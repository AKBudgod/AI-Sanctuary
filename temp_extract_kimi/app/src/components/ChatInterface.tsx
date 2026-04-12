import { useRef, useEffect, useState } from 'react';
import { Send, Sparkles, MoreVertical, Trash2, Menu, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useChatStore } from '@/store/chatStore';
import { relationshipLevels } from '@/data/characters';
import { cn } from '@/lib/utils';

interface ChatInterfaceProps {
  onOpenSidebar: () => void;
}

export function ChatInterface({ onOpenSidebar }: ChatInterfaceProps) {
  const {
    getCurrentCharacter,
    getCurrentScenario,
    getMessages,
    sendMessage,
    setScenario,
    clearChat,
    isTyping,
    theme,
    currentScenarioId,
  } = useChatStore();
  
  const [input, setInput] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const character = getCurrentCharacter();
  const scenario = getCurrentScenario();
  const messages = character ? getMessages(character.id) : [];

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input when character changes
  useEffect(() => {
    inputRef.current?.focus();
  }, [character?.id]);

  const handleSend = async () => {
    if (!input.trim() || !character) return;
    const message = input;
    setInput('');
    await sendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getThemeStyles = () => {
    switch (theme) {
      case 'light':
        return 'bg-gray-50';
      case 'dark':
        return 'bg-gray-950';
      case 'midnight':
        return 'bg-slate-950';
      case 'sunset':
        return 'bg-gradient-to-b from-orange-950 to-purple-950';
      default:
        return 'bg-gray-950';
    }
  };

  const getMessageStyles = (isUser: boolean) => {
    if (isUser) {
      return theme === 'light' 
        ? 'bg-purple-600 text-white' 
        : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white';
    }
    return theme === 'light'
      ? 'bg-white text-gray-900 border border-gray-200'
      : theme === 'sunset'
      ? 'bg-orange-900/30 text-orange-100 border border-orange-800/50'
      : 'bg-gray-800/50 text-gray-100 border border-gray-700/50';
  };

  if (!character) {
    return (
      <div className={cn("flex-1 flex flex-col items-center justify-center", getThemeStyles())}>
        <div className="text-center p-8">
          <Sparkles className="w-16 h-16 mx-auto mb-4 text-purple-400" />
          <h2 className={cn(
            "text-2xl font-bold mb-2",
            theme === 'light' ? 'text-gray-900' : 'text-white'
          )}>
            Welcome to OpenCompanion
          </h2>
          <p className={cn(
            "max-w-md mx-auto",
            theme === 'light' ? 'text-gray-600' : 'text-gray-400'
          )}>
            Select a companion from the sidebar or create your own to start chatting. 
            No filters, no limits - just genuine connections.
          </p>
          <Button 
            onClick={onOpenSidebar}
            className="mt-6"
          >
            <Menu className="w-4 h-4 mr-2" />
            Choose a Companion
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex-1 flex flex-col h-full", getThemeStyles())}>
      {/* Header */}
      <div className={cn(
        "p-4 border-b flex items-center justify-between",
        theme === 'light' ? 'bg-white border-gray-200' :
        theme === 'dark' ? 'bg-gray-900 border-gray-800' :
        theme === 'midnight' ? 'bg-slate-900 border-slate-800' :
        'bg-orange-950/80 border-orange-900 backdrop-blur'
      )}>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenSidebar}
            className="lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <div className="relative group">
            <Avatar className="w-12 h-12 ring-2 ring-purple-500/40 shadow-lg transition-all group-hover:ring-purple-500/60">
              <AvatarImage src={character.avatar} className="object-cover" />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">{character.name[0]}</AvatarFallback>
            </Avatar>
            <div className={cn(
              "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2",
              theme === 'light' ? 'border-white bg-green-500' : 'border-gray-900 bg-green-500'
            )} />
          </div>
          
          <div>
            <div className="flex items-center gap-2">
              <h3 className={cn(
                "font-semibold",
                theme === 'light' ? 'text-gray-900' : 'text-white'
              )}>
                {character.name}
              </h3>
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs",
                  relationshipLevels[character.relationship].color === 'pink' && 'border-pink-500 text-pink-400',
                  relationshipLevels[character.relationship].color === 'purple' && 'border-purple-500 text-purple-400',
                )}
              >
                {relationshipLevels[character.relationship].label}
              </Badge>
            </div>
            <p className={cn(
              "text-xs",
              theme === 'light' ? 'text-gray-500' : 'text-gray-400'
            )}>
              Level {character.level} • {scenario?.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Scenario selector */}
          <Select
            value={currentScenarioId}
            onValueChange={(value) => setScenario(character.id, value)}
          >
            <SelectTrigger className={cn(
              "w-40",
              theme === 'light' ? 'bg-gray-100 border-gray-200' : 'bg-gray-800 border-gray-700'
            )}>
              <SelectValue placeholder="Select scenario" />
            </SelectTrigger>
            <SelectContent>
              {character.scenarios.map(s => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sound toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>

          {/* Options menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => clearChat(character.id)} className="text-red-400">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Chat
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="relative inline-block mb-4">
                <img 
                  src={character.avatar} 
                  alt={character.name}
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-purple-500/30 shadow-xl"
                />
                <div className={cn(
                  "absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 flex items-center justify-center",
                  theme === 'light' ? 'border-white bg-green-500' : 'border-gray-900 bg-green-500'
                )}>
                  <span className="w-2 h-2 bg-white rounded-full" />
                </div>
              </div>
              <h3 className={cn(
                "text-xl font-semibold mb-2",
                theme === 'light' ? 'text-gray-900' : 'text-white'
              )}>
                {character.name}
              </h3>
              <p className={cn(
                "text-sm max-w-sm mx-auto mb-4",
                theme === 'light' ? 'text-gray-500' : 'text-gray-400'
              )}>
                {character.description}
              </p>
              <div className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm",
                theme === 'light' ? 'bg-purple-100 text-purple-700' : 'bg-purple-500/20 text-purple-300'
              )}>
                <Sparkles className="w-4 h-4" />
                {scenario?.name}
              </div>
            </div>
          )}

          {messages.map((message) => {
            // Check if message content is an image URL
            const isImage = !message.isUser && (
              message.content.startsWith('http') && 
              (message.content.includes('.jpg') || 
               message.content.includes('.jpeg') || 
               message.content.includes('.png') ||
               message.content.includes('picsum.photos') ||
               message.content.includes('unsplash'))
            );
            
            return (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.isUser ? 'flex-row-reverse' : 'flex-row'
                )}
              >
                <Avatar className="w-9 h-9 flex-shrink-0 ring-2 ring-purple-500/20">
                  {message.isUser ? (
                    <AvatarFallback className="bg-gradient-to-br from-gray-600 to-gray-700 text-white text-xs">You</AvatarFallback>
                  ) : (
                    <>
                      <AvatarImage src={character.avatar} className="object-cover" />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs">{character.name[0]}</AvatarFallback>
                    </>
                  )}
                </Avatar>

                {isImage ? (
                  <div className="max-w-[70%]">
                    <div className="rounded-2xl overflow-hidden border border-gray-700/50">
                      <img 
                        src={message.content} 
                        alt="Shared by character" 
                        className="max-w-full max-h-[400px] object-cover"
                        loading="lazy"
                      />
                    </div>
                    <span className={cn(
                      "text-[10px] mt-1 block text-gray-500"
                    )}>
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ) : (
                  <div className={cn(
                    "max-w-[70%] rounded-2xl px-4 py-2.5",
                    getMessageStyles(message.isUser),
                    message.isUser ? 'rounded-tr-sm' : 'rounded-tl-sm'
                  )}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                    <span className={cn(
                      "text-[10px] mt-1 block",
                      message.isUser ? 'text-white/60' : 'text-gray-500'
                    )}>
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-3">
              <Avatar className="w-9 h-9 ring-2 ring-purple-500/20">
                <AvatarImage src={character.avatar} className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs">{character.name[0]}</AvatarFallback>
              </Avatar>
              <div className={cn(
                "rounded-2xl rounded-tl-sm px-4 py-3",
                theme === 'light' ? 'bg-white border border-gray-200' :
                theme === 'sunset' ? 'bg-orange-900/30 border border-orange-800/50' :
                'bg-gray-800/50 border border-gray-700/50'
              )}>
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input area */}
      <div className={cn(
        "p-4 border-t",
        theme === 'light' ? 'bg-white border-gray-200' :
        theme === 'dark' ? 'bg-gray-900 border-gray-800' :
        theme === 'midnight' ? 'bg-slate-900 border-slate-800' :
        'bg-orange-950/80 border-orange-900 backdrop-blur'
      )}>
        <div className="max-w-4xl mx-auto flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${character.name}...`}
            className={cn(
              "flex-1",
              theme === 'light' 
                ? 'bg-gray-100 border-gray-200 focus:bg-white' 
                : theme === 'sunset'
                ? 'bg-orange-900/30 border-orange-800/50 text-white placeholder:text-orange-400/50'
                : 'bg-gray-800 border-gray-700 text-white'
            )}
            disabled={isTyping}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className={cn(
          "text-center text-xs mt-2",
          theme === 'light' ? 'text-gray-400' : 'text-gray-500'
        )}>
          Press Enter to send • Be respectful and have fun!
        </p>
      </div>
    </div>
  );
}
