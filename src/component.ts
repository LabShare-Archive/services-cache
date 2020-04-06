import {Component, ProviderMap} from '@loopback/core';
import {CacheBindings} from './keys';
import {CacheStrategyResolverProvider} from './providers';
/**
 * Implements a configuration component.
 * @access public
 */
export class ServicesCacheComponent implements Component {
  providers?: ProviderMap = {
    [CacheBindings.CACHE.key]: CacheStrategyResolverProvider,
  };
}
