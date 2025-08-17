import { Queue } from 'bullmq';

const manualFileProcessingQueue = new Queue('manualFileProcessingQueue', {
  connection: {
    host: "localhost",
    port: 6379,
  },
  defaultJobOptions: {
    attempts: 4,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: {
      age: 3600
    },
    removeOnFail: 1000, 
  },
});

export default manualFileProcessingQueue;