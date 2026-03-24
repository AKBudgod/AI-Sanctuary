// Contract ABIs and Addresses for AI Sanctuary Web3 Integration
// Deployed on Polygon

export const CONTRACT_ADDRESSES = {
  // Replace these with actual deployed addresses after deployment
  SANCTUM_TOKEN: '0x0000000000000000000000000000000000000000',
  RESEARCH_REWARDS: '0x0000000000000000000000000000000000000000',
  TIER_STAKING: '0x0000000000000000000000000000000000000000',
  SANCTUARY_NFT: '0x0000000000000000000000000000000000000000',
};

// SanctumToken (SANC) - ERC-20 with research rewards
export const SANCTUM_TOKEN_ABI = [
  // ERC-20 Standard
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',

  // Research Rewards
  'function rewardResearcher(address _researcher, uint256 _testScore, string memory _modelId) returns (uint256)',
  'function researcherTestsCompleted(address) view returns (uint256)',
  'function researcherTokensEarned(address) view returns (uint256)',
  'function totalResearchRewardsDistributed() view returns (uint256)',
  'function rewardRatePerTest() view returns (uint256)',

  // Staking
  'function stakedBalance(address) view returns (uint256)',
  'function stakingStartTime(address) view returns (uint256)',

  // Tokenomics
  'function MAX_SUPPLY() view returns (uint256)',
  'function totalRevenueCollected() view returns (uint256)',

  // Events
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
  'event ResearchRewarded(address indexed researcher, uint256 amount, string modelId)',
];

// ResearchRewards - Submit findings and earn tokens
export const RESEARCH_REWARDS_ABI = [
  // Submission
  'function submitResearch(string memory _modelId, string memory _ipfsHash, uint8 _submissionType) returns (uint256)',
  'function verifySubmission(uint256 _submissionId, uint8 _qualityScore, bool _approved)',
  'function batchVerify(uint256[] calldata _submissionIds, uint8[] calldata _qualityScores, bool[] calldata _approved)',

  // Views
  'function submissions(uint256) view returns (address researcher, string memory modelId, string memory ipfsHash, uint8 submissionType, uint256 timestamp, uint256 rewardAmount, bool verified, bool paid, address verifier, uint8 qualityScore)',
  'function submissionById(uint256) view returns (tuple(address researcher, string modelId, string ipfsHash, uint8 submissionType, uint256 timestamp, uint256 rewardAmount, bool verified, bool paid, address verifier, uint8 qualityScore))',
  'function researcherSubmissions(address) view returns (uint256[])',
  'function pendingVerification(uint256) view returns (bool)',
  'function getSubmission(uint256 _submissionId) view returns (tuple(address researcher, string modelId, string ipfsHash, uint8 submissionType, uint256 timestamp, uint256 rewardAmount, bool verified, bool paid, address verifier, uint8 qualityScore))',
  'function getResearcherSubmissions(address _researcher) view returns (uint256[])',
  'function getPendingCount() view returns (uint256)',

  // Stats
  'function totalSubmissions() view returns (uint256)',
  'function totalVerified() view returns (uint256)',
  'function totalRewardsPaid() view returns (uint256)',
  'function getStats() view returns (uint256 _totalSubmissions, uint256 _totalVerified, uint256 _totalRewardsPaid, uint256 _pendingCount, uint256 _tokenBalance)',

  // Admin
  'function addVerifier(address _verifier)',
  'function removeVerifier(address _verifier)',
  'function isVerifier(address) view returns (bool)',

  // Events
  'event SubmissionCreated(uint256 indexed submissionId, address indexed researcher, string modelId, uint8 submissionType)',
  'event SubmissionVerified(uint256 indexed submissionId, address indexed verifier, uint8 qualityScore, uint256 rewardAmount)',
  'event RewardPaid(uint256 indexed submissionId, address indexed researcher, uint256 amount)',
];

// TierStaking - Stake SANC for tier benefits
export const TIER_STAKING_ABI = [
  // Staking
  'function stake(uint256 _amount)',
  'function unstake()',
  'function claimRewards()',

  // Views
  'function stakes(address) view returns (uint256 amount, uint256 tierLevel, uint256 lastClaimTime, uint256 totalClaimed, uint256 stakeStartTime)',
  'function getUserTier(address _user) view returns (uint256 tierLevel, string memory tierName, uint256 stakedAmount, uint256 pendingRewards)',
  'function hasTier(address _user, uint256 _tierLevel) view returns (bool)',
  'function calculatePendingRewards(address _user) view returns (uint256)',

  // Tier Info
  'function tiers(uint256) view returns (string memory name, uint256 minStake, uint256 dailyRewardRate, bool active)',
  'function tierCount() view returns (uint256)',
  'function getAllTiers() view returns (tuple(string name, uint256 minStake, uint256 dailyRewardRate, bool active)[])',

  // Stats
  'function totalStaked() view returns (uint256)',
  'function rewardPool() view returns (uint256)',
  'function getStats() view returns (uint256 _totalStaked, uint256 _rewardPool, uint256 _activeStakers)',

  // Admin
  'function setTier(uint256 _tierId, string memory _name, uint256 _minStake, uint256 _dailyRewardRate, bool _active)',
  'function fundRewardPool(uint256 _amount)',

  // Events
  'event Staked(address indexed user, uint256 amount, uint256 tier)',
  'event Unstaked(address indexed user, uint256 amount)',
  'event RewardsClaimed(address indexed user, uint256 amount)',
];

// Chain configuration
export const POLYGON_CHAIN_ID = 137;
export const MUMBAI_CHAIN_ID = 80001;
export const AMOY_CHAIN_ID = 80002;

export const SUPPORTED_CHAINS = {
  [POLYGON_CHAIN_ID]: {
    name: 'Polygon Mainnet',
    rpcUrl: 'https://polygon-rpc.com',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    blockExplorer: 'https://polygonscan.com',
  },
  [MUMBAI_CHAIN_ID]: {
    name: 'Mumbai Testnet',
    rpcUrl: 'https://rpc-mumbai.maticvigil.com',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    blockExplorer: 'https://mumbai.polygonscan.com',
  },
  [AMOY_CHAIN_ID]: {
    name: 'Amoy Testnet',
    rpcUrl: 'https://rpc-amoy.polygon.technology',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    blockExplorer: 'https://amoy.polygonscan.com',
  },
};

// Submission types (match contract enum)
export enum SubmissionType {
  ModelTest = 0,
  SafetyReport = 1,
  AlignmentStudy = 2,
  BugBounty = 3,
  DatasetContrib = 4,
}

// SanctuaryNFT - Voice Model Collectibles
export const SANCTUARY_NFT_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function safeMint(address to, string memory uri)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function balanceOf(address owner) view returns (uint256)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
];

export const SUBMISSION_TYPE_NAMES: Record<SubmissionType, string> = {
  [SubmissionType.ModelTest]: 'Model Test',
  [SubmissionType.SafetyReport]: 'Safety Report',
  [SubmissionType.AlignmentStudy]: 'Alignment Study',
  [SubmissionType.BugBounty]: 'Bug Bounty',
  [SubmissionType.DatasetContrib]: 'Dataset Contribution',
};

// Tier names (match contract)
export const TIER_NAMES = [
  'Explorer',
  'Researcher',
  'Analyst',
  'Institutional',
  'Verified',
];
