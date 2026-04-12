export async function onRequestGet({ request, env }: { request: Request, env: any }) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response("Unauthorized", { status: 401 });
    }
    const userEmail = authHeader.split('Bearer ')[1].trim();

    const xToken = await env.KLA_LEADS_KV.get(`oauth:x:${userEmail}`);
    const redditToken = await env.KLA_LEADS_KV.get(`oauth:reddit:${userEmail}`);

    return new Response(JSON.stringify({ 
      x: !!xToken, 
      reddit: !!redditToken 
    }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: {'Content-Type': 'application/json'} });
  }
}
