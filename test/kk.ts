import { expect } from "chai";
import { ethers } from "hardhat";

describe("SimpleStorage", function () {
  it("should store and retrieve a value", async function () {
    const Factory = await ethers.getContractFactory("SimpleStorage");
    const contract = await Factory.deploy();
    await contract.waitForDeployment();

    // Сохраняем значение
    await contract.set(42);

    // Читаем значение
    const value = await contract.get();
    expect(value).to.equal(42n); // ethers v6 возвращает bigint
  });
});
