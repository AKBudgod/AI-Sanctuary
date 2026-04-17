import { isAdmin } from '../models';

// ─── OpenAI voice map ────────────────────────────────────────────────────────
// Maps character slugs → OpenAI TTS voice name (alloy|echo|fable|onyx|nova|shimmer)
const OPENAI_VOICE_MAP: Record<string, string> = {
  'lyra':        'shimmer',
  'maya':        'nova',
  'kla':         'shimmer',
  'mj':          'nova',
  'john':        'onyx',
  'rachel':      'nova',
  'angel':       'shimmer',
  'antigravity': 'onyx',
  'miles':       'onyx',
  'bella':       'shimmer',
  'cleo':        'shimmer',
  'lily':        'nova',
  'skye':        'alloy',
  'raven':       'echo',
};

const POLLY_VOICE_MAP: Record<string, string> = {
  'lyra':        'Emma',
  'maya':        'Salli',
  'kla':         'Emma',
  'mj':          'Amy',
  'john':        'Brian',
  'rachel':      'Salli',
  'angel':       'Kimberly',
  'antigravity': 'Joey',
  'miles':       'Justin',
  'bella':       'Salli',
  'cleo':        'Emma',
  'lily':        'Amy',
  'skye':        'Kimberly',
  'raven':       'Geraint',
  'domi':        'Salli',
  'antoni':      'Brian',
  'josh':        'Joey',
  'amy':         'Amy',
  'brian':       'Brian',
  'emma':        'Emma',
  'salli':       'Salli',
  'joey':        'Joey',
  'kimberly':    'Kimberly',
  'justin':      'Justin',
  'kendra':      'Kendra',
  'nicole':      'Nicole',
  'russell':     'Russell',
  'mizuki':      'Mizuki',
  'takumi':      'Takumi',
};

// CORS headers
const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-Email',
};

interface SynthesizerRequest {
  text?:         string;
  voice_id?:     string;
  character_id?: string;
  language?:     string;
}

