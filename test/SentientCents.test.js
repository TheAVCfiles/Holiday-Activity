const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SentientCents", function () {
  let sentientCents;
  let owner, minter, burner, royaltyAdmin, user1, user2, treasury;

  beforeEach(async function () {
    [owner, minter, burner, royaltyAdmin, user1, user2, treasury] = await ethers.getSigners();

    const SentientCents = await ethers.getContractFactory("SentientCents");
    sentientCents = await SentientCents.deploy(
      "Sentient Cents",
      "SCENT",
      owner.address,
      treasury.address,
      0 // Start with no royalty
    );
    await sentientCents.waitForDeployment();

    // Grant roles
    const MINTER_ROLE = await sentientCents.MINTER_ROLE();
    const BURNER_ROLE = await sentientCents.BURNER_ROLE();
    const ROYALTY_ADMIN_ROLE = await sentientCents.ROYALTY_ADMIN_ROLE();

    await sentientCents.grantRole(MINTER_ROLE, minter.address);
    await sentientCents.grantRole(BURNER_ROLE, burner.address);
    await sentientCents.grantRole(ROYALTY_ADMIN_ROLE, royaltyAdmin.address);
  });

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await sentientCents.name()).to.equal("Sentient Cents");
      expect(await sentientCents.symbol()).to.equal("SCENT");
    });

    it("Should have 2 decimals", async function () {
      expect(await sentientCents.decimals()).to.equal(2);
    });

    it("Should set the correct initial admin", async function () {
      const DEFAULT_ADMIN_ROLE = await sentientCents.DEFAULT_ADMIN_ROLE();
      expect(await sentientCents.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
    });
  });

  describe("Decimal Handling", function () {
    it("Should handle cent-like amounts correctly", async function () {
      // 1.00 SCENT = 100 base units
      const oneSCENT = 100n;
      await sentientCents.connect(minter).mint(user1.address, oneSCENT);
      expect(await sentientCents.balanceOf(user1.address)).to.equal(oneSCENT);
    });

    it("Should handle fractional cents", async function () {
      // 1.25 SCENT = 125 base units
      const amount = 125n;
      await sentientCents.connect(minter).mint(user1.address, amount);
      expect(await sentientCents.balanceOf(user1.address)).to.equal(amount);
    });
  });

  describe("Minting", function () {
    it("Should allow minter to mint tokens", async function () {
      const amount = 10000n; // 100.00 SCENT
      await sentientCents.connect(minter).mint(user1.address, amount);
      expect(await sentientCents.balanceOf(user1.address)).to.equal(amount);
    });

    it("Should fail if non-minter tries to mint", async function () {
      const amount = 10000n;
      await expect(
        sentientCents.connect(user1).mint(user1.address, amount)
      ).to.be.reverted;
    });
  });

  describe("Burning", function () {
    beforeEach(async function () {
      const amount = 10000n; // 100.00 SCENT
      await sentientCents.connect(minter).mint(user1.address, amount);
    });

    it("Should allow burner to burn tokens", async function () {
      const burnAmount = 5000n; // 50.00 SCENT
      await sentientCents.connect(burner).burn(user1.address, burnAmount);
      expect(await sentientCents.balanceOf(user1.address)).to.equal(5000n);
    });

    it("Should fail if non-burner tries to burn", async function () {
      const burnAmount = 5000n;
      await expect(
        sentientCents.connect(user1).burn(user1.address, burnAmount)
      ).to.be.reverted;
    });
  });

  describe("Royalty Configuration", function () {
    it("Should allow royalty admin to set royalty basis points", async function () {
      await sentientCents.connect(royaltyAdmin).setRoyaltyBasisPoints(500); // 5%
      expect(await sentientCents.royaltyBasisPoints()).to.equal(500);
    });

    it("Should fail if royalty BPS exceeds 10000", async function () {
      await expect(
        sentientCents.connect(royaltyAdmin).setRoyaltyBasisPoints(10001)
      ).to.be.revertedWith("SentientCents: bp>10000");
    });

    it("Should allow royalty admin to set royalty recipient", async function () {
      await sentientCents.connect(royaltyAdmin).setRoyaltyRecipient(user2.address);
      expect(await sentientCents.royaltyRecipient()).to.equal(user2.address);
    });
  });

  describe("Transfers with 2 Decimal Precision", function () {
    beforeEach(async function () {
      const amount = 10000n; // 100.00 SCENT
      await sentientCents.connect(minter).mint(user1.address, amount);
    });

    it("Should transfer tokens with 2 decimal precision", async function () {
      const transferAmount = 1250n; // 12.50 SCENT
      await sentientCents.connect(user1).transfer(user2.address, transferAmount);
      expect(await sentientCents.balanceOf(user2.address)).to.equal(transferAmount);
    });

    it("Should handle royalty with 2 decimal precision", async function () {
      // Set 10% royalty
      await sentientCents.connect(royaltyAdmin).setRoyaltyBasisPoints(1000);
      
      const transferAmount = 1000n; // 10.00 SCENT
      await sentientCents.connect(user1).transfer(user2.address, transferAmount);

      // User2 should receive 900 (9.00 SCENT - 90%)
      expect(await sentientCents.balanceOf(user2.address)).to.equal(900n);

      // Treasury should receive 100 (1.00 SCENT - 10%)
      expect(await sentientCents.balanceOf(treasury.address)).to.equal(100n);
    });
  });

  describe("Micro-Royalty Tracking", function () {
    it("Should handle very small royalty amounts", async function () {
      await sentientCents.connect(royaltyAdmin).setRoyaltyBasisPoints(100); // 1%
      
      const amount = 10000n; // 100.00 SCENT
      await sentientCents.connect(minter).mint(user1.address, amount);
      
      const transferAmount = 50n; // 0.50 SCENT
      await sentientCents.connect(user1).transfer(user2.address, transferAmount);

      // 1% of 50 = 0 (rounds down)
      // So user2 gets full amount
      expect(await sentientCents.balanceOf(user2.address)).to.equal(50n);
    });

    it("Should track cumulative small royalties over time", async function () {
      await sentientCents.connect(royaltyAdmin).setRoyaltyBasisPoints(1000); // 10%
      
      const amount = 10000n; // 100.00 SCENT
      await sentientCents.connect(minter).mint(user1.address, amount);
      
      // Make multiple small transfers
      for (let i = 0; i < 5; i++) {
        await sentientCents.connect(user1).transfer(user2.address, 100n); // 1.00 SCENT each
      }

      // Each transfer: 100 base units, 10% fee = 10 units to treasury, 90 to user2
      // After 5 transfers:
      // user2: 5 * 90 = 450
      // treasury: 5 * 10 = 50
      expect(await sentientCents.balanceOf(user2.address)).to.equal(450n);
      expect(await sentientCents.balanceOf(treasury.address)).to.equal(50n);
    });
  });
});
