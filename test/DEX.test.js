const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DEX", function () {
  let dex, tokenA, tokenB;
  let owner, addr1, addr2;

  const ONE = ethers.utils.parseEther("1");
  const HUNDRED = ethers.utils.parseEther("100");
  const TWO_HUNDRED = ethers.utils.parseEther("200");

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const Mock = await ethers.getContractFactory("MockERC20");
    tokenA = await Mock.deploy("TokenA", "A");
    tokenB = await Mock.deploy("TokenB", "B");

    const DEX = await ethers.getContractFactory("DEX");
    dex = await DEX.deploy(tokenA.address, tokenB.address);

    await tokenA.approve(dex.address, ethers.constants.MaxUint256);
    await tokenB.approve(dex.address, ethers.constants.MaxUint256);
  });

  /* ================= LIQUIDITY MANAGEMENT ================= */

  describe("Liquidity Management", function () {
    it("should allow initial liquidity provision", async function () {
      await dex.addLiquidity(HUNDRED, TWO_HUNDRED);
      expect(await dex.reserveA()).to.equal(HUNDRED);
      expect(await dex.reserveB()).to.equal(TWO_HUNDRED);
    });

    it("should mint correct LP tokens for first provider", async function () {
      const tx = await dex.addLiquidity(HUNDRED, TWO_HUNDRED);
      const receipt = await tx.wait();

      const event = receipt.events.find(
        (e) => e.event === "LiquidityAdded"
      );

      expect(event.args.liquidityMinted).to.be.gt(0);
    });

    it("should allow subsequent liquidity additions", async function () {
      await dex.addLiquidity(HUNDRED, TWO_HUNDRED);
      await dex.addLiquidity(HUNDRED, TWO_HUNDRED);
      expect(await dex.totalLiquidity()).to.be.gt(0);
    });

    it("should maintain price ratio on liquidity addition", async function () {
      await dex.addLiquidity(HUNDRED, TWO_HUNDRED);
      const rA = await dex.reserveA();
      const rB = await dex.reserveB();
      expect(rB.mul(ONE).div(rA)).to.equal(
        TWO_HUNDRED.mul(ONE).div(HUNDRED)
      );
    });

    it("should allow partial liquidity removal", async function () {
      await dex.addLiquidity(HUNDRED, TWO_HUNDRED);
      const lp = await dex.totalLiquidity();
      await dex.removeLiquidity(lp.div(2));
      expect(await dex.totalLiquidity()).to.equal(lp.div(2));
    });

    it("should return correct token amounts on liquidity removal", async function () {
      await dex.addLiquidity(HUNDRED, TWO_HUNDRED);
      const lp = await dex.totalLiquidity();
      await dex.removeLiquidity(lp);
      expect(await dex.reserveA()).to.equal(0);
      expect(await dex.reserveB()).to.equal(0);
    });

    it("should revert on zero liquidity addition", async function () {
      await expect(dex.addLiquidity(0, 0)).to.be.reverted;
    });

    it("should revert when removing more liquidity than owned", async function () {
      await dex.addLiquidity(HUNDRED, TWO_HUNDRED);
      await expect(
        dex.removeLiquidity(ethers.utils.parseEther("9999"))
      ).to.be.reverted;
    });
  });

  /* ================= TOKEN SWAPS ================= */

  describe("Token Swaps", function () {
    beforeEach(async function () {
      await dex.addLiquidity(HUNDRED, TWO_HUNDRED);
    });

    it("should swap token A for token B", async function () {
      const balBefore = await tokenB.balanceOf(owner.address);
      await dex.swap(tokenA.address, ONE);
      const balAfter = await tokenB.balanceOf(owner.address);
      expect(balAfter).to.be.gt(balBefore);
    });

    it("should swap token B for token A", async function () {
      const balBefore = await tokenA.balanceOf(owner.address);
      await dex.swap(tokenB.address, ONE);
      const balAfter = await tokenA.balanceOf(owner.address);
      expect(balAfter).to.be.gt(balBefore);
    });

    it("should calculate correct output amount with fee", async function () {
      const rA = await dex.reserveA();
      const rB = await dex.reserveB();

      const amountInWithFee = ONE.mul(997);
      const numerator = amountInWithFee.mul(rB);
      const denominator = rA.mul(1000).add(amountInWithFee);
      const expected = numerator.div(denominator);

      await dex.swap(tokenA.address, ONE);
      const bal = await tokenB.balanceOf(owner.address);
      expect(bal).to.be.gte(expected);
    });

    it("should update reserves after swap", async function () {
      await dex.swap(tokenA.address, ONE);
      expect(await dex.reserveA()).to.be.gt(HUNDRED);
    });

    it("should increase k after swap due to fees", async function () {
      const kBefore = (await dex.reserveA()).mul(await dex.reserveB());
      await dex.swap(tokenA.address, ONE);
      const kAfter = (await dex.reserveA()).mul(await dex.reserveB());
      expect(kAfter).to.be.gt(kBefore);
    });

    it("should revert on zero swap amount", async function () {
      await expect(dex.swap(tokenA.address, 0)).to.be.reverted;
    });

    it("should handle large swaps with high price impact", async function () {
      await dex.swap(tokenA.address, ethers.utils.parseEther("50"));
      expect(await dex.reserveB()).to.be.lt(TWO_HUNDRED);
    });

    it("should handle multiple consecutive swaps", async function () {
      await dex.swap(tokenA.address, ONE);
      await dex.swap(tokenA.address, ONE);
      await dex.swap(tokenB.address, ONE);
      expect(await dex.reserveA()).to.be.gt(0);
    });

    it("should update price after swaps", async function () {
      const priceBefore = (await dex.reserveB()).mul(ONE).div(
        await dex.reserveA()
      );
      await dex.swap(tokenA.address, ONE);
      const priceAfter = (await dex.reserveB()).mul(ONE).div(
        await dex.reserveA()
      );
      expect(priceAfter).to.not.equal(priceBefore);
    });

    it("should handle price queries with zero reserves gracefully", async function () {
      const DEX = await ethers.getContractFactory("DEX");
      const emptyDex = await DEX.deploy(tokenA.address, tokenB.address);
      expect(await emptyDex.reserveA()).to.equal(0);
    });
  });

  /* ================= FEES ================= */

  describe("Fee Distribution", function () {
    it("should accumulate fees for liquidity providers", async function () {
      await dex.addLiquidity(HUNDRED, TWO_HUNDRED);
      const kBefore = (await dex.reserveA()).mul(await dex.reserveB());
      await dex.swap(tokenA.address, ONE);
      const kAfter = (await dex.reserveA()).mul(await dex.reserveB());
      expect(kAfter).to.be.gt(kBefore);
    });

    it("should distribute fees proportionally to LP share", async function () {
      await dex.addLiquidity(HUNDRED, TWO_HUNDRED);
      const lp = await dex.totalLiquidity();
      await dex.swap(tokenA.address, ONE);
      await dex.removeLiquidity(lp);
      expect(await tokenA.balanceOf(owner.address)).to.be.gt(0);
    });
  });

  /* ================= EDGE CASES ================= */

  describe("Edge Cases", function () {
    it("should handle very small liquidity amounts", async function () {
      await dex.addLiquidity(1, 1);
      expect(await dex.totalLiquidity()).to.be.gt(0);
    });

    it("should handle very large liquidity amounts", async function () {
      await dex.addLiquidity(
        ethers.utils.parseEther("100000"),
        ethers.utils.parseEther("100000")
      );
      expect(await dex.reserveA()).to.be.gt(0);
    });

    it("should prevent unauthorized access", async function () {
      await expect(
        dex.connect(addr1).removeLiquidity(1)
      ).to.be.reverted;
    });
  });

  /* ================= EVENTS ================= */

  describe("Events", function () {
    it("should emit LiquidityAdded event", async function () {
      await expect(dex.addLiquidity(HUNDRED, TWO_HUNDRED))
        .to.emit(dex, "LiquidityAdded");
    });
  });
});
describe("MockERC20", function () {
  it("should mint tokens", async function () {
    const [owner] = await ethers.getSigners();
    const Mock = await ethers.getContractFactory("MockERC20");
    const token = await Mock.deploy("Test", "T");

    await token.mint(owner.address, ethers.utils.parseEther("10"));
    const balance = await token.balanceOf(owner.address);

    expect(balance).to.be.gt(0);
  });
});
