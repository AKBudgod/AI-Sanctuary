const hre = require('hardhat');

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log('Deploying contracts with account:', deployer.address);
  console.log('Account balance:', (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy SanctumToken
  console.log('\n--- Deploying SanctumToken ---');
  const SanctumToken = await hre.ethers.getContractFactory('SanctumToken');

  // For DEX liquidity, we'll use deployer address initially
  // In production, this should be a DEX pool address
  const sanctumToken = await SanctumToken.deploy(deployer.address);
  await sanctumToken.waitForDeployment();

  const tokenAddress = await sanctumToken.getAddress();
  console.log('SanctumToken deployed to:', tokenAddress);
  console.log('Token Symbol:', await sanctumToken.symbol());
  console.log('Total Supply:', (await sanctumToken.totalSupply()).toString());

  // Deploy ResearchRewards
  console.log('\n--- Deploying ResearchRewards ---');
  const ResearchRewards = await hre.ethers.getContractFactory('ResearchRewards');
  const researchRewards = await ResearchRewards.deploy(tokenAddress);
  await researchRewards.waitForDeployment();

  const rewardsAddress = await researchRewards.getAddress();
  console.log('ResearchRewards deployed to:', rewardsAddress);

  // Deploy TierStaking
  console.log('\n--- Deploying TierStaking ---');
  const TierStaking = await hre.ethers.getContractFactory('TierStaking');
  const tierStaking = await TierStaking.deploy(tokenAddress);
  await tierStaking.waitForDeployment();

  const stakingAddress = await tierStaking.getAddress();
  console.log('TierStaking deployed to:', stakingAddress);

  // Deploy SanctuaryNFT
  console.log('\n--- Deploying SanctuaryNFT ---');
  const SanctuaryNFT = await hre.ethers.getContractFactory('SanctuaryNFT');
  const sanctuaryNFT = await SanctuaryNFT.deploy(deployer.address);
  await sanctuaryNFT.waitForDeployment();

  const nftAddress = await sanctuaryNFT.getAddress();
  console.log('SanctuaryNFT deployed to:', nftAddress);

  // Setup: Add contracts as distributors
  console.log('\n--- Setting up permissions ---');
  await (await sanctumToken.addDistributor(rewardsAddress)).wait();
  console.log('Added ResearchRewards as distributor');

  // Fund contracts with tokens
  console.log('\n--- Funding contracts ---');
  const rewardPoolAmount = hre.ethers.parseEther('10000000'); // 10M tokens for rewards
  await (await sanctumToken.transfer(rewardsAddress, rewardPoolAmount)).wait();
  console.log('Funded ResearchRewards with 10M SANC');

  const stakingPoolAmount = hre.ethers.parseEther('5000000'); // 5M tokens for staking rewards
  // Approve and call fundRewardPool so TierStaking.rewardPool is updated correctly
  await (await sanctumToken.approve(stakingAddress, stakingPoolAmount)).wait();
  await (await tierStaking.fundRewardPool(stakingPoolAmount)).wait();
  console.log('Funded TierStaking.rewardPool with 5M SANC');

  // Verify contracts on Polygonscan (if not on hardhat network)
  if (hre.network.name !== 'hardhat') {
    console.log('\n--- Waiting for block confirmations ---');
    await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30s

    console.log('Verifying contracts...');
    try {
      await hre.run('verify:verify', {
        address: tokenAddress,
        constructorArguments: [deployer.address],
      });
      console.log('SanctumToken verified');
    } catch (e) {
      console.log('SanctumToken verification failed:', e.message);
    }

    try {
      await hre.run('verify:verify', {
        address: rewardsAddress,
        constructorArguments: [tokenAddress],
      });
      console.log('ResearchRewards verified');
    } catch (e) {
      console.log('ResearchRewards verification failed:', e.message);
    }

    try {
      await hre.run('verify:verify', {
        address: stakingAddress,
        constructorArguments: [tokenAddress],
      });
      console.log('TierStaking verified');
    } catch (e) {
      console.log('TierStaking verification failed:', e.message);
    }
  }

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      SanctumToken: {
        address: tokenAddress,
        abi: 'SanctumToken',
      },
      ResearchRewards: {
        address: rewardsAddress,
        abi: 'ResearchRewards',
      },
      TierStaking: {
        address: stakingAddress,
        abi: 'TierStaking',
      },
      SanctuaryNFT: {
        address: nftAddress,
        abi: 'SanctuaryNFT',
      },
    },
  };

  const fs = require('fs');
  fs.writeFileSync(
    `deployment-${hre.network.name}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log('\n=== DEPLOYMENT COMPLETE ===');
  console.log('Deployment info saved to:', `deployment-${hre.network.name}.json`);
  console.log('\nContract Addresses:');
  console.log('  SANC Token:', tokenAddress);
  console.log('  Research Rewards:', rewardsAddress);
  console.log('  Tier Staking:', stakingAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
