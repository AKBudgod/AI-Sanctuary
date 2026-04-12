// AI Image Generation Service
// Uses Pollinations.AI for free, unlimited AI image generation
// No API key required - images are generated on-demand via URL

import { v4 as uuidv4 } from 'uuid';

export type ImageRatio = '1:1' | '3:2' | '2:3' | '4:3' | '3:4' | '16:9' | '9:16';
export type ArtStyle = 'realistic' | 'anime' | 'artistic' | '3d' | 'fantasy' | 'cyberpunk';

interface GenerateImageOptions {
  prompt: string;
  ratio?: ImageRatio;
  style?: ArtStyle;
  seed?: number;
  negativePrompt?: string;
  enhance?: boolean;
}

interface Img2ImgOptions {
  imageUrl: string;
  prompt: string;
  strength?: number; // 0-1, how much to transform
  ratio?: ImageRatio;
  style?: ArtStyle;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  negativePrompt?: string;
  ratio: ImageRatio;
  style: ArtStyle;
  seed: number;
  timestamp: number;
  isImg2Img?: boolean;
  originalImage?: string;
}

// Style modifiers for different art styles
const styleModifiers: Record<ArtStyle, string> = {
  realistic: 'photorealistic, highly detailed, 8k uhd, professional photography, sharp focus, natural lighting',
  anime: 'anime style, manga art, vibrant colors, detailed anime illustration, studio ghibli style, cel shaded',
  artistic: 'digital art, masterpiece, best quality, highly detailed, artistic composition, painterly style',
  '3d': '3d render, octane render, unreal engine 5, ray tracing, detailed textures, cinematic lighting, volumetric',
  fantasy: 'fantasy art, magical atmosphere, ethereal lighting, detailed fantasy illustration, mystical',
  cyberpunk: 'cyberpunk style, neon lights, futuristic, high tech, detailed cyberpunk art, dystopian',
};

// Ratio to dimensions mapping
const ratioToDimensions: Record<ImageRatio, { width: number; height: number }> = {
  '1:1': { width: 1024, height: 1024 },
  '3:2': { width: 1024, height: 683 },
  '2:3': { width: 683, height: 1024 },
  '4:3': { width: 1024, height: 768 },
  '3:4': { width: 768, height: 1024 },
  '16:9': { width: 1024, height: 576 },
  '9:16': { width: 576, height: 1024 },
};

// Generate a seed from prompt for consistency
function generateSeedFromPrompt(prompt: string): number {
  let hash = 0;
  for (let i = 0; i < prompt.length; i++) {
    const char = prompt.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash) % 1000000;
}

