import { useState, useRef } from 'react';
import { X, Plus, Sparkles, Wand2, Upload, Lock, Image, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useChatStore } from '@/store/chatStore';
import { usePremiumStore } from '@/store/premiumStore';
import { generateAIImage, type ArtStyle } from '@/lib/aiImageService';
import { cn } from '@/lib/utils';

interface CreateCharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const presetTags = [
  'Friendly', 'Flirty', 'Mysterious', 'Playful', 'Dominant', 'Submissive',
  'Caring', 'Protective', 'Chaotic', 'Calm', 'Energetic', 'Artistic',
  'Intellectual', 'Passionate', 'Gentle', 'Witty', 'Seductive', 'Innocent',
  'Rebellious', 'Loyal', 'Adventurous', 'Dreamy', 'Confident', 'Shy'
];

const presetAvatars = [
  'https://api.dicebear.com/7.x/notionists/svg?seed=aria&backgroundColor=ffdfbf',
  'https://api.dicebear.com/7.x/notionists/svg?seed=blaze&backgroundColor=c0aede',
  'https://api.dicebear.com/7.x/notionists/svg?seed=cora&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/notionists/svg?seed=dante&backgroundColor=d1d4f9',
  'https://api.dicebear.com/7.x/notionists/svg?seed=elara&backgroundColor=ffd5dc',
  'https://api.dicebear.com/7.x/notionists/svg?seed=frost&backgroundColor=ffdfbf',
];

