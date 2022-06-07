require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-etherscan")
require("hardhat-deploy")
require("solidity-coverage")
require("hardhat-gas-reporter")
require("hardhat-contract-sizer")
require("dotenv").config()

const RINKEBY_URL = process.env.RINKEBY_RPC_URL
const ACCOUNT = process.env.PRIVATE_KEY

module.exports = {
  defaultNetwork: "hardhat",
  solidity: "0.8.7",
  namedAccounts: {
    deployer: {
      default: 0,
      1: 0,
      rinkeby: "0x352E62b2F941962a443d993AeF51fCB496CDbcAD",
    },
    player: {
      default: 1,
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
      blockConfirmations: 1,
    },
    rinkeby: {
      url: process.env.RINKEBY_RPC_URL,
      blockConfirmations: 6,
      account: process.env.PRIVATE_KEY,
      chainId: 4,
    },
  },
  gasReporter: {
    enable: true,
    outputFile: "gasreport.txt",
    noColors: true,
    currency: "USD",
    coinmarketcap: process.env.COINMARKET_API_KEY,
  },
  etherscan: {
    apiKey: {
      rinkeby: process.env.ETHERSCAN_API_KEY,
    },
  },
  mocha: {
    timeout: 100000000,
  },
}
