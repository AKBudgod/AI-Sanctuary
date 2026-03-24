// Text-to-Speech (TTS) API Handler
// Integrates OpenAI TTS and ElevenLabs with Tier-based gating

interface Env {
    ELEVENLABS_API_KEY?: string;
    OPENAI_API_KEY?: string;
    HF_TOKEN?: string;
    USERS_KV: any;
    KLA_LEADS_KV?: any;
}

interface EventContext<EnvParams, Params extends string, Data> {
    request: Request;
    functionPath: string;
    waitUntil: (promise: Promise<any>) => void;
    next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
    env: EnvParams;
    params: Params;
    data: Data;
}

type PagesFunction<
    EnvParams = any,
    Params extends string = any,
    Data extends Record<string, unknown> = Record<string, unknown>
> = (context: EventContext<EnvParams, Params, Data>) => Response | Promise<Response>;

// CORS headers applied to every response so the browser can use audio cross-origin
const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// -------------------------------------------------------------------------------------------------
// Helper function to prepare text strictly for speech (removes roleplay actions, converts laughs)
function preprocessForTTS(text: string): string {
    let processed = text;
    // Common laughs and giggles into actual phonetics the model handles beautifully
    processed = processed.replace(/\*laughs?\*/gi, 'Haha!');
    processed = processed.replace(/\(laughs?\)/gi, 'Haha!');
    processed = processed.replace(/\*giggles?\*/gi, 'Hehe!');
    processed = processed.replace(/\(giggles?\)/gi, 'Hehe!');
    processed = processed.replace(/\*chuckles?\*/gi, 'Heh!');
    processed = processed.replace(/\(chuckles?\)/gi, 'Heh!');
    processed = processed.replace(/\*sighs?\*/gi, 'Ahhh.');
    
    // Remove all other asterisks/action blocks so the TTS doesn't attempt to awkwardly read them aloud
    processed = processed.replace(/\*[^*]+\*/g, '');
    
    // Clean up excessive double spaces from stripping the tags
    processed = processed.replace(/\s{2,}/g, ' ');
    return processed.trim();
}
// -------------------------------------------------------------------------------------------------

// Map internal Aliases to OpenAI Voice IDs
const OPENAI_VOICES: Record<string, string> = {
    'voice-lily': 'shimmer',
    'sesame-lily-csm-1b': 'nova',
    'voice-miles': 'onyx',
    'sesame-miles-csm-1b': 'onyx',
    'voice-skye': 'alloy',
    'sesame-skye-csm-1b': 'alloy',
    'voice-raven': 'nova',
    'sesame-raven-csm-1b': 'nova',
    'voice-lyra': 'shimmer',
    'voice-ivy': 'shimmer',
    'voice-nova': 'nova',
    'voice-cleo': 'shimmer',
    'voice-john': 'onyx',
    'voice-angel': 'shimmer',
    'voice-antigravity': 'onyx',
    'voice-bella': 'shimmer',
    'voice-rachel': 'nova',
    'voice-domi': 'nova',
    'voice-antoni': 'onyx',
    'voice-josh': 'alloy',
    'voice-mj': 'shimmer',
};

