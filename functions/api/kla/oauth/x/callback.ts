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

    // Retrieve the state mapping from KV
    const stateDataStr = await env.KLA_LEADS_KV.get(`oauth:state:${state}`);
    if (!stateDataStr) {
      return new Response("Invalid or expired state parameter", { status: 400 });
    }

    const { email, codeVerifier } = JSON.parse(stateDataStr);
    
    // Cleanup state
    await env.KLA_LEADS_KV.delete(`oauth:state:${state}`);

    const clientId = env.X_CLIENT_ID;
    const clientSecret = env.X_CLIENT_SECRET;
    const redirectUri = `https://ai-sanctuary.online/api/kla/oauth/x/callback`;

    // Exchange code for token
    const tokenRes = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }).toString()
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      return new Response(`Token exchange failed: ${err}`, { status: 500 });
    }

    const tokenData = await tokenRes.json();
    
    // Save token to KV, associated with the user's email
    await env.KLA_LEADS_KV.put(`oauth:x:${email}`, JSON.stringify({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: Date.now() + (tokenData.expires_in * 1000)
    }));

    // Redirect user back to K'LA Dashboard
    return Response.redirect('https://ai-sanctuary.online/kla/dashboard', 302);

  } catch (err: any) {
    return new Response(err.message, { status: 500 });
  }
}
