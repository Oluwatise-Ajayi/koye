"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiWorker = aiWorker;
const queues_1 = require("../queues");
const orm_1 = require("../orm");
const Art_1 = require("../entities/Art");
function aiWorker() {
    queues_1.aiQueue.process(async (job) => {
        const { artId } = job.data;
        console.log('AI job', artId);
        await new Promise(r => setTimeout(r, 1500));
        const repo = orm_1.AppDataSource.getRepository(Art_1.Art);
        const art = await repo.findOneBy({ id: artId });
        if (!art)
            return;
        art.aiStatus = 'success';
        await repo.save(art);
        return { ok: true };
    });
}
