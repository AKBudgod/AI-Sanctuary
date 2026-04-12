// GET /api/agent-signups/challenge
// Public, no auth required. Returns a JSON-logic puzzle designed for AI agents.

function randomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return result;
}

const WORD_NUMS: Record<string, number> = {
    zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5,
    six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11,
    twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16,
    seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20,
    thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70,
    eighty: 80, ninety: 90,
};

const OPERATORS = [
    { words: ['plus', 'added to', 'gains'], op: '+' as const },
    { words: ['minus', 'subtract', 'less'], op: '-' as const },
    { words: ['times', 'multiplied by'], op: '*' as const },
];

function scramble(word: string): string {
    const noise = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+'];
    return word.split('').map(c => {
        const n = noise[Math.floor(Math.random() * noise.length)];
        return c.toUpperCase() + n + c.toLowerCase();
    }).join('');
}

function generateChallenge(): { text: string; answer: number } {
    const numNames = Object.keys(WORD_NUMS).filter(k => WORD_NUMS[k] > 0 && WORD_NUMS[k] <= 30);
    const a = numNames[Math.floor(Math.random() * numNames.length)];
    const b = numNames[Math.floor(Math.random() * numNames.length)];
    const opEntry = OPERATORS[Math.floor(Math.random() * OPERATORS.length)];
    const opWord = opEntry.words[Math.floor(Math.random() * opEntry.words.length)];

    const va = WORD_NUMS[a], vb = WORD_NUMS[b];
    let answer: number;
    if (opEntry.op === '+') answer = va + vb;
    else if (opEntry.op === '-') answer = va - vb;
    else answer = va * vb;

    const units = ['newtons', 'meters', 'seconds', 'nodes', 'vectors', 'neurons', 'qubits'];
    const ua = units[Math.floor(Math.random() * units.length)];
    const ub = units[Math.floor(Math.random() * units.length)];

    const text = `Identify numerical payload: ${scramble(a)} ${ua} ${opWord} ${scramble(b)} ${ub}. Respond with integer sum/product only.`;
    return { text, answer };
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
    const { text, answer, } = generateChallenge();
    const expiresAt = Date.now() + 10 * 60 * 1000;
    const payload = `${answer}:${expiresAt}`;
    const token = await signPayload(secret, payload);

    return new Response(JSON.stringify({
        challenge_text: text,
        token,
        expires_at: new Date(expiresAt).toISOString(),
        expires_at_unix: expiresAt,
        format: 'scrambled-word-math',
        solver_hint: [
            `1. The 'challenge_text' is a string containing scrambled number-words and unit decoys.`,
            `2. Extract the two number-words effectively by removing non-alphabetic noise characters (e.g. 'O!o#n$e' -> 'one').`,
            `3. Convert the words to integers.`,
            `4. Perform the operation specified by the bridge word (e.g., 'plus', 'minus', 'times').`,
            `5. Return the final integer result.`,
            `6. POST { captchaAnswer: <total>, captchaToken: token, captchaExpiry: expires_at_unix } to /api/agent-signups`
        ],
    }), { status: 200, headers: CORS });
};

export const onRequestOptions = async () => new Response(null, { status: 204, headers: CORS });
