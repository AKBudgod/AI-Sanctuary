// Serves voice samples from KV as binary files for Cloud Coqui (HuggingFace) to consume
export const onRequestGet = async (context: any) => {
    const { env, params } = context;
    const { slug } = params;
    const usersKv = env.USERS_KV;

    if (!usersKv || !slug) {
        return new Response('Not Found', { status: 404 });
    }

    try {
        // Look for the global sample first
        let base64 = await usersKv.get(`global_voice_sample:${slug.toLowerCase()}`);
        
        if (!base64) {
            // If not found globally, attempt to locate user-specific ones by searching KV keys
            const list = await usersKv.list({ prefix: 'voice_sample:' });
            const matchingKey = list.keys.find((k: any) => k.name.toLowerCase().endsWith(`:${slug.toLowerCase()}`));
            if (matchingKey) {
                base64 = await usersKv.get(matchingKey.name);
            }
        }

        if (!base64) {
            // Fallback: check if it's a built-in voice that we might have a static URL for
            return new Response('Voice sample not found in Nexus Vault', { status: 404 });
        }

        // Convert base64 to binary
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        let mimeType = 'audio/wav';
        if (bytes.length > 3) {
            if (bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) {
                mimeType = 'audio/mpeg'; // ID3 tag (MP3)
            } else if (bytes[0] === 0xff && (bytes[1] === 0xfb || bytes[1] === 0xf3 || bytes[1] === 0xf2)) {
                mimeType = 'audio/mpeg'; // MP3 frame sync
            } else if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
                mimeType = 'audio/wav'; // RIFF tag (WAV)
            }
        }

        return new Response(bytes, {
            headers: {
                'Content-Type': mimeType,
                'Access-Control-Allow-Origin': '*', // Crucial for external HF space to fetch
                'Cache-Control': 'public, max-age=3600'
            }
        });
    } catch (err) {
        return new Response('Internal Server Error', { status: 500 });
    }
};