export function CreateCharacterModal({ isOpen, onClose }: CreateCharacterModalProps) {
  const { createCharacter, theme } = useChatStore();
  const { isPremium, useCustomCharacterSlot, getRemainingCustomChars } = usePremiumStore();
  
  const [activeTab, setActiveTab] = useState('preset');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [personality, setPersonality] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState(presetAvatars[0]);
  const [customTag, setCustomTag] = useState('');
  const [scenarios, setScenarios] = useState([{ name: 'Casual Chat', description: 'Just chatting naturally' }]);
  
  // Image generation states
  const [selectedStyle, setSelectedStyle] = useState<ArtStyle>('realistic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imagePrompt, setImagePrompt] = useState('');
  
  // Upload states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const remainingCustomChars = getRemainingCustomChars();

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const addCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      setSelectedTags([...selectedTags, customTag.trim()]);
      setCustomTag('');
    }
  };

  const addScenario = () => {
    setScenarios([...scenarios, { name: '', description: '' }]);
  };

  const updateScenario = (index: number, field: 'name' | 'description', value: string) => {
    const newScenarios = [...scenarios];
    newScenarios[index][field] = value;
    setScenarios(newScenarios);
  };

  const removeScenario = (index: number) => {
    setScenarios(scenarios.filter((_, i) => i !== index));
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

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return;
    
    setIsGenerating(true);
    try {
      // Use the actual AI image generation service
      const result = await generateAIImage({
        prompt: imagePrompt.trim(),
        ratio: '1:1',
        style: selectedStyle,
      });
      
      setGeneratedImage(result.url);
    } catch (error) {
      console.error('Image generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getFinalAvatar = () => {
    if (activeTab === 'upload' && uploadedImage) return uploadedImage;
    if (activeTab === 'generate' && generatedImage) return generatedImage;
    return selectedAvatar;
  };

  const handleCreate = () => {
    if (!name.trim() || !description.trim()) return;

    // Check if using custom avatar
    if ((activeTab === 'upload' || activeTab === 'generate') && !isPremium()) {
      if (!useCustomCharacterSlot()) {
        alert('No custom character slots remaining. Upgrade to Premium!');
        return;
      }
    }

    const characterScenarios = scenarios
      .filter(s => s.name.trim())
      .map((s, i) => ({
        id: `scenario-${i}`,
        name: s.name,
        description: s.description,
        systemPrompt: `You are ${name}. ${personality}. ${s.description}`,
      }));

    createCharacter({
      name: name.trim(),
      avatar: getFinalAvatar(),
      personality: personality.trim() || 'friendly and engaging',
      description: description.trim(),
      tags: selectedTags.length > 0 ? selectedTags : ['Custom'],
      scenarios: characterScenarios.length > 0 ? characterScenarios : [
        { id: 'default', name: 'Casual Chat', description: 'Just chatting', systemPrompt: `You are ${name}. Be friendly and engaging.` }
      ],
      isCustom: true,
      isPremium: isPremium(),
    });

    // Reset form
    setName('');
    setDescription('');
    setPersonality('');
    setSelectedTags([]);
    setSelectedAvatar(presetAvatars[0]);
    setScenarios([{ name: 'Casual Chat', description: 'Just chatting naturally' }]);
    setUploadedImage(null);
    setGeneratedImage(null);
    setImagePrompt('');
    setActiveTab('preset');
    onClose();
  };

  const isValid = name.trim() && description.trim();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "max-w-3xl max-h-[90vh] p-0 overflow-hidden",
        theme === 'light' ? 'bg-white' :
        theme === 'dark' ? 'bg-gray-900' :
        theme === 'midnight' ? 'bg-slate-950' :
        'bg-orange-950'
      )}>
        <DialogHeader className={cn(
          "p-6 pb-4 border-b",
          theme === 'light' ? 'border-gray-200' :
          theme === 'dark' ? 'border-gray-800' :
          theme === 'midnight' ? 'border-slate-800' :
          'border-orange-900'
        )}>
          <DialogTitle className={cn(
            "flex items-center gap-2 text-xl",
            theme === 'light' ? 'text-gray-900' : 'text-white'
          )}>
            <Sparkles className="w-5 h-5 text-purple-400" />
            Create Your Companion
            {!isPremium() && (
              <Badge variant="outline" className="ml-auto text-xs">
                <Lock className="w-3 h-3 mr-1" />
                {remainingCustomChars} slot left
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className={cn(
                "font-semibold flex items-center gap-2",
                theme === 'light' ? 'text-gray-700' : 'text-gray-300'
              )}>
                <span className="w-6 h-6 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center">1</span>
                Basic Information
              </h3>

              <div className="space-y-2">
                <Label className={theme === 'light' ? 'text-gray-700' : 'text-gray-300'}>
                  Name *
                </Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Aurora, Shadow, Luna..."
                  className={theme === 'light' ? 'bg-gray-50' : 'bg-gray-800'}
                />
              </div>

              <div className="space-y-2">
                <Label className={theme === 'light' ? 'text-gray-700' : 'text-gray-300'}>
                  Description *
                </Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Who are they? What makes them special?"
                  className={theme === 'light' ? 'bg-gray-50' : 'bg-gray-800'}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label className={theme === 'light' ? 'text-gray-700' : 'text-gray-300'}>
                  Personality Traits
                </Label>
                <Textarea
                  value={personality}
                  onChange={(e) => setPersonality(e.target.value)}
                  placeholder="e.g., mysterious, witty, deeply caring..."
                  className={theme === 'light' ? 'bg-gray-50' : 'bg-gray-800'}
                  rows={2}
                />
              </div>
            </div>

            {/* Avatar Selection Tabs */}
            <div className="space-y-4">
              <h3 className={cn(
                "font-semibold flex items-center gap-2",
                theme === 'light' ? 'text-gray-700' : 'text-gray-300'
              )}>
                <span className="w-6 h-6 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center">2</span>
                Choose Avatar
              </h3>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="preset">
                    <Image className="w-4 h-4 mr-1" />
                    Preset
                  </TabsTrigger>
                  <TabsTrigger value="upload">
                    <Upload className="w-4 h-4 mr-1" />
                    Upload
                    {!isPremium() && <Lock className="w-3 h-3 ml-1" />}
                  </TabsTrigger>
                  <TabsTrigger value="generate">
                    <Wand2 className="w-4 h-4 mr-1" />
                    Generate
                    {!isPremium() && <Lock className="w-3 h-3 ml-1" />}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="preset" className="mt-4">
                  <div className="grid grid-cols-6 gap-2">
                    {presetAvatars.map((avatar, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedAvatar(avatar)}
                        className={cn(
                          "aspect-square rounded-xl overflow-hidden transition-all",
                          selectedAvatar === avatar
                            ? "ring-2 ring-purple-500 ring-offset-2"
                            : "opacity-60 hover:opacity-100"
                        )}
                      >
                        <img src={avatar} alt={`Avatar ${i + 1}`} className="w-full h-full" />
                      </button>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="upload" className="mt-4">
                  {!isPremium() && remainingCustomChars === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-700 rounded-xl">
                      <Lock className="w-8 h-8 mx-auto mb-2 text-gray-500" />
                      <p className="text-gray-400 text-sm">No custom character slots remaining</p>
                      <Button variant="outline" className="mt-2" size="sm">
                        <Crown className="w-4 h-4 mr-1 text-yellow-400" />
                        Upgrade to Premium
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
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
                          "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
                          "hover:border-purple-500 hover:bg-purple-500/5",
                          uploadedImage ? 'border-purple-500 bg-purple-500/10' : 'border-gray-700'
                        )}
                      >
                        {uploadedImage ? (
                          <img src={uploadedImage} alt="Uploaded" className="w-32 h-32 mx-auto rounded-xl object-cover" />
                        ) : (
                          <>
                            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-500" />
                            <p className="text-gray-400 text-sm">Click to upload your image</p>
                            <p className="text-gray-500 text-xs mt-1">JPG, PNG up to 5MB</p>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="generate" className="mt-4 space-y-4">
                  {!isPremium() && remainingCustomChars === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-700 rounded-xl">
                      <Lock className="w-8 h-8 mx-auto mb-2 text-gray-500" />
                      <p className="text-gray-400 text-sm">No custom character slots remaining</p>
                      <Button variant="outline" className="mt-2" size="sm">
                        <Crown className="w-4 h-4 mr-1 text-yellow-400" />
                        Upgrade to Premium
                      </Button>
                    </div>
                  ) : (
                    <>
                      {/* Art Style Selector */}
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-300">Art Style</Label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'realistic', name: 'Realistic' },
                            { id: 'anime', name: 'Anime' },
                            { id: 'artistic', name: 'Digital Art' },
                            { id: '3d', name: '3D Render' },
                            { id: 'fantasy', name: 'Fantasy' },
                            { id: 'cyberpunk', name: 'Cyberpunk' },
                          ].map((style) => (
                            <button
                              key={style.id}
                              onClick={() => setSelectedStyle(style.id as ArtStyle)}
                              className={cn(
                                "py-2 px-3 rounded-lg border text-sm font-medium transition-all",
                                selectedStyle === style.id
                                  ? "border-purple-500 bg-purple-500/20 text-purple-300"
                                  : "border-gray-700 text-gray-400 hover:border-gray-600"
                              )}
                            >
                              {style.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Image Prompt */}
                      <div className="space-y-2">
                        <Label className="text-sm">Image Description</Label>
                        <Textarea
                          value={imagePrompt}
                          onChange={(e) => setImagePrompt(e.target.value)}
                          placeholder="Describe your character's appearance..."
                          className={theme === 'light' ? 'bg-gray-50' : 'bg-gray-800'}
                          rows={3}
                        />
                      </div>

                      <Button
                        onClick={handleGenerateImage}
                        disabled={!imagePrompt.trim() || isGenerating}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                      >
                        {isGenerating ? (
                          <>
                            <span className="animate-spin mr-2">⚡</span>
                            Generating...
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-4 h-4 mr-2" />
                            Generate Image
                          </>
                        )}
                      </Button>

                      {generatedImage && (
                        <div className="rounded-xl overflow-hidden">
                          <img src={generatedImage} alt="Generated" className="w-full h-48 object-cover" />
                        </div>
                      )}
                    </>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Tags */}
            <div className="space-y-4">
              <h3 className={cn(
                "font-semibold flex items-center gap-2",
                theme === 'light' ? 'text-gray-700' : 'text-gray-300'
              )}>
                <span className="w-6 h-6 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center">3</span>
                Personality Tags
              </h3>

              <div className="flex flex-wrap gap-2">
                {presetTags.map(tag => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCustomTag()}
                  placeholder="Add custom tag..."
                  className={theme === 'light' ? 'bg-gray-50' : 'bg-gray-800'}
                />
                <Button variant="outline" onClick={addCustomTag}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedTags.map(tag => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => toggleTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Scenarios */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className={cn(
                  "font-semibold flex items-center gap-2",
                  theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                )}>
                  <span className="w-6 h-6 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center">4</span>
                  Role-Play Scenarios
                </h3>
                <Button variant="outline" size="sm" onClick={addScenario}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>

              <div className="space-y-3">
                {scenarios.map((scenario, index) => (
                  <div
                    key={index}
                    className={cn(
                      "p-3 rounded-lg space-y-2",
                      theme === 'light' ? 'bg-gray-50' : 'bg-gray-800'
                    )}
                  >
                    <div className="flex gap-2">
                      <Input
                        value={scenario.name}
                        onChange={(e) => updateScenario(index, 'name', e.target.value)}
                        placeholder="Scenario name"
                        className="flex-1"
                      />
                      {scenarios.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeScenario(index)}
                          className="text-red-400"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <Input
                      value={scenario.description}
                      onChange={(e) => updateScenario(index, 'description', e.target.value)}
                      placeholder="What happens in this scenario?"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className={cn(
          "p-6 pt-4 border-t flex justify-end gap-2",
          theme === 'light' ? 'border-gray-200' :
          theme === 'dark' ? 'border-gray-800' :
          theme === 'midnight' ? 'border-slate-800' :
          'border-orange-900'
        )}>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!isValid}
            className="bg-gradient-to-r from-purple-600 to-pink-600"
          >
            <Wand2 className="w-4 h-4 mr-2" />
            Create Companion
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
