const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("CommonGround", function () {
  const one = ethers.parseEther("1");
  async function deploy(threshold = 2n, seconds = 3600) {
    const [owner, treasury, alice, bob, carol] = await ethers.getSigners();
    const now = await time.latest();
    const Factory = await ethers.getContractFactory("CommonGround");
    const contract = await Factory.deploy(treasury.address, [BigInt(now + seconds), BigInt(now + seconds), BigInt(now + seconds)], [threshold, threshold, threshold]);
    return { contract, owner, treasury, alice, bob, carol };
  }
  it("validates configuration and starts each first slot active", async function () {
    const now = await time.latest(), Factory = await ethers.getContractFactory("CommonGround"), [, treasury] = await ethers.getSigners();
    await expect(Factory.deploy(ethers.ZeroAddress, [BigInt(now + 1), BigInt(now + 1), BigInt(now + 1)], [2,2,2])).to.be.revertedWith("zero treasury");
    await expect(Factory.deploy(treasury.address, [BigInt(now + 1)], [2])).to.be.revertedWith("three services required");
    const { contract } = await deploy();
    expect((await contract.getSlot(0, 0))[0]).to.equal(1);
    expect((await contract.getSlot(0, 1))[0]).to.equal(0);
  });
  it("requires exactly one MON and one support per wallet/slot", async function () {
    const { contract, alice } = await deploy();
    await expect(contract.connect(alice).contribute(0, { value: 0 })).to.be.revertedWith("send exactly one MON");
    await contract.connect(alice).contribute(0, { value: one });
    await expect(contract.connect(alice).contribute(0, { value: one })).to.be.revertedWith("already supported");
  });
  it("succeeds at threshold, accounts impact, and unlocks sequentially", async function () {
    const { contract, alice, bob } = await deploy();
    await contract.connect(alice).contribute(0, { value: one });
    await expect(contract.connect(bob).contribute(0, { value: one })).to.emit(contract, "SlotSucceeded").withArgs(0, 0, 2, one * 2n);
    expect((await contract.getSlot(0, 0))[0]).to.equal(2);
    expect((await contract.getSlot(0, 1))[0]).to.equal(1);
    expect(await contract.impactAccrued()).to.equal(one * 2n);
  });
  it("handles thirty-supporter threshold without a demo shortcut", async function () {
    const { contract } = await deploy(30n);
    const signers = await ethers.getSigners();
    for (let i = 2; i < 32; i++) await contract.connect(signers[i]).contribute(1, { value: one });
    expect((await contract.getSlot(1, 0))[0]).to.equal(2);
  });
  it("finalizes at deadline, preserves earlier success, and permits one refund", async function () {
    const { contract, alice, bob, carol } = await deploy(2n, 10);
    await contract.connect(alice).contribute(0, { value: one });
    await contract.connect(bob).contribute(0, { value: one });
    await contract.connect(carol).contribute(0, { value: one });
    const deadline = (await contract.getService(0))[0];
    await time.increaseTo(deadline);
    await expect(contract.finalizeExpired(0)).to.emit(contract, "SlotFailed").withArgs(0, 1, one);
    expect((await contract.getSlot(0, 0))[0]).to.equal(2);
    expect((await contract.getSlot(0, 1))[0]).to.equal(3);
    expect((await contract.getSlot(0, 2))[0]).to.equal(0);
    await expect(contract.connect(carol).claimRefund(0, 1)).to.emit(contract, "RefundClaimed").withArgs(0, 1, carol.address, one);
    await expect(contract.connect(carol).claimRefund(0, 1)).to.be.revertedWith("refund already claimed");
  });
  it("reserves pending and refundable funds; only treasury withdraws accrued funds", async function () {
    const { contract, treasury, alice, bob, carol } = await deploy(2n, 10);
    await contract.connect(alice).contribute(2, { value: one });
    await expect(contract.connect(alice).withdrawImpact()).to.be.revertedWith("only treasury");
    await contract.connect(bob).contribute(2, { value: one });
    await contract.connect(carol).contribute(2, { value: one });
    await time.increaseTo((await contract.getService(2))[0]);
    await contract.finalizeExpired(2);
    await expect(contract.connect(treasury).withdrawImpact()).to.emit(contract, "ImpactWithdrawn").withArgs(treasury.address, one * 2n, one * 2n);
    expect(await ethers.provider.getBalance(await contract.getAddress())).to.equal(one);
    await contract.connect(carol).claimRefund(2, 1);
    expect(await ethers.provider.getBalance(await contract.getAddress())).to.equal(0);
  });
});
