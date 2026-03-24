require('@nomicfoundation/hardhat-toolbox');
require('@nomicfoundation/hardhat-verify');
require('dotenv').config();

// normalize and validate PRIVATE_KEY from .env (returns undefined when invalid)
const getPrivateKey = () => {
  const pk = process.env.PRIVATE_KEY || '';
  if (!pk) return undefined;
  const cleaned = pk.startsWith('0x') ? pk.slice(2) : pk;
  return /^([0-9a-fA-F]{64})$/.test(cleaned) ? '0x' + cleaned : undefined;
};

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: '0.8.19',
        settings: { optimizer: { enabled: true, runs: 200 } }
      },
      {
        version: '0.8.20',
        settings: { optimizer: { enabled: true, runs: 200 } }
      }
    ]
  },
  networks: {
    // Polygon Mainnet
    polygon: {
      url: process.env.POLYGON_RPC || 'https://polygon-rpc.com',
      accounts: getPrivateKey() ? [getPrivateKey()] : [],
      chainId: 137,
    },
    // Polygon Mumbai Testnet
    mumbai: {
      url: process.env.MUMBAI_RPC || 'https://rpc-mumbai.maticvigil.com',
      accounts: getPrivateKey() ? [getPrivateKey()] : [],
      chainId: 80001,
    },
    // Polygon Amoy Testnet (new testnet)
    amoy: {
      url: process.env.AMOY_RPC || 'https://rpc-amoy.polygon.technology',
      accounts: getPrivateKey() ? [getPrivateKey()] : [],
      chainId: 80002,
    },
  },
  etherscan: {
    apiKey: {
      polygon: process.env.POLYGONSCAN_API_KEY || '',
      polygonMumbai: process.env.POLYGONSCAN_API_KEY || '',
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: 'USD',
  },
};
