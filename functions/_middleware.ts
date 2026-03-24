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

// ══════════════════════════════════════════════════════════════
// 🛡️ PER-IP RATE LIMITER
// Protects the OpenRouter budget from being drained by a single 
// IP address. Uses RATE_LIMIT_KV to track request counts per 
// 60-second window globally across all Cloudflare edge nodes.
// ══════════════════════════════════════════════════════════════
const RATE_LIMIT_RPM = 30; // Max requests per minute per IP on /api/models
const HEAVY_ENDPOINTS = ['/api/models', '/api/tts', '/api/synthesizer'];

async function checkIpRateLimit(env: any, ip: string, endpoint: string): Promise<{ blocked: boolean; count: number }> {
  if (!env?.RATE_LIMIT_KV) return { blocked: false, count: 0 };
  try {
    const minute = Math.floor(Date.now() / 60000); 
    const key = `ratelimit:${ip}:${minute}`;
    const raw = await env.RATE_LIMIT_KV.get(key);
    const count = raw ? parseInt(raw, 10) : 0;

    if (count >= RATE_LIMIT_RPM) {
      return { blocked: true, count };
    }

    // Increment — TTL of 90s to auto-clean after the window expires
    await env.RATE_LIMIT_KV.put(key, String(count + 1), { expirationTtl: 90 });
    return { blocked: false, count: count + 1 };
  } catch (_) {
    // Non-fatal — never block a request because rate limit tracking fails
    return { blocked: false, count: 0 };
  }
}

// Middleware for all API requests - optimized for high traffic
export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);

  // Handle CORS preflight
  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // Add CORS and cache headers for API routes
  if (url.pathname.startsWith('/api/')) {

    // ── Per-IP Rate Limiter for heavy endpoints ───────────────────────────────
    const isHeavyEndpoint = HEAVY_ENDPOINTS.some(e => url.pathname.startsWith(e));
    if (isHeavyEndpoint && context.request.method === 'POST') {
      const ip = context.request.headers.get('CF-Connecting-IP') 
              || context.request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim()
              || 'unknown';

      const { blocked } = await checkIpRateLimit((context as any).env, ip, url.pathname);

      if (blocked) {
        return new Response(JSON.stringify({
          error: 'Rate limit exceeded',
          message: `You've sent too many requests. Please slow down — limit is ${RATE_LIMIT_RPM} requests/minute. The Sanctuary protects its models for everyone. 🛡️`,
          retryAfter: 60
        }), {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Retry-After': '60',
          },
        });
      }
    }
    // ─────────────────────────────────────────────────────────────────────────

    const original = await context.next();

    // Create a mutable copy of the response (original may be immutable)
    const headers = new Headers(original.headers);
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // IMPORTANT: Only cache genuinely static/public endpoints.
    // Do NOT cache /api/models, /api/tiers etc. — they return personalized user data.
    if (context.request.method === 'GET') {
      if (url.pathname === '/api/health') {
        headers.set('Cache-Control', 'public, max-age=30');
      } else if (url.pathname === '/api/newsletter') {
        headers.set('Cache-Control', 'public, max-age=300');
      } else {
        // Personalized routes — must NOT be cached by CDN
        headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        headers.set('Pragma', 'no-cache');
        headers.set('Expires', '0');
        headers.set('Surrogate-Control', 'no-store');
      }
    } else {
      headers.set('Cache-Control', 'no-store');
    }

    return new Response(original.body, {
      status: original.status,
      statusText: original.statusText,
      headers,
    });
  }


  // Static assets - aggressive caching (immutable)
  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/static/')) {
    const original = await context.next();
    const headers = new Headers(original.headers);
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    return new Response(original.body, {
      status: original.status,
      statusText: original.statusText,
      headers,
    });
  }

  return context.next();
};
