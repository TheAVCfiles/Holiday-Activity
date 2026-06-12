const hre = require("hardhat");

async function main() {
  const signers = await hre.ethers.getSigners();
  if (signers.length === 0) {
    throw new Error("No deployer account found. Check your network configuration and private keys.");
  }
  const deployer = signers[0];
  const deployerAddress = await deployer.getAddress();

  console.log("Deploying contracts with account:", deployerAddress);

  const Stagecoin = await hre.ethers.getContractFactory("Stagecoin");
  const stagecoin = await Stagecoin.deploy(
    "Stagecoin",
    "STAGE",
    deployerAddress,
    deployerAddress,
    500
  );
  await stagecoin.deployTransaction.wait(1);

  console.log("Stagecoin deployed to:", stagecoin.address);

  const SentientCents = await hre.ethers.getContractFactory("SentientCents");
  const sentientCents = await SentientCents.deploy(
    "SentientCents",
    "SCENTS",
    deployerAddress,
    deployerAddress,
    250
  );
  await sentientCents.deployTransaction.wait(1);

  console.log("SentientCents deployed to:", sentientCents.address);

  console.log("\nVerification constructor args:");
  console.log("Stagecoin:", ["Stagecoin", "STAGE", deployerAddress, deployerAddress, 500]);
  console.log("SentientCents:", ["SentientCents", "SCENTS", deployerAddress, deployerAddress, 250]);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
