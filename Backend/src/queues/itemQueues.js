// backend: queues/itemQueue.js — defines the queue
import { Queue } from "bullmq";

const redisPassword = process.env.REDIS_PASSWORD;
const connection = { 
  host: process.env.REDIS_HOST || "localhost", 
  port: process.env.REDIS_PORT || 6379,
  password: redisPassword ? redisPassword : undefined
};

const itemQueue = new Queue("item-processing", { connection });
export default itemQueue;