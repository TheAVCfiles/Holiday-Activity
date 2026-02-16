// scripts/local-test.js
// Script for local testing and demonstration of token functionality
const { ethers } = require("hardhat");

async function main() {
  console.log("=== Local Token Testing & Demonstration ===\n");

  const [deployer, alice, bob, charlie, treasury] = await ethers.getSigners();
  
  console.log("Accounts:");
  console.log("  Deployer:", deployer.address);
  console.log("  Alice:", alice.address);
  console.log("  Bob:", bob.address);
  console.log("  Charlie:", charlie.address);
  console.log("  Treasury:", treasury.address);
  console.log("");

  // Deploy Stagecoin
  console.log("--- Deploying Stagecoin ---");
  const Stagecoin = await ethers.getContractFactory("Stagecoin");
  const stagecoin = await Stagecoin.deploy(
    "Stagecoin",
    "SC",
    deployer.address,
    treasury.address,
    250 // 2.5% royalty
  );
  await stagecoin.waitForDeployment();
  const scAddress = await stagecoin.getAddress();
  console.log("Stagecoin deployed at:", scAddress);
  console.log("Initial royalty: 2.5% to", treasury.address);
  console.log("");

  // Deploy SentientCents
  console.log("--- Deploying SentientCents ---");
  const SentientCents = await ethers.getContractFactory("SentientCents");
  const scent = await SentientCents.deploy(
    "Sentient Cents",
    "SCENT",
    deployer.address,
    treasury.address,
    0 // No royalty initially
  );
  await scent.waitForDeployment();
  const scentAddress = await scent.getAddress();
  console.log("SentientCents deployed at:", scentAddress);
  console.log("");

  // Test Stagecoin functionality
  console.log("=== Testing Stagecoin ===\n");

  console.log("1. Minting tokens to Alice");
  await stagecoin.mint(alice.address, ethers.parseEther("1000"));
  let balance = await stagecoin.balanceOf(alice.address);
  console.log("   Alice balance:", ethers.formatEther(balance), "SC");
  console.log("");

  console.log("2. Alice transfers 100 SC to Bob (with 2.5% royalty)");
  await stagecoin.connect(alice).transfer(bob.address, ethers.parseEther("100"));
  balance = await stagecoin.balanceOf(bob.address);
  let treasuryBalance = await stagecoin.balanceOf(treasury.address);
  console.log("   Bob received:", ethers.formatEther(balance), "SC");
  console.log("   Treasury fee:", ethers.formatEther(treasuryBalance), "SC");
  console.log("");

  console.log("3. Testing royalty bypass (transfer from treasury)");
  await stagecoin.mint(treasury.address, ethers.parseEther("100"));
  const treasuryStartBalance = await stagecoin.balanceOf(treasury.address);
  await stagecoin.connect(treasury).transfer(charlie.address, ethers.parseEther("50"));
  balance = await stagecoin.balanceOf(charlie.address);
  const treasuryEndBalance = await stagecoin.balanceOf(treasury.address);
  console.log("   Charlie received:", ethers.formatEther(balance), "SC (no fee)");
  console.log("   Treasury balance changed by:", ethers.formatEther(treasuryStartBalance - treasuryEndBalance), "SC");
  console.log("");

  console.log("4. Adjusting royalty to 5%");
  await stagecoin.setRoyaltyBasisPoints(500);
  console.log("   New royalty rate: 5%");
  console.log("");

  console.log("5. Bob transfers 50 SC to Charlie (with 5% royalty)");
  const bobStartBalance = await stagecoin.balanceOf(bob.address);
  await stagecoin.connect(bob).transfer(charlie.address, ethers.parseEther("50"));
  const bobEndBalance = await stagecoin.balanceOf(bob.address);
  balance = await stagecoin.balanceOf(charlie.address);
  treasuryBalance = await stagecoin.balanceOf(treasury.address);
  console.log("   Bob sent:", ethers.formatEther(bobStartBalance - bobEndBalance), "SC");
  console.log("   Charlie received:", ethers.formatEther(balance - ethers.parseEther("50")), "SC");
  console.log("   Treasury received:", ethers.formatEther(treasuryBalance - treasuryEndBalance), "SC");
  console.log("");

  // Test SentientCents functionality
  console.log("=== Testing SentientCents ===\n");

  console.log("1. Minting 100.00 SCENT to Alice");
  await scent.mint(alice.address, 10000n); // 100.00 with 2 decimals
  balance = await scent.balanceOf(alice.address);
  console.log("   Alice balance:", Number(balance) / 100, "SCENT");
  console.log("");

  console.log("2. Alice transfers 12.50 SCENT to Bob (no royalty)");
  await scent.connect(alice).transfer(bob.address, 1250n);
  balance = await scent.balanceOf(bob.address);
  console.log("   Bob received:", Number(balance) / 100, "SCENT");
  console.log("");

  console.log("3. Enabling 10% royalty on SCENT");
  await scent.setRoyaltyBasisPoints(1000);
  console.log("   Royalty set to: 10%");
  console.log("");

  console.log("4. Bob transfers 10.00 SCENT to Charlie (with 10% royalty)");
  await scent.connect(bob).transfer(charlie.address, 1000n);
  balance = await scent.balanceOf(charlie.address);
  treasuryBalance = await scent.balanceOf(treasury.address);
  console.log("   Charlie received:", Number(balance) / 100, "SCENT");
  console.log("   Treasury fee:", Number(treasuryBalance) / 100, "SCENT");
  console.log("");

  // Test burning
  console.log("=== Testing Burn Functionality ===\n");

  console.log("1. Burning 10 SC from Alice");
  let aliceBalance = await stagecoin.balanceOf(alice.address);
  console.log("   Alice balance before burn:", ethers.formatEther(aliceBalance), "SC");
  await stagecoin.burn(alice.address, ethers.parseEther("10"));
  aliceBalance = await stagecoin.balanceOf(alice.address);
  console.log("   Alice balance after burn:", ethers.formatEther(aliceBalance), "SC");
  console.log("");

  console.log("2. Burning 5.00 SCENT from Bob");
  let bobScentBalance = await scent.balanceOf(bob.address);
  console.log("   Bob balance before burn:", Number(bobScentBalance) / 100, "SCENT");
  await scent.burn(bob.address, 500n);
  bobScentBalance = await scent.balanceOf(bob.address);
  console.log("   Bob balance after burn:", Number(bobScentBalance) / 100, "SCENT");
  console.log("");

  // Final balances
  console.log("=== Final Balances ===\n");

  console.log("Stagecoin (SC):");
  console.log("  Alice:", ethers.formatEther(await stagecoin.balanceOf(alice.address)), "SC");
  console.log("  Bob:", ethers.formatEther(await stagecoin.balanceOf(bob.address)), "SC");
  console.log("  Charlie:", ethers.formatEther(await stagecoin.balanceOf(charlie.address)), "SC");
  console.log("  Treasury:", ethers.formatEther(await stagecoin.balanceOf(treasury.address)), "SC");
  console.log("  Total Supply:", ethers.formatEther(await stagecoin.totalSupply()), "SC");
  console.log("");

  console.log("SentientCents (SCENT):");
  console.log("  Alice:", Number(await scent.balanceOf(alice.address)) / 100, "SCENT");
  console.log("  Bob:", Number(await scent.balanceOf(bob.address)) / 100, "SCENT");
  console.log("  Charlie:", Number(await scent.balanceOf(charlie.address)) / 100, "SCENT");
  console.log("  Treasury:", Number(await scent.balanceOf(treasury.address)) / 100, "SCENT");
  console.log("  Total Supply:", Number(await scent.totalSupply()) / 100, "SCENT");
  console.log("");

  console.log("=== Testing Complete ===");
  console.log("\nContract Addresses:");
  console.log("  Stagecoin:", scAddress);
  console.log("  SentientCents:", scentAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
