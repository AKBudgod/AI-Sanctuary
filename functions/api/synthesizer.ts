import { isAdmin } from './models';

interface SynthesizerRequest {
  text?: string;
  voice_id?: string;
  character_id?: string;
  language?: string;
}

export async function onRequest(context: any) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname.split('/').pop();

  // 1. Strict Admin Check for all synthesizer operations
  // We need to get the user email from the session/header (assuming it's passed or handled by middleware)
  // For now, we'll check the Authorization header or a custom header if available
  const userEmail = request.headers.get('X-User-Email'); 
  if (!isAdmin(userEmail)) {
    return new Response(JSON.stringify({ detail: 'Unauthorized: Admin access required' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    if (request.method === 'POST' && path === 'upload') {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      if (!file) return new Response(JSON.stringify({ detail: 'No file provided' }), { status: 400 });

      // Prepare ElevenLabs Add Voice request
      const elFormData = new FormData();
      elFormData.append('name', `Clone_${file.name.split('.')[0]}_${Date.now()}`);
      elFormData.append('files', file);
      elFormData.append('description', `Cloned via AI Sanctuary Admin by ${userEmail}`);

      const elRes = await fetch('https://api.elevenlabs.io/v1/voices/add', {
        method: 'POST',
        headers: {
          'xi-api-key': env.ELEVENLABS_API_KEY,
        },
        body: elFormData,
      });

      if (!elRes.ok) {
        const errorData = await elRes.json();
        return new Response(JSON.stringify({ detail: `ElevenLabs Upload Error: ${JSON.stringify(errorData)}` }), { status: elRes.status });
      }

      return elRes;
    }

    if (request.method === 'POST' && path === 'clone') {
      const body: SynthesizerRequest = await request.json();
      if (!body.text || !body.voice_id) {
        return new Response(JSON.stringify({ detail: 'Missing text or voice_id' }), { status: 400 });
      }

      // Prepare ElevenLabs TTS request
      const elRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${body.voice_id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': env.ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: body.text,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          }
        }),
      });

      if (!elRes.ok) {
        const errorData = await elRes.json();
        return new Response(JSON.stringify({ detail: `ElevenLabs Synth Error: ${JSON.stringify(errorData)}` }), { status: elRes.status });
      }

      return new Response(elRes.body, {
        headers: {
          'Content-Type': 'audio/mpeg',
        }
      });
    }

    if (request.method === 'POST' && path === 'register') {
      const body: SynthesizerRequest = await request.json();
      if (!body.voice_id || !body.character_id) {
        return new Response(JSON.stringify({ detail: 'Missing voice_id or character_id' }), { status: 400 });
      }

      // Save to KV to make it "Permanent" and "Universal"
      await env.USERS_KV.put(`global_voice:${body.character_id}`, body.voice_id);

      return new Response(JSON.stringify({ status: 'success', message: 'Voice registered globally' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ detail: 'Method not allowed' }), { status: 405 });
  } catch (err: any) {
    return new Response(JSON.stringify({ detail: `Synthesizer API Error: ${err.message}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
