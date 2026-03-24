
export const onRequest = async (context: any) => {
    const kv = context.env.USERS_KV;
    if (!kv) return new Response("No USERS_KV binding found", { status: 500 });
    
    const indexRaw = await kv.get('agent_signups:index') || '[]';
    const ids = JSON.parse(indexRaw);
    
    const details = [];
    for (const id of ids) {
        const val = await kv.get(id);
        details.push({ id, val: val ? JSON.parse(val) : null });
    }
    
    return new Response(JSON.stringify({ indexCount: ids.length, details }, null, 2), {
        headers: { 'Content-Type': 'application/json' }
    });
};
