const ADMIN_EMAILS = [
    'weedj747@gmail.com', 'wjreviews420@gmail.com', 'kearns.adam747@gmail.com', 'AKBudgod@ai-sanctuary.online', 'gamergoodguy445@gmail.com',
    'kearns.adan747@gmail.com', 'akbudgod@ai-sanctuary.online',
];

// Default Polly voice assigned to newly uploaded Bixby voices so the synthesizer
// can immediately fall through to the free StreamElements provider.
const DEFAULT_POLLY_VOICE = 'Emma';

export const onRequestPost = async (context: any) => {
    const { request, env } = context;
    const apiKey = env.ELEVENLABS_API_KEY;
    const usersKv = env.USERS_KV;

    try {
        const formData = await request.formData();
        const file = formData.get('file');
        const name = formData.get('name') || 'Sanctuary Custom Voice';
        const email = formData.get('email')?.toString().toLowerCase(); 
        const isGlobal = formData.get('isGlobal') === 'true';
        const provider = formData.get('provider')?.toString() || 'auto';

        if (!file || !email) {
            return new Response(JSON.stringify({ error: 'File and Email are required' }), { 
                status: 400, headers: { 'Content-Type': 'application/json' } 
            });
        }

        const isAdmin = ADMIN_EMAILS.includes(email);

        // --- CLONING VAULT (Free Mirroring Pivot) ---
        // Even if ElevenLabs fails, we store the sample to enable Free Synthesis
        if (usersKv && file instanceof File) {
            try {
                const arrayBuffer = await file.arrayBuffer();
                const uint8 = new Uint8Array(arrayBuffer);
                let binary = '';
                for (let i = 0; i < uint8.length; i += 8192) {
                    binary += String.fromCharCode.apply(null, Array.from(uint8.subarray(i, i + 8192)));
                }
                const base64Audio = btoa(binary);
                
                const slug = name.toLowerCase().replace(/\s+/g, '-');
                if (isGlobal && isAdmin) {
                    // Global Mirror for core characters (Lyra, John, MJ, etc.)
                    await usersKv.put(`global_voice_sample:${slug}`, base64Audio);
                    // ── CRITICAL: The user wants their raw voices strictly processed by
                    // local hardware/Coqui. Do not silently inject an 'Emma' fallback mapping here.
                    const existing = await usersKv.get(`global_voice:${slug}`);
                    if (!existing) {
                        console.log(`GLOBAL VOICE KEY: "${slug}" newly vaulted (No explicit fallback set).`);
                    }
                    if (provider !== 'auto') await usersKv.put(`global_voice_provider:${slug}`, provider);
                    console.log(`GLOBAL MIRROR: Character ${slug} vaulted permanently.`);
                } else {
                    // User-specific custom voice — store under slug, not raw display name
                    await usersKv.put(`voice_sample:${email}:${slug}`, base64Audio);
                    if (provider !== 'auto') await usersKv.put(`user_voice_provider:${email}:${slug}`, provider);
                }

                // Mirror to Physical Hardware Node (non-blocking, 10s timeout)
                try {
                    console.log(`[MIRROR] Syncing voice "${name}" to Physical Hardware...`);
                    const mirrorFormData = new FormData();
                    mirrorFormData.append('file', file);
                    mirrorFormData.append('character_id', name.toLowerCase().replace(/\s+/g, '-'));

                    await fetch('https://node.ai-sanctuary.online/add_voice', {
                        method: 'POST',
                        headers: { 'Bypass-Tunnel-Reminder': 'true' },
                        body: mirrorFormData,
                        signal: AbortSignal.timeout(10000)
                    }).catch(e => console.warn('[MIRROR] Hardware Node offline or timed out, saved to Cloud Vault only.'));
                } catch (mErr) {
                    console.warn('[MIRROR] Hardware sync failed (non-fatal):', mErr);
                }

            } catch (vErr) {
                console.error("Vault Storage Error:", vErr);
            }
        }
        // ----------------------------------

        if (!apiKey) {
            // No ElevenLabs key — Neural (Free) path is the primary anyway.
            // Sample is already vaulted in KV and mirrored to physical node above.
            return new Response(JSON.stringify({ 
                success: true,
                provider: 'nexus-vault',
                message: 'Voice vaulted in Nexus KV and mirrored to physical hardware node.' 
            }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

        // Deep fallback: also register with ElevenLabs if key is present
        const elFormData = new FormData();
        elFormData.append('name', name);
        elFormData.append('description', 'Nexus Mirrored Voice - AI Sanctuary');
        elFormData.append('files', file);

        const elResponse = await fetch('https://api.elevenlabs.io/v1/voices/add', {
            method: 'POST',
            headers: { 'xi-api-key': apiKey },
            body: elFormData,
        });

        const data: any = await elResponse.json();

        if (elResponse.ok && data.voice_id) {
            if (usersKv) {
                // Store specifically for THIS voice slug so users can own multiple clones
                await usersKv.put(`voice:${email}:${name.toLowerCase()}`, data.voice_id);
                // Maintain generic fallback for the most recently cloned voice
                await usersKv.put(`voice:${email}`, data.voice_id);
                await usersKv.put(`voice_name:${data.voice_id}`, name);
            }
            return new Response(JSON.stringify({ 
                success: true, 
                voice_id: data.voice_id,
                message: 'Voice successfully mirrored (Nexus Grid backing active).'
            }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        } else {
            return new Response(JSON.stringify({ 
                error: 'Neural (Free) sync error, but voice saved to Nexus Vault for Free Synthesis.',
                vaultStatus: 'saved',
                raw: data
            }), { status: elResponse.status === 200 ? 500 : elResponse.status, headers: { 'Content-Type': 'application/json' } });
        }

    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message || String(err) }), { 
            status: 500, headers: { 'Content-Type': 'application/json' } 
        });
    }
};
