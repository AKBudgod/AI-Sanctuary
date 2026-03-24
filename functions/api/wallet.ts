// Wallet API with fallback for when KV is not available

// In-memory fallback storage (resets on each deployment)
const memoryStore: Map<string, string> = new Map();

function getStore(env: any): { get: (key: string) => Promise<string | null>; put: (key: string, value: string) => Promise<void>; delete?: (key: string) => Promise<void> } {
  // Use KV if available, otherwise use in-memory store
  if (env.USERS_KV) {
    return env.USERS_KV;
  }
  // Fallback to memory
  return {
    get: async (key: string) => memoryStore.get(key) || null,
    put: async (key: string, value: string) => { memoryStore.set(key, value); },
    delete: async (key: string) => { memoryStore.delete(key); },
  };
}

// Store wallet connection info
export const onRequestPost: PagesFunction = async (context) => {
  try {
    const { address, chainId, action } = await context.request.json();
    
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return new Response(
        JSON.stringify({ error: 'Invalid wallet address' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const store = getStore(context.env);
    const normalizedAddress = address.toLowerCase();
    
    if (action === 'connect') {
      // Store or update wallet connection
      const existing = await store.get(`wallet:${normalizedAddress}`);
      const walletData = existing ? JSON.parse(existing) : {
        address: normalizedAddress,
        firstConnected: new Date().toISOString(),
        connectCount: 0
      };
      
      walletData.lastConnected = new Date().toISOString();
      walletData.chainId = chainId;
      walletData.connectCount++;
      
      await store.put(`wallet:${normalizedAddress}`, JSON.stringify(walletData));
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Wallet connected',
          firstTime: !existing 
        }), 
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    if (action === 'disconnect') {
      // Update last seen
      const existing = await store.get(`wallet:${normalizedAddress}`);
      if (existing) {
        const walletData = JSON.parse(existing);
        walletData.lastDisconnected = new Date().toISOString();
        await store.put(`wallet:${normalizedAddress}`, JSON.stringify(walletData));
      }
      
      return new Response(
        JSON.stringify({ success: true, message: 'Wallet disconnected' }), 
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }), 
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// Get wallet stats (public)
export const onRequestGet: PagesFunction = async (context) => {
  try {
    const url = new URL(context.request.url);
    const address = url.searchParams.get('address');
    
    if (!address) {
      return new Response(
        JSON.stringify({ error: 'Address required' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const store = getStore(context.env);
    const normalizedAddress = address.toLowerCase();
    const walletData = await store.get(`wallet:${normalizedAddress}`);
    
    if (!walletData) {
      return new Response(
        JSON.stringify({ error: 'Wallet not found' }), 
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const data = JSON.parse(walletData);
    // Don't expose sensitive data
    return new Response(
      JSON.stringify({
        firstConnected: data.firstConnected,
        connectCount: data.connectCount
      }), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
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
