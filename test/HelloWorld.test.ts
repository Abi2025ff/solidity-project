import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer } from "ethers";
import { HelloWorld, HelloWorld__factory } from "../typechain-types";

describe("HelloWorld", function () {
  let helloWorld: HelloWorld;
  let owner: Signer;
  let addr1: Signer;

  beforeEach(async function () {
    const HelloWorldFactory = (await ethers.getContractFactory(
      "HelloWorld"
    )) as HelloWorld__factory;
    [owner, addr1] = await ethers.getSigners();
    helloWorld = await HelloWorldFactory.deploy();
    await helloWorld.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct initial greeting", async function () {
      expect(await helloWorld.greeting()).to.equal("Hello, Solidity!");
    });

    it("Should set the deployer as the owner", async function () {
      expect(await helloWorld.owner()).to.equal(await owner.getAddress());
    });
  });

  describe("setGreeting", function () {
    it("Should allow the owner to update the greeting", async function () {
      await helloWorld.setGreeting("Hi, Ethereum!");
      expect(await helloWorld.greeting()).to.equal("Hi, Ethereum!");
    });

    it("Should revert if called by a non-owner", async function () {
      await expect(
        helloWorld.connect(addr1).setGreeting("Not allowed!")
      ).to.be.revertedWithCustomError(helloWorld, "OwnableUnauthorizedAccount");
    });
  });
});