import { useState, useCallback, useRef, useEffect } from 'react';

interface UseTextToSpeechOptions {
  voiceURI?: string;
  pitch?: number;
  rate?: number;
  volume?: number;
  lang?: string;
}

export function useTextToSpeech(options: UseTextToSpeechOptions = {}) {
  const { voiceURI, pitch = 1, rate = 1, volume = 1, lang = 'en-US' } = options;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!('speechSynthesis' in window)) {
      console.error('Text-to-speech is not supported in this browser');
      return;
    }

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    // Find and set voice
    let selectedVoice: SpeechSynthesisVoice | null = null;
    
    if (voiceURI) {
      selectedVoice = voices.find(v => v.voiceURI === voiceURI) || null;
    }
    
    // Fallback to Google voices or default
    if (!selectedVoice) {
      const googleVoices = voices.filter(v => 
        v.name.toLowerCase().includes('google') || 
        v.name.toLowerCase().includes('samantha') ||
        v.name.toLowerCase().includes('daniel')
      );
      if (googleVoices.length > 0) {
        selectedVoice = googleVoices[0];
      } else if (voices.length > 0) {
        selectedVoice = voices[0];
      }
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.pitch = pitch;
    utterance.rate = rate;
    utterance.volume = volume;
    utterance.lang = lang;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      if (onEnd) onEnd();
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      setIsSpeaking(false);
    };

    speechSynthesis.speak(utterance);
  }, [voices, voiceURI, pitch, rate, volume, lang]);

  const stop = useCallback(() => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const pause = useCallback(() => {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause();
    }
  }, []);

  const resume = useCallback(() => {
    if (speechSynthesis.paused) {
      speechSynthesis.resume();
    }
  }, []);

  return {
    isSpeaking,
    voices,
    speak,
    stop,
    pause,
    resume,
  };
}