export async function onRequest(context: any) {
  const { request, env } = context;
  const url      = new URL(request.url);
  const fullPath = url.pathname.toLowerCase();

  // ── CORS Preflight ─────────────────────────────────────────────────────────
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  const userEmail   = (request.headers.get('X-User-Email') || 'anonymous').toLowerCase().trim();
  const isUserAdmin = isAdmin(userEmail, env);

  const safeJson = async () => {
    try { return await request.json(); } catch { return {}; }
  };

  const jsonRes = (data: object, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });

  try {
    // ── GET /api/synthesizer/voices ─────────────────────────────────────────
    if (request.method === 'GET' && fullPath.endsWith('/voices')) {
      const kv = env.USERS_KV;
      
      // Fetch mappings (global_voice:), samples (global_voice_sample:), and user's personal samples
      const [listMappings, listSamples, listPersonal] = await Promise.all([
        kv.list({ prefix: 'global_voice:' }),
        kv.list({ prefix: 'global_voice_sample:' }),
        userEmail !== 'anonymous' 
          ? kv.list({ prefix: `voice_sample:${userEmail}:` }) 
          : Promise.resolve({ keys: [] })
      ]);
      
      const seenSlugs = new Set<string>();
      const vaultVoices: any[] = [];

      const processKeys = (keys: any[], prefix: string, isPrivate: boolean = false) => {
        for (const k of keys) {
          const slug = k.name.replace(prefix, '');
          if (seenSlugs.has(slug)) continue;
          seenSlugs.add(slug);
          vaultVoices.push({
            slug,
            label: slug.split(/[-_]/).map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
            isBuiltIn: false,
            isPersonal: isPrivate,
            isCommunity: !isPrivate
          });
        }
      };

      processKeys(listMappings.keys, 'global_voice:');
      processKeys(listSamples.keys, 'global_voice_sample:');
      if (userEmail !== 'anonymous') {
         processKeys(listPersonal.keys, `voice_sample:${userEmail}:`, true);
      }

      // We explicitly exclude the builtin array entirely as per user requirement.
      return jsonRes({ voices: vaultVoices });
    }


    // ── POST /api/synthesizer/upload ────────────────────────────────────────
    // Admin uploads a WAV/MP3 sample → vaulted in KV Nexus Store as base64
    if (request.method === 'POST' && fullPath.endsWith('/upload')) {
      if (!isUserAdmin) return jsonRes({ detail: 'Unauthorized — Admin access required.' }, 403);

      const formData = await request.formData();
      const file     = formData.get('file') as File;
      if (!file) return jsonRes({ detail: 'No file provided.' }, 400);

      const targetCharacter = ((formData.get('character') as string) || '').trim();
      const slug = (targetCharacter && targetCharacter !== 'custom')
        ? targetCharacter.toLowerCase()
        : file.name.split('.')[0].toLowerCase().replace(/\s+/g, '-');

      // Chunked btoa to avoid call-stack overflow on large files
      const arrayBuffer = await file.arrayBuffer();
      const uint8       = new Uint8Array(arrayBuffer);
      let binary = '';
      for (let i = 0; i < uint8.length; i += 8192) {
        binary += String.fromCharCode.apply(null, Array.from(uint8.subarray(i, i + 8192)));
      }
      await env.USERS_KV.put(`global_voice_sample:${slug}`, btoa(binary));
      console.log(`[SYNTH-UPLOAD] "${slug}" vaulted (${arrayBuffer.byteLength} bytes).`);

      // NEW: Mirror to Physical Hardware Node
      try {
        console.log(`[SYNTH-UPLOAD] Mirroring "${slug}" to physical node...`);
        const mirrorFormData = new FormData();
        mirrorFormData.append('file', file);
        mirrorFormData.append('character_id', slug);

        await fetch('https://node.ai-sanctuary.online/add_voice', {
          method: 'POST',
          headers: { 'Bypass-Tunnel-Reminder': 'true' },
          body: mirrorFormData,
          signal: AbortSignal.timeout(10000) // 10s timeout for mirroring
        }).catch(() => null);
      } catch (e) { console.warn('[SYNTH-UPLOAD] Mirroring failed.'); }

      return jsonRes({
        voice_id: `native_cf_${slug}_${Date.now()}`,
        slug,
        provider: 'nexus-vault',
        message:  `Voice sample vaulted for "${slug}". Physical Mirror updated.`,
      });
    }

    // ── POST /api/synthesizer/clone  (or /synthesize, or root) ────────────
    // Body: { text, voice_id, language? }
    // Provider chain: HuggingFace MMS → HuggingFace SpeechT5 → OpenAI TTS
    // If all fail, returns 503 { fallback: 'web-speech' } → client uses Web Speech API
    if (
      request.method === 'POST' &&
      (fullPath.endsWith('/clone') || fullPath.endsWith('/synthesize') || fullPath === '/api/synthesizer')
    ) {
      const body: SynthesizerRequest = await safeJson();

      if (!body.text?.trim()) return jsonRes({ detail: 'text is required.' }, 400);
      if (!body.voice_id)     return jsonRes({ detail: 'voice_id is required.' }, 400);

      // Normalise voice_id → slug  (handles "voice-lyra", "native_cf_lyra_123", "lyra")
      let slug = body.voice_id
        .replace(/^voice-/i,     '')
        .replace(/^native_cf_/i, '')
        .replace(/_\d+$/,         '')
        .toLowerCase();

      // Removed hardcoded Lyra override to allow dynamic KV overrides

      // Strip roleplay markers, clean whitespace, cap length
      const cleanText = body.text
        .replace(/\*[^*]+\*/g,         '')
        .replace(/!\[.*?\]\([^)]+\)/g, '')
        .replace(/\s{2,}/g,            ' ')
        .trim()
        .substring(0, 1000);

      if (!cleanText) return jsonRes({ detail: 'Text is empty after cleaning.' }, 400);

      const hfToken   = env.HF_TOKEN?.trim();
      const openaiKey = env.OPENAI_API_KEY?.trim();

      // ── PROVIDER 0: Sanctuary Local Neural Voice (Neural Link Bridge) ──
      try {
        console.log(`[SYNTH] Dispatching Neural Clone to Physical Hardware for "${slug}"...`);
        const localController = new AbortController();
        const localId = setTimeout(() => localController.abort(), 90000); // 90s timeout for local clone (CPU synthesis overhead)
        
        const localRes = await fetch('https://node.ai-sanctuary.online/api/synthesize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Bypass-Tunnel-Reminder': 'true' },
          body: JSON.stringify({ 
            text: cleanText, 
            voice_id: slug,
            language: body.language || 'en'
          }),
          signal: localController.signal
        }).catch(() => null);
        clearTimeout(localId);

        if (localRes && localRes.ok) {
          const audio = await localRes.arrayBuffer();
          if (audio.byteLength > 100) {
            console.log(`[SYNTH] Local Hardware Synthesis Success: "${slug}"`);
            return new Response(audio, {
              headers: { 
                ...CORS, 
                'Content-Type': 'audio/wav', 
                'X-TTS-Provider': 'Local-Hardware-Cloned',
                'X-Voice-Slug': slug 
              },
            });
          }
        } else {
          console.log(`[SYNTH] Local Node passive/offline (Status: ${localRes?.status || 'no-res'}). Falling to grid...`);
        }
      } catch (e: any) {
        console.warn('[SYNTH] Local Hardware failed:', e.message);
      }

      // ── PROVIDER 0.2: Hugging Face XTTS-v2 (Cloud Coqui) ──
      if (hfToken) {
        const SPACES = [
          'https://hasanbasbunar-voice-cloning-xtts-v2.hf.space',
          'https://coqui-xtts.hf.space'
        ];
        
        for (const space of SPACES) {
          try {
            const refUrl = `https://ai-sanctuary.online/api/voice/sample/${slug}`;
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
              signal: AbortSignal.timeout(8000)
            });

            if (hfRes.ok) {
              const result: any = await hfRes.json();
              if (result.is_generating || result.msg === "estimation" || result.error) continue;

              const audioUrl = result.data?.[0]?.url;
              if (audioUrl) {
                const audioRes = await fetch(audioUrl);
                const ab = await audioRes.arrayBuffer();
                return new Response(ab, {
                  headers: { 
                    ...CORS,
                    'Content-Type': 'audio/wav', 
                    'X-TTS-Provider': 'HuggingFace-XTTS-Cloud', 
                    'X-Voice-Slug': slug
                  } 
                });
              }
            }
          } catch (e) {
            // Log omitted
          }
        }
        console.warn('[SYNTH] All HF XTTS fallbacks failed or queued.');
      }

      // ── Check for a custom-mapped voice: look for an explicit mapping OR any stored sample ──
      // This means voices uploaded via Bixby Creator are immediately synthesizable
      // without needing a separate "Register to Global Grid" step.
      let explicitVoiceMapping: string | null = null;
      let hasSample = false;
      if (env.USERS_KV) {
        explicitVoiceMapping = await env.USERS_KV.get(`global_voice:${slug}`);
        if (!explicitVoiceMapping) {
          // Check for personal sample (user-specific)
          const personalKey = userEmail && userEmail !== 'anonymous'
            ? await env.USERS_KV.get(`voice_sample:${userEmail}:${slug}`)
            : null;
          if (personalKey) hasSample = true;
          // Check global sample
          if (!hasSample) {
            const globalSample = await env.USERS_KV.get(`global_voice_sample:${slug}`);
            if (globalSample) hasSample = true;
          }
        }
      }
      const isCustomMapped = !!(explicitVoiceMapping || hasSample);
      // Resolve Polly voice: explicit mapping > built-in map
      const pollyVoice = POLLY_VOICE_MAP[slug] || explicitVoiceMapping;

      if (pollyVoice) {
        try {
          const pollyUrl = `https://api.streamelements.com/kappa/v2/speech?voice=${pollyVoice}&text=${encodeURIComponent(cleanText)}`;
          const pRes = await fetch(pollyUrl);
          if (pRes.ok) {
            const audio = await pRes.arrayBuffer();
            if (audio.byteLength > 100) {
              return new Response(audio, {
                headers: { 
                  ...CORS, 
                  'Content-Type': 'audio/mpeg', 
                  'X-TTS-Provider': 'StreamElements-Polly',
                  'X-TTS-Voice': pollyVoice,
                  'X-Mapped': isCustomMapped ? 'true' : 'false'
                },
              });
            }
          }
        } catch (e: any) { console.warn('[SYNTH] StreamElements failed:', e.message); }
      }

      // ── PROVIDER 1: HuggingFace MMS-TTS (free, requires HF_TOKEN) ─────────
      if (hfToken) {
        try {
          const hfRes = await fetch(
            'https://api-inference.huggingface.co/models/facebook/mms-tts-eng',
            {
              method:  'POST',
              headers: {
                'Authorization':    `Bearer ${hfToken}`,
                'Content-Type':     'application/json',
                'X-Wait-For-Model': 'true',
              },
              body: JSON.stringify({ inputs: cleanText }),
            }
          );
          if (hfRes.ok) {
            const audio = await hfRes.arrayBuffer();
            if (audio.byteLength > 100) {
              return new Response(audio, {
                headers: { ...CORS, 'Content-Type': 'audio/wav', 'X-TTS-Provider': 'HuggingFace-MMS' },
              });
            }
          }
          console.warn(`[SYNTH] HF MMS failed: ${hfRes.status}`);
        } catch (e: any) { console.error('[SYNTH] HF MMS error:', e.message); }
      }

      // ── PROVIDER 2: HuggingFace SpeechT5 (free, higher quality female) ───
      if (hfToken) {
        try {
          const hfRes = await fetch(
            'https://api-inference.huggingface.co/models/microsoft/speecht5_tts',
            {
              method:  'POST',
              headers: {
                'Authorization':    `Bearer ${hfToken}`,
                'Content-Type':     'application/json',
                'X-Wait-For-Model': 'true',
              },
              body: JSON.stringify({
                inputs: cleanText,
                parameters: {
                  speaker_embeddings:
                    'https://huggingface.co/datasets/Matthijs/cmu-arctic-xvectors/resolve/main/cmu_us_slt_arctic-wav-arctic_a0508.npy',
                },
              }),
            }
          );
          if (hfRes.ok) {
            const audio = await hfRes.arrayBuffer();
            if (audio.byteLength > 100) {
              return new Response(audio, {
                headers: { ...CORS, 'Content-Type': 'audio/flac', 'X-TTS-Provider': 'HuggingFace-SpeechT5' },
              });
            }
          }
          console.warn(`[SYNTH] HF SpeechT5 failed: ${hfRes.status}`);
        } catch (e: any) { console.error('[SYNTH] HF SpeechT5 error:', e.message); }
      }

      // ── PROVIDER 3: OpenAI TTS (key already set in Cloudflare secrets) ────
      if (openaiKey) {
        try {
          const oaVoice = OPENAI_VOICE_MAP[slug] || 'alloy';
          const oaRes   = await fetch('https://api.openai.com/v1/audio/speech', {
            method:  'POST',
            headers: {
              'Authorization': `Bearer ${openaiKey}`,
              'Content-Type':  'application/json',
            },
            body: JSON.stringify({
              model:           'tts-1',
              input:           cleanText.substring(0, 4096),
              voice:           oaVoice,
              response_format: 'mp3',
            }),
          });
          if (oaRes.ok) {
            return new Response(oaRes.body, {
              headers: {
                ...CORS,
                'Content-Type':   'audio/mpeg',
                'X-TTS-Provider': 'OpenAI-TTS',
                'X-OA-Voice':     oaVoice,
                'X-Voice-Slug':   slug,
              },
            });
          }
          const errBody = await oaRes.text().catch(() => '');
          console.warn(`[SYNTH] OpenAI TTS failed (${oaRes.status}):`, errBody.substring(0, 200));
        } catch (e: any) { console.error('[SYNTH] OpenAI TTS error:', e.message); }
      }

      // All server providers failed.
      // Return 503 + fallback hint → frontend uses window.speechSynthesis (Web Speech API)
      return jsonRes({
        detail:   'All server synthesis providers offline.',
        fallback: 'web-speech',
      }, 503);
    }

    // ── POST /api/synthesizer/register ─────────────────────────────────────
    // Links a voice_id (Polly/Free Alias) and optional sample_id to a character slug
    if (request.method === 'POST' && fullPath.endsWith('/register')) {
      if (!isUserAdmin) return jsonRes({ detail: 'Unauthorized.' }, 403);
  
      const body: any = await safeJson();
      if (!body.voice_id || !body.character_id) {
        return jsonRes({ detail: 'Missing voice_id or character_id.' }, 400);
      }
  
      const charSlug = body.character_id.replace(/^voice-/i, '').toLowerCase();
      
      // Store primary synthesis mapping (e.g. "Emma")
      await env.USERS_KV.put(`global_voice:${charSlug}`, body.voice_id);
      
      // Store reference sample ID for UI/Metadata if provided
      if (body.sample_id) {
        await env.USERS_KV.put(`global_voice_sample:${charSlug}`, body.sample_id);
      }

      console.log(`[SYNTH-REGISTER] "${charSlug}" → "${body.voice_id}" (Sample: ${body.sample_id || 'none'})`);
  
      return jsonRes({
        status:       'success',
        message:      `Voice registered globally for "${charSlug}".`,
        character_id: charSlug,
        voice_id:     body.voice_id,
        sample_id:    body.sample_id,
      });
    }

    return jsonRes({ detail: 'Route not found.' }, 404);

  } catch (err: any) {
    console.error('[SYNTHESIZER] Unhandled error:', err);
    return jsonRes({ detail: `Synthesizer error: ${err.message}` }, 500);
  }
}
