import { useState } from 'react';
import type { Companion, ViewMode } from '@/types';
import { Button } from '@/components/ui/button';
import { Sparkles, User, ArrowRight } from 'lucide-react';

interface CharacterSelectionProps {
  companions: Companion[];
  onSelectCompanion: (companion: Companion) => void;
  setViewMode: (mode: ViewMode) => void;
}

export function CharacterSelection({ companions, onSelectCompanion, setViewMode }: CharacterSelectionProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleSelect = (companion: Companion) => {
    setSelectedId(companion.id);
    onSelectCompanion(companion);
  };

  const handleContinue = () => {
    if (selectedId) {
      setViewMode('chat');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-8 bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary-400/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-300/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      
      {/* Header */}
      <div className="text-center mb-12 z-10">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 text-primary-500" />
          <span className="text-primary-600 font-medium text-sm uppercase tracking-wider">Choose Your Companion</span>
          <Sparkles className="w-6 h-6 text-primary-500" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          Meet Your <span className="text-gradient">AI Friend</span>
        </h1>
        <p className="text-gray-600 max-w-md mx-auto">
          Choose your AI companion who will assist you with image generation, task management, and everyday conversations.
        </p>
      </div>

      {/* Character Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full z-10">
        {companions.map((companion) => (
          <div
            key={companion.id}
            className={`
              companion-card relative bg-white rounded-3xl p-8 cursor-pointer
              transition-all duration-400
              ${selectedId === companion.id ? 'selected' : ''}
              ${hoveredId === companion.id && selectedId !== companion.id ? 'shadow-xl' : 'shadow-lg'}
            `}
            onClick={() => handleSelect(companion)}
            onMouseEnter={() => setHoveredId(companion.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {/* Selection Indicator */}
            {selectedId === companion.id && (
              <div className="absolute top-4 right-4 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center animate-bounce-in">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}

            {/* Character Image */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-gray-100 shadow-lg">
                  <img
                    src={companion.avatar}
                    alt={companion.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Status Dot */}
                <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white animate-pulse" />
              </div>
            </div>

            {/* Character Info */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500 uppercase tracking-wider">
                  {companion.gender === 'male' ? 'Male' : 'Female'} Companion
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{companion.name}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {companion.personality}
              </p>
              
              {/* Voice Preview */}
              <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                <span className="text-xs text-gray-500 uppercase tracking-wider">Voice Sample</span>
                <p className="text-sm text-gray-700 mt-1 italic">
                  "Hi, I'm {companion.name}! I'm excited to be your AI companion."
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Continue Button */}
      <div className="mt-12 z-10">
        <Button
          onClick={handleContinue}
          disabled={!selectedId}
          className={`
            px-8 py-6 text-lg font-semibold rounded-full transition-all duration-300
            ${selectedId 
              ? 'bg-primary-500 hover:bg-primary-600 text-white shadow-lg hover:shadow-xl' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          Continue with {companions.find(c => c.id === selectedId)?.name || 'Your Companion'}
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>

      {/* Bottom Info */}
      <div className="mt-8 text-center text-sm text-gray-500 z-10">
        <p>You can change your companion anytime in settings</p>
      </div>
    </div>
  );
}
