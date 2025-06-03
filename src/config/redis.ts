// redis.ts placeholder// src/config/redis.ts
import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

const {
  REDIS_HOST, REDIS_PORT, REDIS_PASSWORD
} = process.env;

// Initialize Redis client
export const redisClient = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT ? Number(REDIS_PORT) : 6379,
  password: REDIS_PASSWORD || undefined,
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});
redisClient.on('error', (err) => {
  console.error('Redis connection error:', err);
});
