import { LRUCache } from 'lru-cache';
import crypto from 'crypto';

const cache = new LRUCache<string, object>({
  max: 500,
  ttl: 1000 * 60 * 15, // 15 minutes
});

export function getCacheKey(query: string): string {
  return crypto.createHash('md5').update(query).digest('hex');
}

export function getCached(key: string): object | undefined {
  return cache.get(key);
}

export function setCache(key: string, value: object): void {
  cache.set(key, value);
}
