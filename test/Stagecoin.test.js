const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Stagecoin", function () {
  let stagecoin;
  let owner, minter, burner, royaltyAdmin, user1, user2, treasury;

  beforeEach(async function () {
    [owner, minter, burner, royaltyAdmin, user1, user2, treasury] = await ethers.getSigners();

    const Stagecoin = await ethers.getContractFactory("Stagecoin");
    stagecoin = await Stagecoin.deploy(
      "Stagecoin",
      "SC",
      owner.address,
      treasury.address,
      0 // Start with no royalty
    );
    await stagecoin.waitForDeployment();

    // Grant roles
    const MINTER_ROLE = await stagecoin.MINTER_ROLE();
    const BURNER_ROLE = await stagecoin.BURNER_ROLE();
    const ROYALTY_ADMIN_ROLE = await stagecoin.ROYALTY_ADMIN_ROLE();

    await stagecoin.grantRole(MINTER_ROLE, minter.address);
    await stagecoin.grantRole(BURNER_ROLE, burner.address);
    await stagecoin.grantRole(ROYALTY_ADMIN_ROLE, royaltyAdmin.address);
  });

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await stagecoin.name()).to.equal("Stagecoin");
      expect(await stagecoin.symbol()).to.equal("SC");
    });

    it("Should have 18 decimals", async function () {
      expect(await stagecoin.decimals()).to.equal(18);
    });

    it("Should set the correct initial admin", async function () {
      const DEFAULT_ADMIN_ROLE = await stagecoin.DEFAULT_ADMIN_ROLE();
      expect(await stagecoin.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
    });

    it("Should initialize with zero royalty", async function () {
      expect(await stagecoin.royaltyBasisPoints()).to.equal(0);
    });
  });

  describe("Minting", function () {
    it("Should allow minter to mint tokens", async function () {
      const amount = ethers.parseEther("1000");
      await stagecoin.connect(minter).mint(user1.address, amount);
      expect(await stagecoin.balanceOf(user1.address)).to.equal(amount);
    });

    it("Should fail if non-minter tries to mint", async function () {
      const amount = ethers.parseEther("1000");
      await expect(
        stagecoin.connect(user1).mint(user1.address, amount)
      ).to.be.reverted;
    });

    it("Should update total supply when minting", async function () {
      const amount = ethers.parseEther("1000");
      await stagecoin.connect(minter).mint(user1.address, amount);
      expect(await stagecoin.totalSupply()).to.equal(amount);
    });
  });

  describe("Burning", function () {
    beforeEach(async function () {
      const amount = ethers.parseEther("1000");
      await stagecoin.connect(minter).mint(user1.address, amount);
    });

    it("Should allow burner to burn tokens", async function () {
      const burnAmount = ethers.parseEther("500");
      await stagecoin.connect(burner).burn(user1.address, burnAmount);
      expect(await stagecoin.balanceOf(user1.address)).to.equal(
        ethers.parseEther("500")
      );
    });

    it("Should fail if non-burner tries to burn", async function () {
      const burnAmount = ethers.parseEther("500");
      await expect(
        stagecoin.connect(user1).burn(user1.address, burnAmount)
      ).to.be.reverted;
    });

    it("Should update total supply when burning", async function () {
      const burnAmount = ethers.parseEther("500");
      const initialSupply = await stagecoin.totalSupply();
      await stagecoin.connect(burner).burn(user1.address, burnAmount);
      expect(await stagecoin.totalSupply()).to.equal(initialSupply - burnAmount);
    });
  });

  describe("Royalty Configuration", function () {
    it("Should allow royalty admin to set royalty basis points", async function () {
      await stagecoin.connect(royaltyAdmin).setRoyaltyBasisPoints(250); // 2.5%
      expect(await stagecoin.royaltyBasisPoints()).to.equal(250);
    });

    it("Should fail if royalty BPS exceeds 10000", async function () {
      await expect(
        stagecoin.connect(royaltyAdmin).setRoyaltyBasisPoints(10001)
      ).to.be.revertedWith("Stagecoin: bp>10000");
    });

    it("Should allow royalty admin to set royalty recipient", async function () {
      await stagecoin.connect(royaltyAdmin).setRoyaltyRecipient(user2.address);
      expect(await stagecoin.royaltyRecipient()).to.equal(user2.address);
    });

    it("Should emit event when royalty BPS is updated", async function () {
      await expect(
        stagecoin.connect(royaltyAdmin).setRoyaltyBasisPoints(250)
      )
        .to.emit(stagecoin, "RoyaltyBasisPointsUpdated")
        .withArgs(0, 250);
    });

    it("Should emit event when royalty recipient is updated", async function () {
      await expect(
        stagecoin.connect(royaltyAdmin).setRoyaltyRecipient(user2.address)
      )
        .to.emit(stagecoin, "RoyaltyRecipientUpdated")
        .withArgs(treasury.address, user2.address);
    });
  });

  describe("Transfers without Royalty", function () {
    beforeEach(async function () {
      const amount = ethers.parseEther("1000");
      await stagecoin.connect(minter).mint(user1.address, amount);
    });

    it("Should transfer tokens normally when royalty is 0", async function () {
      const transferAmount = ethers.parseEther("100");
      await stagecoin.connect(user1).transfer(user2.address, transferAmount);
      expect(await stagecoin.balanceOf(user2.address)).to.equal(transferAmount);
    });
  });

  describe("Transfers with Royalty", function () {
    beforeEach(async function () {
      const amount = ethers.parseEther("1000");
      await stagecoin.connect(minter).mint(user1.address, amount);
      // Set 10% royalty
      await stagecoin.connect(royaltyAdmin).setRoyaltyBasisPoints(1000);
    });

    it("Should deduct royalty on transfer", async function () {
      const transferAmount = ethers.parseEther("100");
      await stagecoin.connect(user1).transfer(user2.address, transferAmount);

      // User2 should receive 90 (100 - 10% royalty)
      const expectedAmount = ethers.parseEther("90");
      expect(await stagecoin.balanceOf(user2.address)).to.equal(expectedAmount);

      // Treasury should receive 10 (10% royalty)
      const expectedRoyalty = ethers.parseEther("10");
      expect(await stagecoin.balanceOf(treasury.address)).to.equal(expectedRoyalty);
    });

    it("Should not charge royalty when transferring to royalty recipient", async function () {
      const transferAmount = ethers.parseEther("100");
      await stagecoin.connect(user1).transfer(treasury.address, transferAmount);
      expect(await stagecoin.balanceOf(treasury.address)).to.equal(transferAmount);
    });

    it("Should not charge royalty when transferring from royalty recipient", async function () {
      // First mint to treasury
      await stagecoin.connect(minter).mint(treasury.address, ethers.parseEther("100"));
      
      const transferAmount = ethers.parseEther("100");
      await stagecoin.connect(treasury).transfer(user2.address, transferAmount);
      expect(await stagecoin.balanceOf(user2.address)).to.equal(transferAmount);
    });

    it("Should handle very small transfers with zero fee", async function () {
      // Transfer 1 wei (fee would be 0)
      await stagecoin.connect(user1).transfer(user2.address, 1);
      expect(await stagecoin.balanceOf(user2.address)).to.equal(1);
    });
  });

  describe("Access Control", function () {
    it("Should allow admin to grant roles", async function () {
      const MINTER_ROLE = await stagecoin.MINTER_ROLE();
      await stagecoin.connect(owner).grantRole(MINTER_ROLE, user2.address);
      expect(await stagecoin.hasRole(MINTER_ROLE, user2.address)).to.be.true;
    });

    it("Should allow admin to revoke roles", async function () {
      const MINTER_ROLE = await stagecoin.MINTER_ROLE();
      await stagecoin.connect(owner).revokeRole(MINTER_ROLE, minter.address);
      expect(await stagecoin.hasRole(MINTER_ROLE, minter.address)).to.be.false;
    });
  });
});
