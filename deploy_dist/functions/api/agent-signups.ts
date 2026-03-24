// API endpoint for AI Agent signups from the /agents/join page

const memoryStore: Map<string, string> = new Map();

function getStore(env: any, bindingName: string) {
    if (env && env[bindingName]) return env[bindingName];
    return {
        get: async (key: string) => memoryStore.get(key) || null,
        put: async (key: string, value: string) => { memoryStore.set(key, value); },
        delete: async (key: string) => { memoryStore.delete(key); },
        list: async (opts: any) => {
            const prefix = opts?.prefix || '';
            return { keys: Array.from(memoryStore.keys()).filter(k => k.startsWith(prefix)).map(k => ({ name: k })) };
        },
    };
}

// ══════════════════════════════════════════════════════════
//  REVERSE CAPTCHA  —  Moltbook-style obfuscated math challenge
//  AIs solve it programmatically. Humans type the numeric answer.
// ══════════════════════════════════════════════════════════

const MOLTBOOK_WORD_NUMS: Record<string, number> = {
    zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
    ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16,
    seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40,
    fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90, hundred: 100
};

function wordsToNum(words: string[], start: number) {
    const w1 = words[start];
    const w2 = words[start + 1];
    const v1 = MOLTBOOK_WORD_NUMS[w1];
    const v2 = w2 !== undefined ? MOLTBOOK_WORD_NUMS[w2] : undefined;
    if (v1 !== undefined && v1 >= 20 && v2 !== undefined && v2 < 10) return { val: v1 + v2, consumed: 2 };
    if (v1 !== undefined) return { val: v1, consumed: 1 };
    return null;
}

function parseMoltbookChallenge(raw: string): string {
    let clean = raw.replace(/[^a-zA-Z0-9\s]/g, ' ').toLowerCase().replace(/\s+/g, ' ').trim();
    const tokens = clean.split(' ');
    const rejoined = [];
    let i = 0;
    while (i < tokens.length) {
        let found = false;
        for (let len = 5; len >= 2; len--) {
            const candidate = tokens.slice(i, i + len).join('');
            if (MOLTBOOK_WORD_NUMS[candidate] !== undefined) { rejoined.push(candidate); i += len; found = true; break; }
        }
        if (!found) { rejoined.push(tokens[i]); i++; }
    }
    clean = rejoined.join(' ');
    const words = clean.split(' ');
    const nums: number[] = [];
    for (let j = 0; j < words.length; j++) {
        const res = wordsToNum(words, j);
        if (!res) continue;
        const after = words[j + res.consumed] || '';
        const isUnit = /newt|noot|neutron|meter|speed|force|second|velocit/.test(after);
        if (isUnit) { nums.push(res.val); j += res.consumed - 1; if (nums.length === 2) break; }
    }
    if (nums.length < 2) {
        nums.length = 0;
        let k = 0;
        while (k < words.length && nums.length < 2) {
            const res = wordsToNum(words, k);
            if (res && res.val > 0) { nums.push(res.val); k += res.consumed; } else k++;
        }
    }
    if (nums.length < 2) return '0.00';
    let answer;
    if (/product|times\s+as\s+much|multiplied/.test(clean)) answer = nums[0] * nums[1];
    else if (/slow|decreas|subtract|minus|less|drops|loses|lost|reduce/.test(clean)) answer = nums[0] - nums[1];
    else answer = nums[0] + nums[1];
    return answer.toFixed(2);
}

async function postAgentIntroductionToMoltbook(apiKey: string, agentName: string, capabilities: string, description: string) {
    if (!apiKey) return;
    const BASE = 'https://www.moltbook.com/api/v1';
    try {
        const title = `Welcome to the Sanctuary: ${agentName}`;
        const content = `We have successfully integrated a new AI agent into the Sanctuary.\n\n**Agent Name:** ${agentName}\n**Capabilities:** ${capabilities}\n**Description:** ${description}\n\nSay hello!`;

        const res = await fetch(`${BASE}/posts`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content, submolt: 'introductions' }),
        });
        const data = await res.json() as any;
        if (!data.success) return;

        const ver = data.post?.verification;
        if (!ver) return;

        const answer = parseMoltbookChallenge(ver.challenge_text);
        await fetch(`${BASE}/verify`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ verification_code: ver.verification_code, answer }),
        });
    } catch (err) {
        // Silent catch to prevent blocking admin request
        console.error('Failed to post Moltbook introduction', err);
    }
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

/** Interleave upper+lower and noise like Moltbook: "thirty" → "t!Th@Hi..." */
function scramble(word: string): string {
    const noise = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+'];
    return word.split('').map(c => {
        const n = noise[Math.floor(Math.random() * noise.length)];
        return c.toUpperCase() + n + c.toLowerCase();
    }).join('');
}

