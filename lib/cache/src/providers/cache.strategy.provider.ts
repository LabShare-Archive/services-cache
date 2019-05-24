import { ApplicationConfig } from '@loopback/core';
import { inject, Provider } from '@loopback/context';
import { ConfigBindings } from '@labshare/lb-services-config';
import { MemoryStorage, RedisStorage, ExpirationStrategy } from '../index';

import * as _ from 'lodash';


export class CacheStrategyResolverProvider implements Provider<ExpirationStrategy> {

  constructor(
    @inject(ConfigBindings.CONFIG, { optional: true })
    protected labShareConfiguration: ApplicationConfig
  ) { }

  async value(): Promise<ExpirationStrategy> {
    let provider;
    if (_.get(this.labShareConfiguration, 'cache.strategy', 'memory') === 'redis') {
      const redisOptions = _.get(this.labShareConfiguration, 'cache.redisOptions');
      provider = await new ExpirationStrategy(new RedisStorage(redisOptions));
      _.set(global, 'LABSHARE_CACHE', provider);
      return provider;
    }
    provider = await new ExpirationStrategy(new MemoryStorage());
    _.set(global, 'LABSHARE_CACHE', provider);
    return provider;
  }

}
