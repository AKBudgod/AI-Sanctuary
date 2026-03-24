type PagesFunction<
    Env = any,
    Params extends string = any,
    Data extends Record<string, unknown> = Record<string, unknown>
> = (context: { request: Request; env: Env; params: Params; data: Data; waitUntil: (p: Promise<any>) => void; next: (input?: Request | string, init?: RequestInit) => Promise<Response>; functionPath: string }) => Response | Promise<Response>;

const PAYPAL_BASE = 'https://api-m.sandbox.paypal.com';

/**
 * Safe base64 encoder for Cloudflare Workers.
 * btoa() throws if the string contains chars outside Latin1 (e.g. from PowerShell echo artifacts).
 * We use TextEncoder → Uint8Array → String.fromCharCode so it always works.
 */
function safeBase64(str: string): string {
    const bytes = new TextEncoder().encode(str.trim());
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

async function getPayPalAccessToken(clientId: string, clientSecret: string): Promise<string> {
    const credentials = safeBase64(`${clientId.trim()}:${clientSecret.trim()}`);
    const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`PayPal token error: ${res.status} ${text}`);
    }

    const data = await res.json() as { access_token: string };
    return data.access_token;
}

async function createPayPalOrder(
    accessToken: string,
    amountUsd: string,
    description: string
): Promise<{ id: string }> {
    const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: 'USD',
                    value: amountUsd,
                },
                description,
            }],
        }),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`PayPal create order error: ${res.status} ${text}`);
    }

    return res.json() as Promise<{ id: string }>;
}

async function capturePayPalOrder(
    accessToken: string,
    orderId: string
): Promise<any> {
    const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${orderId}/capture`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`PayPal capture error: ${res.status} ${text}`);
    }

    return res.json();
}

export const onRequestPost: PagesFunction = async (context) => {
    const { request, env } = context;

    const clientId = (env.PAYPAL_CLIENT_ID as string) || 'AQAPArt2QgkA3bItoxo_zRIUQEa0UcB9LnYXcY3gfOiAWIWp0IPRp5kWSW91rHl3twIruZ8aUIkHOOMp';
    const clientSecret = env.PAYPAL_CLIENT_SECRET as string;

    if (!clientSecret) {
        return new Response(JSON.stringify({ error: 'PayPal not configured (PAYPAL_CLIENT_SECRET missing)' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const corsHeaders = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
    };

    let body: any;
    try {
        body = await request.json();
    } catch {
        return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400, headers: corsHeaders });
    }

    const { action } = body;

    // ── Create Order ──────────────────────────────────────────────────────────
    if (action === 'create-order') {
        const { amount, description } = body;
        if (!amount || isNaN(parseFloat(amount))) {
            return new Response(JSON.stringify({ error: 'Valid amount required' }), { status: 400, headers: corsHeaders });
        }

        try {
            const accessToken = await getPayPalAccessToken(clientId, clientSecret);
            const order = await createPayPalOrder(
                accessToken,
                parseFloat(amount).toFixed(2),
                description || 'AI Sanctuary Purchase'
            );

            return new Response(JSON.stringify({ orderID: order.id }), { status: 200, headers: corsHeaders });
        } catch (err: any) {
            console.error('PayPal Create Order Error:', err);
            return new Response(JSON.stringify({ error: err.message || 'Failed to create PayPal order' }), { status: 500, headers: corsHeaders });
        }
    }

    // ── Capture & Fulfill Order ───────────────────────────────────────────────
    if (action === 'capture') {
        const { orderID, email, tier, interval, tokens } = body;

        if (!orderID || !email) {
            return new Response(JSON.stringify({ error: 'Missing orderID or email' }), { status: 400, headers: corsHeaders });
        }

        try {
            // 1. Verify & capture real payment with PayPal
            const accessToken = await getPayPalAccessToken(clientId, clientSecret);
            const capture = await capturePayPalOrder(accessToken, orderID);

            // Ensure capture actually succeeded
            const captureStatus = capture?.status;
            if (captureStatus !== 'COMPLETED') {
                return new Response(JSON.stringify({ error: `PayPal order not completed. Status: ${captureStatus}` }), {
                    status: 402,
                    headers: corsHeaders
                });
            }

            // 2. Fulfill in USERS_KV
            const userKey = `email:${email.toLowerCase()}`;
            let userData: any = await env.USERS_KV.get(userKey, { type: 'json' });

            if (!userData) {
                userData = {
                    email: email.toLowerCase(),
                    tokens: 0,
                    tier: 'explorer',
                    firstConnected: new Date().toISOString(),
                    isDeveloper: false,
                    lastFreeReset: new Date().toISOString().split('T')[0],
                    dailyFreeCount: 100
                };
            }

            // Grant SANC tokens
            if (tokens) {
                userData.tokens = (userData.tokens || 0) + parseInt(tokens, 10);
            }

            // Grant Developer tier
            if (tier === 'developer') {
                userData.tier = 'developer';
                userData.isDeveloper = true;
                userData.developerSince = new Date().toISOString();
                if (interval === 'lifetime') {
                    userData.isLifetime = true;
                }
                if (interval) {
                    userData.developerInterval = interval;
                }
            }

            // Grant K'LA tier
            if (tier === 'data-miner' || tier === 'copywriter' || tier === 'autonomous-sdr') {
                userData.klaTier = tier;
                userData.klaSince = new Date().toISOString();
                // For monthly sdr, store expiry
                if (tier === 'autonomous-sdr') {
                    const expiry = new Date();
                    expiry.setMonth(expiry.getMonth() + 1);
                    userData.klaExpiry = expiry.toISOString();
                }
            }

            // Record the PayPal order ID for audit trail
            userData.lastPaypalOrderId = orderID;
            userData.lastPaypalCapture = new Date().toISOString();

            await env.USERS_KV.put(userKey, JSON.stringify(userData));

            return new Response(JSON.stringify({
                success: true,
                message: 'Payment verified and benefits granted.',
                email,
                tier: userData.tier,
                klaTier: userData.klaTier,
                tokens: userData.tokens,
            }), { status: 200, headers: corsHeaders });

        } catch (err: any) {
            console.error('PayPal Capture Error:', err);
            return new Response(JSON.stringify({ error: err.message || 'Failed to process PayPal order' }), { status: 500, headers: corsHeaders });
        }
    }

    return new Response(JSON.stringify({ error: 'Invalid action. Use "create-order" or "capture".' }), { status: 400, headers: corsHeaders });
};

export const onRequestOptions: PagesFunction = async () => {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
};
