import {inject, Provider} from '@loopback/context';
import {
  MemoryStorage,
  RedisStorage,
  LabShareCache,
  CacheBindings,
} from '../index';

import * as _ from 'lodash';
import {CacheConstants} from '../constants/index';
import {LabShareCacheConfig} from '../types';

export class CacheStrategyResolverProvider implements Provider<LabShareCache> {
  constructor() {}

  /**
   * @property {LabShareCacheConfig} cacheConfig - Cache configuration.
   */
  @inject(CacheBindings.CACHE_CONFIG, {optional: false})
  cacheConfig: LabShareCacheConfig;

  async value(): Promise<LabShareCache> {
    let provider;
    if (
      _.get(
        this.cacheConfig,
        CacheConstants.CACHE_STRATEGY,
        CacheConstants.MEMORY,
      ) === CacheConstants.REDIS
    ) {
      const redisOptions = _.get(
        this.cacheConfig,
        CacheConstants.REDIS_OPTIONS,
      );
      provider = new LabShareCache(new RedisStorage(redisOptions));
      _.set(global, CacheConstants.LABSHARE_CACHE, provider);
      return provider;
    }
    provider = new LabShareCache(new MemoryStorage());
    _.set(global, CacheConstants.LABSHARE_CACHE, provider);
    return provider;
  }
}
