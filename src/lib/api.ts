// API utility functions for AI Sanctuary

const API_BASE = '/api';

export async function subscribeToNewsletter(email: string) {
  const response = await fetch(`${API_BASE}/newsletter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return response.json();
}

export async function getSubscriberCount() {
  const response = await fetch(`${API_BASE}/newsletter`);
  return response.json();
}

export async function connectWallet(address: string, chainId: number) {
  const response = await fetch(`${API_BASE}/wallet`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, chainId, action: 'connect' }),
  });
  return response.json();
}

export async function disconnectWallet(address: string, chainId: number) {
  const response = await fetch(`${API_BASE}/wallet`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, chainId, action: 'disconnect' }),
  });
  return response.json();
}

export async function getWalletStats(address: string) {
  const response = await fetch(`${API_BASE}/wallet?address=${address}`);
  return response.json();
}

export async function checkHealth() {
  const response = await fetch(`${API_BASE}/health`);
  return response.json();
}
