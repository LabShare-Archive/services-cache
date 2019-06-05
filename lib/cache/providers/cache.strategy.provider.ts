import {ApplicationConfig} from '@loopback/core';
import {inject, Provider} from '@loopback/context';
import {ConfigBindings} from '@labshare/lb-services-config';
import {MemoryStorage, RedisStorage, ExpirationStrategy} from '../index';

import * as _ from 'lodash';
import { CacheConstants } from '../constants/index';

export class CacheStrategyResolverProvider
  implements Provider<ExpirationStrategy> {
  constructor(
    @inject(ConfigBindings.CONFIG, {optional: true})
    protected labShareConfiguration: ApplicationConfig,
  ) {}

  async value(): Promise<ExpirationStrategy> {
    let provider;
    if (
      _.get(this.labShareConfiguration, CacheConstants.CACHE_STRATEGY, CacheConstants.MEMORY) === CacheConstants.REDIS
    ) {
      const redisOptions = _.get( this.labShareConfiguration, CacheConstants.REDIS_OPTIONS);
      provider = new ExpirationStrategy(new RedisStorage(redisOptions));
      _.set(global, CacheConstants.LABSHARE_CACHE, provider);
      return provider;
    }
    provider = new ExpirationStrategy(new MemoryStorage());
    _.set(global, CacheConstants.LABSHARE_CACHE, provider);
    return provider;
  }
}
