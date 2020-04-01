import {StorageProvider} from './storages/storage-provider';
import {Options, ExpiringCacheItem, CacheConfig, CacheType} from './types';
import {CacheConstants} from './constants/index';
import * as _ from 'lodash';
import {RedisStorage} from './storages/redis.storage';
import {MemoryStorage} from './storages/memory.storage';

export class LabShareCache {
  private storage: StorageProvider;
  constructor(public cacheConfig: CacheConfig) {
    this.storage = this.createCacheClient();
  }
  private createCacheClient(): StorageProvider {
    let provider;
    if (this.cacheConfig?.type === CacheType.REDIS) {
      provider = new RedisStorage(this.cacheConfig?.redis);
      // for global decorators
      _.set(global, CacheConstants.LABSHARE_CACHE, provider);
      return provider;
    }
    provider = new MemoryStorage();
    // for global decorators
    _.set(global, CacheConstants.LABSHARE_CACHE, provider);
    return provider;
  }

  public async getItem<T>(key: string): Promise<T> {
    const item = await this.storage.getItem<ExpiringCacheItem>(key);
    if (
      item &&
      _.has(item, 'meta') &&
      _.has(item, 'meta.ttl') &&
      this.isItemExpired(item)
    ) {
      await this.storage.setItem(key, undefined);
      return undefined;
    }
    return item ? item.content : undefined;
  }

  public async setItem(
    key: string,
    content: any,
    options: Options,
  ): Promise<void> {
    options = {
      ttl: CacheConstants.TTL_60_SEC,
      isLazy: true,
      isCachedForever: false,
      ...options,
    };

    let meta = {};

    if (!options.isCachedForever) {
      meta = {
        ttl: options.ttl,
        createdAt: Date.now(),
      };
      if (!options.isLazy) {
        setTimeout(() => {
          this.unsetKey(key).catch(err => console.log(err));
        }, options.ttl);
      }
    }

    await this.storage.setItem(key, {meta, content});
  }

  public async deleteItem(key: string): Promise<void> {
    const item = await this.storage.getItem<ExpiringCacheItem>(key);
    if (item?.meta) {
      await this.storage.deleteItem(key);
      return;
    }
    return;
  }

  public async clear(): Promise<void> {
    await this.storage.clear();
  }

  private isItemExpired(item: ExpiringCacheItem): boolean {
    return Date.now() > item.meta.createdAt + item.meta.ttl;
  }

  private async unsetKey(key: string): Promise<void> {
    await this.storage.setItem(key, undefined);
  }
}
