import { usePremiumStore } from '@/store/premiumStore';

export type ContentLevel = 'safe' | 'risque' | 'nsfw' | 'unrestricted';

interface GenerateImageOptions {
  prompt: string;
  contentLevel?: ContentLevel;
  ratio?: '1:1' | '3:2' | '2:3' | '4:3' | '3:4' | '16:9' | '9:16';
  style?: 'realistic' | 'anime' | 'artistic' | '3d';
}

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
  ratio: string;
}

// Store generated images in memory (in production, this would be in a database)
let generatedImages: GeneratedImage[] = [];

// For premium users - NO restrictions on what can be generated
// The prompt goes directly to the AI with only quality enhancements
const qualityEnhancements: Record<string, string> = {
  realistic: 'photorealistic, high detail, professional photography, 8k resolution, sharp focus, beautiful lighting',
  anime: 'anime style, high quality, detailed, vibrant colors, studio ghibli inspired',
  artistic: 'digital art, highly detailed, masterpiece, best quality, artistic composition',
  '3d': '3D render, octane render, unreal engine 5, high quality, detailed textures, cinematic lighting',
};

export function canGenerateContentLevel(level: ContentLevel): boolean {
  const { isPremium, isAdmin } = usePremiumStore.getState();
  
  // Premium and Admin can generate anything
  if (isAdmin() || isPremium()) return true;
  
  // Free users limited to safe content
  switch (level) {
    case 'safe':
      return true;
    case 'risque':
    case 'nsfw':
    case 'unrestricted':
      return false;
    default:
      return false;
  }
}

export function getMaxContentLevel(): ContentLevel {
  const { isPremium, isAdmin } = usePremiumStore.getState();
  
  if (isPremium() || isAdmin()) return 'unrestricted';
  return 'safe';
}

// For premium users - the prompt is sent with minimal modifications
// Just quality enhancements, no content filtering
export function enhancePromptForGeneration(
  basePrompt: string,
  style: string = 'realistic'
): string {
  const enhancement = qualityEnhancements[style] || qualityEnhancements.realistic;
  return `${basePrompt}, ${enhancement}`;
}

// Generate image using AI - UNRESTRICTED for premium users
export async function generateImage(
  options: GenerateImageOptions
): Promise<GeneratedImage> {
  const { isPremium } = usePremiumStore.getState();
  
  // Premium check
  if (!isPremium()) {
    throw new Error('Image generation is a Premium feature. Please upgrade to access.');
  }
  
  // Enhance the prompt with quality settings (used in production)
  enhancePromptForGeneration(options.prompt, options.style);
  
  // In a real implementation, this would call an AI image generation API
  // For demo purposes, we'll use a placeholder service that demonstrates the concept
  
  // Generate a unique ID
  const id = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // For this demo, we'll return a placeholder that simulates what would happen
  // In production, this would be the actual generated image URL from an API like:
  // - Stable Diffusion
  // - DALL-E
  // - Midjourney
  // - NovelAI
  
  const timestamp = Date.now();
  
  // Create placeholder image based on ratio
  const ratioToSize: Record<string, { w: number; h: number }> = {
    '1:1': { w: 1024, h: 1024 },
    '3:2': { w: 1024, h: 683 },
    '2:3': { w: 683, h: 1024 },
    '4:3': { w: 1024, h: 768 },
    '3:4': { w: 768, h: 1024 },
    '16:9': { w: 1024, h: 576 },
    '9:16': { w: 576, h: 1024 },
  };
  
  const size = ratioToSize[options.ratio || '1:1'];
  
  // Use picsum for demo placeholder images
  // In production, this would be the actual AI-generated image
  const placeholderUrl = `https://picsum.photos/${size.w}/${size.h}?random=${timestamp}`;
  
  const generatedImage: GeneratedImage = {
    id,
    url: placeholderUrl,
    prompt: options.prompt,
    timestamp,
    ratio: options.ratio || '1:1',
  };
  
  // Store in history
  generatedImages.unshift(generatedImage);
  
  // Simulate generation delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return generatedImage;
}

// Generate character portrait - UNRESTRICTED for premium
export async function generateCharacterPortrait(
  description: string,
  options: {
    contentLevel?: ContentLevel;
    ratio?: '1:1' | '3:2' | '2:3';
    style?: 'realistic' | 'anime' | 'artistic';
  } = {}
): Promise<string> {
  const { isPremium } = usePremiumStore.getState();
  
  if (!isPremium()) {
    throw new Error('Character portrait generation requires Premium.');
  }
  
  const enhancedPrompt = enhancePromptForGeneration(
    `portrait of ${description}`,
    options.style || 'realistic'
  );
  
  const image = await generateImage({
    prompt: enhancedPrompt,
    ratio: options.ratio || '1:1',
    style: options.style || 'realistic',
  });
  
  return image.url;
}

// Get generation history
export function getGenerationHistory(): GeneratedImage[] {
  return [...generatedImages];
}

// Clear history
export function clearGenerationHistory(): void {
  generatedImages = [];
}

// Delete specific image from history
export function deleteGeneratedImage(id: string): void {
  generatedImages = generatedImages.filter(img => img.id !== id);
}

export function getContentLevelDescription(level: ContentLevel): string {
  switch (level) {
    case 'safe':
      return 'Safe for work content';
    case 'risque':
      return 'Suggestive and sensual content';
    case 'nsfw':
      return 'Explicit adult content';
    case 'unrestricted':
      return 'Complete creative freedom - generate anything';
    default:
      return '';
  }
}

export function getContentLevelBadge(level: ContentLevel): { text: string; color: string } {
  switch (level) {
    case 'safe':
      return { text: 'SFW', color: 'bg-green-500/20 text-green-400 border-green-500/50' };
    case 'risque':
      return { text: 'RISQUE', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' };
    case 'nsfw':
      return { text: 'NSFW', color: 'bg-red-500/20 text-red-400 border-red-500/50' };
    case 'unrestricted':
      return { text: 'UNLIMITED', color: 'bg-purple-500/20 text-purple-400 border-purple-500/50' };
    default:
      return { text: 'UNKNOWN', color: 'bg-gray-500/20 text-gray-400' };
  }
}

export const aspectRatios = [
  { id: '1:1', name: 'Square', icon: '□' },
  { id: '3:2', name: 'Landscape', icon: '▭' },
  { id: '2:3', name: 'Portrait', icon: '▯' },
  { id: '4:3', name: 'Classic', icon: '▭' },
  { id: '3:4', name: 'Tall', icon: '▯' },
  { id: '16:9', name: 'Widescreen', icon: '▭' },
  { id: '9:16', name: 'Mobile', icon: '▯' },
];

export const artStyles = [
  { id: 'realistic', name: 'Photorealistic', description: 'Life-like photography style' },
  { id: 'anime', name: 'Anime', description: 'Japanese animation style' },
  { id: 'artistic', name: 'Digital Art', description: 'Stylized artistic rendering' },
  { id: '3d', name: '3D Render', description: 'Computer generated 3D style' },
];
