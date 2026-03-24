// Newsletter API with fallback for when KV is not available

// In-memory fallback storage (resets on each deployment)
const memoryStore: Map<string, string> = new Map();

function getStore(env: any): { get: (key: string) => Promise<string | null>; put: (key: string, value: string) => Promise<void>; delete?: (key: string) => Promise<void> } {
  // Use KV if available, otherwise use in-memory store
  if (env.NEWSLETTER_KV) {
    return env.NEWSLETTER_KV;
  }
  // Fallback to memory
  return {
    get: async (key: string) => memoryStore.get(key) || null,
    put: async (key: string, value: string) => { memoryStore.set(key, value); },
    delete: async (key: string) => { memoryStore.delete(key); },
  };
}

export const onRequestPost: PagesFunction = async (context) => {
  try {
    const { email } = await context.request.json();
    
    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const store = getStore(context.env);

    // Check if already subscribed
    const existing = await store.get(`subscriber:${email}`);
    if (existing) {
      return new Response(
        JSON.stringify({ error: 'Already subscribed' }), 
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Store subscription
    await store.put(`subscriber:${email}`, JSON.stringify({
      email,
      subscribedAt: new Date().toISOString(),
      source: 'website'
    }));

    // Add to list for easy retrieval
    const subscribers = await store.get('subscribers:list') || '[]';
    const list = JSON.parse(subscribers);
    list.push(email);
    await store.put('subscribers:list', JSON.stringify(list));

    return new Response(
      JSON.stringify({ success: true, message: 'Successfully subscribed' }), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const onRequestGet: PagesFunction = async (context) => {
  try {
    const store = getStore(context.env);
    // Return subscriber count (public info)
    const subscribers = await store.get('subscribers:list') || '[]';
    const list = JSON.parse(subscribers);
    
    return new Response(
      JSON.stringify({ count: list.length }), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ count: 0 }), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
