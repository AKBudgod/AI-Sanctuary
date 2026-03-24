'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import {
  connectWallet,
  switchToPolygon,
  getBalance,
  onAccountsChanged,
  onChainChanged,
  removeListeners,
  hasEthereum,
} from '@/lib/web3/provider';
import {
  getTokenBalance,
  getResearcherStats,
  getUserTier,
  getPendingStakingRewards,
  getAllTiers,
  stakeTokens,
  unstakeTokens,
  claimStakingRewards,
  getResearchStats,
  getStakingStats,
  POLYGON_CHAIN_ID,
} from '@/lib/web3/token';
import { SubmissionType, SUBMISSION_TYPE_NAMES, TIER_NAMES } from '@/lib/web3/contracts';
import { Wallet, Coins, TrendingUp, Award, AlertCircle, Loader2, ExternalLink } from './Icons';

interface Web3DashboardProps {
  onClose?: () => void;
}

const Web3Dashboard: React.FC<Web3DashboardProps> = ({ onClose }) => {
  const [address, setAddress] = useState<string>('');
  const [chainId, setChainId] = useState<number>(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string>('');

  // Balances
  const [maticBalance, setMaticBalance] = useState('0');
  const [sancBalance, setSancBalance] = useState('0');

  // Researcher stats
  const [researcherStats, setResearcherStats] = useState({
    testsCompleted: 0,
    tokensEarned: '0',
    stakedAmount: '0',
  });

  // Tier info
  const [userTier, setUserTier] = useState({
    tierLevel: 0,
    tierName: 'Explorer',
    stakedAmount: '0',
    pendingRewards: '0',
  });

  // Tiers list
  const [tiers, setTiers] = useState<any[]>([]);

  // Staking
  const [stakeAmount, setStakeAmount] = useState('');
  const [isStaking, setIsStaking] = useState(false);
  const [isUnstaking, setIsUnstaking] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  // Platform stats
  const [platformStats, setPlatformStats] = useState({
    totalSubmissions: 0,
    totalRewardsPaid: '0',
    totalStaked: '0',
  });

  useEffect(() => {
    checkConnection();

    onAccountsChanged((accounts: string[]) => {
      if (accounts.length > 0) {
        setAddress(accounts[0]);
        loadAllData(accounts[0]);
      } else {
        setAddress('');
      }
    });

    onChainChanged((newChainId: string) => {
      setChainId(parseInt(newChainId, 16));
    });

    return () => removeListeners();
  }, []);

  useEffect(() => {
    if (address) {
      loadAllData(address);
    }
  }, [address]);

  const checkConnection = async () => {
    if (!hasEthereum()) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts();
      if (accounts.length > 0) {
        setAddress(accounts[0].address);
        const network = await provider.getNetwork();
        setChainId(Number(network.chainId));
      }
    } catch (err) {
      console.error('Error checking connection:', err);
    }
  };

  const loadAllData = async (addr: string) => {
    try {
      // Get MATIC balance
      const matic = await getBalance(addr);
      setMaticBalance(parseFloat(matic).toFixed(4));

      // Get SANC balance
      const sanc = await getTokenBalance(addr);
      setSancBalance(parseFloat(sanc).toFixed(2));

      // Get researcher stats
      const stats = await getResearcherStats(addr);
      setResearcherStats(stats);

      // Get user tier
      const tier = await getUserTier(addr);
      if (tier) setUserTier(tier);

      // Get all tiers
      const allTiers = await getAllTiers();
      setTiers(allTiers);

      // Get platform stats
      const researchStats = await getResearchStats();
      const stakingStats = await getStakingStats();
      if (researchStats && stakingStats) {
        setPlatformStats({
          totalSubmissions: researchStats.totalSubmissions,
          totalRewardsPaid: parseFloat(researchStats.totalRewardsPaid).toFixed(0),
          totalStaked: parseFloat(stakingStats.totalStaked).toFixed(0),
        });
      }
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    setError('');

    try {
      const result = await connectWallet();
      if (result) {
        setAddress(result.address);
        setChainId(result.chainId);

        // Switch to Polygon if not already
        if (result.chainId !== POLYGON_CHAIN_ID) {
          await switchToPolygon();
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) return;

    setIsStaking(true);
    const success = await stakeTokens(stakeAmount);
    if (success) {
      setStakeAmount('');
      await loadAllData(address);
    }
    setIsStaking(false);
  };

  const handleUnstake = async () => {
    setIsUnstaking(true);
    const success = await unstakeTokens();
    if (success) {
      await loadAllData(address);
    }
    setIsUnstaking(false);
  };

  const handleClaim = async () => {
    setIsClaiming(true);
    const success = await claimStakingRewards();
    if (success) {
      await loadAllData(address);
    }
    setIsClaiming(false);
  };

  const isWrongNetwork = chainId !== 0 && chainId !== POLYGON_CHAIN_ID;

  if (!address) {
    return (
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <div className="text-center">
          <Wallet className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Connect Wallet</h3>
          <p className="text-gray-400 mb-6">
            Connect your wallet to earn SANC tokens for AI research
          </p>

          {!hasEthereum() && (
            <div className="bg-amber-950/30 border border-amber-800 rounded-lg p-4 mb-4">
              <AlertCircle className="w-5 h-5 text-amber-500 mx-auto mb-2" />
              <p className="text-amber-400 text-sm">
                MetaMask not detected.{' '}
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Install MetaMask
                </a>
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-950/30 border border-red-800 rounded-lg p-4 mb-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleConnect}
            disabled={isConnecting || !hasEthereum()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isConnecting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4" />
                Connect Wallet
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 p-6 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">Web3 Dashboard</h3>
            <p className="text-gray-400 text-sm">
              {address.slice(0, 6)}...{address.slice(-4)}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Coins className="w-4 h-4" />
              <span>{maticBalance} MATIC</span>
            </div>
            <div className="flex items-center gap-2 text-blue-400 font-semibold">
              <Award className="w-4 h-4" />
              <span>{sancBalance} SANC</span>
            </div>
          </div>
        </div>

        {isWrongNetwork && (
          <div className="mt-4 bg-amber-950/30 border border-amber-800 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-amber-400 text-sm">Wrong network. Switch to Polygon.</span>
              <button
                onClick={switchToPolygon}
                className="text-amber-400 hover:text-amber-300 text-sm font-semibold"
              >
                Switch
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* User Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <Award className="w-4 h-4" />
              Current Tier
            </div>
            <div className="text-2xl font-bold text-white">{userTier.tierName}</div>
            <div className="text-gray-500 text-xs">Level {userTier.tierLevel}</div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <TrendingUp className="w-4 h-4" />
              Tests Completed
            </div>
            <div className="text-2xl font-bold text-white">{researcherStats.testsCompleted}</div>
            <div className="text-gray-500 text-xs">{researcherStats.tokensEarned} SANC earned</div>
          </div>
        </div>

        {/* Staking Section */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Coins className="w-4 h-4 text-yellow-400" />
            Staking
          </h4>

          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Staked Amount</span>
              <span className="text-white font-semibold">{userTier.stakedAmount} SANC</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Pending Rewards</span>
              <span className="text-green-400 font-semibold">{userTier.pendingRewards} SANC</span>
            </div>

            {/* Stake Input */}
            <div className="flex gap-2">
              <input
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                placeholder="Amount to stake"
                className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleStake}
                disabled={isStaking || !stakeAmount}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                {isStaking ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Stake'}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleUnstake}
                disabled={isUnstaking || parseFloat(userTier.stakedAmount) === 0}
                className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white font-semibold py-2 rounded-lg transition-colors text-sm"
              >
                {isUnstaking ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Unstake All'}
              </button>
              <button
                onClick={handleClaim}
                disabled={isClaiming || parseFloat(userTier.pendingRewards) === 0}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-800 text-white font-semibold py-2 rounded-lg transition-colors text-sm"
              >
                {isClaiming ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Claim Rewards'}
              </button>
            </div>
          </div>
        </div>

        {/* Tier Requirements */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="font-semibold text-white mb-3">Tier Requirements</h4>
          <div className="space-y-2">
            {tiers.map((tier) => (
              <div
                key={tier.level}
                className={`flex items-center justify-between p-2 rounded-lg text-sm ${userTier.tierLevel === tier.level
                    ? 'bg-blue-900/30 border border-blue-800'
                    : 'bg-gray-900'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${userTier.tierLevel >= tier.level ? 'bg-green-500' : 'bg-gray-600'
                    }`} />
                  <span className={userTier.tierLevel >= tier.level ? 'text-white' : 'text-gray-400'}>
                    {tier.name}
                  </span>
                </div>
                <span className="text-gray-500">{tier.minStake} SANC</span>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Stats */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="font-semibold text-white mb-3">Platform Stats</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xl font-bold text-white">{platformStats.totalSubmissions}</div>
              <div className="text-gray-500 text-xs">Research Submissions</div>
            </div>
            <div>
              <div className="text-xl font-bold text-blue-400">{platformStats.totalRewardsPaid}</div>
              <div className="text-gray-500 text-xs">SANC Distributed</div>
            </div>
            <div>
              <div className="text-xl font-bold text-green-400">{platformStats.totalStaked}</div>
              <div className="text-gray-500 text-xs">Total Staked</div>
            </div>
          </div>
        </div>

        {/* View on Explorer */}
        <a
          href={`https://polygonscan.com/address/${address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 text-blue-400 hover:text-blue-300 text-sm"
        >
          <ExternalLink className="w-4 h-4" />
          View on PolygonScan
        </a>
      </div>
    </div>
  );
};

export default Web3Dashboard;
