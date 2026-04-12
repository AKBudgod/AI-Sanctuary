import { synthesizeImage } from './models';

type PagesFunction<
  Env = any,
  Params extends string = any,
  Data extends Record<string, unknown> = Record<string, unknown>
> = (context: {
  request: Request;
  env: Env;
  params: Params;
  data: Data;
  waitUntil: (p: Promise<any>) => void;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  functionPath: string;
}) => Response | Promise<Response>;

// Admin API with fallback for when KV is not available

// In-memory fallback storage (resets on each deployment)
const memoryStore: Map<string, string> = new Map();

function getStore(env: any, bindingName: string): { 
  get: (key: string, opts?: { type: 'json' | 'text' | 'arrayBuffer' | 'stream' }) => Promise<any>; 
  put: (key: string, value: string) => Promise<void>; 
  delete?: (key: string) => Promise<void>; 
  list?: (opts?: any) => Promise<{ keys: { name: string }[] }> 
} {
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
  
  const walletList = usersKv.list ? await usersKv.list({ prefix: 'wallet:' }) : { keys: [] };
  const walletCount = walletList.keys.length;
  
  // Real conversion stats
  const globalStats: any = await usersKv.get('stats:global_summary', { type: 'json' }) || {
    totalConversions: 0,
    totalRevenueCents: 0,
    lastUpdate: new Date().toISOString()
  };
  
  return {
    newsletter: {
      totalSubscribers: subCount,
    },
    wallets: {
      totalConnected: walletCount,
    },
    ads: {
        totalConversions: globalStats.totalConversions || 0,
        totalRevenue: (globalStats.totalRevenueCents || 0) / 100,
        lastSync: globalStats.lastUpdate
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
  const url = new URL(context.request.url);
  
  // We allow synthesis and status checks to bypass the strict Admin API Key requirement 
  // This ensures the Sanctuary remains "Raw and Open" regardless of login state.
  const publicActions = ['synthesizeImage', 'checkImageStatus'];
  const action = url.searchParams.get('action');
  
  const isPublic = action && publicActions.includes(action);

  if (!isPublic && !isAuthorized(context.request, context.env)) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized - Provide API key in Authorization header' }), 
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const url = new URL(context.request.url);
    const body: any = await context.request.json().catch(() => ({}));
    const action = body.action || url.searchParams.get('action');
    const { email, address } = body;
    
    const newsletterKv = getStore(context.env, 'NEWSLETTER_KV');
    const usersKv = getStore(context.env, 'USERS_KV');

    if (!action) {
      return new Response(JSON.stringify({ error: 'Action required' }), { status: 400 });
    }

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
      
      case 'synthesizeImage':
        const imagePrompt = body.imagePrompt || url.searchParams.get('imagePrompt') || url.searchParams.get('prompt');
        const allowNSFW = body.allowNSFW !== undefined ? body.allowNSFW : (url.searchParams.get('nsfw') === 'true');
        
        if (!imagePrompt) {
          return new Response(JSON.stringify({ error: 'Image prompt required' }), { status: 400 });
        }
        const initImage = body.initImage || url.searchParams.get('initImage');
        const strength = body.strength || url.searchParams.get('strength');
        
        const result = await synthesizeImage(imagePrompt, !!allowNSFW, context.env, initImage, strength ? parseFloat(strength) : undefined);
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });

      case 'checkImageStatus':
        const jobId = body.jobId || url.searchParams.get('jobId');
        if (!jobId) return new Response(JSON.stringify({ error: 'jobId required' }), { status: 400 });
        
        try {
          const statusRes = await fetch(`https://node.ai-sanctuary.online/status?id=${jobId}`, {
            headers: { 'Bypass-Tunnel-Reminder': 'true' }
          });
          const statusData = await statusRes.json();
          return new Response(JSON.stringify(statusData), { headers: { 'Content-Type': 'application/json' } });
        } catch (e) {
          return new Response(JSON.stringify({ status: 'failed', error: 'Hardware unreachable' }), { status: 500 });
        }

      case 'controlPC':
        const controlPayload = body.payload || {};
        const controlKey = context.env.ADMIN_SECRET_KEY || 'sanctuary_admin_a6d313036d937828f5beba51c7b4576ac51de23767e43e6b';
        
        try {
          const controlRes = await fetch('https://node.ai-sanctuary.online/api/control', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${controlKey}`,
              'Bypass-Tunnel-Reminder': 'true'
            },
            body: JSON.stringify(controlPayload)
          });
          const controlData = await controlRes.json();
          return new Response(JSON.stringify(controlData), { status: 200, headers: { 'Content-Type': 'application/json' } });
        } catch (e: any) {
          return new Response(JSON.stringify({ error: 'Remote Link Failed', details: e.message }), { status: 502 });
        }

      case 'purgeVoices': {
        // Delete all custom voice entries from USERS_KV
        const voicePrefixes = [
          'voice_sample:',
          'global_voice_sample:',
          'voice:',
          'voice_name:',
          'global_voice:',
          'community_voices:',
        ];

        let deletedCount = 0;
        const errors: string[] = [];

        for (const prefix of voicePrefixes) {
          try {
            const listed = await usersKv.list?.({ prefix }) || { keys: [] };
            for (const key of listed.keys) {
              try {
                await usersKv.delete(key.name);
                deletedCount++;
              } catch (e: any) {
                errors.push(`Failed to delete ${key.name}: ${e.message}`);
              }
            }
          } catch (e: any) {
            errors.push(`List failed for prefix "${prefix}": ${e.message}`);
          }
        }

        // Also clear the community voices index
        try {
          await usersKv.delete('community_voices');
        } catch (_) {}

        return new Response(JSON.stringify({
          success: true,
          message: `Voice registry purged. ${deletedCount} entries deleted.`,
          deletedCount,
          errors: errors.length > 0 ? errors : undefined,
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }), 
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
