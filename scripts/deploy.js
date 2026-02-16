// scripts/deploy.js
const { ethers } = require("hardhat");

async function main() {
  const [deployer, oracle, minter, burner, royaltyAdmin] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  // Deploy Stagecoin (18 decimals)
  console.log("\n--- Deploying Stagecoin ---");
  const Stagecoin = await ethers.getContractFactory("Stagecoin");
  const stage = await Stagecoin.deploy(
    "Stagecoin", 
    "SC", 
    deployer.address, 
    deployer.address, 
    0 // Initial royalty basis points (0 = no royalty initially)
  );
  await stage.waitForDeployment();
  const stageAddress = await stage.getAddress();
  console.log("Stagecoin deployed:", stageAddress);

  // Deploy SentientCents (2 decimals)
  console.log("\n--- Deploying SentientCents ---");
  const SentientCents = await ethers.getContractFactory("SentientCents");
  const sent = await SentientCents.deploy(
    "Sentient Cents", 
    "SCENT", 
    deployer.address, 
    deployer.address, 
    0 // Initial royalty basis points (0 = no royalty initially)
  );
  await sent.waitForDeployment();
  const sentAddress = await sent.getAddress();
  console.log("SentientCents deployed:", sentAddress);

  // Grant roles: example giving oracle/minter/burner addresses roles
  console.log("\n--- Granting Roles for Stagecoin ---");
  const MINTER_ROLE = await stage.MINTER_ROLE();
  const BURNER_ROLE = await stage.BURNER_ROLE();
  const ROYALTY_ADMIN_ROLE = await stage.ROYALTY_ADMIN_ROLE();

  // Check if we have multiple signers (for real deployments)
  if (minter && minter.address !== deployer.address) {
    console.log("Granting MINTER_ROLE to:", minter.address);
    await stage.grantRole(MINTER_ROLE, minter.address);
  }
  
  if (burner && burner.address !== deployer.address) {
    console.log("Granting BURNER_ROLE to:", burner.address);
    await stage.grantRole(BURNER_ROLE, burner.address);
  }
  
  if (royaltyAdmin && royaltyAdmin.address !== deployer.address) {
    console.log("Granting ROYALTY_ADMIN_ROLE to:", royaltyAdmin.address);
    await stage.grantRole(ROYALTY_ADMIN_ROLE, royaltyAdmin.address);
  }

  // Do the same for SentientCents
  console.log("\n--- Granting Roles for SentientCents ---");
  const sMINTER_ROLE = await sent.MINTER_ROLE();
  const sBURNER_ROLE = await sent.BURNER_ROLE();
  const sROYALTY_ADMIN = await sent.ROYALTY_ADMIN_ROLE();

  if (minter && minter.address !== deployer.address) {
    console.log("Granting MINTER_ROLE to:", minter.address);
    await sent.grantRole(sMINTER_ROLE, minter.address);
  }
  
  if (burner && burner.address !== deployer.address) {
    console.log("Granting BURNER_ROLE to:", burner.address);
    await sent.grantRole(sBURNER_ROLE, burner.address);
  }
  
  if (royaltyAdmin && royaltyAdmin.address !== deployer.address) {
    console.log("Granting ROYALTY_ADMIN_ROLE to:", royaltyAdmin.address);
    await sent.grantRole(sROYALTY_ADMIN, royaltyAdmin.address);
  }

  console.log("\n--- Roles Summary ---");
  console.log("Deployer (Admin):", deployer.address);
  if (minter) console.log("Minter:", minter.address);
  if (burner) console.log("Burner:", burner.address);
  if (royaltyAdmin) console.log("Royalty Admin:", royaltyAdmin.address);

  // Example: mint some Stagecoin to an address (as demonstration)
  console.log("\n--- Minting Example Stagecoin ---");
  console.log("Minting 1000 Stagecoin to deployer as demonstration");
  await stage.mint(deployer.address, ethers.parseEther("1000"));
  const balance = await stage.balanceOf(deployer.address);
  console.log("Deployer Stagecoin balance:", ethers.formatEther(balance), "SC");

  console.log("\n=== Deployment Complete ===");
  console.log("Stagecoin:", stageAddress);
  console.log("SentientCents:", sentAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
