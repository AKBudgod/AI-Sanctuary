interface Env {
  USERS_KV: KVNamespace;
}

export const onRequestGet: any = async (context: any) => {
  const env = context.env as Env;
  try {
    const authHeader = context.request.headers.get('Authorization');
    const userEmail = authHeader?.replace('Bearer ', '')?.trim()?.toLowerCase();
    
    if (!userEmail || userEmail === 'anonymous') {
      return new Response(JSON.stringify({ error: 'Authentication required' }), { status: 401 });
    }

    const url = new URL(context.request.url);
    const modelId = url.searchParams.get('modelId');

    if (!modelId) {
      return new Response(JSON.stringify({ error: 'modelId required' }), { status: 400 });
    }

    const historyKey = `history:${userEmail}:${modelId}`;
    const history = await context.env.USERS_KV.get(historyKey) || '[]';

    return new Response(history, {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

export const onRequestPost: any = async (context: any) => {
  const env = context.env as Env;
  try {
    const authHeader = context.request.headers.get('Authorization');
    const userEmail = authHeader?.replace('Bearer ', '')?.trim()?.toLowerCase();
    
    if (!userEmail || userEmail === 'anonymous') {
      return new Response(JSON.stringify({ error: 'Authentication required' }), { status: 401 });
    }

    const { modelId, messages } = await context.request.json() as any;

    if (!modelId || !messages) {
      return new Response(JSON.stringify({ error: 'modelId and messages required' }), { status: 400 });
    }

    const historyKey = `history:${userEmail}:${modelId}`;
    await context.env.USERS_KV.put(historyKey, JSON.stringify(messages));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
