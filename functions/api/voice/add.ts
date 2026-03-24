export const onRequestPost = async (context: any) => {
    const { request, env } = context;
    const apiKey = env.ELEVENLABS_API_KEY;
    const usersKv = env.USERS_KV;

    if (!apiKey) {
        return new Response(JSON.stringify({ error: 'ElevenLabs API key not configured' }), { 
            status: 500, headers: { 'Content-Type': 'application/json' } 
        });
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file');
        const name = formData.get('name') || 'Sanctuary Custom Voice';
        const email = formData.get('email'); // Provided by UI

        if (!file || !email) {
            return new Response(JSON.stringify({ error: 'File and Email are required' }), { 
                status: 400, headers: { 'Content-Type': 'application/json' } 
            });
        }

        // Forward to ElevenLabs
        const elFormData = new FormData();
        elFormData.append('name', name);
        elFormData.append('description', 'User uploaded custom voice clone from AI Sanctuary');
        elFormData.append('files', file);

        const elResponse = await fetch('https://api.elevenlabs.io/v1/voices/add', {
            method: 'POST',
            headers: {
                'xi-api-key': apiKey,
            },
            body: elFormData,
        });

        const data: any = await elResponse.json();

        if (elResponse.ok && data.voice_id) {
            // Store the voice_id in KV for this user
            if (usersKv) {
                await usersKv.put(`voice:${email.toLowerCase()}`, data.voice_id);
            }
            return new Response(JSON.stringify({ 
                success: true, 
                voice_id: data.voice_id,
                message: 'Voice successfully cloned and linked to your account.'
            }), { 
                status: 200, headers: { 'Content-Type': 'application/json' } 
            });
        } else {
            return new Response(JSON.stringify({ 
                error: data.detail?.message || data.error || 'Failed to add voice to ElevenLabs',
                raw: data
            }), { 
                status: elResponse.status, headers: { 'Content-Type': 'application/json' } 
            });
        }

    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message || String(err) }), { 
            status: 500, headers: { 'Content-Type': 'application/json' } 
        });
    }
};
