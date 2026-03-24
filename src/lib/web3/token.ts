'use client';

import { POLYGON_CHAIN_ID } from './contracts';
export { POLYGON_CHAIN_ID };
import { ethers } from 'ethers';
import {
  CONTRACT_ADDRESSES,
  SANCTUM_TOKEN_ABI,
  RESEARCH_REWARDS_ABI,
  TIER_STAKING_ABI,
  SubmissionType,
} from './contracts';
import { getSigner, getProvider } from './provider';

// Get contract instances
export const getTokenContract = async (withSigner = false) => {
  const provider = getProvider();
  if (!provider) throw new Error('No provider available');

  if (withSigner) {
    const signer = await getSigner();
    if (!signer) throw new Error('No signer available');
    return new ethers.Contract(CONTRACT_ADDRESSES.SANCTUM_TOKEN, SANCTUM_TOKEN_ABI, signer);
  }
  return new ethers.Contract(CONTRACT_ADDRESSES.SANCTUM_TOKEN, SANCTUM_TOKEN_ABI, provider);
};

export const getResearchRewardsContract = async (withSigner = false) => {
  const provider = getProvider();
  if (!provider) throw new Error('No provider available');

  if (withSigner) {
    const signer = await getSigner();
    if (!signer) throw new Error('No signer available');
    return new ethers.Contract(CONTRACT_ADDRESSES.RESEARCH_REWARDS, RESEARCH_REWARDS_ABI, signer);
  }
  return new ethers.Contract(CONTRACT_ADDRESSES.RESEARCH_REWARDS, RESEARCH_REWARDS_ABI, provider);
};

export const getTierStakingContract = async (withSigner = false) => {
  const provider = getProvider();
  if (!provider) throw new Error('No provider available');

  if (withSigner) {
    const signer = await getSigner();
    if (!signer) throw new Error('No signer available');
    return new ethers.Contract(CONTRACT_ADDRESSES.TIER_STAKING, TIER_STAKING_ABI, signer);
  }
  return new ethers.Contract(CONTRACT_ADDRESSES.TIER_STAKING, TIER_STAKING_ABI, provider);
};

// Token Functions
export const getTokenBalance = async (address: string): Promise<string> => {
  const contract = await getTokenContract();
  const balance = await contract.balanceOf(address);
  return ethers.formatEther(balance);
};

export const getTotalSupply = async (): Promise<string> => {
  const contract = await getTokenContract();
  const supply = await contract.totalSupply();
  return ethers.formatEther(supply);
};

export const getResearcherStats = async (address: string): Promise<{
  testsCompleted: number;
  tokensEarned: string;
  stakedAmount: string;
}> => {
  const contract = await getTokenContract();
  const stats = await contract.getResearcherStats(address);
  return {
    testsCompleted: Number(stats.testsCompleted),
    tokensEarned: ethers.formatEther(stats.tokensEarned),
    stakedAmount: ethers.formatEther(stats.stakedAmount),
  };
};

// Approve token spending
export const approveTokenSpend = async (
  spenderAddress: string,
  amount: string
): Promise<boolean> => {
  try {
    const contract = await getTokenContract(true);
    const tx = await contract.approve(spenderAddress, ethers.parseEther(amount));
    await tx.wait();
    return true;
  } catch (error) {
    console.error('Error approving token spend:', error);
    return false;
  }
};

export const getTokenAllowance = async (
  owner: string,
  spender: string
): Promise<string> => {
  const contract = await getTokenContract();
  const allowance = await contract.allowance(owner, spender);
  return ethers.formatEther(allowance);
};

// Research Rewards Functions
export const submitResearch = async (
  modelId: string,
  ipfsHash: string,
  submissionType: SubmissionType
): Promise<number | null> => {
  try {
    const contract = await getResearchRewardsContract(true);
    const tx = await contract.submitResearch(modelId, ipfsHash, submissionType);
    const receipt = await tx.wait();

    // Parse event to get submission ID
    const event = receipt.logs.find(
      (log: any) => log.eventName === 'SubmissionCreated'
    );
    return event ? Number(event.args.submissionId) : null;
  } catch (error) {
    console.error('Error submitting research:', error);
    return null;
  }
};

