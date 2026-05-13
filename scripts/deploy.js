const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
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
  await stagecoin.deployed();

  console.log("Stagecoin deployed to:", stagecoin.address);

  const SentientCents = await hre.ethers.getContractFactory("SentientCents");
  const sentientCents = await SentientCents.deploy(
    "SentientCents",
    "SCENTS",
    deployerAddress,
    deployerAddress,
    250
  );
  await sentientCents.deployed();

  console.log("SentientCents deployed to:", sentientCents.address);

  console.log("\nVerification constructor args:");
  console.log("Stagecoin:", ["Stagecoin", "STAGE", deployerAddress, deployerAddress, 500]);
  console.log("SentientCents:", ["SentientCents", "SCENTS", deployerAddress, deployerAddress, 250]);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
