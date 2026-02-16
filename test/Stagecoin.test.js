const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Stagecoin", function () {
  let Stagecoin;
  let stage;
  let owner, minter, burner, alice, bob, royalty, other;

  beforeEach(async function () {
    [owner, minter, burner, alice, bob, royalty, other] = await ethers.getSigners();
    Stagecoin = await ethers.getContractFactory("Stagecoin");
    // Construct with admin=owner, royaltyRecipient=royalty.address, royalty=100 bps = 1%
    stage = await Stagecoin.deploy("Stagecoin", "STG", owner.address, royalty.address, 100);
    await stage.waitForDeployment();

    // grant roles to minter and burner
    await stage.connect(owner).grantRole(await stage.MINTER_ROLE(), minter.address);
    await stage.connect(owner).grantRole(await stage.BURNER_ROLE(), burner.address);
  });

  it("Minter can mint and balances update", async function () {
    await stage.connect(minter).mint(alice.address, ethers.parseEther("100"));
    expect(await stage.balanceOf(alice.address)).to.equal(ethers.parseEther("100"));
  });

  it("Transfer charges royalty and sends correct net", async function () {
    await stage.connect(minter).mint(alice.address, ethers.parseEther("100"));
    // alice -> bob: 10 STG
    const amount = ethers.parseEther("10");
    await stage.connect(alice).transfer(bob.address, amount);

    const fee = amount * 100n / 10000n; // 1% of 10 = 0.1
    const net = amount - fee;

    expect(await stage.balanceOf(royalty.address)).to.equal(fee);
    expect(await stage.balanceOf(bob.address)).to.equal(net);
  });

  it("Burning works only with BURNER_ROLE", async function () {
    await stage.connect(minter).mint(alice.address, ethers.parseEther("50"));
    // burner can burn alice's tokens (this implementation allows burning from arbitrary address by BURNER_ROLE)
    await stage.connect(burner).burn(alice.address, ethers.parseEther("10"));
    expect(await stage.balanceOf(alice.address)).to.equal(ethers.parseEther("40"));
  });

  it("Only royalty admin can change royalty", async function () {
    await expect(stage.connect(other).setRoyaltyBasisPoints(200)).to.be.reverted;
    await stage.connect(owner).setRoyaltyBasisPoints(200);
    expect(await stage.royaltyBasisPoints()).to.equal(200);
  });

  it("No royalty when recipient is address(0) or bp==0", async function () {
    await stage.connect(owner).setRoyaltyBasisPoints(0);
    await stage.connect(minter).mint(alice.address, ethers.parseEther("10"));
    await stage.connect(alice).transfer(bob.address, ethers.parseEther("1"));
    expect(await stage.balanceOf(royalty.address)).to.equal(0);
    expect(await stage.balanceOf(bob.address)).to.equal(ethers.parseEther("1"));
  });
});
