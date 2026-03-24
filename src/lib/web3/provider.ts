'use client';

import { ethers } from 'ethers';
import { POLYGON_CHAIN_ID, SUPPORTED_CHAINS } from './contracts';

// Check if window.ethereum is available
export const hasEthereum = (): boolean => {
  return typeof window !== 'undefined' && !!window.ethereum;
};

// Get provider
export const getProvider = (): ethers.BrowserProvider | null => {
  if (!hasEthereum()) return null;
  return new ethers.BrowserProvider(window.ethereum);
};

// Get signer
export const getSigner = async (): Promise<ethers.JsonRpcSigner | null> => {
  const provider = getProvider();
  if (!provider) return null;
  try {
    return await provider.getSigner();
  } catch {
    return null;
  }
};

// Connect wallet
export const connectWallet = async (): Promise<{
  address: string;
  chainId: number;
  provider: ethers.BrowserProvider;
  signer: ethers.JsonRpcSigner;
} | null> => {
  if (!hasEthereum()) {
    throw new Error('MetaMask not installed');
  }

  try {
    const provider = getProvider();
    if (!provider) throw new Error('Failed to create provider');

    // Request account access
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);

    return { address, chainId, provider, signer };
  } catch (error: any) {
    console.error('Error connecting wallet:', error);
    throw error;
  }
};

// Switch to Polygon network
export const switchToPolygon = async (): Promise<boolean> => {
  if (!hasEthereum()) return false;

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${POLYGON_CHAIN_ID.toString(16)}` }],
    });
    return true;
  } catch (switchError: any) {
    // Chain not added, add it
    if (switchError.code === 4902) {
      try {
        const chain = SUPPORTED_CHAINS[POLYGON_CHAIN_ID];
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: `0x${POLYGON_CHAIN_ID.toString(16)}`,
              chainName: chain.name,
              nativeCurrency: chain.nativeCurrency,
              rpcUrls: [chain.rpcUrl],
              blockExplorerUrls: [chain.blockExplorer],
            },
          ],
        });
        return true;
      } catch (addError) {
        console.error('Error adding Polygon network:', addError);
        return false;
      }
    }
    console.error('Error switching to Polygon:', switchError);
    return false;
  }
};

// Get ETH balance
export const getBalance = async (address: string): Promise<string> => {
  const provider = getProvider();
  if (!provider) return '0';
  
  const balance = await provider.getBalance(address);
  return ethers.formatEther(balance);
};

// Listen for account changes
export const onAccountsChanged = (callback: (accounts: string[]) => void): void => {
  if (hasEthereum()) {
    window.ethereum.on('accountsChanged', callback);
  }
};

// Listen for chain changes
export const onChainChanged = (callback: (chainId: string) => void): void => {
  if (hasEthereum()) {
    window.ethereum.on('chainChanged', callback);
  }
};

// Remove listeners
export const removeListeners = (): void => {
  if (hasEthereum()) {
    window.ethereum.removeAllListeners('accountsChanged');
    window.ethereum.removeAllListeners('chainChanged');
  }
};

// Type augmentation for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}
