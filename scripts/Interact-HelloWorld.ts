import { ethers } from "hardhat";

async function main() {
    const HelloWorld = await ethers.getContractFactory("HelloWorld");
    const [owner, addr1] = await ethers.getSigners()

    const helloworld = await HelloWorld.deploy();
    await helloworld.waitForDeployment();
    const contractAddress = await helloworld.getAddress()
    console.log("Deployed to :", contractAddress)

    const initialGreeting = await helloworld.greeting()
    console.log("Initial greeting:", initialGreeting);

    await helloworld.setGreeting("Hello fron TypeScript")
    const newGreeting = await helloworld.greeting();
    console.log("Update greeting:", newGreeting);

    try {
        await helloworld.connect(addr1).setGreeting("Hack attemp!");
        console.log("ERROR: Non-owner changed greeting!")
    } catch(error) {
        console.log("Good: Non-owner cannot change greeting."); 
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1
});