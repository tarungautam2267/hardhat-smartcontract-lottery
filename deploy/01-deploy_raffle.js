const { network, ethers } = require("hardhat")
const {
  developmentChains,
  networkConfig,
} = require("../helper-hardhat-config.js")
const { verify } = require("../utils/verify.js")
require("dotenv").config()

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = network.config.chainId
  let vrfcoordinatorv2mockaddress, subscriptionId
  if (developmentChains.includes(network.name)) {
    const vrfcoordinatorv2mock = await ethers.getContract(
      "VRFCoordinatorV2Mock"
    )
    vrfcoordinatorv2mockaddress = vrfcoordinatorv2mock.address
    const tx = await vrfcoordinatorv2mock.createSubscription()
    const txrec = await tx.wait(1)
    subscriptionId = await txrec.events[0].args.subId
    const FUND_AMOUNT = ethers.utils.parseEther("5")
    await vrfcoordinatorv2mock.fundSubscription(subscriptionId, FUND_AMOUNT)
  } else {
    vrfcoordinatorv2mockaddress = networkConfig[chainId]["vrfCoordinatorV2"]
    subscriptionId = networkConfig[chainId]["subscriptionId"]
  }
  const entranceFees = networkConfig[chainId]["entranceFees"]
  const gasLane = networkConfig[chainId]["gasLane"]
  const callbackGasLimit = networkConfig[chainId]["callbackGasLimit"]
  const interval = networkConfig[chainId]["interval"]
  const argse = [
    vrfcoordinatorv2mockaddress,
    subscriptionId,
    gasLane,
    interval,
    entranceFees,
    callbackGasLimit,
  ]
  const raffle = await deploy("Raffle", {
    from: deployer,
    args: argse,
    log: true,
    waitConfirmations: 1,
  })

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(raffle.address, argse)
  }
  log(
    "------------------------------------------------------------------------------"
  )
}
module.exports.tags = ["all", "raffle"]
