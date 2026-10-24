require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
module.exports = {
  solidity: { version: "0.8.24", settings: { optimizer: { enabled: true, runs: 200 } } },
  networks: {
    hardhat: { accounts: { count: 40 } },
    monadTestnet: {
      url: process.env.MONAD_TESTNET_RPC_URL || "https://testnet-rpc.monad.xyz",
      chainId: 10143,
      accounts: privateKey ? [privateKey] : []
    }
  }
};
