const { assert, expect } = require("chai")
const { network, getNamedAccounts, ethers, deployments } = require("hardhat")
const {
  developmentChains,
  networkConfig,
} = require("../../helper-hardhat-config.js")

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Raffle", function () {
      let raffle, vrfcoordinatorv2mock, entranceFees, deployer, interval
      const chainId = network.config.chainId
      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        raffle = await ethers.getContract("Raffle", deployer)
        vrfcoordinatorv2mock = await ethers.getContract(
          "VRFCoordinatorV2Mock",
          deployer
        )
        entranceFees = await raffle.getEntranceFee()
        interval = await raffle.getInterval()
      })
      describe("constructor", function () {
        it("initialize raffle correctly", async function () {
          const rafflestate = await raffle.getRaffleState()
          const interval = await raffle.getInterval()
          assert.equal(rafflestate.toString(), "0")
          assert.equal(interval.toString(), networkConfig[chainId]["interval"])
        })
      })
      describe("enterRaffle", function () {
        it("reverts when dont pay enough", async function () {
          await expect(raffle.enterRaffle()).to.be.revertedWith(
            "Raffle__SendMoreToEnterRaffle"
          )
        })
        it("records player when entering", async function () {
          await raffle.enterRaffle({ value: entranceFees })
          const player1 = await raffle.getPlayer(0)
          assert.equal(player1, deployer)
        })
        it("Event emit ", async function () {
          await expect(raffle.enterRaffle({ value: entranceFees })).to.emit(
            raffle,
            "RaffleEnter"
          )
        })
        it("doesnt allow when raffle is calculating", async function () {
          await raffle.enterRaffle({ value: entranceFees })
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ])
          await network.provider.send("evm_mine", [])
          await raffle.performUpkeep([])
          await expect(
            raffle.enterRaffle({ value: entranceFees })
          ).to.be.revertedWith("Raffle__RaffleNotOpen")
        })
      })
      describe("checkUpkeep", function () {
        it("returns false if enough eth not sent", async function () {
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ])
          await network.provider.send("evm_mine", [])
          const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([])
          assert(!upkeepNeeded)
        })
        it("returns false if raffle isnt open", async function () {
          await raffle.enterRaffle({ value: entranceFees })
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ])
          await network.provider.send("evm_mine", [])
          await raffle.performUpkeep([])
          const rafflestate = await raffle.getRaffleState()
          const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([])
          assert.equal(rafflestate.toString(), "1")
          assert.equal(upkeepNeeded, false)
        })
      })
      describe("performUpkeep", function () {
        it("run if checkupkeep is true", async function () {
          await raffle.enterRaffle({ value: entranceFees })
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ])
          await network.provider.send("evm_mine", [])
          const tx = await raffle.performUpkeep([])
          assert(tx)
        })
        it("reverts when checkupkeep is false", async function () {
          await expect(raffle.performUpkeep([])).to.be.revertedWith(
            "Raffle__UpkeepNotNeeded"
          )
        })
      })
    })