// Map internal Aliases to ElevenLabs Voice IDs (Premium)
const ELEVENLABS_VOICES: Record<string, string> = {
    'voice-lyra': 'io97SleO9TTvGEeqFIkD',           // Cloned Lyra (Latest)
    'voice-lyra-uncensored': 'io97SleO9TTvGEeqFIkD', // Lyra Uncensored — same voice, unlocked persona
    'voice-maya': 'mVZahVUWy9NErVKwbv7V',           // Cloned Maya
    'maya': 'mVZahVUWy9NErVKwbv7V',                 // Alias for Maya
    'sesame-maya-csm-1b': 'mVZahVUWy9NErVKwbv7V',   // Alias for Sesame Maya CSM
    'voice-rachel': '21m00Tcm4TlvDq8ikWAM',         // Rachel
    'voice-domi': 'AZnzlk1XvdvUeBnXmlld',           // Domi
    'voice-bella': 'EXAVITQu4vr4xnSDxMaL',          // Bella (Sarah)
    'voice-antoni': 'ErXwobaYiN019PkySvjV',         // Antoni
    'voice-josh': 'MF3mGyEYCl7XYWbV9V6O',           // Eli
    'voice-john': 'pNInz6obpgDQGcFmaJgB',           // Adam
    'voice-angel': 'oWAxZDx7w5VEj9dCyTzz',          // Grace
    'voice-antigravity': 'LcfcDJNUP1GQjkzn1xUU',    // Emily
    'voice-nova': 'jsCqWAovK2zIkigp8H9G',           // Freya
    'voice-cleo': 'XB0fDUnXU5c29xEQQ5E1',           // Charlotte
    'voice-ivy': 'ThT5KcBeYPX3keUQqHPh',            // Dorothy
    'voice-lily': 'mVZahVUWy9NErVKwbv7V',           // Lily — confirmed voice ID
    'sesame-lily-csm-1b': 'mVZahVUWy9NErVKwbv7V',    // Alias for Lily CSM
    'voice-miles': 'iP95p4xoKVk53GoZ742B',          // Chris (Charming Male)
    'sesame-miles-csm-1b': 'iP95p4xoKVk53GoZ742B',   // Alias for Miles CSM
    'voice-skye': 'cgSgspJ2msm6clMCkdW9',           // Jessica (Playful)
    'sesame-skye-csm-1b': 'cgSgspJ2msm6clMCkdW9',    // Alias for Skye CSM
    'voice-raven': 'FGY2WhTYpPnrIDTdsKH5',          // Laura (Quirky)
    'sesame-raven-csm-1b': 'FGY2WhTYpPnrIDTdsKH5',   // Alias for Raven CSM
    'voice-mj': 'P6Bf15T65rW4U4rK94qM',             // MJ (Real Voice ID)
    'sesame-mj-csm-1b': 'P6Bf15T65rW4U4rK94qM',      // Alias for MJ CSM
    'voice-kla': 'ZK5PGKfJuJG39PkEcNns',            // K'LA (Super Sexy Character)
};

// Tier -> Voice Mapping (Allowed Voice Names)
const TIER_VOICES: Record<string, string[]> = {
    explorer:    ['voice-lyra', 'voice-maya', 'voice-john', 'sesame-maya-csm-1b', 'sesame-miles-csm-1b'],
    novice:      ['voice-lyra', 'voice-maya', 'voice-john', 'voice-rachel', 'voice-antoni'],
    apprentice:  ['voice-lyra', 'voice-maya', 'voice-john', 'voice-rachel', 'voice-antoni', 'voice-bella', 'voice-josh'],
    adept:       ['voice-lyra', 'voice-maya', 'voice-john', 'voice-rachel', 'voice-Antoni', 'voice-bella', 'voice-josh', 'voice-angel', 'voice-antigravity'],
    master:      ['voice-lyra', 'voice-lyra-uncensored', 'voice-maya', 'voice-john', 'voice-rachel', 'voice-antoni', 'voice-bella', 'voice-josh', 'voice-angel', 'voice-antigravity', 'voice-domi', 'voice-cleo', 'voice-lily', 'voice-miles', 'voice-mj', 'voice-kla'],
    developer:   ['voice-lyra', 'voice-lyra-uncensored', 'voice-maya', 'voice-john', 'voice-rachel', 'voice-antoni', 'voice-bella', 'voice-josh', 'voice-angel', 'voice-antigravity', 'voice-domi', 'voice-cleo', 'voice-ivy', 'voice-nova', 'voice-lily', 'voice-miles', 'voice-skye', 'voice-raven', 'voice-mj', 'voice-kla'],
};

// Admin accounts — full access
const ADMIN_EMAILS = [
    'weedj747@gmail.com',
    'wjreviews420@gmail.com',
    'kearns.adam747@gmail.com',
    'AKBudgod@ai-sanctuary.online',
    'gamergoodguy445@gmail.com',
];

