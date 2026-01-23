import { expect } from "chai";
import { ethers } from "hardhat";
import { AucEngine } from "../typechain-types";
import { Signer } from "ethers";
import { time } from "@nomicfoundation/hardhat-network-helpers"
import { parseEther } from "ethers";

describe("AucEngine", function () {
    let owner: Signer;
    let buyer: Signer;
    let auct: AucEngine;
    let seller: Signer;

    beforeEach(async function () {
        [owner, seller, buyer] = await ethers.getSigners();

        const factory = await ethers.getContractFactory("AucEngine");
        auct = await factory.deploy();
        await auct.waitForDeployment();
    });

    it("Should deploy and set owner correctly", async function() {
      const contractOwner = await auct.owner();
      expect(contractOwner).to.eq(await owner.getAddress());
    });

    
    it("Should create an auction", async function() {
      const startingPrice = ethers.parseEther("5");
      const discountRate = ethers.parseEther("0.00001");
      const item = "Vintage watch";
      const duration = 60*60*24;

      await expect(auct.connect(seller).createAuction(startingPrice, discountRate, item, duration)).to.emit(auct, "AuctionCreated").withArgs(0, item, startingPrice, duration);

      const auction = await auct.auctions(0);
      expect(auction.seller).to.equal(await seller.getAddress());
      expect(auction.startingPrice).to.equal(startingPrice);
      expect(auction.item).to.equal(item);

    });

    async function getTimestamp(bn: any) {
        return (
            await ethers.provider.getBlock(bn)
        )?.timestamp
    } 

    it("Timestamp", async function() {
        const duration = 60*60*24;
        const tx = await auct.connect(seller).createAuction(
            parseEther("5"),
            parseEther("0.00001"),
            "hello",
            duration
        )

        const auction = await auct.auctions(0);

        const time = await getTimestamp(tx.blockNumber);
        expect(auction.endAt).to.equal(time! + duration);
    });

    describe("buy", function () {
        it("allows to buy", async function () {
           const duration = 60*60*24;
           const tx = await auct.connect(seller).createAuction(
            parseEther("5"),
            parseEther("0.00001"),
            "hello",
            duration
        )

        await time.increase(1000);


        const txBuy = await auct.connect(buyer).buy(0, {value: parseEther("6")});
        const Auctions = await auct.auctions(0)
        const finalPrice = Auctions.finalPrice;
        const Price = finalPrice - ((finalPrice * 10n) / 100n);

        await expect(() => Promise.resolve(txBuy)).to.changeEtherBalance(seller, Price)
        await expect(txBuy).to.emit(auct, "AuctionEnded").withArgs(0, finalPrice, await buyer.getAddress());

        expect((await auct.auctions(0)).stopped).to.be.true;

        await expect(auct.connect(buyer).buy(0, {value: parseEther("6")})).to.be.revertedWith('stopped!');
        })
    })
})