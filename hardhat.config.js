require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const AVAX_RPC_URL = process.env.AVAX_RPC_URL;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: {
          optimizer: { enabled: true, runs: 200 },
          viaIR: true
        }
      },
      {
        version: "0.8.28",
        settings: {
          optimizer: { enabled: true, runs: 200 },
          viaIR: true
        }
      }
    ]
  },
  networks: {
    fuji: {
      url: AVAX_RPC_URL,
      chainId: 43113,
      accounts: [PRIVATE_KEY]
    }
  }
};
