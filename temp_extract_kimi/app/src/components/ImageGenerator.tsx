import { useState, useRef, useEffect } from 'react';
import { 
  Wand2, 
  Download, 
  Trash2, 
  Image as ImageIcon, 
  RefreshCw, 
  Sparkles,
  Lock,
  Crown,
  History,
  Upload,
  Layers,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { usePremiumStore } from '@/store/premiumStore';
import { 
  generateAIImage, 
  generateImg2Img,
  getGeneratedImages, 
  deleteGeneratedImage,
  clearGeneratedImages,
  regenerateImage,
  aspectRatioOptions,
  artStyleOptions,
  type GeneratedImage,
  type ImageRatio,
  type ArtStyle
} from '@/lib/aiImageService';
import { cn } from '@/lib/utils';

interface ImageGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImageGenerator({ isOpen, onClose }: ImageGeneratorProps) {
  const { isPremium } = usePremiumStore();
  
  // Generation states
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [selectedRatio, setSelectedRatio] = useState<ImageRatio>('1:1');
  const [selectedStyle, setSelectedStyle] = useState<ArtStyle>('realistic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [activeTab, setActiveTab] = useState('generate');
  const [enhancePrompt, setEnhancePrompt] = useState(true);
  
  // Img2Img states
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [img2imgPrompt, setImg2imgPrompt] = useState('');
  const [transformStrength, setTransformStrength] = useState(0.7);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load generated images on mount
  useEffect(() => {
    if (isOpen) {
      setGeneratedImages(getGeneratedImages());
    }
  }, [isOpen]);

  const handleGenerate = async () => {
    if (!prompt.trim() || !isPremium()) return;
    
    setIsGenerating(true);
    try {
      const image = await generateAIImage({
        prompt: prompt.trim(),
        ratio: selectedRatio,
        style: selectedStyle,
        negativePrompt: negativePrompt.trim() || undefined,
        enhance: enhancePrompt,
      });
      
      setGeneratedImages(getGeneratedImages());
      setSelectedImage(image);
      setPrompt('');
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImg2ImgGenerate = async () => {
    if (!img2imgPrompt.trim() || !uploadedImage || !isPremium()) return;
    
    setIsGenerating(true);
    try {
      const image = await generateImg2Img({
        imageUrl: uploadedImage,
        prompt: img2imgPrompt.trim(),
        strength: transformStrength,
        ratio: selectedRatio,
        style: selectedStyle,
      });
      
      setGeneratedImages(getGeneratedImages());
      setSelectedImage(image);
      setImg2imgPrompt('');
      setUploadedImage(null);
    } catch (error) {
      console.error('Img2Img generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteImage = (id: string) => {
    deleteGeneratedImage(id);
    setGeneratedImages(getGeneratedImages());
    if (selectedImage?.id === id) {
      setSelectedImage(null);
    }
  };

  const handleClearHistory = () => {
    clearGeneratedImages();
    setGeneratedImages([]);
    setSelectedImage(null);
  };

  const handleRegenerate = async (id: string) => {
    setIsGenerating(true);
    try {
      const newImage = await regenerateImage(id);
      if (newImage) {
        setGeneratedImages(getGeneratedImages());
        setSelectedImage(newImage);
      }
    } catch (error) {
      console.error('Regeneration failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (image: GeneratedImage) => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ai-generated-${image.id.slice(0, 8)}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      // Fallback: open in new tab
      window.open(image.url, '_blank');
    }
  };

  if (!isPremium()) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <ImageIcon className="w-5 h-5 text-purple-400" />
              AI Image Generator
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <Lock className="w-16 h-16 mx-auto mb-4 text-gray-500" />
            <h3 className="text-xl font-semibold mb-2 text-white">Premium Feature</h3>
            <p className="text-gray-400 text-sm mb-4">
              AI Image generation with unlimited creative freedom.
            </p>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Premium
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] p-0 overflow-hidden bg-gray-900 border-gray-800">
        <DialogHeader className="p-4 pb-2 border-b border-gray-800">
          <DialogTitle className="flex items-center gap-2 text-white">
            <Sparkles className="w-5 h-5 text-purple-400" />
            AI Image Generator
            <Badge className="ml-auto bg-purple-500/20 text-purple-400 border-purple-500/50">
              <Crown className="w-3 h-3 mr-1" />
              UNLIMITED
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <div className="flex h-[80vh]">
            {/* Left Panel - Controls */}
            <div className="w-96 border-r border-gray-800 flex flex-col">
              <TabsList className="grid w-full grid-cols-3 m-3 mb-0">
                <TabsTrigger value="generate">
                  <Wand2 className="w-4 h-4 mr-1" />
                  Text2Img
                </TabsTrigger>
                <TabsTrigger value="img2img">
                  <Layers className="w-4 h-4 mr-1" />
                  Img2Img
                </TabsTrigger>
                <TabsTrigger value="history">
                  <History className="w-4 h-4 mr-1" />
                  History
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1 p-4">
                {/* Text2Img Tab */}
                <TabsContent value="generate" className="mt-0 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300 flex items-center justify-between">
                      Prompt
                      <span className="text-xs text-gray-500">Describe anything</span>
                    </Label>
                    <Textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="A beautiful cyberpunk city at night with neon lights..."
                      className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 min-h-[100px] resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300 flex items-center justify-between">
                      Negative Prompt
                      <span className="text-xs text-gray-500">What to avoid</span>
                    </Label>
                    <Input
                      value={negativePrompt}
                      onChange={(e) => setNegativePrompt(e.target.value)}
                      placeholder="blurry, low quality, distorted..."
                      className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Aspect Ratio</Label>
                    <Select value={selectedRatio} onValueChange={(v) => setSelectedRatio(v as ImageRatio)}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {aspectRatioOptions.map((ratio) => (
                          <SelectItem key={ratio.id} value={ratio.id} className="text-white hover:bg-gray-700">
                            <div className="flex items-center gap-2">
                              <span className="text-xs bg-gray-700 px-2 py-0.5 rounded">{ratio.id}</span>
                              <span>{ratio.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Art Style</Label>
                    <Select value={selectedStyle} onValueChange={(v) => setSelectedStyle(v as ArtStyle)}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {artStyleOptions.map((style) => (
                          <SelectItem key={style.id} value={style.id} className="text-white hover:bg-gray-700">
                            <div>
                              <div className="font-medium">{style.name}</div>
                              <div className="text-xs text-gray-400">{style.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <Label className="text-gray-300 text-sm">Enhance Quality</Label>
                    <Switch
                      checked={enhancePrompt}
                      onCheckedChange={setEnhancePrompt}
                    />
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || isGenerating}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating AI Image...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 mr-2" />
                        Generate Image
                      </>
                    )}
                  </Button>
                </TabsContent>

                {/* Img2Img Tab */}
                <TabsContent value="img2img" className="mt-0 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Upload Image</Label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all",
                        "hover:border-purple-500 hover:bg-purple-500/5",
                        uploadedImage ? 'border-purple-500 bg-purple-500/10' : 'border-gray-700'
                      )}
                    >
                      {uploadedImage ? (
                        <img src={uploadedImage} alt="Upload" className="max-h-32 mx-auto rounded-lg" />
                      ) : (
                        <>
                          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-500" />
                          <p className="text-gray-400 text-sm">Click to upload image</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Transformation Prompt</Label>
                    <Textarea
                      value={img2imgPrompt}
                      onChange={(e) => setImg2imgPrompt(e.target.value)}
                      placeholder="Turn this into a cyberpunk style..."
                      className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 min-h-[80px] resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300 flex justify-between">
                      <span>Transform Strength</span>
                      <span className="text-gray-500">{Math.round(transformStrength * 100)}%</span>
                    </Label>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.1"
                      value={transformStrength}
                      onChange={(e) => setTransformStrength(parseFloat(e.target.value))}
                      className="w-full accent-purple-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Output Style</Label>
                    <Select value={selectedStyle} onValueChange={(v) => setSelectedStyle(v as ArtStyle)}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {artStyleOptions.map((style) => (
                          <SelectItem key={style.id} value={style.id} className="text-white hover:bg-gray-700">
                            {style.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={handleImg2ImgGenerate}
                    disabled={!img2imgPrompt.trim() || !uploadedImage || isGenerating}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Transforming...
                      </>
                    ) : (
                      <>
                        <Layers className="w-4 h-4 mr-2" />
                        Transform Image
                      </>
                    )}
                  </Button>
                </TabsContent>

                {/* History Tab */}
                <TabsContent value="history" className="mt-0">
                  {generatedImages.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No images generated yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500">
                          {generatedImages.length} images
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleClearHistory}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Clear All
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {generatedImages.map((image) => (
                          <div
                            key={image.id}
                            className={cn(
                              "relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all",
                              selectedImage?.id === image.id
                                ? "border-purple-500"
                                : "border-transparent hover:border-gray-600"
                            )}
                            onClick={() => setSelectedImage(image)}
                          >
                            <img
                              src={image.url}
                              alt={image.prompt}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            {image.isImg2Img && (
                              <div className="absolute top-1 left-1 bg-purple-500/80 text-white text-[10px] px-1.5 py-0.5 rounded">
                                img2img
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </ScrollArea>
            </div>

            {/* Right Panel - Preview */}
            <div className="flex-1 bg-gray-950 flex flex-col">
              <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
                {selectedImage ? (
                  <div className="relative max-w-full">
                    <img
                      src={selectedImage.url}
                      alt={selectedImage.prompt}
                      className="max-w-full max-h-[70vh] rounded-xl shadow-2xl"
                    />
                  </div>
                ) : isGenerating ? (
                  <div className="text-center text-gray-500">
                    <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-purple-500" />
                    <p className="text-lg">Generating your image...</p>
                    <p className="text-sm text-gray-600">This may take 10-30 seconds</p>
                  </div>
                ) : (
                  <div className="text-center text-gray-600">
                    <ImageIcon className="w-24 h-24 mx-auto mb-4 opacity-30" />
                    <p className="text-lg">Your AI creation will appear here</p>
                    <p className="text-sm">Enter a prompt and click Generate</p>
                  </div>
                )}
              </div>

              {selectedImage && (
                <div className="p-4 border-t border-gray-800 bg-gray-900">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-300 truncate" title={selectedImage.prompt}>
                        <span className="text-gray-500">Prompt:</span> {selectedImage.prompt}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="border-gray-700 text-gray-400 text-xs">
                          {selectedImage.ratio}
                        </Badge>
                        <Badge variant="outline" className="border-gray-700 text-gray-400 text-xs capitalize">
                          {selectedImage.style}
                        </Badge>
                        {selectedImage.isImg2Img && (
                          <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                            img2img
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRegenerate(selectedImage.id)}
                        disabled={isGenerating}
                        className="border-gray-700 text-white hover:bg-gray-800"
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Variation
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(selectedImage)}
                        className="border-gray-700 text-white hover:bg-gray-800"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteImage(selectedImage.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