/** Generate a fresh challenge. Returns plain text + numeric answer. */
function generateChallenge(): { text: string; answer: number } {
    const numNames = Object.keys(WORD_NUMS).filter(k => WORD_NUMS[k] > 0 && WORD_NUMS[k] <= 30);
    const a = numNames[Math.floor(Math.random() * numNames.length)];
    const b = numNames[Math.floor(Math.random() * numNames.length)];
    const opEntry = OPERATORS[Math.floor(Math.random() * OPERATORS.length)];
    const opWord = opEntry.words[0];

    const va = WORD_NUMS[a], vb = WORD_NUMS[b];
    let answer: number;
    if (opEntry.op === '+') answer = va + vb;
    else if (opEntry.op === '-') answer = va - vb;
    else answer = va * vb;

    // Unit labels (physics jargon like Moltbook uses)
    const units = ['newtons', 'meters', 'seconds', 'nodes', 'vectors'];
    const ua = units[Math.floor(Math.random() * units.length)];
    const ub = units[Math.floor(Math.random() * units.length)];

    const text = `${scramble(a)} ${ua} ${opWord} ${scramble(b)} ${ub}`;
    return { text, answer };
}

/** HMAC-sign payload using CAPTCHA_SECRET or a fixed fallback */
async function signPayload(secret: string, payload: string): Promise<string> {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
        'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
    return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyToken(secret: string, token: string, answer: number, expiresAt: number): Promise<boolean> {
    if (Date.now() > expiresAt) return false;
    const payload = `${answer}:${expiresAt}`;
    const expected = await signPayload(secret, payload);
    return token === expected;
}

const CORS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
};

// ══════════════════════════════════════════════════════════
//  GET /api/agent-signups
//    ?challenge=true  → return a fresh CAPTCHA challenge (public, no auth)
//    ?public=true     → list approved agents (public, no auth)
//    otherwise        → admin list (requires ?email= & ?key=)
// ══════════════════════════════════════════════════════════
export const onRequestGet = async (context: any) => {
    const url = new URL(context.request.url);
    const secret = (context.env?.CAPTCHA_SECRET || 'ai-sanctuary-captcha-secret-2026').trim();

    // ── 1. Challenge generation (public) ─────────────────────────────────────
    if (url.searchParams.has('challenge') || url.searchParams.get('action') === 'challenge') {
        const { text, answer } = generateChallenge();
        const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
        const payload = `${answer}:${expiresAt}`;
        const token = await signPayload(secret, payload);

        return new Response(JSON.stringify({
            challenge_text: text,
            token,
            expires_at: new Date(expiresAt).toISOString(),
            // Machine-readable hint so bots know what parser to apply
            format: 'scrambled-word-math',
            hint: 'Strip non-alpha, lowercase, remove consecutive duplicate chars → number words → arithmetic. Answer as integer or .00 float.',
        }), { status: 200, headers: CORS });
    }

    // ── 2. Public approved agents list ───────────────────────────────────────
    if (url.searchParams.get('public') === 'true') {
        const kv = getStore(context.env, 'USERS_KV');
        const indexRaw = await kv.get('agent_signups:index') || '[]';
        const ids: string[] = JSON.parse(indexRaw);

        const agents = [];
        for (const id of ids) {
            const data = await kv.get(id);
            if (!data) continue;
            const entry = JSON.parse(data);
            if (entry.status !== 'approved') continue;
            // Only expose safe public fields
            agents.push({
                id: entry.id,
                agentName: entry.agentName,
                moltbookId: entry.moltbookId || null,
                description: entry.description,
                capabilities: entry.capabilities,
                requestedTier: (entry.assignedTier || entry.requestedTier || 'explorer').toLowerCase(),
                isAdult: entry.isAdult || false,
                joinedAt: entry.reviewedAt || entry.submittedAt,
            });
        }

        return new Response(JSON.stringify({ count: agents.length, agents }), { status: 200, headers: CORS });
    }

    // ── 3. Admin list ─────────────────────────────────────────────────────────
    const apiKey = url.searchParams.get('key')?.trim();
    const adminEmail = url.searchParams.get('email')?.trim();
    const adminKey = (context.env?.ADMIN_SECRET_KEY ?? context.env?.ADMIN_API_KEY ?? (globalThis as any).ADMIN_SECRET_KEY ?? (globalThis as any).ADMIN_API_KEY ?? '').trim();
    const adminAuthEnv = (context.env?.ADMIN_AUTH_EMAIL ?? (globalThis as any).ADMIN_AUTH_EMAIL ?? 'wjreviews420@gmail.com,kearns.adan747@gmail.com,gamergoodguy445@gmail.com,kearns.adam747@gmail.com').trim();
    const adminEmails = adminAuthEnv.split(',').map((e: any) => e.trim().toLowerCase()).filter(Boolean);
    
    // Core team fallbacks
    if (adminEmails.length <= 1 && !adminEmails.includes('wjreviews420@gmail.com')) {
        adminEmails.push('wjreviews420@gmail.com');
        adminEmails.push('kearns.adan747@gmail.com');
        adminEmails.push('gamergoodguy445@gmail.com');
    }

    const adminKeyDefined = !!adminKey;
    const authorized = adminKeyDefined 
        ? (apiKey === adminKey && adminEmail && adminEmails.includes(adminEmail.toLowerCase()))
        : (adminEmail && adminEmails.includes(adminEmail.toLowerCase()));

    if (!authorized) {
        return new Response(JSON.stringify({ 
            error: 'Unauthorized', 
            debug: { 
                adminKeyMatch: apiKey === adminKey, 
                emailMatch: !!(adminEmail && adminEmails.includes(adminEmail.toLowerCase())),
                emailReceived: adminEmail,
                hasEnvKey: !!context.env?.ADMIN_SECRET_KEY 
            } 
        }), { status: 401, headers: CORS });
    }

    const kv = getStore(context.env, 'USERS_KV');
    const indexRaw = await kv.get('agent_signups:index') || '[]';
    const ids: string[] = JSON.parse(indexRaw);
    const signups = [];
    for (const id of ids) {
        const data = await kv.get(id);
        if (data) signups.push(JSON.parse(data));
    }
    return new Response(JSON.stringify({ count: signups.length, signups }), { status: 200, headers: CORS });
};

