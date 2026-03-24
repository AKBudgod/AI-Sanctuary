export async function onRequestGet({ request, env }: { request: Request, env: any }) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response("Unauthorized", { status: 401 });
    }
    const userEmail = authHeader.split('Bearer ')[1].trim();

    // List all missions for this specific user
    const list = await env.KLA_LEADS_KV.list({ prefix: `mission:${userEmail}:` });
    
    const missions = [];
    for (const key of list.keys) {
      const dataStr = await env.KLA_LEADS_KV.get(key.name);
      if (dataStr) {
        try {
          missions.push(JSON.parse(dataStr));
        } catch(e) {}
      }
    }

    // Sort by newest first
    missions.sort((a, b) => b.id - a.id);

    return new Response(JSON.stringify({ missions }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: {'Content-Type': 'application/json'} });
  }
}

export async function onRequestPost({ request, env }: { request: Request, env: any }) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response("Unauthorized", { status: 401 });
    }
    const userEmail = authHeader.split('Bearer ')[1].trim();

    const { niche } = await request.json() as any;
    if (!niche) throw new Error("Niche is required");

    const missionId = Date.now();
    const missionData = {
      id: missionId,
      email: userEmail,
      niche: niche,
      leads: 0,
      sent: 0,
      status: 'Active',
      createdAt: new Date().toISOString()
    };

    // Save strictly to this user's tracking partition
    await env.KLA_LEADS_KV.put(`mission:${userEmail}:${missionId}`, JSON.stringify(missionData));

    return new Response(JSON.stringify({ success: true, mission: missionData }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: {'Content-Type': 'application/json'} });
  }
}
