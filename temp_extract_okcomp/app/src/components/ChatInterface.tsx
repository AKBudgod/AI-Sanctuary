import { useState, useRef, useEffect } from 'react';
import type { Message, Companion, ViewMode } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Mic, MicOff, Send, Image as ImageIcon, Video, 
  ListTodo, StickyNote, Bell, ChevronLeft, Settings, Sparkles
} from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';

interface ChatInterfaceProps {
  companion: Companion;
  messages: Message[];
  onSendMessage: (text: string) => void;
  setViewMode: (mode: ViewMode) => void;
  onBack: () => void;
}

export function ChatInterface({ companion, messages, onSendMessage, setViewMode, onBack }: ChatInterfaceProps) {
  const [inputText, setInputText] = useState('');
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { isListening, transcript, interimTranscript, startListening, stopListening, resetTranscript } = useSpeechRecognition();
  const { isSpeaking, speak } = useTextToSpeech({
    voiceURI: companion.gender === 'male' ? 'Google UK English Male' : 'Google UK English Female',
    rate: 0.9,
    pitch: 1.1
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle voice transcript
  useEffect(() => {
    if (transcript) {
      setInputText(transcript);
      resetTranscript();
    }
  }, [transcript, resetTranscript]);

  // Speak AI messages
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.sender === 'ai' && isVoiceMode && !isSpeaking) {
      speak(lastMessage.text);
    }
  }, [messages, isVoiceMode, speak, isSpeaking]);

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    { icon: ImageIcon, label: 'Image', mode: 'image' as ViewMode, color: 'text-purple-500' },
    { icon: Video, label: 'Video', mode: 'video' as ViewMode, color: 'text-blue-500' },
    { icon: ListTodo, label: 'Tasks', mode: 'tasks' as ViewMode, color: 'text-green-500' },
    { icon: Bell, label: 'Remind', mode: 'reminders' as ViewMode, color: 'text-orange-500' },
    { icon: StickyNote, label: 'Notes', mode: 'notes' as ViewMode, color: 'text-pink-500' },
  ];

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="hover:bg-gray-100"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="w-10 h-10">
                <AvatarImage src={companion.avatar} alt={companion.name} />
                <AvatarFallback>{companion.name[0]}</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-800">{companion.name}</h2>
              <p className="text-xs text-gray-500">Online & Ready to help</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsVoiceMode(!isVoiceMode)}
            className={`${isVoiceMode ? 'bg-primary-100 text-primary-600' : 'hover:bg-gray-100'}`}
          >
            {isVoiceMode ? <Sparkles className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
          </Button>
        </div>
      </header>

      {/* Quick Actions */}
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => setViewMode(action.mode)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors whitespace-nowrap"
            >
              <action.icon className={`w-4 h-4 ${action.color}`} />
              <span className="text-sm font-medium text-gray-700">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Avatar className="w-20 h-20 mb-4">
              <AvatarImage src={companion.avatar} alt={companion.name} />
              <AvatarFallback>{companion.name[0]}</AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Welcome to {companion.name}!</h3>
            <p className="text-gray-500 max-w-sm">
              {companion.gender === 'male' 
                ? "I'm here to help you create images, videos, manage tasks, and more. Just ask me anything!"
                : "Hi sweetie! I'm here to help you create, organize, and make your day brighter. What can we do together?"}
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {message.sender === 'ai' && (
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarImage src={companion.avatar} alt={companion.name} />
                  <AvatarFallback>{companion.name[0]}</AvatarFallback>
                </Avatar>
              )}
              <div
                className={`
                  max-w-xs md:max-w-md px-4 py-3 rounded-2xl
                  ${message.sender === 'user' 
                    ? 'chat-message-user' 
                    : 'chat-message-ai'
                  }
                `}
              >
                <p className="text-sm">{message.text}</p>
                <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-white/70' : 'text-gray-400'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Voice Mode Indicator */}
      {isVoiceMode && (
        <div className="px-4 py-2 bg-primary-50 border-t border-primary-100">
          <div className="flex items-center justify-center gap-2 text-primary-600">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span className="text-sm font-medium">Voice Mode Active - {companion.name} will speak responses</span>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-4 bg-white border-t border-gray-200">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleVoiceToggle}
            className={`${isListening ? 'bg-red-100 text-red-600 recording-pulse' : 'hover:bg-gray-100'}`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </Button>

          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isListening ? "Listening..." : "Type a message or use voice..."}
              className="w-full pr-12 rounded-full border-gray-200 focus:border-primary-500 focus:ring-primary-500"
              disabled={isListening}
            />
            {interimTranscript && (
              <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-gray-100 rounded-lg text-sm text-gray-600">
                <span className="text-xs text-gray-400">Live: </span>
                {interimTranscript}
              </div>
            )}
          </div>

          <Button
            onClick={handleSend}
            disabled={!inputText.trim() || isListening}
            className="bg-primary-500 hover:bg-primary-600 text-white rounded-full px-6"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {/* Listening Indicator */}
        {isListening && (
          <div className="flex items-center justify-center gap-1 mt-3">
            <div className="waveform-bar h-2" />
            <div className="waveform-bar h-4" />
            <div className="waveform-bar h-6" />
            <div className="waveform-bar h-8" />
            <div className="waveform-bar h-6" />
            <div className="waveform-bar h-4" />
            <div className="waveform-bar h-2" />
            <div className="waveform-bar h-5" />
          </div>
        )}
      </div>
    </div>
  );
}
