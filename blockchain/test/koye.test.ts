import { expect } from "chai";
import { ethers } from "hardhat";
describe("KoyeCertificate", function(){
  it("batch mints", async function(){
    const [owner, a, b] = await ethers.getSigners();
    const Koye = await ethers.getContractFactory("KoyeCertificate");
    const koye = await Koye.deploy("Koye Certificate","KOYE","ipfs://");
    await koye.deployed();
    await koye.setMinter(owner.address, true);
    const hashA = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(JSON.stringify({ipfs:"cidA"})));
    const hashB = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(JSON.stringify({ipfs:"cidB"})));
    const tx = await koye.batchMint([a.address,b.address],[hashA,hashB],[0,0]);
    const receipt = await tx.wait();
    const evs = receipt.events?.filter(e => e.event === "CertificateMinted");
    expect(evs && evs.length).to.equal(2);
  });
});
