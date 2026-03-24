# AI Sanctuary Web3 Integration

## Overview

Your website now has a complete Web3 ecosystem:

- **$SANC Token** - ERC-20 token on Polygon
- **Research Rewards** - Earn tokens for testing AI models
- **Tier Staking** - Stake tokens to unlock platform tiers
- **Revenue Sharing** - Subscription revenue buys back/burns tokens

## Tokenomics

| Allocation | Amount | Purpose |
|------------|--------|---------|
| Total Supply | 100M SANC | Fixed supply |
| DEX Liquidity | 20M (20%) | Initial liquidity pool |
| Research Rewards | 50M (50%) | Paid to researchers over time |
| Team | 15M (15%) | Vested team allocation |
| Community | 15M (15%) | Airdrops, marketing, incentives |

## Smart Contracts

### 1. SanctumToken (SANC)
- Standard ERC-20 with burn functionality
- Research reward distribution
- Revenue collection and buyback mechanism

### 2. ResearchRewards
- Submit research findings (IPFS hash)
- Verifiers approve submissions
- Automatic token payouts based on quality score

### 3. TierStaking
- Stake SANC to unlock platform tiers
- Earn daily rewards based on tier level
- No lock period - instant unstake

## Tier System

| Tier | SANC Required | Daily APY | Benefits |
|------|---------------|-----------|----------|
| Explorer | 0 | 0% | Basic access |
| Researcher | 100 | ~18% | Higher rate limits |
| Analyst | 1,000 | ~36% | Premium models |
| Institutional | 10,000 | ~54% | Banned model access |
| Verified | 100,000 | ~91% | All features |

## Deployment Steps

### 1. Install Dependencies

```bash
cd contracts
npm install
```

### 2. Set Up Environment

Create `.env` file in `contracts/` folder:

```env
PRIVATE_KEY=your_wallet_private_key_without_0x
POLYGONSCAN_API_KEY=your_polygonscan_api_key
```

**Get API Key:** https://polygonscan.com/myapikey

### 3. Deploy to Testnet (Amoy)

```bash
npm run deploy:amoy
```

Save the contract addresses from the output.

### 4. Deploy to Polygon Mainnet

```bash
npm run deploy:polygon
```

**Cost:** ~$50-100 in MATIC for gas

### 5. Update Frontend

Edit `src/lib/web3/contracts.ts` with deployed addresses:

```typescript
export const CONTRACT_ADDRESSES = {
  SANCTUM_TOKEN: '0x...',
  RESEARCH_RESEARCH_REWARDS: '0x...',
  TIER_STAKING: '0x...',
};
```

### 6. Add Liquidity (DEX)

1. Go to QuickSwap: https://quickswap.exchange
2. Create SANC/MATIC pool
3. Add initial liquidity (use the 20M tokens allocated)

### 7. Fund Contracts

Transfer tokens to ResearchRewards and TierStaking contracts:

```javascript
// From deployer wallet
await token.transfer(RESEARCH_REWARDS_ADDRESS, ethers.parseEther('10000000'));
await token.transfer(TIER_STAKING_ADDRESS, ethers.parseEther('5000000'));
```

## How Researchers Earn

### Method 1: Complete AI Tests
1. Connect wallet on platform
2. Run AI model tests
3. System automatically rewards SANC based on test completion

### Method 2: Submit Research
1. Write research findings
2. Upload to IPFS
3. Submit via `submitResearch(modelId, ipfsHash, type)`
4. Verifier reviews and approves
5. Receive SANC based on quality score

## Revenue Model

1. **Subscriptions** paid in MATIC/USDC
2. **50%** of revenue buys SANC from DEX
3. **Burned** or **distributed** to stakers
4. Creates constant buy pressure as platform grows

## Security

- Contracts use OpenZeppelin libraries
- ReentrancyGuard on all external calls
- Owner can pause/emergency withdraw
- Verifiers are whitelisted addresses

## Admin Functions

```javascript
// Add verifier
await researchRewards.addVerifier(verifierAddress);

// Update reward rate
await token.setRewardRate(newRate);

// Update tier requirements
await tierStaking.setTier(level, name, minStake, rewardRate, active);

// Collect revenue
await token.collectRevenue({ value: ethers.parseEther('1') });
```

## Frontend Integration

The Web3Dashboard component is ready to use:

```tsx
import Web3Dashboard from '@/components/ui/Web3Dashboard';

// In your page:
<Web3Dashboard />
```

Features:
- Wallet connection
- SANC balance display
- Staking interface
- Tier progression
- Platform stats

## Next Steps

1. **Deploy contracts** to Polygon
2. **Add to your website** - integrate Web3Dashboard
3. **Create liquidity pool** on QuickSwap
4. **Market the token** - researchers need to know they can earn
5. **Set up verifiers** - trusted reviewers for research submissions

## Support

- PolygonScan: https://polygonscan.com
- QuickSwap: https://quickswap.exchange
- OpenZeppelin Docs: https://docs.openzeppelin.com
