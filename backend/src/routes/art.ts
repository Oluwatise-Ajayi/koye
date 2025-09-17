import express from 'express';
import { AppDataSource } from '../orm';
import { Art } from '../entities/Art';
import { User } from '../entities/User';
import { pinJsonToIPFS } from '../services/ipfsService';
import { mintQueue, aiQueue } from '../queues';
const router = express.Router();
router.post('/upload', async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Art);
    const userRepo = AppDataSource.getRepository(User);
    const { title, description, fileUrl, metadata, username, artistWallet } = req.body;
    let artist = null;
    if (username) artist = await userRepo.findOneBy({ username });
    const art = repo.create({ title, description, fileUrl, metadataJson: metadata||{}, aiStatus:'pending', nftStatus:'queued', artist: artist||null });
    await repo.save(art);
    const ipfs = await pinJsonToIPFS({ title, description, file: fileUrl, metadata: metadata||{} });
    art.ipfsMetadataCid = ipfs.cid;
    art.metadataJson = { ...art.metadataJson, ipfsCid: ipfs.cid };
    await repo.save(art);
    aiQueue.add('ai-process', { artId: art.id });
    mintQueue.add('mint', { artId: art.id, artistWallet });
    res.json({ artId: art.id, status: 'pending' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'upload failed' }); }
});
router.get('/status/:artId', async (req, res) => {
  const repo = AppDataSource.getRepository(Art);
  const art = await repo.findOneBy({ id: req.params.artId });
  if (!art) return res.status(404).json({ error: 'not found' });
  res.json({ artId: art.id, aiStatus: art.aiStatus, nftStatus: art.nftStatus, nftTokenId: art.nftTokenId, nftTxHash: art.nftTxHash });
});
export default router;
