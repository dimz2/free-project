import { Redis } from "@upstash/redis";

// Baca UPSTASH_REDIS_REST_URL & UPSTASH_REDIS_REST_TOKEN otomatis dari env.
export const redis = Redis.fromEnv();
