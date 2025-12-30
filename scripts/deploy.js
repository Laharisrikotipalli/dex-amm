async function main() {
  const [deployer] = await ethers.getSigners();

  const Mock = await ethers.getContractFactory("MockERC20");
  const tokenA = await Mock.deploy("TokenA", "A");
  const tokenB = await Mock.deploy("TokenB", "B");

  const DEX = await ethers.getContractFactory("DEX");
  const dex = await DEX.deploy(tokenA.address, tokenB.address);

  console.log("TokenA:", tokenA.address);
  console.log("TokenB:", tokenB.address);
  console.log("DEX:", dex.address);
}

main().catch(console.error);
