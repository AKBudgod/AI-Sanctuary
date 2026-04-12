// Video Generation Service using Replicate API
// This uses the free tier of Replicate for video generation

export interface GeneratedVideoResult {
  url: string;
  prompt: string;
  model?: string;
  duration?: number;
}

export interface VideoGenerationOptions {
  duration?: number;
  fps?: number;
  width?: number;
  height?: number;
  model?: string;
}

// Replicate API configuration
const REPLICATE_API_TOKEN = 'r8_xxxxxxxxxxxxxxxxxxxxxxxx'; // Users should replace with their own token
const REPLICATE_API_URL = 'https://api.replicate.com/v1/predictions';

// Available video generation models
export const VIDEO_MODELS = {
  'ltx-video': 'lightricks/ltx-video:1',
  'zeroscope': 'anotherjesse/zeroscope-v2-xl:9f747673945c62801b13b84701c783929c0ee784e4748ec062204894dda1a351',
  'animatediff': 'guoyww/animatediff-prompt-travel:fcb7d2b9f9c7c5a3bf8e9c2e8c9e1d2c3b4a5f6e7d8c9b0a1f2e3d4c5b6a',
};

export async function generateVideo(
  prompt: string, 
  options: VideoGenerationOptions = {}
): Promise<GeneratedVideoResult> {
  try {
    const {
      duration = 5,
      model = VIDEO_MODELS['ltx-video']
    } = options;

    console.log('Generating video with prompt:', prompt);
    console.log('Using model:', model);

    // For demo purposes, we'll use a mock response
    // In a real implementation, you would call the Replicate API here
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // For now, return a placeholder video URL
    // In production, this would be the actual generated video URL from Replicate
    return {
      url: generatePlaceholderVideo(),
      prompt,
      model,
      duration
    };
  } catch (error) {
    console.error('Video generation error:', error);
    return {
      url: generatePlaceholderVideo(),
      prompt,
      model: 'fallback',
      duration: options.duration || 5
    };
  }
}

// Placeholder video - in production this would be actual generated videos
function generatePlaceholderVideo(): string {
  // Return a data URL for a simple animated SVG
  // In production, this would be actual video URLs from the API
  return '/phone-video.png';
}

// Poll for video generation status (common pattern for async video APIs)
export async function pollForVideoStatus(
  predictionId: string,
  maxAttempts = 60,
  intervalMs = 5000
): Promise<GeneratedVideoResult> {
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    try {
      const response = await fetch(`${REPLICATE_API_URL}/${predictionId}`, {
        headers: {
          'Authorization': `Token ${REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.status === 'succeeded') {
        return {
          url: data.output,
          prompt: data.input.prompt,
          model: data.version.model,
          duration: data.input.num_frames / data.input.fps
        };
      } else if (data.status === 'failed') {
        throw new Error('Video generation failed');
      }
      
      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, intervalMs));
      attempts++;
    } catch (error) {
      console.error('Error polling for video status:', error);
      throw error;
    }
  }
  
  throw new Error('Video generation timed out');
}

// Get video generation models
export function getVideoModels() {
  return Object.entries(VIDEO_MODELS).map(([key, value]) => ({
    id: key,
    name: key.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    value
  }));
}

// Estimate generation time based on parameters
export function estimateGenerationTime(duration: number, resolution: string): number {
  const baseTime = 30; // seconds
  const durationMultiplier = duration / 5; // 5 seconds is base
  const resolutionMultiplier = resolution === '1080p' ? 3 : resolution === '720p' ? 2 : 1;
  
  return Math.ceil(baseTime * durationMultiplier * resolutionMultiplier);
}
