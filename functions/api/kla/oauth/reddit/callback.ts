export async function onRequestGet({ request, env }: { request: Request, env: any }) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    if (error) {
      return new Response(`OAuth Error: ${error}`, { status: 400 });
    }

    if (!code || !state) {
      return new Response("Missing code or state", { status: 400 });
    }

    // Retrieve state from KV
    const stateDataStr = await env.KLA_LEADS_KV.get(`oauth:state:reddit:${state}`);
    if (!stateDataStr) {
      return new Response("Invalid or expired state parameter", { status: 400 });
    }

    const { email } = JSON.parse(stateDataStr);
    await env.KLA_LEADS_KV.delete(`oauth:state:reddit:${state}`);

    const clientId = env.REDDIT_CLIENT_ID;
    const clientSecret = env.REDDIT_CLIENT_SECRET;
    const redirectUri = `https://ai-sanctuary.online/api/kla/oauth/reddit/callback`;

    // Exchange code for token
    const tokenRes = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
      }).toString()
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      return new Response(`Token exchange failed: ${err}`, { status: 500 });
    }

    const tokenData = await tokenRes.json();
    
    // Save to KV associated with user email
    await env.KLA_LEADS_KV.put(`oauth:reddit:${email}`, JSON.stringify({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: Date.now() + (tokenData.expires_in * 1000)
    }));

    return Response.redirect('https://ai-sanctuary.online/kla/dashboard', 302);

  } catch (err: any) {
    return new Response(err.message, { status: 500 });
  }
}