// Handle CORS preflight
export const onRequestOptions: PagesFunction<Env> = async () => {
    return new Response(null, {
        status: 204,
        headers: CORS_HEADERS,
    });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
    try {
        const { text, voice } = await context.request.json() as { text: string; voice: string };

        if (!text || !text.trim() || !voice) {
            return new Response(JSON.stringify({ error: 'Text and voice are required and cannot be empty' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
            });
        }

        // 1. Authenticate user
        const authHeader = context.request.headers.get('Authorization');
        if (!authHeader || authHeader === 'Bearer anonymous') {
            return new Response(
                JSON.stringify({ error: 'Authentication required' }),
                { status: 401, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
            );
        }

        const userEmail = authHeader.replace('Bearer ', '').trim().toLowerCase();
        const usersKv = context.env.USERS_KV;

        let userTier = 'explorer';
        let isDeveloper = false;

        if (usersKv) {
            const userData = await usersKv.get(`email:${userEmail}`);
            if (userData) {
                const user = JSON.parse(userData);
                userTier = user.tier || 'explorer';

                if (user.trialEndsAt && new Date(user.trialEndsAt) > new Date()) {
                    userTier = 'developer';
                }

                if (user.isDeveloper || user.tier === 'developer') {
                    userTier = 'developer';
                }

                isDeveloper = userTier === 'developer';
            }
        }

        // Admin Override
        if (ADMIN_EMAILS.includes(userEmail)) {
            userTier = 'developer';
            isDeveloper = true;
        }

        // 2. Check Access
        const globalVoiceId = (usersKv) ? await usersKv.get(`global_voice:${voice}`) : null;
        
        // Easter Egg: K'la Unlock Check
        let hasKlaAccess = false;
        if (voice === 'voice-kla' && context.env.KLA_LEADS_KV) {
            const mission = await context.env.KLA_LEADS_KV.get(`mission:${userEmail}`);
            if (mission) hasKlaAccess = true;
        }

        if (!isDeveloper && !hasKlaAccess) {
            const allowedVoices = TIER_VOICES[userTier] || [];
            if (!allowedVoices.includes(voice) && !globalVoiceId && voice !== 'sesame-maya-csm-1b' && voice !== 'sesame-miles-csm-1b') {
                return new Response(
                    JSON.stringify({
                        error: 'Voice not available on your current tier',
                        allowed: allowedVoices,
                        upgradeRequired: true
                    }),
                    { status: 403, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
                );
            }
        }

        // 3. ElevenLabs
        if (voice === 'voice-user' || ELEVENLABS_VOICES[voice] || globalVoiceId) {
            if (context.env.ELEVENLABS_API_KEY) {
                try {
                    let voiceId = globalVoiceId || ELEVENLABS_VOICES[voice];
                    
                    if (voice === 'voice-user') {
                        const userVoiceId = await usersKv?.get(`voice:${userEmail}`);
                        voiceId = userVoiceId || 'pNInz6obpgDQGcFmaJgB'; // Fallback to Adam
                    }

                    if (voiceId) {
                        // Dynamic settings based on the specific voice to optimize for quality/expressiveness
                        let voiceSettings = { stability: 0.45, similarity_boost: 0.80, style: 0.45, use_speaker_boost: true };
                        
                        // Lyra Optimizations: Reduced similarity_boost to remove "echo" (artifacts from clone), 
                        // increased style for expressiveness, and tuned stability for emotional resonance.
                        if (voice.includes('lyra')) {
                            voiceSettings = { stability: 0.52, similarity_boost: 0.72, style: 0.65, use_speaker_boost: true };
                        } else if (voice.includes('maya') || voice.includes('lily')) {
                            voiceSettings = { stability: 0.48, similarity_boost: 0.78, style: 0.55, use_speaker_boost: true };
                        }

                        const elResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
                            method: 'POST',
                            headers: {
                                'xi-api-key': context.env.ELEVENLABS_API_KEY,
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                text: preprocessForTTS(text),
                                model_id: 'eleven_turbo_v2_5',
                                voice_settings: voiceSettings
                            }),
                        });

                        if (elResponse.ok) {
                            return new Response(elResponse.body, {
                                headers: {
                                    'Content-Type': 'audio/mpeg',
                                    'Cache-Control': 'no-cache',
                                    ...CORS_HEADERS,
                                },
                            });
                        }
                    }
                } catch (err) {
                    console.error("ElevenLabs Error:", err);
                }
            }
        }

        // 4. OpenAI Fallback
        if (OPENAI_VOICES[voice]) {
            if (!context.env.OPENAI_API_KEY) {
                return new Response(JSON.stringify({ error: 'OpenAI TTS Key Unavailable' }), {
                    status: 503,
                    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
                });
            }

            const voiceId = OPENAI_VOICES[voice];
            const isAdmin = ADMIN_EMAILS.includes(userEmail);

            const response = await fetch('https://api.openai.com/v1/audio/speech', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${context.env.OPENAI_API_KEY.trim()}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'tts-1',
                    input: isAdmin ? text : text.substring(0, 4096),
                    voice: voiceId,
                    response_format: 'mp3',
                }),
            });

            if (response.ok) {
                return new Response(response.body, {
                    headers: {
                        'Content-Type': 'audio/mpeg',
                        'Cache-Control': 'no-cache',
                        ...CORS_HEADERS,
                    },
                });
            }
        }

        return new Response(JSON.stringify({ error: 'Voice service failure' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
        });

    } catch (error) {
        return new Response(
            JSON.stringify({ error: String(error) }),
            { status: 500, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
        );
    }
};
