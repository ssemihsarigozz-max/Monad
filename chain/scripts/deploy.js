const hre = require("hardhat");

async function main() {
  const treasury = process.env.TREASURY_ADDRESS;
  const threshold = BigInt(process.env.SERVICE_THRESHOLD || "2");
  const now = Math.floor(Date.now() / 1000);
  const deadlines = ["LIBRARY_DEADLINE", "LAUNDRY_DEADLINE", "CAFETERIA_DEADLINE"].map((key) => BigInt(process.env[key] || now + 3600));
  if (!treasury || !hre.ethers.isAddress(treasury)) throw new Error("Set a valid TREASURY_ADDRESS in .env");
  if (threshold < 2n) throw new Error("SERVICE_THRESHOLD must be at least 2");
  const Factory = await hre.ethers.getContractFactory("CommonGround");
  const contract = await Factory.deploy(treasury, deadlines, [threshold, threshold, threshold]);
  await contract.waitForDeployment();
  console.log(`CommonGround deployed to ${await contract.getAddress()}`);
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
