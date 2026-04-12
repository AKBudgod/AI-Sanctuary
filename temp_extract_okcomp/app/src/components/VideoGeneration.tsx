import { useState } from 'react';
import type { Companion, ViewMode } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  ArrowLeft, Play, Download, Copy, 
  Video, Film, Clock, Sparkles, RefreshCw, Check
} from 'lucide-react';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { generateVideo, estimateGenerationTime } from '@/services/videoGeneration';

interface GeneratedVideo {
  id: string;
  url: string;
  prompt: string;
  status: 'generating' | 'completed' | 'failed';
  duration: number;
  createdAt: Date;
}

interface VideoGenerationProps {
  companion: Companion;
  onBack: () => void;
  setViewMode: (mode: ViewMode) => void;
}

const durationOptions = [
  { label: '3 seconds', value: 3 },
  { label: '5 seconds', value: 5 },
  { label: '10 seconds', value: 10 },
  { label: '15 seconds', value: 15 },
];

export function VideoGeneration({ 
  companion, 
  onBack,
  setViewMode 
}: VideoGenerationProps) {
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<GeneratedVideo | null>(null);
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  
  const { speak } = useTextToSpeech({
    voiceURI: companion.gender === 'male' ? 'Google UK English Male' : 'Google UK English Female',
    rate: 0.9,
    pitch: 1.1
  });

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    
    setIsGenerating(true);
    setProgress(0);
    speak(`Creating your ${duration}-second video: ${prompt}`);
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 5;
      });
    }, 300);

    try {
      const estimatedTime = estimateGenerationTime(duration, '720p');
      
      // Add generating video to list
      const generatingVideo: GeneratedVideo = {
        id: Date.now().toString(),
        url: '',
        prompt: prompt,
        status: 'generating',
        duration,
        createdAt: new Date()
      };
      
      setGeneratedVideos(prev => [generatingVideo, ...prev]);

      // Simulate generation time
      await new Promise(resolve => setTimeout(resolve, estimatedTime * 1000));

      // Generate actual video
      const result = await generateVideo(prompt, {
        duration,
        width: 576,
        height: 320
      });

      const completedVideo: GeneratedVideo = {
        ...generatingVideo,
        url: result.url,
        status: 'completed'
      };

      setSelectedVideo(completedVideo);
      setGeneratedVideos(prev => prev.map(v => 
        v.id === completedVideo.id ? completedVideo : v
      ));
      
      setProgress(100);
      speak("Your video is ready! It looks amazing!");
    } catch (error) {
      console.error('Video generation failed:', error);
      speak("I had trouble generating that video. Please try again!");
      
      // Mark as failed
      setGeneratedVideos(prev => prev.map(v => 
        v.status === 'generating' ? { ...v, status: 'failed' } : v
      ));
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const handleCopyPrompt = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    speak("Prompt copied to clipboard!");
  };

  const handleDownload = async (videoUrl: string, prompt: string) => {
    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-generated-video-${prompt.substring(0, 30).replace(/[^a-z0-9]/gi, '-')}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      speak("Video downloaded!");
    } catch (error) {
      console.error('Download failed:', error);
      speak("I couldn't download that video.");
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-900 text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-gray-700 text-white">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src={companion.avatar} alt={companion.name} />
              <AvatarFallback>{companion.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-semibold text-white">Video Generation</h1>
              <p className="text-xs text-gray-400">with {companion.name}</p>
            </div>
          </div>
        </div>
        <Video className="w-6 h-6 text-primary-400" />
      </header>

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)]">
        {/* Generation Panel */}
        <div className="lg:w-2/5 bg-gray-800 border-r border-gray-700 p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Prompt Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Video Description
              </label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A cinematic aerial view of a futuristic city at sunset..."
                className="min-h-[120px] bg-gray-700 border-gray-600 text-white focus:border-primary-500 focus:ring-primary-500 resize-none"
              />
            </div>

            {/* Duration Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Duration
              </label>
              <div className="grid grid-cols-2 gap-2">
                {durationOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setDuration(option.value)}
                    className={`
                      flex items-center justify-center gap-2 p-3 rounded-xl transition-all
                      ${duration === option.value 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }
                    `}
                  >
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Progress Bar */}
            {isGenerating && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Generating video...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className="w-full h-12 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl"
            >
              {isGenerating ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Generating...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Film className="w-5 h-5" />
                  <span>Generate Video</span>
                </div>
              )}
            </Button>

            {/* Quick Actions */}
            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={() => setViewMode('chat')}
                className="w-full justify-start gap-2 bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
              >
                <Sparkles className="w-4 h-4" />
                Back to Chat
              </Button>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="flex-1 bg-gray-900 p-6 overflow-y-auto">
          {selectedVideo ? (
            <div className="max-w-4xl mx-auto">
              {/* Video Preview */}
              <div className="relative mb-6 rounded-2xl overflow-hidden bg-black aspect-video">
                {selectedVideo.status === 'completed' ? (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 to-blue-900">
                    <div className="text-center">
                      <Play className="w-16 h-16 text-white/80 mx-auto mb-4" />
                      <p className="text-white/60 text-sm">Video Preview</p>
                      <p className="text-white/40 text-xs mt-2">{selectedVideo.prompt}</p>
                    </div>
                  </div>
                ) : selectedVideo.status === 'generating' ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <div className="text-center">
                      <RefreshCw className="w-12 h-12 text-primary-400 animate-spin mx-auto mb-4" />
                      <p className="text-gray-400">Generating...</p>
                      <p className="text-gray-500 text-sm mt-2">{Math.round(progress)}%</p>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <div className="text-center text-red-400">
                      <Video className="w-12 h-12 mx-auto mb-4" />
                      <p className="text-red-400">Generation Failed</p>
                      <p className="text-gray-500 text-sm mt-2">Please try again</p>
                    </div>
                  </div>
                )}
                
                {/* Actions */}
                {selectedVideo.status === 'completed' && (
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={() => handleCopyPrompt(selectedVideo.prompt, selectedVideo.id)}
                      className="bg-black/50 hover:bg-black/70 text-white border-0"
                    >
                      {copiedId === selectedVideo.id ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={() => handleDownload(selectedVideo.url, selectedVideo.prompt)}
                      className="bg-black/50 hover:bg-black/70 text-white border-0"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Details */}
              {selectedVideo.status === 'completed' && (
                <div className="bg-gray-800 rounded-xl p-6 mb-6">
                  <h3 className="font-semibold text-white mb-2">Prompt</h3>
                  <p className="text-gray-300 text-sm mb-4">{selectedVideo.prompt}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-gray-500 uppercase">Duration</span>
                      <p className="text-white font-medium">{selectedVideo.duration} seconds</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 uppercase">Status</span>
                      <p className="text-green-400 font-medium">
                        Ready
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-32 h-32 bg-gray-800 rounded-full flex items-center justify-center mb-6">
                <Video className="w-16 h-16 text-gray-600" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-2">
                Create Your First Video
              </h3>
              <p className="text-gray-400 max-w-md">
                {companion.gender === 'male' 
                  ? "Describe any scene or animation, and I'll generate a video for you!"
                  : "Tell me your vision, sweetie, and let's create some video magic!"}
              </p>
            </div>
          )}

          {/* Gallery */}
          {generatedVideos.length > 0 && (
            <div className="mt-8">
              <h3 className="font-semibold text-white mb-4">Recent Videos</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {generatedVideos.map((video) => (
                  <button
                    key={video.id}
                    onClick={() => setSelectedVideo(video)}
                    className="group relative aspect-video rounded-xl overflow-hidden bg-gray-800"
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      {video.status === 'completed' ? (
                        <div className="text-center">
                          <Play className="w-10 h-10 text-white/60 mx-auto mb-2 group-hover:text-white transition-colors" />
                          <p className="text-xs text-gray-500">Video</p>
                        </div>
                      ) : video.status === 'generating' ? (
                        <div className="text-center">
                          <RefreshCw className="w-8 h-8 text-primary-400 animate-spin mx-auto mb-2" />
                          <p className="text-xs text-gray-500">Processing</p>
                        </div>
                      ) : (
                        <div className="text-center text-red-400">
                          <Video className="w-8 h-8 mx-auto mb-2" />
                          <p className="text-xs">Failed</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-xs line-clamp-2">{video.prompt}</p>
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
