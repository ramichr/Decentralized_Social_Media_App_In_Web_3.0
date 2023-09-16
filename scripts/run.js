/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const fs = require("fs");
const { ethers } = require("hardhat");
async function main() {
  const [deployer, user1] = await ethers.getSigners();
  // We get the contract factory to deploy
  const DsocialappFactory = await ethers.getContractFactory("Dsocialapp");
  // Deploy contract
  const dsocialapp = await DsocialappFactory.deploy();
  // Save contract address file in project
  const contractsDir = __dirname + "/../src/contractsData";
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + `/dsocialapp-address.json`,
    JSON.stringify({ address: dsocialapp.address }, undefined, 2)
  );

  const contractArtifact = artifacts.readArtifactSync("Dsocialapp");

  fs.writeFileSync(
    contractsDir + `/dsocialapp.json`,
    JSON.stringify(contractArtifact, null, 2)
  );
  console.log("Dsocialapp deployed to:", dsocialapp.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
