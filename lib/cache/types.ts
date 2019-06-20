export interface IExpiringCacheItem {
  content: any;
  meta: {
    createdAt: number;
    ttl: number;
  };
}

export interface IOptions {
  ttl?: number;
  isLazy?: boolean;
  isCachedForever?: boolean;
  cacheKey?: string;
  noop?: boolean;
  refreshCache?: boolean;
}