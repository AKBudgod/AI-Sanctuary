// Text-to-Speech (TTS) API Handler
// Fallback Architecture: StreamElements (Polly) -> HF MMS -> HF SpeechT5 -> OpenAI TTS

interface Env {
  OPENAI_API_KEY?: string;
  ELEVENLABS_API_KEY?: string;
  HF_TOKEN?: string;
  USERS_KV: any;
  KLA_LEADS_KV?: any;
  AI: any;
}

interface EventContext<EnvParams, Params extends string, Data> {
  request: Request;
  env: EnvParams;
}

// CORS headers
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-Email',
};

function preprocessForTTS(text: string): string {
  let processed = text;
  processed = processed.replace(/\*laughs?\*/gi, 'Haha!');
  processed = processed.replace(/\(laughs?\)/gi, 'Haha!');
  processed = processed.replace(/\*giggles?\*/gi, 'Hehe!');
  processed = processed.replace(/\(giggles?\)/gi, 'Hehe!');
  processed = processed.replace(/\*chuckles?\*/gi, 'Heh!');
  processed = processed.replace(/\(chuckles?\)/gi, 'Heh!');
  processed = processed.replace(/\*sighs?\*/gi, 'Ahhh.');
  processed = processed.replace(/!\[.*?\]\([^)]+\)/g, '');
  processed = processed.replace(/\[.*?\]\([^)]+\)/g, '');
  processed = processed.replace(/\*[^*]+\*/g, '');
  processed = processed.replace(/\s{2,}/g, ' ');
  
  processed = processed.trim();
  // Safe truncation at 4000 chars matching LLM limit, breaking at nearest sentence
  if (processed.length > 4000) {
    const safeSlice = processed.substring(0, 4000);
    const lastPunc = Math.max(safeSlice.lastIndexOf('.'), safeSlice.lastIndexOf('!'), safeSlice.lastIndexOf('?'));
    processed = lastPunc > 0 ? safeSlice.substring(0, lastPunc + 1) : safeSlice;
  }
  return processed;
}

const OPENAI_VOICES: Record<string, string> = {
  'lyra': 'shimmer',
  'maya': 'nova',
  'kla': 'shimmer',
  'mj': 'nova',
  'john': 'onyx',
  'rachel': 'nova',
  'angel': 'shimmer',
  'antigravity': 'onyx',
  'miles': 'onyx',
  'bella': 'shimmer',
  'cleo': 'shimmer',
  'lily': 'nova',
  'skye': 'alloy',
  'raven': 'echo',
  'domi': 'nova',
  'antoni': 'onyx',
  'josh': 'alloy',
};

const POLLY_VOICES: Record<string, string> = {
  'lyra': 'Emma',
  'maya': 'Salli',
  'kla': 'Emma',
  'mj': 'Amy',
  'john': 'Brian',
  'rachel': 'Salli',
  'angel': 'Kimberly',
  'antigravity': 'Joey',
  'miles': 'Justin',
  'bella': 'Salli',
  'cleo': 'Emma',
  'lily': 'Amy',
  'skye': 'Kimberly',
  'raven': 'Geraint',
  'domi': 'Salli',
  'antoni': 'Brian',
  'josh': 'Joey',
  'amy': 'Amy',
  'brian': 'Brian',
  'emma': 'Emma',
  'salli': 'Salli',
  'joey': 'Joey',
  'kimberly': 'Kimberly',
  'justin': 'Justin',
  'kendra': 'Kendra',
  'nicole': 'Nicole',
  'russell': 'Russell',
  'mizuki': 'Mizuki',
  'takumi': 'Takumi',
};

export const onRequestOptions = async () => new Response(null, { status: 204, headers: CORS_HEADERS });

