"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mintWorker = mintWorker;
const queues_1 = require("../queues");
const orm_1 = require("../orm");
const Art_1 = require("../entities/Art");
const ethers_1 = require("ethers");
const BATCH_SIZE = parseInt(process.env.MINT_BATCH_SIZE || '20');
const BATCH_INTERVAL = parseInt(process.env.MINT_BATCH_INTERVAL_SEC || '60') * 1000;
let buffer = [];
let timer = null;
function resetTimer() { if (timer)
    clearTimeout(timer); timer = setTimeout(() => processBatch().catch(e => console.error(e)), BATCH_INTERVAL); }
async function processBatch() {
    if (buffer.length === 0)
        return;
    const batch = buffer.splice(0, buffer.length);
    try {
        const provider = new ethers_1.ethers.JsonRpcProvider(process.env.POLYGON_AMOY_RPC_URL);
        const wallet = new ethers_1.ethers.Wallet(process.env.PRIVATE_KEY || '', provider);
        const abi = require('../abi/KoyeCertificate.json').abi;
        const contract = new ethers_1.ethers.Contract(process.env.KOYE_CONTRACT_ADDRESS || '', abi, wallet);
        const recipients = [];
        const metadataHashes = [];
        const contentTypes = [];
        for (const item of batch) {
            const repo = orm_1.AppDataSource.getRepository(Art_1.Art);
            const art = await repo.findOneBy({ id: item.artId });
            if (!art)
                continue;
            const metadataJSON = JSON.stringify(art.metadataJson || {});
            const metadataHash = ethers_1.ethers.keccak256(ethers_1.ethers.toUtf8Bytes(metadataJSON));
            recipients.push(item.artistWallet || wallet.address);
            metadataHashes.push(metadataHash);
            contentTypes.push(0);
        }
        if (recipients.length === 0)
            return;
        const tx = await contract.batchMint(recipients, metadataHashes, contentTypes, { gasLimit: 5000000 });
        const receipt = await tx.wait();
        console.log('batch mint tx', receipt.transactionHash);
        for (const item of batch) {
            const repo = orm_1.AppDataSource.getRepository(Art_1.Art);
            const art = await repo.findOneBy({ id: item.artId });
            if (!art)
                continue;
            art.nftStatus = 'minted_pending';
            art.nftTxHash = receipt.transactionHash;
            await repo.save(art);
        }
    }
    catch (err) {
        console.error('batch failed', err);
    }
    timer = null;
}
function mintWorker() {
    queues_1.mintQueue.process(async (job) => {
        const { artId, artistWallet } = job.data;
        buffer.push({ artId, artistWallet });
        if (buffer.length >= BATCH_SIZE)
            await processBatch();
        else
            resetTimer();
        return { queued: true };
    });
}
