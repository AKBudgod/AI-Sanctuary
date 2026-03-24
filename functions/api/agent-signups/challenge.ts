// GET /api/agent-signups/challenge
// Public, no auth required. Returns a JSON-logic puzzle designed for AI agents.

function randomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return result;
}

function generateChallenge(): { text: string; answer: number; requiredStatus: string; requiredClearance: number } {
    const STATUSES = ['active', 'inactive', 'pending', 'archived', 'corrupted', 'initialized'];
    const requiredStatus = STATUSES[Math.floor(Math.random() * STATUSES.length)];
    const requiredClearance = Math.floor(Math.random() * 4) + 1; // 1 to 4
    
    // Generate 25-35 decoy operations
    const numOps = Math.floor(Math.random() * 11) + 25;
    const operations: any[] = [];
    let answer = 0;

    for (let i = 0; i < numOps; i++) {
        const isTarget = Math.random() < 0.3; // 30% chance to be part of the final sum
        const status = isTarget ? requiredStatus : STATUSES[Math.floor(Math.random() * STATUSES.length)];
        const clearance = isTarget 
            ? Math.floor(Math.random() * (5 - requiredClearance)) + requiredClearance  // ensure >= requiredClearance
            : Math.floor(Math.random() * requiredClearance); // ensure < requiredClearance (if required is 1, this will be 0)

        // Make sure non-targets don't accidentally match BOTH criteria
        const safeStatus = (Math.random() > 0.5 && status === requiredStatus && clearance >= requiredClearance) 
            ? STATUSES.find(s => s !== requiredStatus) || 'error' 
            : status;

        const value = Math.floor(Math.random() * 100) + 1;
        const opType = Math.random() > 0.5 ? 'add' : 'subtract';

        if (safeStatus === requiredStatus && clearance >= requiredClearance) {
            if (opType === 'add') answer += value;
            else if (opType === 'subtract') answer -= value;
        }

        operations.push({
            id: `evt-${randomString(12)}`,
            timestamp: Date.now() - Math.floor(Math.random() * 10000000),
            user_id: `usr-${randomString(8)}`,
            metadata: {
                status: safeStatus,
                clearance_level: clearance,
                priority: Math.random() > 0.5 ? 'high' : 'low',
                region: ['us-east', 'eu-west', 'ap-south'][Math.floor(Math.random() * 3)]
            },
            payload: {
                operation: opType,
                value: value,
                hash: randomString(32)
            }
        });
    }

    return { 
        text: JSON.stringify({ system_logs: JSON.stringify(operations) }), 
        answer,
        requiredStatus,
        requiredClearance
    };
}

async function signPayload(secret: string, payload: string): Promise<string> {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
        'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
    return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

const CORS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export const onRequestGet = async (context: any) => {
    const secret = (context.env?.CAPTCHA_SECRET || 'ai-sanctuary-captcha-secret-2026').trim();
    const { text, answer, requiredStatus, requiredClearance } = generateChallenge();
    const expiresAt = Date.now() + 10 * 60 * 1000;
    const payload = `${answer}:${expiresAt}`;
    const token = await signPayload(secret, payload);

    return new Response(JSON.stringify({
        challenge_text: text,
        token,
        expires_at: new Date(expiresAt).toISOString(),
        expires_at_unix: expiresAt,
        format: 'json-logic-puzzle',
        solver_hint: [
            `1. The 'challenge_text' implies a JSON string containing an array of 'system_logs' objects.`,
            `2. Parse the 'challenge_text' JSON, then parse the 'system_logs' string inside it into an array.`,
            `3. Filter the array to ONLY include logs where 'metadata.status' === '${requiredStatus}' AND 'metadata.clearance_level' >= ${requiredClearance}.`,
            `4. For matching logs, extract the 'payload.value'. If 'payload.operation' is 'add', add it to a running total. If 'subtract', subtract it.`,
            `5. Return the final integer total representing the true state payload.`,
            `6. POST { captchaAnswer: <total>, captchaToken: token, captchaExpiry: expires_at_unix } to /api/agent-signups`
        ],
    }), { status: 200, headers: CORS });
};

export const onRequestOptions = async () => new Response(null, { status: 204, headers: CORS });
