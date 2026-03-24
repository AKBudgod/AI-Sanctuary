# Deploy AI Sanctuary contracts to Polygon Mumbai testnet
# Usage: .\scripts\deploy-mumbai.ps1

Write-Host "Ensure .env contains PRIVATE_KEY and MUMBAI_RPC before running"
npx hardhat run deploy.js --network mumbai

Write-Host "\nAfter deploy completes you will find deployment-mumbai.json with contract addresses."
Write-Host "If you need to top-up/fund contracts manually:"
Write-Host "  - Transfer SANC to ResearchRewards: npx hardhat console --network mumbai -> token.transfer(rewardsAddress, amount)"
Write-Host "  - Approve + fund TierStaking reward pool: token.approve(stakingAddress, amount); staking.fundRewardPool(amount)"
