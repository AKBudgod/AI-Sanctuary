'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const ConnectWalletButton = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);

  useEffect(() => {
    checkConnection();
    
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const checkConnection = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        setChainId(Number(network.chainId));
        
        const signers = await provider.listAccounts();
        if (signers.length > 0) {
          const address = signers[0].address;
          setAccount(address);
          // Notify backend of connection
          await notifyBackend(address, Number(network.chainId), 'connect');
        }
      } catch (error) {
        console.error("Error checking wallet:", error);
      }
    }
  };

  const notifyBackend = async (address: string, chainId: number, action: 'connect' | 'disconnect') => {
    try {
      await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, chainId, action }),
      });
    } catch (error) {
      console.error('Backend notification failed:', error);
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
      setError(null);
    } else {
      setAccount(null);
    }
  };

  const handleChainChanged = () => {
    window.location.reload();
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);
    
    if (!window.ethereum) {
      setError("Please install MetaMask");
      setIsConnecting(false);
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      
      setAccount(address);
      setChainId(Number(network.chainId));
      
      // Notify backend
      await notifyBackend(address, Number(network.chainId), 'connect');
      
      // Store in localStorage for persistence
      localStorage.setItem('walletConnected', 'true');
      localStorage.setItem('walletAddress', address);
    } catch (err: any) {
      console.error("Connection error:", err);
      if (err.code === 4001) {
        setError("Connection rejected by user");
      } else {
        setError("Failed to connect wallet");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    if (account) {
      await notifyBackend(account, chainId || 1, 'disconnect');
    }
    setAccount(null);
    setChainId(null);
    localStorage.removeItem('walletConnected');
    localStorage.removeItem('walletAddress');
  };

  const getNetworkName = (id: number | null) => {
    switch (id) {
      case 1: return 'Ethereum';
      case 137: return 'Polygon';
      case 56: return 'BSC';
      case 42161: return 'Arbitrum';
      case 10: return 'Optimism';
      case 8453: return 'Base';
      default: return 'Unknown';
    }
  };

  return (
    <div className="relative">
      {account ? (
        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-900/80 backdrop-blur-md border border-gray-800 rounded-full text-xs font-semibold tracking-wide">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
            <span className="text-gray-400 uppercase">{getNetworkName(chainId)}</span>
          </div>
          <button
            onClick={disconnectWallet}
            className="px-4 py-2 rounded-full font-bold text-gray-200 transition-all duration-300 bg-gray-900/80 backdrop-blur-md border border-gray-800 hover:border-blue-500/50 hover:text-white flex items-center gap-2 group shadow-lg"
          >
            <span className="w-2 h-2 bg-blue-500 rounded-full group-hover:scale-125 transition-transform"></span>
            {account.substring(0, 6)}...{account.substring(account.length - 4)}
          </button>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="relative px-6 py-2.5 rounded-full font-bold text-white transition-all duration-300 transform hover:scale-105 active:scale-95 bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-[0_0_20px_rgba(79,70,229,0.5)] flex items-center gap-2 group overflow-hidden"
        >
          <span className="absolute inset-0 bg-white/10 group-hover:translate-x-full transition-transform duration-700 ease-in-out -skew-x-12 -translate-x-full" />
          {isConnecting ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Connecting...
            </>
          ) : (
            <>
              <span className="relative z-10">Connect Wallet</span>
            </>
          )}
        </button>
      )}
      
      {error && (
        <div className="absolute top-full mt-2 right-0 bg-red-900 text-red-200 text-sm px-3 py-2 rounded-lg whitespace-nowrap z-50">
          {error}
        </div>
      )}
    </div>
  );
};

// TypeScript declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

export default ConnectWalletButton;
