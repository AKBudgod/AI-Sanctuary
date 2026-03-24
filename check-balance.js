const hre = require('hardhat');

async function main() {
  const pk = process.env.PRIVATE_KEY;
  if (!pk) {
    console.error('No PRIVATE_KEY found in .env');
    return;
  }

  const wallet = new hre.ethers.Wallet(pk, hre.ethers.provider);
  console.log('Wallet Address:', wallet.address);

  const balance = await hre.ethers.provider.getBalance(wallet.address);
  console.log('Balance:', hre.ethers.formatEther(balance), 'MATIC');
  
  const network = await hre.ethers.provider.getNetwork();
  console.log('Network Name:', network.name);
  console.log('Chain ID:', network.chainId.toString());
}

main().catch(console.error);
