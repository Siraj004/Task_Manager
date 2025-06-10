import { Redis } from '@upstash/redis';
import dotenv from 'dotenv';

dotenv.config();

export const redisClient = new Redis({
  url: process.env.REDIS_URL!,
  token: process.env.REDIS_TOKEN!,
});

// Optional test
redisClient.set("test-key", "hello").then(() => {
  console.log("Redis Upstash connection successful.");
}).catch((err) => {
  console.error("Redis Upstash connection failed:", err);
});
