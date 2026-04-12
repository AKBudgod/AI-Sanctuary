export const onRequestGet = async (context: any) => {
    const { env, request } = context;
    const usersKv = env.USERS_KV;

    if (!usersKv) {
        return new Response(JSON.stringify({ mirrored: [] }), { 
            status: 200, headers: { 'Content-Type': 'application/json' } 
        });
    }

    try {
        const authHeader = request.headers.get('Authorization');
        const email = authHeader?.replace('Bearer ', '')?.trim()?.toLowerCase();

        // List all global_voice_sample: keys to find out which voices are mirrored
        const list = await usersKv.list({ prefix: 'global_voice_sample:' });
        const mirrored = list.keys.map((k: any) => 'voice-' + k.name.replace('global_voice_sample:', ''));

        // Output user custom voices if logged in
        if (email && email !== 'anonymous') {
            const personalList = await usersKv.list({ prefix: `voice_sample:${email}:` });
            const personalVoices = personalList.keys.map((k: any) => 'voice-' + k.name.replace(`voice_sample:${email}:`, ''));
            mirrored.push(...personalVoices);
        }

        return new Response(JSON.stringify({ 
            mirrored,
            provider: 'Nexus-Vault-Free'
        }), { 
            status: 200, headers: { 'Content-Type': 'application/json' } 
        });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message || String(err), mirrored: [] }), { 
            status: 500, headers: { 'Content-Type': 'application/json' } 
        });
    }
};
