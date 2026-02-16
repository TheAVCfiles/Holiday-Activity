const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SentientCents", function () {
  let SentientCents, cents;
  let owner, minter, burner, alice, bob, royalty, other;

  beforeEach(async function () {
    [owner, minter, burner, alice, bob, royalty, other] = await ethers.getSigners();
    SentientCents = await ethers.getContractFactory("SentientCents");
    // SentientCents has 2 decimals. We'll mint in cents (i.e. 100.00 = 10000 units)
    cents = await SentientCents.deploy("SentientCents", "SCT", owner.address, royalty.address, 50); // 0.5%
    await cents.deployed();

    await cents.connect(owner).grantRole(await cents.MINTER_ROLE(), minter.address);
    await cents.connect(owner).grantRole(await cents.BURNER_ROLE(), burner.address);
  });

  it("decimals is 2", async function () {
    expect(await cents.decimals()).to.equal(2);
  });

  it("mint and transfer with royalty (2 decimals)", async function () {
    // mint 100.00 -> 10000 units
    const minted = ethers.utils.parseUnits("100.00", 2);
    await cents.connect(minter).mint(alice.address, minted);
    expect(await cents.balanceOf(alice.address)).to.equal(minted);

    // alice -> bob 10.00 (1000 units)
    const amount = ethers.utils.parseUnits("10.00", 2);
    await cents.connect(alice).transfer(bob.address, amount);

    const fee = amount.mul(50).div(10000); // 0.5% of 1000 = 5 units -> 0.05
    const net = amount.sub(fee);

    expect(await cents.balanceOf(royalty.address)).to.equal(fee);
    expect(await cents.balanceOf(bob.address)).to.equal(net);
  });

  it("only burner role can burn", async function () {
    const minted = ethers.utils.parseUnits("5.00", 2);
    await cents.connect(minter).mint(alice.address, minted);
    await cents.connect(owner).grantRole(await cents.BURNER_ROLE(), burner.address);
    await cents.connect(burner).burn(alice.address, ethers.utils.parseUnits("1.00", 2));
    expect(await cents.balanceOf(alice.address)).to.equal(ethers.utils.parseUnits("4.00", 2));
  });
});
