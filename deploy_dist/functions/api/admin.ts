// Admin API with fallback for when KV is not available

// In-memory fallback storage (resets on each deployment)
const memoryStore: Map<string, string> = new Map();

function getStore(env: any, bindingName: string): { get: (key: string) => Promise<string | null>; put: (key: string, value: string) => Promise<void>; delete?: (key: string) => Promise<void>; list?: (opts: any) => Promise<{ keys: { name: string }[] }> } {
  if (env[bindingName]) {
    return env[bindingName];
  }
  // Fallback to memory
  return {
    get: async (key: string) => memoryStore.get(key) || null,
    put: async (key: string, value: string) => { memoryStore.set(key, value); },
    delete: async (key: string) => { memoryStore.delete(key); },
    list: async (opts: any) => {
      const prefix = opts?.prefix || '';
      const keys = Array.from(memoryStore.keys())
        .filter(k => k.startsWith(prefix))
        .map(k => ({ name: k }));
      return { keys };
    },
  };
}

// Simple auth check
function isAuthorized(request: Request, env: any): boolean {
  const authHeader = request.headers.get('Authorization');
  const apiKey = authHeader?.replace('Bearer ', '');
  // In test mode, allow any non-empty key or skip if no ADMIN_API_KEY set
  if (!env.ADMIN_API_KEY) {
    return apiKey && apiKey.length > 0;
  }
  return apiKey === env.ADMIN_API_KEY;
}

// Get all newsletter subscribers
async function getSubscribers(kv: any) {
  const subscribers = await kv.get('subscribers:list') || '[]';
  const emails = JSON.parse(subscribers);
  
  const details = [];
  for (const email of emails) {
    const data = await kv.get(`subscriber:${email}`);
    if (data) {
      details.push(JSON.parse(data));
    }
  }
  
  return { count: emails.length, subscribers: details };
}

// Get all wallet connections
async function getWallets(kv: any) {
  const list = await kv.list({ prefix: 'wallet:' });
  const wallets = [];
  
  for (const key of list.keys) {
    const data = await kv.get(key.name);
    if (data) {
      wallets.push(JSON.parse(data));
    }
  }
  
  return { count: wallets.length, wallets };
}

// Get stats
async function getStats(env: any) {
  const newsletterKv = getStore(env, 'NEWSLETTER_KV');
  const usersKv = getStore(env, 'USERS_KV');
  
  const subscribers = await newsletterKv.get('subscribers:list') || '[]';
  const subCount = JSON.parse(subscribers).length;
  
  const walletList = await usersKv.list({ prefix: 'wallet:' });
  const walletCount = walletList.keys.length;
  
  return {
    newsletter: {
      totalSubscribers: subCount,
    },
    wallets: {
      totalConnected: walletCount,
    },
    timestamp: new Date().toISOString(),
  };
}

export const onRequestGet: PagesFunction = async (context) => {
  if (!isAuthorized(context.request, context.env)) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized - Provide API key in Authorization header' }), 
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const url = new URL(context.request.url);
  const action = url.searchParams.get('action') || 'stats';

  try {
    const newsletterKv = getStore(context.env, 'NEWSLETTER_KV');
    const usersKv = getStore(context.env, 'USERS_KV');

    switch (action) {
      case 'subscribers':
        const subs = await getSubscribers(newsletterKv);
        return new Response(JSON.stringify(subs), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });

      case 'wallets':
        const wallets = await getWallets(usersKv);
        return new Response(JSON.stringify(wallets), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });

      case 'stats':
      default:
        const stats = await getStats(context.env);
        return new Response(JSON.stringify(stats), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// Admin actions
export const onRequestPost: PagesFunction = async (context) => {
  if (!isAuthorized(context.request, context.env)) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized - Provide API key in Authorization header' }), 
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { action, email, address } = await context.request.json();
    const newsletterKv = getStore(context.env, 'NEWSLETTER_KV');
    const usersKv = getStore(context.env, 'USERS_KV');

    switch (action) {
      case 'deleteSubscriber':
        if (!email) {
          return new Response(
            JSON.stringify({ error: 'Email required' }), 
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }
        await newsletterKv.delete(`subscriber:${email}`);
        
        // Update list
        const subscribers = JSON.parse(await newsletterKv.get('subscribers:list') || '[]');
        const updated = subscribers.filter((e: string) => e !== email);
        await newsletterKv.put('subscribers:list', JSON.stringify(updated));
        
        return new Response(
          JSON.stringify({ success: true, message: 'Subscriber deleted' }), 
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );

      case 'deleteWallet':
        if (!address) {
          return new Response(
            JSON.stringify({ error: 'Address required' }), 
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }
        await usersKv.delete(`wallet:${address.toLowerCase()}`);
        
        return new Response(
          JSON.stringify({ success: true, message: 'Wallet deleted' }), 
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );

      case 'testSubscribe':
        // Add test subscriber without validation
        if (!email) {
          return new Response(
            JSON.stringify({ error: 'Email required' }), 
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }
        
        await newsletterKv.put(`subscriber:${email}`, JSON.stringify({
          email,
          subscribedAt: new Date().toISOString(),
          source: 'admin_test'
        }));
        
        const list = JSON.parse(await newsletterKv.get('subscribers:list') || '[]');
        if (!list.includes(email)) {
          list.push(email);
          await newsletterKv.put('subscribers:list', JSON.stringify(list));
        }
        
        return new Response(
          JSON.stringify({ success: true, message: 'Test subscriber added' }), 
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );

      case 'testWallet':
        // Add test wallet without MetaMask
        if (!address) {
          return new Response(
            JSON.stringify({ error: 'Address required' }), 
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }
        
        const normalizedAddress = address.toLowerCase();
        await usersKv.put(`wallet:${normalizedAddress}`, JSON.stringify({
          address: normalizedAddress,
          firstConnected: new Date().toISOString(),
          lastConnected: new Date().toISOString(),
          chainId: 1,
          connectCount: 1,
          source: 'admin_test'
        }));
        
        return new Response(
          JSON.stringify({ success: true, message: 'Test wallet added' }), 
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );

      default:
        return new Response(
          JSON.stringify({ error: 'Unknown action' }), 
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// CORS preflight
export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
};
