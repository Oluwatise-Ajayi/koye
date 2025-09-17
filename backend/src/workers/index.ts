import { mintWorker } from './mintWorker';
import { aiWorker } from './aiWorker';
export function createQueueConsumers(){ mintWorker(); aiWorker(); }
