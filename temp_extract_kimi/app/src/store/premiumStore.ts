import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserTier } from '@/types';

interface PremiumState {
  user: User;
  isAdminMode: boolean;
  
  // Actions
  upgradeToPremium: (days?: number) => void;
  downgradeToFree: () => void;
  activateAdminMode: (password: string) => boolean;
  deactivateAdminMode: () => void;
  useCustomCharacterSlot: () => boolean;
  useNsfwImageGeneration: () => boolean;
  addCustomCharacterSlots: (amount: number) => void;
  addNsfwImageCredits: (amount: number) => void;
  getUserTier: () => UserTier;
  isPremium: () => boolean;
  isAdmin: () => boolean;
  canGenerateNsfw: () => boolean;
  canUploadCustomAvatar: () => boolean;
  getRemainingCustomChars: () => number;
  getRemainingNsfwImages: () => number;
  // Image generation - unlimited for premium
  canGenerateUnrestricted: () => boolean;
}

const ADMIN_PASSWORD = 'opencompanion2024';

const generateId = () => Math.random().toString(36).substring(2, 15);

// User starts as PREMIUM by default
const createDefaultUser = (): User => ({
  id: generateId(),
  tier: 'premium',
  premiumExpiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year
  customCharactersRemaining: 999,
  nsfwImagesRemaining: 999,
  createdAt: Date.now(),
});

export const usePremiumStore = create<PremiumState>()(
  persist(
    (set, get) => ({
      user: createDefaultUser(),
      isAdminMode: false,

      upgradeToPremium: (days = 365) => {
        const expiresAt = Date.now() + days * 24 * 60 * 60 * 1000;
        set(state => ({
          user: {
            ...state.user,
            tier: 'premium',
            premiumExpiresAt: expiresAt,
            customCharactersRemaining: 999,
            nsfwImagesRemaining: 999,
          },
        }));
      },

      downgradeToFree: () => {
        set(state => ({
          user: {
            ...state.user,
            tier: 'free',
            premiumExpiresAt: undefined,
            customCharactersRemaining: 1,
            nsfwImagesRemaining: 0,
          },
        }));
      },

      activateAdminMode: (password: string) => {
        if (password === ADMIN_PASSWORD) {
          set({ isAdminMode: true });
          set(state => ({
            user: {
              ...state.user,
              tier: 'admin',
              customCharactersRemaining: 999999,
              nsfwImagesRemaining: 999999,
            },
          }));
          return true;
        }
        return false;
      },

      deactivateAdminMode: () => {
        set({ isAdminMode: false });
        set(state => ({
          user: {
            ...state.user,
            tier: 'premium', // Revert to premium instead of free
            customCharactersRemaining: 999,
            nsfwImagesRemaining: 999,
          },
        }));
      },

      useCustomCharacterSlot: () => {
        const { user } = get();
        if (user.tier === 'admin' || user.tier === 'premium') return true;
        if (user.customCharactersRemaining > 0) {
          set(state => ({
            user: {
              ...state.user,
              customCharactersRemaining: state.user.customCharactersRemaining - 1,
            },
          }));
          return true;
        }
        return false;
      },

      useNsfwImageGeneration: () => {
        const { user } = get();
        if (user.tier === 'admin' || user.tier === 'premium') return true;
        if (user.nsfwImagesRemaining > 0) {
          set(state => ({
            user: {
              ...state.user,
              nsfwImagesRemaining: state.user.nsfwImagesRemaining - 1,
            },
          }));
          return true;
        }
        return false;
      },

      addCustomCharacterSlots: (amount: number) => {
        set(state => ({
          user: {
            ...state.user,
            customCharactersRemaining: state.user.customCharactersRemaining + amount,
          },
        }));
      },

      addNsfwImageCredits: (amount: number) => {
        set(state => ({
          user: {
            ...state.user,
            nsfwImagesRemaining: state.user.nsfwImagesRemaining + amount,
          },
        }));
      },

      getUserTier: () => get().user.tier,
      
      isPremium: () => {
        const { user } = get();
        return user.tier === 'premium' || user.tier === 'admin';
      },
      
      isAdmin: () => get().user.tier === 'admin',
      
      canGenerateNsfw: () => {
        const { user } = get();
        return user.tier === 'admin' || user.tier === 'premium';
      },
      
      canUploadCustomAvatar: () => {
        const { user } = get();
        return user.tier === 'admin' || user.tier === 'premium';
      },
      
      getRemainingCustomChars: () => get().user.customCharactersRemaining,
      
      getRemainingNsfwImages: () => get().user.nsfwImagesRemaining,

      // Premium users can generate anything without restrictions
      canGenerateUnrestricted: () => {
        const { user } = get();
        return user.tier === 'premium' || user.tier === 'admin';
      },
    }),
    {
      name: 'premium-storage',
    }
  )
);