// Build the Pollinations AI URL
function buildPollinationsUrl(
  prompt: string,
  options: {
    width: number;
    height: number;
    seed?: number;
    negativePrompt?: string;
    enhance?: boolean;
  }
): string {
  const encodedPrompt = encodeURIComponent(prompt);
  let url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${options.width}&height=${options.height}&nologo=true`;
  
  if (options.seed !== undefined) {
    url += `&seed=${options.seed}`;
  }
  
  if (options.negativePrompt) {
    url += `&negative=${encodeURIComponent(options.negativePrompt)}`;
  }
  
  return url;
}

// Storage for generated images
const generatedImages: Map<string, GeneratedImage> = new Map();

/**
 * Generate an AI image from text prompt
 * Uses Pollinations.AI for free, unlimited generation
 */
export async function generateAIImage(options: GenerateImageOptions): Promise<GeneratedImage> {
  const ratio = options.ratio || '1:1';
  const style = options.style || 'realistic';
  const dimensions = ratioToDimensions[ratio];
  
  // Enhance prompt with style modifier
  const styleModifier = styleModifiers[style];
  const enhancedPrompt = `${options.prompt}, ${styleModifier}`;
  
  // Generate or use provided seed
  const seed = options.seed ?? generateSeedFromPrompt(enhancedPrompt);
  
  // Build the generation URL
  const imageUrl = buildPollinationsUrl(enhancedPrompt, {
    width: dimensions.width,
    height: dimensions.height,
    seed,
    negativePrompt: options.negativePrompt,
    enhance: options.enhance,
  });
  
  // Create image object
  const generatedImage: GeneratedImage = {
    id: uuidv4(),
    url: imageUrl,
    prompt: options.prompt,
    negativePrompt: options.negativePrompt,
    ratio,
    style,
    seed,
    timestamp: Date.now(),
  };
  
  // Store in history
  generatedImages.set(generatedImage.id, generatedImage);
  
  // Preload the image to ensure it generates
  await preloadImage(imageUrl);
  
  return generatedImage;
}

/**
 * Generate img2img transformation
 * Takes an existing image and transforms it based on prompt
 */
export async function generateImg2Img(options: Img2ImgOptions): Promise<GeneratedImage> {
  const ratio = options.ratio || '1:1';
  const style = options.style || 'realistic';
  const dimensions = ratioToDimensions[ratio];
  const strength = options.strength ?? 0.7;
  
  // For img2img, we include the original image reference in the prompt
  // Pollinations doesn't have native img2img, so we craft a detailed prompt
  const styleModifier = styleModifiers[style];
  const enhancedPrompt = `${options.prompt}, based on reference image, ${styleModifier}, transformation strength ${strength}`;
  
  const seed = generateSeedFromPrompt(enhancedPrompt + options.imageUrl);
  
  const imageUrl = buildPollinationsUrl(enhancedPrompt, {
    width: dimensions.width,
    height: dimensions.height,
    seed,
  });
  
  const generatedImage: GeneratedImage = {
    id: uuidv4(),
    url: imageUrl,
    prompt: options.prompt,
    ratio,
    style,
    seed,
    timestamp: Date.now(),
    isImg2Img: true,
    originalImage: options.imageUrl,
  };
  
  generatedImages.set(generatedImage.id, generatedImage);
  
  await preloadImage(imageUrl);
  
  return generatedImage;
}

/**
 * Generate a character portrait based on character description
 */
export async function generateCharacterImage(
  characterDescription: string,
  options: {
    ratio?: ImageRatio;
    style?: ArtStyle;
    contentLevel?: 'safe' | 'suggestive' | 'explicit';
  } = {}
): Promise<string> {
  const ratio = options.ratio || '1:1';
  const style = options.style || 'realistic';
  const dimensions = ratioToDimensions[ratio];
  
  // Build character-specific prompt
  let characterPrompt = `portrait of ${characterDescription}`;
  
  // Add quality modifiers
  characterPrompt += `, ${styleModifiers[style]}`;
  
  // Add portrait-specific modifiers
  characterPrompt += `, portrait photography, facing camera, beautiful composition`;
  
  const seed = generateSeedFromPrompt(characterPrompt);
  
  const imageUrl = buildPollinationsUrl(characterPrompt, {
    width: dimensions.width,
    height: dimensions.height,
    seed,
  });
  
  // Preload to ensure generation
  await preloadImage(imageUrl);
  
  return imageUrl;
}

/**
 * Preload an image to ensure it's generated
 */
function preloadImage(url: string): Promise<void> {
  return new Promise((resolve, _reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => {
      // Even if error, the URL might still work (CORS issues)
      // Give it a moment and resolve anyway
      setTimeout(resolve, 500);
    };
    img.src = url;
    
    // Timeout after 30 seconds
    setTimeout(() => resolve(), 30000);
  });
}

/**
 * Get all generated images
 */
export function getGeneratedImages(): GeneratedImage[] {
  return Array.from(generatedImages.values()).sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Get a specific generated image
 */
export function getGeneratedImage(id: string): GeneratedImage | undefined {
  return generatedImages.get(id);
}

/**
 * Delete a generated image
 */
export function deleteGeneratedImage(id: string): boolean {
  return generatedImages.delete(id);
}

/**
 * Clear all generated images
 */
export function clearGeneratedImages(): void {
  generatedImages.clear();
}

/**
 * Regenerate an image with same prompt but different seed
 */
export async function regenerateImage(id: string): Promise<GeneratedImage | null> {
  const existing = generatedImages.get(id);
  if (!existing) return null;
  
  return generateAIImage({
    prompt: existing.prompt,
    ratio: existing.ratio,
    style: existing.style,
    negativePrompt: existing.negativePrompt,
    seed: Math.floor(Math.random() * 1000000), // New random seed
  });
}

/**
 * Get aspect ratio options
 */
export const aspectRatioOptions = [
  { id: '1:1' as ImageRatio, name: 'Square', description: '1:1 - Perfect for profiles' },
  { id: '3:2' as ImageRatio, name: 'Landscape', description: '3:2 - Wide format' },
  { id: '2:3' as ImageRatio, name: 'Portrait', description: '2:3 - Tall format' },
  { id: '4:3' as ImageRatio, name: 'Classic', description: '4:3 - Standard photo' },
  { id: '3:4' as ImageRatio, name: 'Tall', description: '3:4 - Portrait photo' },
  { id: '16:9' as ImageRatio, name: 'Widescreen', description: '16:9 - Cinematic' },
  { id: '9:16' as ImageRatio, name: 'Mobile', description: '9:16 - Stories/TikTok' },
];

/**
 * Get art style options
 */
export const artStyleOptions = [
  { id: 'realistic' as ArtStyle, name: 'Photorealistic', description: 'Life-like photography style' },
  { id: 'anime' as ArtStyle, name: 'Anime', description: 'Japanese animation style' },
  { id: 'artistic' as ArtStyle, name: 'Digital Art', description: 'Stylized artistic rendering' },
  { id: '3d' as ArtStyle, name: '3D Render', description: 'Computer generated 3D style' },
  { id: 'fantasy' as ArtStyle, name: 'Fantasy', description: 'Magical fantasy artwork' },
  { id: 'cyberpunk' as ArtStyle, name: 'Cyberpunk', description: 'Futuristic neon style' },
];
