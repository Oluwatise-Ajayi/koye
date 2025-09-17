import { ethers } from "hardhat";
async function main(){
  const Koye = await ethers.getContractFactory("KoyeCertificate");
  const baseURI = "ipfs://";
  const koye = await Koye.deploy("Koye Certificate","KOYE",baseURI);
  await koye.deployed();
  console.log("deployed:",koye.address);
}
main().catch(e=>{console.error(e);process.exit(1);});
