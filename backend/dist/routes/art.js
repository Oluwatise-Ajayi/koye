"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const orm_1 = require("../orm");
const Art_1 = require("../entities/Art");
const User_1 = require("../entities/User");
const ipfsService_1 = require("../services/ipfsService");
const queues_1 = require("../queues");
const router = express_1.default.Router();
router.post('/upload', async (req, res) => {
    try {
        const repo = orm_1.AppDataSource.getRepository(Art_1.Art);
        const userRepo = orm_1.AppDataSource.getRepository(User_1.User);
        const { title, description, fileUrl, metadata, username, artistWallet } = req.body;
        let artist = null;
        if (username)
            artist = await userRepo.findOneBy({ username });
        const art = repo.create({ title, description, fileUrl, metadataJson: metadata || {}, aiStatus: 'pending', nftStatus: 'queued', artist: artist || null });
        await repo.save(art);
        const ipfs = await (0, ipfsService_1.pinJsonToIPFS)({ title, description, file: fileUrl, metadata: metadata || {} });
        art.ipfsMetadataCid = ipfs.cid;
        art.metadataJson = { ...art.metadataJson, ipfsCid: ipfs.cid };
        await repo.save(art);
        queues_1.aiQueue.add('ai-process', { artId: art.id });
        queues_1.mintQueue.add('mint', { artId: art.id, artistWallet });
        res.json({ artId: art.id, status: 'pending' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'upload failed' });
    }
});
router.get('/status/:artId', async (req, res) => {
    const repo = orm_1.AppDataSource.getRepository(Art_1.Art);
    const art = await repo.findOneBy({ id: req.params.artId });
    if (!art)
        return res.status(404).json({ error: 'not found' });
    res.json({ artId: art.id, aiStatus: art.aiStatus, nftStatus: art.nftStatus, nftTokenId: art.nftTokenId, nftTxHash: art.nftTxHash });
});
exports.default = router;
