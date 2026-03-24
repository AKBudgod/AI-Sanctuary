// API to earn Web3 tokens every 3 hours
import { ethers } from 'ethers';

interface Env {
  USERS_KV: any;
  PRIVATE_KEY: string;
  RPC_URL: string;
  SANCTUM_TOKEN_ADDRESS: string;
}

const EARN_COOLDOWN = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
const EARN_AMOUNT = 50; // Tokens to reward

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export const onRequestOptions = async () => {
    return new Response(null, {
        status: 204,
        headers: CORS_HEADERS,
    });
};

export const onRequestPost = async (context: any) => {
  const { request, env } = context;
  
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || authHeader === 'Bearer anonymous') {
      return new Response(JSON.stringify({ error: 'Authentication required' }), { status: 401, headers: CORS_HEADERS });
    }

    const email = authHeader.replace('Bearer ', '').trim().toLowerCase();
    const lastEarnKey = `last_earn:${email}`;
    const lastEarnTime = await env.USERS_KV.get(lastEarnKey);
    const now = Date.now();

    if (lastEarnTime && now - parseInt(lastEarnTime) < EARN_COOLDOWN) {
      const remaining = EARN_COOLDOWN - (now - parseInt(lastEarnTime));
      return new Response(JSON.stringify({ 
        error: 'Cooldown active', 
        remainingMinutes: Math.ceil(remaining / 60000) 
      }), { status: 429, headers: CORS_HEADERS });
    }

    // Reward logic
    // 1. Get user's wallet address from KV
    const userData = await env.USERS_KV.get(`email:${email}`);
    if (!userData) return new Response(JSON.stringify({ error: 'User not found' }), { status: 404, headers: CORS_HEADERS });
    
    const user = JSON.parse(userData);
    const walletAddress = user.walletAddress;
    
    if (!walletAddress) {
      return new Response(JSON.stringify({ error: 'No wallet linked' }), { status: 400, headers: CORS_HEADERS });
    }

    // 2. Call contract to reward researcher
    // Note: In a real Cloudflare environment, we'd use a private key from secrets
    if (!env.PRIVATE_KEY || !env.RPC_URL) {
       // Mock success for local dev if keys missing, but in prod we need them
       await env.USERS_KV.put(lastEarnKey, now.toString());
       return new Response(JSON.stringify({ 
          success: true, 
          message: 'Tokens earned! (Simulation)', 
          amount: EARN_AMOUNT,
          nextAvailable: now + EARN_COOLDOWN 
       }), { headers: CORS_HEADERS });
    }

    const provider = new ethers.JsonRpcProvider(env.RPC_URL);
    const wallet = new ethers.Wallet(env.PRIVATE_KEY, provider);
    const contractAbi = [
      'function rewardResearcher(address _researcher, uint256 _testScore, string memory _modelId) returns (uint256)'
    ];
    const contract = new ethers.Contract(env.SANCTUM_TOKEN_ADDRESS, contractAbi, wallet);

    const tx = await contract.rewardResearcher(walletAddress, 100, 'daily_earning');
    await tx.wait();

    // 3. Update cooldown
    await env.USERS_KV.put(lastEarnKey, now.toString());

    return new Response(JSON.stringify({ 
      success: true, 
      message: `${EARN_AMOUNT} SANC tokens sent to your wallet!`, 
      txHash: tx.hash,
      nextAvailable: now + EARN_COOLDOWN 
    }), { headers: CORS_HEADERS });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS_HEADERS });
  }
};
