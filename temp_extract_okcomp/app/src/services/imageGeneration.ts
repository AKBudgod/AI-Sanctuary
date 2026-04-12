// Image Generation Service using Puter.js
// This provides free, unlimited image generation

export interface GeneratedImageResult {
  url: string;
  prompt: string;
  model?: string;
}

export interface ImageGenerationOptions {
  width?: number;
  height?: number;
  model?: string;
  quality?: string;
}

// Available models for image generation
export const AVAILABLE_MODELS = {
  'flux-schnell': 'black-forest-labs/FLUX.1-schnell-Free',
  'flux-pro': 'black-forest-labs/FLUX.1-pro',
  'dalle3': 'dall-e-3',
  'dalle2': 'dall-e-2',
  'sdxl': 'stabilityai/stable-diffusion-xl-base-1.0',
  'dreamshaper': 'Lykon/DreamShaper',
};

export async function generateImage(
  prompt: string, 
  options: ImageGenerationOptions = {}
): Promise<GeneratedImageResult> {
  try {
    // Default options
    const {
      width = 1024,
      height = 1024,
      model = AVAILABLE_MODELS['flux-schnell'],
      quality = 'medium'
    } = options;

    console.log('Generating image with prompt:', prompt);
    console.log('Using model:', model);

    // Use Puter.js for image generation
    const result = await (window as any).puter.ai.txt2img(prompt, {
      model,
      width,
      height,
      quality,
      num_outputs: 1,
      response_format: 'url'
    });

    // Puter.js returns an image element, we need to extract the src
    let imageUrl = '';
    if (result && result.src) {
      imageUrl = result.src;
    } else if (result && typeof result === 'string') {
      imageUrl = result;
    } else if (result && result[0] && result[0].src) {
      imageUrl = result[0].src;
    } else {
      // Fallback - create a data URL or use a placeholder
      imageUrl = generatePlaceholderImage(prompt);
    }

    return {
      url: imageUrl,
      prompt,
      model
    };
  } catch (error) {
    console.error('Image generation error:', error);
    // Return a placeholder or generated image
    return {
      url: generatePlaceholderImage(prompt),
      prompt,
      model: 'fallback'
    };
  }
}

// Fallback function to generate a simple placeholder image
function generatePlaceholderImage(prompt: string): string {
  // Create a simple SVG placeholder
  const svg = `
    <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#8c4bff;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#a855f7;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" fill="url(#grad)"/>
      <text x="50%" y="50%" font-family="Arial" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle">
        ${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}
      </text>
      <text x="50%" y="80%" font-family="Arial" font-size="16" fill="white" text-anchor="middle" opacity="0.7">
        AI Generated Image
      </text>
    </svg>
  `;
  
  return 'data:image/svg+xml;base64,' + btoa(svg);
}

// Batch generate multiple images
export async function generateImages(
  prompts: string[],
  options: ImageGenerationOptions = {}
): Promise<GeneratedImageResult[]> {
  const results: GeneratedImageResult[] = [];
  
  for (const prompt of prompts) {
    try {
      const result = await generateImage(prompt, options);
      results.push(result);
    } catch (error) {
      console.error(`Failed to generate image for prompt: ${prompt}`, error);
      results.push({
        url: generatePlaceholderImage(prompt),
        prompt,
        model: 'error'
      });
    }
  }
  
  return results;
}

// Get a random model for variety
export function getRandomModel(): string {
  const models = Object.values(AVAILABLE_MODELS);
  return models[Math.floor(Math.random() * models.length)];
}

// Get model display name
export function getModelDisplayName(model: string): string {
  const entries = Object.entries(AVAILABLE_MODELS);
  const entry = entries.find(([, value]) => value === model);
  return entry ? entry[0] : 'Unknown';
}
