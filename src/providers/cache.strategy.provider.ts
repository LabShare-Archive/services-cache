import {inject, Provider} from '@loopback/context';
import {CacheBindings} from '../keys';
import {LabShareCacheConfig} from '../types';
import {LabShareCache} from '../labshare.cache';

export class CacheStrategyResolverProvider implements Provider<LabShareCache> {
  constructor() {}

  /**
   * @property {LabShareCacheConfig} cacheConfig - Cache configuration.
   */
  @inject(CacheBindings.CACHE_CONFIG, {optional: true})
  cacheConfig: LabShareCacheConfig;

  async value(): Promise<LabShareCache> {
    const provider = new LabShareCache(this.cacheConfig);
    return provider;
  }
}
