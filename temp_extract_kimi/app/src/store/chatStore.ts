import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Character, Message, ChatSession, Scenario, Theme } from '@/types';
import { defaultCharacters, relationshipLevels } from '@/data/characters';
import { generateAIResponse, calculateXpGain, checkLevelUp, generateCharacterImage } from '@/lib/aiResponses';

interface ChatState {
  characters: Character[];
  chatSessions: Record<string, ChatSession>;
  currentCharacterId: string | null;
  currentScenarioId: string;
  theme: Theme;
  isTyping: boolean;
  
  // Actions
  setCurrentCharacter: (id: string) => void;
  setScenario: (characterId: string, scenarioId: string) => void;
  sendMessage: (content: string) => Promise<void>;
  createCharacter: (character: Omit<Character, 'id' | 'level' | 'xp' | 'maxXp' | 'relationship'>) => void;
  deleteCharacter: (id: string) => void;
  updateCharacter: (id: string, updates: Partial<Character>) => void;
  clearChat: (characterId: string) => void;
  setTheme: (theme: Theme) => void;
  getMessages: (characterId: string) => Message[];
  getCurrentCharacter: () => Character | null;
  getCurrentScenario: () => Scenario | null;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      characters: defaultCharacters,
      chatSessions: {},
      currentCharacterId: null,
      currentScenarioId: 'default',
      theme: 'dark',
      isTyping: false,

      setCurrentCharacter: (id) => {
        set({ currentCharacterId: id, currentScenarioId: 'default' });
      },

      setScenario: (characterId, scenarioId) => {
        set({ currentScenarioId: scenarioId });
        const session = get().chatSessions[characterId];
        if (session) {
          session.currentScenario = scenarioId;
        }
      },

      sendMessage: async (content) => {
        const { currentCharacterId, characters, chatSessions, currentScenarioId } = get();
        if (!currentCharacterId) return;

        const character = characters.find(c => c.id === currentCharacterId);
        if (!character) return;

        const scenario = character.scenarios.find(s => s.id === currentScenarioId) || character.scenarios[0];
        
        // Create user message
        const userMessage: Message = {
          id: generateId(),
          characterId: currentCharacterId,
          content,
          timestamp: Date.now(),
          isUser: true,
        };

        // Update session with user message
        const currentSession = chatSessions[currentCharacterId] || {
          characterId: currentCharacterId,
          messages: [],
          currentScenario: currentScenarioId,
          lastActive: Date.now(),
        };

        const updatedMessages = [...currentSession.messages, userMessage];
        
        set({
          chatSessions: {
            ...chatSessions,
            [currentCharacterId]: {
              ...currentSession,
              messages: updatedMessages,
              lastActive: Date.now(),
            },
          },
          isTyping: true,
        });

        // Simulate AI thinking time
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500));

        // Generate AI response
        const aiResponse = generateAIResponse(character, content, updatedMessages, scenario);
        
        // Build messages array - may include image
        const newMessages: Message[] = [];
        
        // Add text message
        const aiMessage: Message = {
          id: generateId(),
          characterId: currentCharacterId,
          content: aiResponse.text,
          timestamp: Date.now(),
          isUser: false,
        };
        newMessages.push(aiMessage);
        
        // If AI wants to generate an image, add it as a separate message
        if (aiResponse.shouldGenerateImage && aiResponse.imagePrompt) {
          try {
            const imageUrl = await generateCharacterImage(aiResponse.imagePrompt, {
              ratio: '1:1',
              style: 'realistic'
            });
            
            const imageMessage: Message = {
              id: generateId(),
              characterId: currentCharacterId,
              content: imageUrl,
              timestamp: Date.now(),
              isUser: false,
            };
            newMessages.push(imageMessage);
          } catch (error) {
            console.error('Failed to generate image:', error);
          }
        }

        // Calculate XP
        const xpGained = calculateXpGain(content.length, content.length > 20);
        const levelUpResult = checkLevelUp(character, xpGained);

        // Update character XP and relationship
        let updatedCharacter = { ...character };
        if (levelUpResult.leveledUp) {
          updatedCharacter = {
            ...character,
            level: levelUpResult.newLevel!,
            xp: 0,
            maxXp: Math.floor(character.maxXp * 1.5),
          };
          
          // Check relationship progression
          const currentRel = relationshipLevels[character.relationship];
          if (currentRel.next && updatedCharacter.level >= 3) {
            updatedCharacter.relationship = currentRel.next as any;
          }
        } else {
          updatedCharacter = {
            ...character,
            xp: character.xp + xpGained,
          };
        }

        set(state => ({
          chatSessions: {
            ...state.chatSessions,
            [currentCharacterId]: {
              ...state.chatSessions[currentCharacterId],
              messages: [...updatedMessages, ...newMessages],
              lastActive: Date.now(),
            },
          },
          characters: state.characters.map(c => 
            c.id === currentCharacterId ? updatedCharacter : c
          ),
          isTyping: false,
        }));
      },

      createCharacter: (characterData) => {
        const newCharacter: Character = {
          ...characterData,
          id: generateId(),
          level: 1,
          xp: 0,
          maxXp: 100,
          relationship: 'stranger',
          isCustom: true,
        };
        
        set(state => ({
          characters: [...state.characters, newCharacter],
        }));
      },

      deleteCharacter: (id) => {
        set(state => {
          const { [id]: _, ...remainingSessions } = state.chatSessions;
          return {
            characters: state.characters.filter(c => c.id !== id),
            chatSessions: remainingSessions,
          };
        });
      },

      updateCharacter: (id, updates) => {
        set(state => ({
          characters: state.characters.map(c =>
            c.id === id ? { ...c, ...updates } : c
          ),
        }));
      },

      clearChat: (characterId) => {
        set(state => ({
          chatSessions: {
            ...state.chatSessions,
            [characterId]: {
              characterId,
              messages: [],
              currentScenario: 'default',
              lastActive: Date.now(),
            },
          },
        }));
      },

      setTheme: (theme) => {
        set({ theme });
      },

      getMessages: (characterId) => {
        return get().chatSessions[characterId]?.messages || [];
      },

      getCurrentCharacter: () => {
        const { currentCharacterId, characters } = get();
        if (!currentCharacterId) return null;
        return characters.find(c => c.id === currentCharacterId) || null;
      },

      getCurrentScenario: () => {
        const character = get().getCurrentCharacter();
        if (!character) return null;
        return character.scenarios.find(s => s.id === get().currentScenarioId) || character.scenarios[0];
      },
    }),
    {
      name: 'opencompanion-storage',
      partialize: (state) => ({
        characters: state.characters,
        chatSessions: state.chatSessions,
        theme: state.theme,
      }),
    }
  )
);
