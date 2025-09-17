import Bull from 'bull';
const redis = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
export const mintQueue = new Bull('mint-queue', redis);
export const aiQueue = new Bull('ai-queue', redis);
