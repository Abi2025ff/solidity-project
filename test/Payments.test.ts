import { loadFixture, expect, ethers } from "./setup";

describe("Payments", function() {
    async function deploy() {
        const [user1, user2] = await ethers.getSigners();

        const Factory = await ethers.getContractFactory("Payments");
        const payments = await Factory.deploy()
        await payments.waitForDeployment();

        return { user1, user2, payments }
    }

    it("Should be deployed", async function() {
        const { user1, user2, payments } = await loadFixture(deploy);

        expect(payments.target).to.be.properAddress;
    })

    it("Should have 0 ethers by default", async function() {
        const { payments } = await loadFixture(deploy);
        // const balance = await payments.currentBalance(); если есть в контракте функция получения баланса 
        // а если нет то использовать след вариант
        const balance = await ethers.provider.getBalance(payments.target);
        expect(balance).to.eq(0);
    })

    it("Should be possible to send funds", async function() {
        const { user1, user2, payments } = await loadFixture(deploy);

        const sum = 100; //wei
        const msg = "hello from hardhad";

        // console.log(await ethers.provider.getBalance(user1.address));
        const tx = await payments.connect(user2).pay(msg, { value: sum });
        // console.log(await ethers.provider.getBalance(user1.address));
         await tx.wait(1);
        //  console.log(tx)
        const currentBlock = await ethers.provider.getBlock(await ethers.provider.getBlockNumber())

         await expect(tx).to.changeEtherBalance(user2, -sum);

         const newPayment = await payments.get(user2.address, 0);
         expect(newPayment.message).to.eq(msg);
          expect(newPayment.amount).to.eq(sum);
           expect(newPayment.from).to.eq(user2.address);
            expect(newPayment.timestamp).to.eq(currentBlock?.timestamp);
    })
})