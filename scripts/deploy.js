require("dotenv").config();

async function main() {
  // Use fully qualified contract name to avoid artifact ambiguity
  const GrievanceRegistry = await ethers.getContractFactory("contracts/GrievanceRegistry.sol:GrievanceRegistry");
  const contract = await GrievanceRegistry.deploy();
  await contract.deployed();
  console.log("GrievanceRegistry deployed to:", contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
