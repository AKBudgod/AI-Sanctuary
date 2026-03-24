// kv-utils shared logic would be better but duplicating for speed
const memoryStore: Map<string, string> = new Map();

interface EventContext<Env, Params extends string, Data> {
    request: Request;
    functionPath: string;
    waitUntil: (promise: Promise<any>) => void;
    next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
    env: Env;
    params: Params;
    data: Data;
}

type PagesFunction<
    Env = any,
    Params extends string = any,
    Data extends Record<string, unknown> = Record<string, unknown>
> = (context: EventContext<Env, Params, Data>) => Response | Promise<Response>;

function getStore(env: any) {
    if (env.USERS_KV) return env.USERS_KV;
    return {
        get: async (key: string) => memoryStore.get(key) || null,
        put: async (key: string, value: string) => { memoryStore.set(key, value); },
        delete: async (key: string) => { memoryStore.delete(key); },
    };
}

export const onRequestGet: PagesFunction = async (context) => {
    try {
        const url = new URL(context.request.url);
        const email = url.searchParams.get('email');
        const address = url.searchParams.get('address');

        let userKey = '';
        if (email) {
            userKey = `email:${email.toLowerCase()}`;
        } else if (address) {
            // Deprecated path, but keep for backward compat
            userKey = `wallet:${address.toLowerCase()}`;
        } else {
            // Also check Auth header as fallback
            const authHeader = context.request.headers.get('Authorization');
            if (authHeader) {
                const token = authHeader.replace('Bearer ', '');
                if (token.includes('@')) {
                    userKey = `email:${token.toLowerCase()}`;
                } else {
                    userKey = `wallet:${token.toLowerCase()}`;
                }
            } else {
                return new Response(JSON.stringify({ error: 'Email or Address required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
            }
        }

        const store = getStore(context.env);
        const userDataStr = await store.get(userKey);
        const userData = userDataStr ? JSON.parse(userDataStr) : {};

        const balance = userData.balance || userData.tokens || 0; // consistent field name 'balance'

        return new Response(JSON.stringify({ balance }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });



    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message || String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
};
