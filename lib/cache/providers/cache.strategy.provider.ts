import {inject, Provider} from '@loopback/context';
import {LabShareCache, CacheBindings} from '../index';
import {LabShareCacheConfig} from '../types';

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
