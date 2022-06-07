const { ethers, network } = require("hardhat")
const fs = require("fs")

const FRONTEND_ADDRESS_FILE_LOCATION =
  "nextjs-smartcontract-lottery/constants/contractAddresses.json"
const FRONTEND_ABI_FILE = "nextjs-smartcontract-lottery/constants/abi.json"
module.exports = async function () {
  if (process.env.UPDATE_FRONTEND) {
    console.log("Updating...")
    updateContractAddress()
    updateabi()
  }
}

async function updateabi() {
  const raffle = await ethers.getContract("Raffle")
  fs.writeFileSync(
    FRONTEND_ABI_FILE,
    raffle.interface.format(ethers.utils.FormatTypes.json)
  )
}

async function updateContractAddress() {
  const raffle = await ethers.getContract("Raffle")
  const chainId = network.config.chainId.toString()
  const currentAddress = JSON.parse(
    fs.readFileSync(FRONTEND_ADDRESS_FILE_LOCATION, "utf8")
  )
  if (chainId in currentAddress) {
    if (!currentAddress[chainId].includes(raffle.address)) {
      currentAddress[chainId].push(raffle.address)
    }
  }
  currentAddress[chainId] = raffle.address
  fs.writeFileSync(
    FRONTEND_ADDRESS_FILE_LOCATION,
    JSON.stringify(currentAddress)
  )
}
module.exports.tags = ["all", "frontend"]