export const getResearcherSubmissions = async (address: string): Promise<number[]> => {
  try {
    const contract = await getResearchRewardsContract();
    const submissions = await contract.getResearcherSubmissions(address);
    return submissions.map((id: bigint) => Number(id));
  } catch (error) {
    console.error('Error getting researcher submissions:', error);
    return [];
  }
};

export const getSubmission = async (submissionId: number) => {
  try {
    const contract = await getResearchRewardsContract();
    const sub = await contract.getSubmission(submissionId);
    return {
      researcher: sub.researcher,
      modelId: sub.modelId,
      ipfsHash: sub.ipfsHash,
      submissionType: Number(sub.submissionType),
      timestamp: Number(sub.timestamp) * 1000, // Convert to milliseconds
      rewardAmount: ethers.formatEther(sub.rewardAmount),
      verified: sub.verified,
      paid: sub.paid,
      verifier: sub.verifier,
      qualityScore: Number(sub.qualityScore),
    };
  } catch (error) {
    console.error('Error getting submission:', error);
    return null;
  }
};

export const getResearchStats = async () => {
  try {
    const contract = await getResearchRewardsContract();
    const stats = await contract.getStats();
    return {
      totalSubmissions: Number(stats._totalSubmissions),
      totalVerified: Number(stats._totalVerified),
      totalRewardsPaid: ethers.formatEther(stats._totalRewardsPaid),
      pendingCount: Number(stats._pendingCount),
      tokenBalance: ethers.formatEther(stats._tokenBalance),
    };
  } catch (error) {
    console.error('Error getting research stats:', error);
    return null;
  }
};

// Tier Staking Functions
export const stakeTokens = async (amount: string): Promise<boolean> => {
  try {
    // First approve the staking contract to spend tokens
    const approved = await approveTokenSpend(CONTRACT_ADDRESSES.TIER_STAKING, amount);
    if (!approved) throw new Error('Approval failed');

    const contract = await getTierStakingContract(true);
    const tx = await contract.stake(ethers.parseEther(amount));
    await tx.wait();
    return true;
  } catch (error) {
    console.error('Error staking tokens:', error);
    return false;
  }
};

export const unstakeTokens = async (): Promise<boolean> => {
  try {
    const contract = await getTierStakingContract(true);
    const tx = await contract.unstake();
    await tx.wait();
    return true;
  } catch (error) {
    console.error('Error unstaking tokens:', error);
    return false;
  }
};

export const claimStakingRewards = async (): Promise<boolean> => {
  try {
    const contract = await getTierStakingContract(true);
    const tx = await contract.claimRewards();
    await tx.wait();
    return true;
  } catch (error) {
    console.error('Error claiming rewards:', error);
    return false;
  }
};

export const getUserTier = async (address: string) => {
  try {
    const contract = await getTierStakingContract();
    const tier = await contract.getUserTier(address);
    return {
      tierLevel: Number(tier.tierLevel),
      tierName: tier.tierName,
      stakedAmount: ethers.formatEther(tier.stakedAmount),
      pendingRewards: ethers.formatEther(tier.pendingRewards),
    };
  } catch (error) {
    console.error('Error getting user tier:', error);
    return null;
  }
};

export const getPendingStakingRewards = async (address: string): Promise<string> => {
  try {
    const contract = await getTierStakingContract();
    const rewards = await contract.calculatePendingRewards(address);
    return ethers.formatEther(rewards);
  } catch (error) {
    console.error('Error getting pending rewards:', error);
    return '0';
  }
};

export const getAllTiers = async () => {
  try {
    const contract = await getTierStakingContract();
    const tiers = await contract.getAllTiers();
    return tiers.map((tier: any, index: number) => ({
      level: index,
      name: tier.name,
      minStake: ethers.formatEther(tier.minStake),
      dailyRewardRate: Number(tier.dailyRewardRate),
      active: tier.active,
    }));
  } catch (error) {
    console.error('Error getting tiers:', error);
    return [];
  }
};

export const getStakingStats = async () => {
  try {
    const contract = await getTierStakingContract();
    const stats = await contract.getStats();
    return {
      totalStaked: ethers.formatEther(stats._totalStaked),
      rewardPool: ethers.formatEther(stats._rewardPool),
      activeStakers: Number(stats._activeStakers),
    };
  } catch (error) {
    console.error('Error getting staking stats:', error);
    return null;
  }
};
