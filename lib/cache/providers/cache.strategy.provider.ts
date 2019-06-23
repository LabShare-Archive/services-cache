import {ApplicationConfig} from '@loopback/core';
import {inject, Provider} from '@loopback/context';
import {ConfigBindings} from '@labshare/services-config';
import {MemoryStorage, RedisStorage, LabShareCache} from '../index';

import * as _ from 'lodash';
import { CacheConstants } from '../constants/index';

export class CacheStrategyResolverProvider
  implements Provider<LabShareCache> {
  constructor(
    @inject(ConfigBindings.CONFIG, {optional: true})
    protected labShareConfiguration: ApplicationConfig,
  ) {}

  async value(): Promise<LabShareCache> {
    let provider;
    if (
      _.get(this.labShareConfiguration, CacheConstants.CACHE_STRATEGY, CacheConstants.MEMORY) === CacheConstants.REDIS
    ) {
      const redisOptions = _.get( this.labShareConfiguration, CacheConstants.REDIS_OPTIONS);
      provider = new LabShareCache(new RedisStorage(redisOptions));
      _.set(global, CacheConstants.LABSHARE_CACHE, provider);
      return provider;
    }
    provider = new LabShareCache(new MemoryStorage());
    _.set(global, CacheConstants.LABSHARE_CACHE, provider);
    return provider;
  }
}
