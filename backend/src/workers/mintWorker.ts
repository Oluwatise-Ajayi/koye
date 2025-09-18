import { mintQueue } from "../queues";
import { AppDataSource } from "../orm";
import { Art } from "../entities/Art";
import { ethers } from "ethers";
const BATCH_SIZE = parseInt(process.env.MINT_BATCH_SIZE || "20");
const BATCH_INTERVAL =
  parseInt(process.env.MINT_BATCH_INTERVAL_SEC || "60") * 1000;
let buffer: any[] = [];
let timer: NodeJS.Timeout | null = null;
function resetTimer() {
  if (timer) clearTimeout(timer);
  timer = setTimeout(
    () => processBatch().catch((e) => console.error(e)),
    BATCH_INTERVAL
  );
}
async function processBatch() {
  if (buffer.length === 0) return;
  const batch = buffer.splice(0, buffer.length);
  try {
    const provider = new ethers.JsonRpcProvider(
      process.env.POLYGON_AMOY_RPC_URL
    );
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY || "", provider);
    const abi = require("../abi/KoyeCertificate.json").abi;
    const contract = new ethers.Contract(
      process.env.KOYE_CONTRACT_ADDRESS || "",
      abi,
      wallet
    );
    const recipients = [];
    const metadataHashes = [];
    const contentTypes = [];
    for (const item of batch) {
      const repo = AppDataSource.getRepository(Art);
      const art = await repo.findOneBy({ id: item.artId });
      if (!art) continue;
      const metadataJSON = JSON.stringify(art.metadataJson || {});
      const metadataHash = ethers.keccak256(ethers.toUtf8Bytes(metadataJSON));
      recipients.push(item.artistWallet || wallet.address);
      metadataHashes.push(metadataHash);
      contentTypes.push(0);
    }
    if (recipients.length === 0) return;
    const tx = await contract.batchMint(
      recipients,
      metadataHashes,
      contentTypes,
      { gasLimit: 5_000_000 }
    );
    const receipt = await tx.wait();
    console.log("batch mint tx", receipt.transactionHash);
    for (const item of batch) {
      const repo = AppDataSource.getRepository(Art);
      const art = await repo.findOneBy({ id: item.artId });
      if (!art) continue;
      art.nftStatus = "minted_pending";
      art.nftTxHash = receipt.transactionHash;
      await repo.save(art);
    }
  } catch (err) {
    console.error("batch failed", err);
  }
  timer = null;
}
export function mintWorker() {
  mintQueue.process(async (job) => {
    const { artId, artistWallet } = job.data;
    buffer.push({ artId, artistWallet });
    if (buffer.length >= BATCH_SIZE) await processBatch();
    else resetTimer();
    return { queued: true };
  });
}
