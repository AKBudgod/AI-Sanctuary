import { useState } from 'react';
import type { Companion, ViewMode } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  ArrowLeft, Sparkles, Download, Copy, RefreshCw, 
  Image as ImageIcon, Wand2, Palette, Check
} from 'lucide-react';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { generateImage, getRandomModel, getModelDisplayName } from '@/services/imageGeneration';

interface ImageGenerationProps {
  companion: Companion;
  onBack: () => void;
  setViewMode: (mode: ViewMode) => void;
}

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  model: string;
  createdAt: Date;
}

const stylePresets = [
  { icon: Wand2, label: 'Fantasy', prompt: 'fantasy digital art style, magical atmosphere, highly detailed' },
  { icon: Palette, label: 'Abstract', prompt: 'abstract digital art, flowing shapes, vibrant colors, modern art' },
];

export function ImageGeneration({ 
  companion, 
  onBack,
  setViewMode 
}: ImageGenerationProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const { speak } = useTextToSpeech({
    voiceURI: companion.gender === 'male' ? 'Google UK English Male' : 'Google UK English Female',
    rate: 0.9,
    pitch: 1.1
  });

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    
    setIsGenerating(true);
    speak(`Generating your image: ${prompt}`);
    
    try {
      const result = await generateImage(prompt, {
        width: 1024,
        height: 1024,
        model: getRandomModel()
      });

      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url: result.url,
        prompt: result.prompt,
        model: result.model || 'unknown',
        createdAt: new Date()
      };

      setSelectedImage(newImage);
      setGeneratedImages(prev => [newImage, ...prev]);
      speak("Your image is ready! Isn't it beautiful?");
    } catch (error) {
      console.error('Image generation failed:', error);
      speak("I had trouble generating that image. Please try again!");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStylePreset = (preset: typeof stylePresets[0]) => {
    setPrompt(`Create a stunning ${preset.prompt}`);
  };

  const handleCopyPrompt = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    speak("Prompt copied to clipboard!");
  };

  const handleDownload = async (imageUrl: string, prompt: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-generated-${prompt.substring(0, 30).replace(/[^a-z0-9]/gi, '-')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      speak("Image downloaded!");
    } catch (error) {
      console.error('Download failed:', error);
      speak("I couldn't download that image.");
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="flex items-center justify-between px-4 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src={companion.avatar} alt={companion.name} />
              <AvatarFallback>{companion.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-semibold text-gray-800">Image Generation</h1>
              <p className="text-xs text-gray-500">with {companion.name}</p>
            </div>
          </div>
        </div>
        <ImageIcon className="w-6 h-6 text-primary-500" />
      </header>

      <div className="flex flex-col lg:flex-row flex-1">
        <div className="lg:w-1/3 bg-white border-r border-gray-200 p-6 overflow-y-auto">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Describe Your Image
              </label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A mystical forest with glowing mushrooms..."
                className="min-h-[100px] border-gray-200 focus:border-primary-500 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Style Presets
              </label>
              <div className="grid grid-cols-2 gap-2">
                {stylePresets.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => handleStylePreset(preset)}
                    className="flex flex-col items-center gap-2 p-3 bg-gray-50 hover:bg-primary-50 rounded-xl transition-colors group"
                  >
                    <preset.icon className="w-5 h-5 text-gray-400 group-hover:text-primary-500" />
                    <span className="text-xs font-medium text-gray-600 group-hover:text-primary-600">
                      {preset.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className="w-full h-12 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl"
            >
              {isGenerating ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Generating...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  <span>Generate Image</span>
                </div>
              )}
            </Button>

            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={() => setViewMode('chat')}
                className="w-full justify-start gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Back to Chat
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          {selectedImage ? (
            <div className="max-w-4xl mx-auto">
              <div className="relative mb-6 rounded-2xl overflow-hidden shadow-2xl bg-gray-100">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.prompt}
                  className="w-full h-auto"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/gallery-1.jpg';
                  }}
                />
                
                <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-xs">
                  {getModelDisplayName(selectedImage.model)}
                </div>
                
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => handleCopyPrompt(selectedImage.prompt, selectedImage.id)}
                    className="bg-white/90 hover:bg-white shadow-lg"
                  >
                    {copiedId === selectedImage.id ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => handleDownload(selectedImage.url, selectedImage.prompt)}
                    className="bg-white/90 hover:bg-white shadow-lg"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">Prompt</h3>
                <p className="text-gray-600 text-sm">{selectedImage.prompt}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ImageIcon className="w-12 h-12 text-gray-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Generate Your First Image
              </h3>
              <p className="text-gray-500 max-w-md">
                {companion.gender === 'male' 
                  ? "Describe anything you can imagine, and I'll create it for you using AI!"
                  : "Tell me what you dream of, sweetie, and I'll bring it to life with AI!"}
              </p>
            </div>
          )}

          {generatedImages.length > 0 && (
            <div className="mt-8">
              <h3 className="font-semibold text-gray-800 mb-4">Recent Creations</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {generatedImages.map((image) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImage(image)}
                    className="gallery-image relative group aspect-square rounded-xl overflow-hidden bg-gray-100"
                  >
                    <img
                      src={image.url}
                      alt={image.prompt}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        const idx = (parseInt(image.id) % 4) + 1;
                        target.src = `/gallery-${idx}.jpg`;
                      }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-sm font-medium">View</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
