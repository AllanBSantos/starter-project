import Bull from 'bull';
import { processReport } from './report.worker';
import { logger } from '../utils/logger';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

/**
 * Queue for processing report resolution
 */
export const reportQueue = new Bull('report-processing', REDIS_URL, {
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: 100,
    removeOnFail: 100,
  },
});

/**
 * Register worker processor
 */
reportQueue.process('process-report', 5, async (job) => {
  return await processReport(job);
});

/**
 * Queue event listeners
 */
reportQueue.on('completed', (job, result) => {
  logger.info(`Job ${job.id} completed`, { result });
});

reportQueue.on('failed', (job, err) => {
  logger.error(`Job ${job?.id} failed`, { error: err.message });
});

reportQueue.on('stalled', (job) => {
  logger.warn(`Job ${job.id} stalled`);
});

/**
 * Graceful shutdown
 */
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, closing queue...');
  await reportQueue.close();
  process.exit(0);
});
