import {IStorage} from '../storages/IStorage';
import {AbstractBaseStrategy} from './abstract.base.strategy';
import {IOptions, IExpiringCacheItem} from '../types';
import {CacheConstants} from '../constants/index';
import * as _ from 'lodash';

export class LabShareCache extends AbstractBaseStrategy {
  constructor(storage: IStorage) {
    super(storage);
  }

  public async getItem<T>(key: string): Promise<T> {
    const item = await this.storage.getItem<IExpiringCacheItem>(key);
    if (item && _.has(item,'meta') && _.has(item, 'meta.ttl') && this.isItemExpired(item)) {
      await this.storage.setItem(key, undefined);
      return undefined;
    }
    return item ? item.content : undefined;
  }

  public async setItem( key: string, content: any, options: IOptions): Promise<void> {
    options = {ttl: CacheConstants.TTL_60_SEC, isLazy: true, isCachedForever: false, ...options};

    let meta = {};

    if (!options.isCachedForever) {
      meta = {
          ttl: options.ttl,
          createdAt: Date.now()
      };
      if (!options.isLazy) {
          setTimeout(() => {
              this.unsetKey(key);
          }, options.ttl);
      }
    }
    
    await this.storage.setItem(key, {meta, content});
  }

  public async deleteItem(key: string): Promise<void> {
    const item = await this.storage.getItem<IExpiringCacheItem>(key);
    if (item && item.meta) {
      await this.storage.deleteItem(key);
      return;
    }
    return;
  }

  public async clear(): Promise<void> {
    await this.storage.clear();
  }

  private isItemExpired(item: IExpiringCacheItem): boolean {
    return Date.now() > item.meta.createdAt + item.meta.ttl;
  }

  private async unsetKey(key: string): Promise<void> {
    await this.storage.setItem(key, undefined);
  }
}
