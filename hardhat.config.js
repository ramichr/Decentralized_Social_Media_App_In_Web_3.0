require("dotenv").config();
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");

const { API_URL, PRIVATE_KEY } = process.env;

module.exports = {
  solidity: "0.8.4",
  defaultNetwork: "sepolia",
  networks: {
    hardhat: {},
    sepolia: {
      url: API_URL,
      accounts: [`0x${PRIVATE_KEY}`],
    },
  },
};

// module.exports = {
//   defaultNetwork: "hardhat",
//   networks: {
//     hardhat: {
//       chainId: 1337,
//     },
//   },
//   solidity: {
//     version: "0.8.4",
//   },
// };
