'use strict';

export class CacheConstants {
  public static LABSHARE_CACHE: string = 'LABSHARE_CACHE';
  public static REDIS_OPTIONS: string = 'services.cache.redisOptions';
  public static CACHE_STRATEGY: string = 'services.cache.strategy';
  public static MEMORY: string = 'memory';
  public static REDIS: string = 'redis';
  public static TTL_1000_SEC: number = 1000;
  public static TTL_60_SEC: number = 60;
}
