// API to claim Voice Model NFTs when passing tiers
import { ethers } from 'ethers';

interface Env {
  USERS_KV: any;
  PRIVATE_KEY: string;
  RPC_URL: string;
  SANCTUARY_NFT_ADDRESS: string;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Mapping of tiers to Voice Model NFTs
const TIER_NFT_MAP: Record<string, { name: string, image: string }> = {
  'explorer': { name: 'Maya (Guide)', image: 'ipfs://.../maya_guide.json' },
  'novice': { name: 'Antoni', image: 'ipfs://.../antoni.json' },
  'apprentice': { name: 'Bella', image: 'ipfs://.../bella.json' },
  'adept': { name: 'Lyra', image: 'ipfs://.../lyra.json' },
  'master': { name: 'Lily', image: 'ipfs://.../lily.json' },
  'developer': { name: 'Raven', image: 'ipfs://.../raven.json' },
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
    if (!authHeader) return new Response(JSON.stringify({ error: 'Auth required' }), { status: 401, headers: CORS_HEADERS });

    const email = authHeader.replace('Bearer ', '').trim().toLowerCase();
    const { tier } = await request.json();

    if (!tier || !TIER_NFT_MAP[tier]) {
      return new Response(JSON.stringify({ error: 'Invalid tier' }), { status: 400, headers: CORS_HEADERS });
    }

    // 1. Check if already claimed
    const claimKey = `claim_nft:${email}:${tier}`;
    const alreadyClaimed = await env.USERS_KV.get(claimKey);
    if (alreadyClaimed) {
      return new Response(JSON.stringify({ error: 'NFT already claimed for this tier' }), { status: 400, headers: CORS_HEADERS });
    }

    // 2. Verify user actually has this tier (Mock or KV check)
    const userData = await env.USERS_KV.get(`email:${email}`);
    if (!userData) return new Response(JSON.stringify({ error: 'User not found' }), { status: 404, headers: CORS_HEADERS });
    
    const user = JSON.parse(userData);
    // In production, we'd check if user.currentTier is >= tier
    // Or check the contract directly

    const walletAddress = user.walletAddress;
    if (!walletAddress) return new Response(JSON.stringify({ error: 'No wallet linked' }), { status: 400, headers: CORS_HEADERS });

    // 3. Mint NFT
    if (!env.PRIVATE_KEY || !env.RPC_URL) {
       await env.USERS_KV.put(claimKey, 'claimed');
       return new Response(JSON.stringify({ 
         success: true, 
         message: `Successfully claimed ${TIER_NFT_MAP[tier].name} NFT! (Simulation)`,
         nft: TIER_NFT_MAP[tier]
       }), { headers: CORS_HEADERS });
    }

    const provider = new ethers.JsonRpcProvider(env.RPC_URL);
    const wallet = new ethers.Wallet(env.PRIVATE_KEY, provider);
    const contractAbi = [
      'function safeMint(address to, string memory uri)'
    ];
    const contract = new ethers.Contract(env.SANCTUARY_NFT_ADDRESS, contractAbi, wallet);

    const nftMetadata = TIER_NFT_MAP[tier];
    const tx = await contract.safeMint(walletAddress, nftMetadata.image);
    await tx.wait();

    // 4. Update claim record
    await env.USERS_KV.put(claimKey, 'claimed');

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Successfully minted your ${nftMetadata.name} NFT!`,
      txHash: tx.hash
    }), { headers: CORS_HEADERS });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS_HEADERS });
  }
};
