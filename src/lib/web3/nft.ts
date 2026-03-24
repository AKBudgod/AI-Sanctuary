'use client';

import { ethers } from 'ethers';
import {
  CONTRACT_ADDRESSES,
  SANCTUARY_NFT_ABI,
} from './contracts';
import { getSigner, getProvider } from './provider';

// Get contract instances
export const getNftContract = async (withSigner = false) => {
  const provider = getProvider();
  if (!provider) throw new Error('No provider available');

  if (withSigner) {
    const signer = await getSigner();
    if (!signer) throw new Error('No signer available');
    return new ethers.Contract(CONTRACT_ADDRESSES.SANCTUARY_NFT, SANCTUARY_NFT_ABI, signer);
  }
  return new ethers.Contract(CONTRACT_ADDRESSES.SANCTUARY_NFT, SANCTUARY_NFT_ABI, provider);
};

// NFT Functions
export const getNftBalance = async (address: string): Promise<number> => {
  try {
    const contract = await getNftContract();
    const balance = await contract.balanceOf(address);
    return Number(balance);
  } catch (error) {
    console.error('Error getting NFT balance:', error);
    return 0;
  }
};

export const getTokenUri = async (tokenId: number): Promise<string | null> => {
  try {
    const contract = await getNftContract();
    const uri = await contract.tokenURI(tokenId);
    return uri;
  } catch (error) {
    console.error('Error getting token URI:', error);
    return null;
  }
};

/**
 * Claim an NFT for reaching a tier
 * Note: Actual minting happens on backend to prevent abuse
 */
export const claimTierNft = async (tierName: string): Promise<any> => {
  try {
    const response = await fetch('/api/web3/claim-nft', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('user_email')}`, // Example auth
      },
      body: JSON.stringify({ tier: tierName }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error claiming NFT:', error);
    return { error: 'Failed to claim NFT' };
  }
};
