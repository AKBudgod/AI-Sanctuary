// Lyra Voice Webhook Handler (ElevenLabs Standard Webhooks)
// Verifies signatures for ElevenLabs Conversational AI events

interface Env {
    LYRA_WEBHOOK_SECRET: string;
    USERS_KV: any;
}

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, svix-id, svix-timestamp, svix-signature',
};

async function verifySignature(request: Request, secret: string, body: string): Promise<boolean> {
    const svixId = request.headers.get('svix-id');
    const svixTimestamp = request.headers.get('svix-timestamp');
    const svixSignature = request.headers.get('svix-signature');

    if (!svixId || !svixTimestamp || !svixSignature) return false;

    // 1. Verify timestamp (prevent replay attacks, e.g. 5 min tolerance)
    const now = Math.floor(Date.now() / 1000);
    const timestamp = parseInt(svixTimestamp, 10);
    if (Math.abs(now - timestamp) > 300) return false;

    // 2. Prepare signed message
    const signedContent = `${svixId}.${svixTimestamp}.${body}`;
    
    // 3. Extract secret (remove wsec_ prefix if present)
    const secretKey = secret.startsWith('wsec_') ? secret.substring(5) : secret;
    const encoder = new TextEncoder();
    const secretData = encoder.encode(secretKey);
    const msgData = encoder.encode(signedContent);

    // 4. Compute HMAC
    const key = await crypto.subtle.importKey(
        'raw',
        secretData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    const hmacBuffer = await crypto.subtle.sign('HMAC', key, msgData);
    
    // 5. Compare with signatures (multiple might be provided space-separated)
    const computedSignature = btoa(String.fromCharCode(...new Uint8Array(hmacBuffer)));
    const signatures = svixSignature.split(' ');
    
    for (const sig of signatures) {
        if (!sig.startsWith('v1,')) continue;
        const sigPart = sig.substring(3);
        if (computedSignature === sigPart) return true;
    }

    return false;
}

export const onRequestOptions: PagesFunction = async () => {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    const body = await request.text();
    const secret = env.LYRA_WEBHOOK_SECRET;

    if (!secret) {
        return new Response('Webhook secret missing', { status: 500 });
    }

    // Verify ElevenLabs Signature
    const isValid = await verifySignature(request, secret, body);
    if (!isValid) {
        console.warn('Invalid Lyra Webhook signature');
        return new Response('Invalid signature', { status: 401 });
    }

    const payload = JSON.parse(body);
    console.log('Lyra Webhook Event:', payload.type, payload);

    // Handle events (e.g. conversational ai call summary, transcript, etc.)
    // For now, we just log it. You can extend this to update user stats or notify admins.
    
    return new Response(JSON.stringify({ status: 'ok' }), {
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
    });
};
