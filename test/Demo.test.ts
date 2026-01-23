import { expect, ethers } from "./setup";
import { Demo } from "../typechain-types";
import { Signer, TransactionResponse } from "ethers";

describe("Demo", function() {
    let owner: Signer; 
    let other_addr: Signer;
    let demo: Demo;

    beforeEach(async function () {
        [owner, other_addr] = await ethers.getSigners();

        const DemoContract = await ethers.getContractFactory("Demo");
        demo = await DemoContract.deploy();
        await demo.waitForDeployment();
    })

    async function sendMoneyTx(sender: Signer, amount: bigint = 100n): Promise<TransactionResponse> {
        const txData = {
            // до этотго выходила ошибка из за 
            // to: demo.address,
            to: await demo.getAddress(),
            value: amount
        }

        const tx = sender.sendTransaction(txData);
        return tx
    }

    async function sendMoney(sender: Signer, amount: bigint = 100n) {
        const tx = await sendMoneyTx(sender, amount);
        const demorec = await tx.wait();

        const block = await ethers.provider.getBlock(demorec!.blockNumber);
        return {
            tx,
            amount,
            demorec,
            timestamp: block?.timestamp,
        }
    }

    it("should allow to send money", async function() {
       const amount = 100n;
       const balanceBefore = await ethers.provider.getBalance(await demo.getAddress());

       const { tx, timestamp } = await sendMoney(other_addr, amount);

       const balanceAfter = await ethers.provider.getBalance(await demo.getAddress());
       expect(balanceAfter - balanceBefore).to.eq(amount);

       expect(tx).to.emit(demo, "Paid").withArgs(await other_addr.getAddress(), amount, timestamp);
    })

    it("should allow owner to withdraw funds", async function() {
       const { amount } = await sendMoney(other_addr);

       await expect(() => demo.withDraw(owner)).to.changeEtherBalances([demo, owner], [-amount, amount])
    })

     it("should allow other address to withdraw funds", async function() {
       const { amount } = await sendMoney(other_addr);

       await expect((demo.connect(other_addr)).withDraw(owner)).to.be.revertedWith("you are not an owner");
       // не использовать стелочную функцию выше потому что она вызывает дважды чтобы проверить до и после но revertedWith не поддерживает этого
    })
})