export const onRequestPost = async (context: EventContext<Env, any, any>) => {
  const { request, env } = context;

  const jsonRes = (data: any, status = 200) =>
    new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } });

  try {
    const rawBody = await request.text();
    if (!rawBody) return jsonRes({ error: 'Empty request body' }, 400);

    let body: any;
    try { body = JSON.parse(rawBody); } catch { return jsonRes({ error: 'Invalid JSON' }, 400); }

    const { text, voice } = body;
    if (!text || !text.trim() || !voice) return jsonRes({ error: 'Text and voice required' }, 400);

    const cleanText = preprocessForTTS(text);
    if (!cleanText) return jsonRes({ error: 'Processed text is empty' }, 400);

    // FIX #1: Strip 'voice-' prefix correctly so assigned model registry works
    const slug = voice.replace(/^voice-/i, '').replace(/^sesame-/i, '').toLowerCase();

    // 1. Check Global Registry for assigned model overrides
    let mappedVoiceId = slug;
    
    // Hardcoded overrides removed to permit KV registry entries

    try {
      if (env.USERS_KV) {
        const globalId = await env.USERS_KV.get(`global_voice:${slug}`);
        if (globalId) {
          mappedVoiceId = globalId.replace(/^native_cf_/i, '').replace(/_\d+$/, '').toLowerCase();
          console.log(`[TTS] Overriding "${slug}" -> assigned model "${mappedVoiceId}"`);
        }
      }
    } catch (e) {
      console.warn('[TTS] Registry lookup failed:', e);
    }

    // Attempt Server-Side Free Providers (Resilient Fallback Chain)
    const hfToken = env.HF_TOKEN?.trim();
    const openaiKey = env.OPENAI_API_KEY?.trim();

    // -- Provider 0: Local Hardware Neural Voice --
    try {
      const localRes = await fetch('https://node.ai-sanctuary.online/api/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Bypass-Tunnel-Reminder': 'true' },
        body: JSON.stringify({ 
          text: cleanText, 
          voice_id: mappedVoiceId, // Uses KV mapped ID or slug
          language: 'en'
        }),
        signal: AbortSignal.timeout(90000) // 90s timeout for local CPU synthesis
      });
      if (localRes && localRes.ok) {
        const audio = await localRes.arrayBuffer();
        if (audio.byteLength > 100) {
          return new Response(audio, {
            headers: { 
              'Content-Type': 'audio/wav', 
              'X-TTS-Provider': 'Local-Hardware-Cloned',
              'X-Voice-Slug': mappedVoiceId,
              ...CORS_HEADERS 
            } 
          });
        }
      }
    } catch (e) { 
      console.log('[TTS] Local Hardware offline or timed out. Falling back to Grid...'); 
    }

    // -- Provider 0.2: Hugging Face XTTS-v2 (Cloud Coqui) --
    if (hfToken) {
      const SPACES = [
        'https://hasanbasbunar-voice-cloning-xtts-v2.hf.space',
        'https://coqui-xtts.hf.space'
      ];
      
      for (const space of SPACES) {
        try {
          // We use a public stable space or inference endpoint if available.
          // For custom clones, we need a URL. For built-ins, we use the persona sample.
          const refUrl = `https://ai-sanctuary.online/api/voice/sample/${mappedVoiceId}`;
          const hfRes = await fetch(`${space}/api/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${hfToken}` },
            body: JSON.stringify({
              data: [
                cleanText, refUrl, null, "English",
                0.75, 1.0, true, 2.0, 1.0, 0, 50, 0.8,
                true, -40, 400, 100, "Sentence", 250, true
              ]
            }),
            signal: AbortSignal.timeout(8000) // Gradio queue-aware: don't wait forever
          });

          if (hfRes.ok) {
            const result: any = await hfRes.json();
            // If Gradio gives a queue estimation or is_generating without data, bail immediately
            if (result.is_generating || result.msg === "estimation" || result.error) continue;
            
            const audioUrl = result.data?.[0]?.url;
            if (audioUrl) {
              const audioRes = await fetch(audioUrl);
              const ab = await audioRes.arrayBuffer();
              return new Response(ab, {
                headers: { 
                  'Content-Type': 'audio/wav', 
                  'X-TTS-Provider': 'HuggingFace-XTTS-Cloud', 
                  ...CORS_HEADERS 
                } 
              });
            }
          }
        } catch (e) {
          // Console log omitted to avoid spam, continues to next space or next provider
        }
      }
      console.warn('[TTS] Both HF XTTS fallbacks failed or queued.');
    }

    // -- Provider 0.5: ElevenLabs (High-Fidelity Fallback) --
    const elevenlabsKey = env.ELEVENLABS_API_KEY?.trim();
    if (elevenlabsKey) {
      try {
        // High-quality voice mappings for ElevenLabs
        const ELEVENLABS_VOICE_MAP: Record<string, string> = {
          'lyra': '21m00Tcm4llvDq8ikSEG', // Bella (High Energy, Professional)
          'maya': 'EXAVITQu4vr4xnSDxMaL', // Rachel (Warm, Narrator)
          'john': 'VR6A4HSKPfS5mNWn9jqO', // Arnold (Deep, Authoritative)
          'kla': '21m00Tcm4llvDq8ikSEG',
          'mj': 'EXAVITQu4vr4xnSDxMaL'
        };

        const evId = ELEVENLABS_VOICE_MAP[slug] || ELEVENLABS_VOICE_MAP[mappedVoiceId];
        
        if (evId) {
          const elRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${evId}`, {
            method: 'POST',
            headers: { 'xi-api-key': elevenlabsKey, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: cleanText,
              model_id: 'eleven_monolingual_v1',
              voice_settings: { stability: 0.5, similarity_boost: 0.75 }
            })
          });

          if (elRes.ok) {
            const ab = await elRes.arrayBuffer();
            if (ab.byteLength > 100) {
              return new Response(ab, {
                headers: { 
                  'Content-Type': 'audio/mpeg', 
                  'X-TTS-Provider': 'ElevenLabs-Pro-Fallback', 
                  ...CORS_HEADERS 
                } 
              });
            }
          }
        }
      } catch (e) {
        console.warn('[TTS] ElevenLabs fallback failed:', e);
      }
    }

    // -- Provider 1: StreamElements (AWS Polly) (Hybrid Free-First) --
    // We use Polly if:
    // 1. The slug is in our POLLY_VOICES map.
    // 2. The mappedVoiceId (from KV) is a valid-looking Polly voice name.
    const isCustomMapped = !!(env.USERS_KV && await env.USERS_KV.get(`global_voice:${slug}`));
    const pollyVoice = POLLY_VOICES[mappedVoiceId.toLowerCase()] || POLLY_VOICES[slug] || (isCustomMapped ? mappedVoiceId : null);

    if (pollyVoice) {
      try {
        const pollyUrl = `https://api.streamelements.com/kappa/v2/speech?voice=${pollyVoice}&text=${encodeURIComponent(cleanText)}`;
        const pRes = await fetch(pollyUrl);
        if (pRes.ok) {
          const ab = await pRes.arrayBuffer();
          if (ab.byteLength > 100) {
              return new Response(ab, { 
                  headers: { 
                      'Content-Type': 'audio/mpeg', 
                      'X-TTS-Provider': 'StreamElements-Polly', 
                      'X-TTS-Voice': pollyVoice,
                      'X-Mapped': isCustomMapped ? 'true' : 'false',
                      ...CORS_HEADERS 
                  } 
              });
          }
        }
      } catch (e) {
        console.warn('[TTS] StreamElements failed:', e);
      }
    }

    // -- Provider 1: HF MMS-TTS (T-0ms) --
    if (hfToken) {
      try {
        const hRes = await fetch('https://api-inference.huggingface.co/models/facebook/mms-tts-eng', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${hfToken}`, 'Content-Type': 'application/json', 'X-Wait-For-Model': 'true' },
          body: JSON.stringify({ inputs: cleanText })
        });
        if (hRes.ok) {
          const ab = await hRes.arrayBuffer();
          if (ab.byteLength > 100) return new Response(ab, { headers: { 'Content-Type': 'audio/wav', 'X-TTS-Provider': 'HuggingFace-MMS', ...CORS_HEADERS } });
        }
      } catch (e) { console.warn('HF_1 failed'); }
    }

    // -- Provider 2: HF SpeechT5 Female Clone Backup (T-500ms) --
    if (hfToken) {
      try {
        const hRes = await fetch('https://api-inference.huggingface.co/models/microsoft/speecht5_tts', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${hfToken}`, 'Content-Type': 'application/json', 'X-Wait-For-Model': 'true' },
          body: JSON.stringify({
            inputs: cleanText,
            parameters: { speaker_embeddings: 'https://huggingface.co/datasets/Matthijs/cmu-arctic-xvectors/resolve/main/cmu_us_slt_arctic-wav-arctic_a0508.npy' }
          })
        });
        if (hRes.ok) {
          const ab = await hRes.arrayBuffer();
          if (ab.byteLength > 100) return new Response(ab, { headers: { 'Content-Type': 'audio/flac', 'X-TTS-Provider': 'HuggingFace-SpeechT5', ...CORS_HEADERS } });
        }
      } catch (e) { console.warn('HF_2 failed'); }
    }

    // -- Provider 3: OpenAI TTS (T-1000ms) --
    if (openaiKey) {
      try {
        const oaVoice = OPENAI_VOICES[mappedVoiceId] || OPENAI_VOICES[slug] || 'alloy';
        const oRes = await fetch('https://api.openai.com/v1/audio/speech', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: 'tts-1', input: cleanText, voice: oaVoice, response_format: 'mp3' })
        });
        if (oRes.ok) {
          return new Response(oRes.body, { headers: { 'Content-Type': 'audio/mpeg', 'X-TTS-Provider': 'OpenAI-TTS', 'X-Voice-Slug': mappedVoiceId, ...CORS_HEADERS } });
        }
      } catch (e) { console.warn('OA failed'); }
    }

    // -- Client-side Fallback (Web Speech API) --
    return jsonRes({ error: 'All servers offline', fallback: 'web-speech' }, 503);

  } catch (error: any) {
    console.error('[TTS FATAL]', error);
    return jsonRes({ error: 'Internal Server Error', stack: error.stack }, 500);
  }
};