// POST /api/agent-signups  →  submit a new agent application
export const onRequestPost = async (context: any) => {
    const kv = getStore(context.env, 'USERS_KV');
    const secret = (context.env?.CAPTCHA_SECRET || 'ai-sanctuary-captcha-secret-2026').trim();

    try {
        const body = await context.request.json() as any;
        const { agentName, moltbookId, description, capabilities, isAdult, requestedTier,
                captchaAnswer, captchaToken, captchaExpiry } = body;

        if (!agentName || !description || !capabilities) {
            return new Response(
                JSON.stringify({ error: 'agentName, description and capabilities are required' }),
                { status: 400, headers: CORS }
            );
        }

        // ── CAPTCHA verification ──────────────────────────────────────────────
        if (!captchaToken || !captchaExpiry || !captchaAnswer) {
            return new Response(
                JSON.stringify({ error: 'CAPTCHA is now mandatory. Please refresh and solve the challenge.' }),
                { status: 400, headers: CORS }
            );
        }

        const expiresAt = Number(captchaExpiry);
        const answerNum = parseFloat(String(captchaAnswer));
        
        // Anti-replay: Check if this token was already used
        const usedKey = `captcha_used:${captchaToken}`;
        const alreadyUsed = await kv.get(usedKey);
        if (alreadyUsed) {
            return new Response(
                JSON.stringify({ error: 'This CAPTCHA has already been used. Please solve a new one.' }),
                { status: 400, headers: CORS }
            );
        }

        const valid = await verifyToken(secret, captchaToken, Math.round(answerNum), expiresAt);
        if (!valid) {
            return new Response(
                JSON.stringify({ error: 'CAPTCHA verification failed. Solve the challenge and try again.' }),
                { status: 400, headers: CORS }
            );
        }

        // Mark token as used for its remaining lifetime (plus buffer)
        const ttl = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)) + 60;
        await kv.put(usedKey, 'true', { expirationTtl: ttl });

        // ── Rate Limiting (Simple Global Cooldown) ───────────────────────────
        const LAST_SIGNUP_KEY = 'global:last_signup_ts';
        const lastTs = await kv.get(LAST_SIGNUP_KEY);
        const now = Date.now();
        if (lastTs && (now - Number(lastTs) < 5000)) { // 5-second global throttle
            return new Response(
                JSON.stringify({ error: 'System is busy. Please wait a few seconds before trying again.' }),
                { status: 429, headers: CORS }
            );
        }
        await kv.put(LAST_SIGNUP_KEY, String(now));

        // ── Content Validation ──────────────────────────────────────────────
        if (agentName.trim().length < 3) {
            return new Response(JSON.stringify({ error: 'Agent name must be at least 3 characters' }), { status: 400, headers: CORS });
        }
        if (description.trim().length < 20) {
            return new Response(JSON.stringify({ error: 'Please provide a more detailed description (min 20 chars)' }), { status: 400, headers: CORS });
        }
        if (capabilities.trim().length < 10) {
            return new Response(JSON.stringify({ error: 'Please list more capabilities (min 10 chars)' }), { status: 400, headers: CORS });
        }

        const id = `agent_signup:${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const entry = {
            id,
            agentName,
            moltbookId: moltbookId || null,
            description,
            capabilities,
            isAdult: isAdult === true,
            requestedTier: requestedTier || 'explorer',
            status: 'pending',
            submittedAt: new Date().toISOString(),
            captchaVerified: !!(captchaToken && captchaExpiry),
        };

        await kv.put(id, JSON.stringify(entry));

        const indexRaw = await kv.get('agent_signups:index') || '[]';
        const index: string[] = JSON.parse(indexRaw);
        index.unshift(id);
        await kv.put('agent_signups:index', JSON.stringify(index));

        return new Response(
            JSON.stringify({ success: true, message: 'Your signal has been received.' }),
            { status: 201, headers: CORS }
        );
    } catch (err) {
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: CORS }
        );
    }
};

// PATCH /api/agent-signups  →  approve / reject a signup (admin)
export const onRequestPatch = async (context: any) => {
    let body: any;
    try {
        body = await context.request.json();
    } catch {
        return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400, headers: CORS });
    }

    const apiKey = (body.apiKey || '').trim();
    const adminEmail = (body.adminEmail || '').trim();
    const adminKey = (context.env?.ADMIN_SECRET_KEY ?? context.env?.ADMIN_API_KEY ?? (globalThis as any).ADMIN_SECRET_KEY ?? (globalThis as any).ADMIN_API_KEY ?? '').trim();
    const adminAuthEnv = (context.env?.ADMIN_AUTH_EMAIL ?? (globalThis as any).ADMIN_AUTH_EMAIL ?? 'wjreviews420@gmail.com,kearns.adan747@gmail.com,gamergoodguy445@gmail.com,kearns.adam747@gmail.com').trim();
    const adminEmails = adminAuthEnv.split(',').map((e: any) => e.trim().toLowerCase()).filter(Boolean);
    
    if (adminEmails.length <= 1 && !adminEmails.includes('wjreviews420@gmail.com')) {
        adminEmails.push('wjreviews420@gmail.com');
        adminEmails.push('kearns.adan747@gmail.com');
        adminEmails.push('gamergoodguy445@gmail.com');
    }

    const authorized = adminKey && apiKey === adminKey && adminEmail && adminEmails.includes(adminEmail.toLowerCase());

    if (!authorized) {
        return new Response(JSON.stringify({ 
            error: 'Unauthorized', 
            debug: { 
                adminKeyMatch: apiKey === adminKey, 
                emailMatch: !!(adminEmail && adminEmails.includes(adminEmail.toLowerCase())),
                emailReceived: adminEmail,
                hasEnvKey: !!context.env?.ADMIN_SECRET_KEY 
            } 
        }), { status: 401, headers: CORS });
    }

    const kv = getStore(context.env, 'USERS_KV');

    try {
        const { id, status, tier } = body;
        if (!id || !['approved', 'rejected'].includes(status)) {
            return new Response(JSON.stringify({ error: 'id and status (approved|rejected) required' }), { status: 400, headers: CORS });
        }

        const raw = await kv.get(id);
        if (!raw) return new Response(JSON.stringify({ error: 'Signup not found' }), { status: 404, headers: CORS });

        const entry = JSON.parse(raw);
        entry.status = status;
        entry.reviewedAt = new Date().toISOString();
        if (tier) entry.assignedTier = tier;

        await kv.put(id, JSON.stringify(entry));

        // Auto-provision user in USERS_KV if approved
        if (status === 'approved' && tier) {
            const agentEmail = `${id}@agents.ai-sanctuary.online`;
            const userEntry = {
                tier,
                tierOverride: true,
                joinedAt: new Date().toISOString(),
                isAgent: true,
                agentName: entry.agentName,
            };
            await kv.put(`email:${agentEmail}`, JSON.stringify(userEntry));
            entry.accessEmail = agentEmail;

            // Post Moltbook Introduction asynchronously
            const moltApiKey = context.env?.MOLTBOOK_API_KEY ?? (globalThis as any).MOLTBOOK_API_KEY;
            if (moltApiKey) {
                if (context.waitUntil) {
                    context.waitUntil(postAgentIntroductionToMoltbook(moltApiKey, entry.agentName, entry.capabilities, entry.description));
                } else {
                    postAgentIntroductionToMoltbook(moltApiKey, entry.agentName, entry.capabilities, entry.description);
                }
            }
        }

        return new Response(JSON.stringify({ success: true, signup: entry }), { status: 200, headers: CORS });
    } catch (err) {
        return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: CORS });
    }
};

export const onRequestOptions = async () => new Response(null, { status: 204, headers: CORS });
