const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Stagecoin", function () {
  let Stagecoin;
  let stagecoin;
  let owner;
  let minter;
  let burner;
  let royaltyRecipient;
  let user1;
  let user2;

  beforeEach(async function () {
    [owner, minter, burner, royaltyRecipient, user1, user2] = await ethers.getSigners();

    Stagecoin = await ethers.getContractFactory("Stagecoin");
    stagecoin = await Stagecoin.deploy(
      "Stagecoin",
      "STAGE",
      owner.address,
      royaltyRecipient.address,
      500 // 5% royalty
    );
    await stagecoin.deployed();

    // Grant roles to minter and burner
    await stagecoin.connect(owner).grantRole(await stagecoin.MINTER_ROLE(), minter.address);
    await stagecoin.connect(owner).grantRole(await stagecoin.BURNER_ROLE(), burner.address);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await stagecoin.hasRole(await stagecoin.DEFAULT_ADMIN_ROLE(), owner.address)).to.equal(true);
    });

    it("Should set the right royalty recipient", async function () {
      expect(await stagecoin.royaltyRecipient()).to.equal(royaltyRecipient.address);
    });

    it("Should set the right royalty basis points", async function () {
      expect(await stagecoin.royaltyBasisPoints()).to.equal(500);
    });
  });

  describe("Minting", function () {
    it("Should allow minter to mint tokens", async function () {
      await stagecoin.connect(minter).mint(user1.address, 1000);
      expect(await stagecoin.balanceOf(user1.address)).to.equal(1000);
    });

    it("Should not allow non-minter to mint tokens", async function () {
      await expect(
        stagecoin.connect(user1).mint(user2.address, 1000)
      ).to.be.reverted;
    });
  });

  describe("Burning", function () {
    beforeEach(async function () {
      await stagecoin.connect(minter).mint(user1.address, 1000);
    });

    it("Should allow burner to burn tokens", async function () {
      await stagecoin.connect(burner).burn(user1.address, 500);
      expect(await stagecoin.balanceOf(user1.address)).to.equal(500);
    });

    it("Should not allow non-burner to burn tokens", async function () {
      await expect(
        stagecoin.connect(user1).burn(user1.address, 500)
      ).to.be.reverted;
    });
  });

  describe("Royalty Transfer", function () {
    beforeEach(async function () {
      await stagecoin.connect(minter).mint(user1.address, 10000);
    });

    it("Should transfer with royalty deduction", async function () {
      await stagecoin.connect(user1).transfer(user2.address, 1000);
      
      // user2 should receive 95% (950 tokens)
      expect(await stagecoin.balanceOf(user2.address)).to.equal(950);
      
      // royaltyRecipient should receive 5% (50 tokens)
      expect(await stagecoin.balanceOf(royaltyRecipient.address)).to.equal(50);
      
      // user1 should have 9000 left
      expect(await stagecoin.balanceOf(user1.address)).to.equal(9000);
    });

    it("Should not charge royalty when transferring to royaltyRecipient", async function () {
      await stagecoin.connect(user1).transfer(royaltyRecipient.address, 1000);
      
      // royaltyRecipient should receive full 1000
      expect(await stagecoin.balanceOf(royaltyRecipient.address)).to.equal(1000);
      
      // user1 should have 9000 left
      expect(await stagecoin.balanceOf(user1.address)).to.equal(9000);
    });

    it("Should not charge royalty when transferring from royaltyRecipient", async function () {
      // First send some tokens to royaltyRecipient
      await stagecoin.connect(user1).transfer(royaltyRecipient.address, 1000);
      
      // Now transfer from royaltyRecipient to user2
      await stagecoin.connect(royaltyRecipient).transfer(user2.address, 500);
      
      // user2 should receive full 500
      expect(await stagecoin.balanceOf(user2.address)).to.equal(500);
    });
  });

  describe("Royalty Admin", function () {
    it("Should allow royalty admin to update royalty recipient", async function () {
      await stagecoin.connect(owner).setRoyaltyRecipient(user2.address);
      expect(await stagecoin.royaltyRecipient()).to.equal(user2.address);
    });

    it("Should allow royalty admin to update royalty basis points", async function () {
      await stagecoin.connect(owner).setRoyaltyBasisPoints(1000);
      expect(await stagecoin.royaltyBasisPoints()).to.equal(1000);
    });

    it("Should not allow setting royalty basis points above 10000", async function () {
      await expect(
        stagecoin.connect(owner).setRoyaltyBasisPoints(10001)
      ).to.be.revertedWith("Stagecoin: bp>10000");
    });

    it("Should emit events when updating royalty settings", async function () {
      await expect(stagecoin.connect(owner).setRoyaltyRecipient(user2.address))
        .to.emit(stagecoin, "RoyaltyRecipientUpdated")
        .withArgs(royaltyRecipient.address, user2.address);

      await expect(stagecoin.connect(owner).setRoyaltyBasisPoints(1000))
        .to.emit(stagecoin, "RoyaltyBasisPointsUpdated")
        .withArgs(500, 1000);
    });
  });
});

describe("SentientCents", function () {
  let SentientCents;
  let sentientCents;
  let owner;
  let minter;
  let burner;
  let royaltyRecipient;
  let user1;
  let user2;

  beforeEach(async function () {
    [owner, minter, burner, royaltyRecipient, user1, user2] = await ethers.getSigners();

    SentientCents = await ethers.getContractFactory("SentientCents");
    sentientCents = await SentientCents.deploy(
      "SentientCents",
      "SCENTS",
      owner.address,
      royaltyRecipient.address,
      250 // 2.5% royalty
    );
    await sentientCents.deployed();

    // Grant roles to minter and burner
    await sentientCents.connect(owner).grantRole(await sentientCents.MINTER_ROLE(), minter.address);
    await sentientCents.connect(owner).grantRole(await sentientCents.BURNER_ROLE(), burner.address);
  });

  describe("Decimals", function () {
    it("Should have 2 decimals", async function () {
      expect(await sentientCents.decimals()).to.equal(2);
    });
  });

  describe("Royalty Transfer", function () {
    beforeEach(async function () {
      await sentientCents.connect(minter).mint(user1.address, 10000);
    });

    it("Should transfer with royalty deduction", async function () {
      await sentientCents.connect(user1).transfer(user2.address, 1000);
      
      // user2 should receive 97.5% (975 tokens)
      expect(await sentientCents.balanceOf(user2.address)).to.equal(975);
      
      // royaltyRecipient should receive 2.5% (25 tokens)
      expect(await sentientCents.balanceOf(royaltyRecipient.address)).to.equal(25);
      
      // user1 should have 9000 left
      expect(await sentientCents.balanceOf(user1.address)).to.equal(9000);
    });
  });
});
