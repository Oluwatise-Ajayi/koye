import { aiQueue } from '../queues';
import { AppDataSource } from '../orm';
import { Art } from '../entities/Art';
export function aiWorker(){
  aiQueue.process(async (job)=> {
    const { artId } = job.data;
    console.log('AI job', artId);
    await new Promise(r=>setTimeout(r,1500));
    const repo = AppDataSource.getRepository(Art);
    const art = await repo.findOneBy({ id: artId });
    if (!art) return;
    art.aiStatus = 'success';
    await repo.save(art);
    return { ok:true };
  });
}
