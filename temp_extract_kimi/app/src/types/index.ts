export interface Character {
  id: string;
  name: string;
  avatar: string;
  personality: string;
  description: string;
  tags: string[];
  voice?: string;
  level: number;
  xp: number;
  maxXp: number;
  relationship: 'stranger' | 'acquaintance' | 'friend' | 'close' | 'intimate';
  scenarios: Scenario[];
  isCustom?: boolean;
  isPremium?: boolean;
  contentRating?: 'safe' | 'risque' | 'nsfw';
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  contentRating?: 'safe' | 'risque' | 'nsfw';
}

export interface Message {
  id: string;
  characterId: string;
  content: string;
  timestamp: number;
  isUser: boolean;
  emotion?: string;
}

export interface ChatSession {
  characterId: string;
  messages: Message[];
  currentScenario: string;
  lastActive: number;
}

export type Theme = 'light' | 'dark' | 'midnight' | 'sunset';

export type UserTier = 'free' | 'premium' | 'admin';

export interface User {
  id: string;
  tier: UserTier;
  premiumExpiresAt?: number;
  customCharactersRemaining: number;
  nsfwImagesRemaining: number;
  createdAt: number;
}

export interface UserPreferences {
  theme: Theme;
  fontSize: 'small' | 'medium' | 'large';
  soundEnabled: boolean;
  autoScroll: boolean;
  blurNsfw: boolean;
}
