export interface ExpiringCacheItem {
  content: any;
  meta: {
    createdAt: number;
    ttl: number;
  };
}

export interface Options {
  ttl?: number;
  isLazy?: boolean;
  isCachedForever?: boolean;
  cacheKey?: string;
  noop?: boolean;
  refreshCache?: boolean;
}

export class RedisConfig {
  [x: string]: any;
  host?: string;
  port?: number;
}

export enum CacheType {
  REDIS = 'redis',
  MEMORY = 'memory',
}

export interface CacheConfig {
  type?: CacheType | string;
  redis?: RedisConfig;
}

export interface LabShareCacheConfig {}
