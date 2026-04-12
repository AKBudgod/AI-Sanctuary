export async function onRequestGet({ request, env }: { request: Request, env: any }) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get('email');
    if (!email) {
      return new Response("Missing email parameter", { status: 400 });
    }

    // Generate state string
    const state = crypto.randomUUID();

    // Store state in KV to prevent CSRF (expires in 10 mins)
    await env.KLA_LEADS_KV.put(`oauth:state:reddit:${state}`, JSON.stringify({ email }), { expirationTtl: 600 });

    const clientId = env.REDDIT_CLIENT_ID;
    if (!clientId) {
      return new Response("Server misconfiguration: REDDIT_CLIENT_ID missing", { status: 500 });
    }

    const redirectUri = `https://ai-sanctuary.online/api/kla/oauth/reddit/callback`;
    const scopes = 'submit';

    const authUrl = new URL('https://www.reddit.com/api/v1/authorize');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('duration', 'permanent'); // Gets a refresh token
    authUrl.searchParams.set('scope', scopes);

    return Response.redirect(authUrl.toString(), 302);

  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  }
}
