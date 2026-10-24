const hre = require("hardhat");
const fs = require("node:fs");
const path = require("node:path");
const { deploymentConfig } = require("./deployment-config");

async function main() {
  const treasury = process.env.TREASURY_ADDRESS;
  if (!treasury || !hre.ethers.isAddress(treasury)) throw new Error("Set a valid TREASURY_ADDRESS in .env");
  if (treasury === hre.ethers.ZeroAddress) throw new Error("Treasury must be nonzero");
  const network = await hre.ethers.provider.getNetwork();
  if (network.chainId !== 10143n) throw new Error("Deployment requires Monad Testnet chain ID 10143");
  const block = await hre.ethers.provider.getBlock("latest");
  const { deadlines, thresholds } = deploymentConfig(process.env, block.timestamp);
  const [deployer] = await hre.ethers.getSigners();
  if (!deployer) throw new Error("Configure a deployer locally before preflight");
  const Factory = await hre.ethers.getContractFactory("CommonGround");
  const transaction = await Factory.getDeployTransaction(treasury, deadlines, thresholds);
  const gas = await deployer.estimateGas(transaction);
  const fees = await hre.ethers.provider.getFeeData();
  const gasPrice = fees.maxFeePerGas ?? fees.gasPrice;
  if (gasPrice == null) throw new Error("Unable to estimate network fees");
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  const estimatedMaxCost = gas * gasPrice;
  console.log(JSON.stringify({ chainId: 10143, deployer: deployer.address, treasury,
    deadlines: deadlines.map(String), deadlineUTC: deadlines.map((value) => new Date(Number(value) * 1000).toISOString()),
    thresholds: thresholds.map(String), estimatedGas: String(gas),
    estimatedMaxCostMON: hre.ethers.formatEther(estimatedMaxCost), balanceMON: hre.ethers.formatEther(balance) }, null, 2));
  if (balance < estimatedMaxCost) throw new Error("Insufficient test MON for estimated deployment fees");
  if (process.env.BROADCAST_DEPLOYMENT !== "1") {
    console.log("Preflight complete. No transaction sent. Obtain user approval before setting BROADCAST_DEPLOYMENT=1.");
    return;
  }
  const contract = await Factory.deploy(treasury, deadlines, thresholds);
  console.log(`Deployment transaction: ${contract.deploymentTransaction().hash}`);
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  if (await hre.ethers.provider.getCode(contractAddress) === "0x") throw new Error("Deployed code not found");
  for (let i = 0; i < 3; i++) {
    const service = await contract.getService(i);
    if (service.deadline !== deadlines[i] || service.threshold !== thresholds[i] || service.activeSlot !== 0n || service.closed) {
      throw new Error("Deployed service configuration mismatch");
    }
  }
  const receipt = await contract.deploymentTransaction().wait();
  const metadata = { network: "Monad Testnet", chainId: 10143, contractAddress,
    transactionHash: receipt.hash, blockNumber: receipt.blockNumber, treasury,
    serviceDeadlines: deadlines.map(String), serviceThresholds: thresholds.map(String),
    abiPath: "chain/abi/CommonGround.json", verified: { contractCode: true, serviceConfiguration: true } };
  fs.writeFileSync(path.join(__dirname, "../deployment.monad-testnet.json"), JSON.stringify(metadata, null, 2) + "\n");
  console.log(`CommonGround deployed and checked at ${contractAddress}`);
}
// Provider errors can contain request bodies or credential-bearing RPC URLs.
main().catch(() => { console.error("Deployment/preflight failed. Check local configuration, network, and test MON balance; raw provider errors are withheld."); process.exitCode = 1; });
