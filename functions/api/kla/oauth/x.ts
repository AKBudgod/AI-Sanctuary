export async function onRequestGet({ request, env }: { request: Request, env: any }) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get('email');
    if (!email) {
      return new Response("Missing email parameter", { status: 400 });
    }

    // Generate PKCE code_verifier (random 43-128 chars)
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const codeVerifier = base64URLEncode(array);

    // Generate code_challenge
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const codeChallenge = base64URLEncode(new Uint8Array(hashBuffer));

    // Generate state
    const state = crypto.randomUUID();

    // Store state and verifier in KV for callback lookup (expires in 10 mins)
    await env.KLA_LEADS_KV.put(`oauth:state:${state}`, JSON.stringify({ email, codeVerifier }), { expirationTtl: 600 });

    const clientId = env.X_CLIENT_ID; // Must be set in Cloudflare exact name
    if (!clientId) {
      return new Response("Server misconfiguration: X_CLIENT_ID missing", { status: 500 });
    }

    const redirectUri = `https://ai-sanctuary.online/api/kla/oauth/x/callback`;
    const scopes = ['tweet.write', 'users.read', 'offline.access'].join(' ');

    const authUrl = new URL('https://twitter.com/i/oauth2/authorize');
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', scopes);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('code_challenge', codeChallenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');

    return Response.redirect(authUrl.toString(), 302);

  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  }
}

function base64URLEncode(buffer: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < buffer.byteLength; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}
