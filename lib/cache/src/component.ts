import { Component, ProviderMap } from '@loopback/core';
import { CacheBindings } from './keys';
import { CacheStrategyResolverProvider, TimerProvider } from './providers';
/**
 * Implements a configuration component.
 * @access public
 */
export class LbServicesCacheComponent implements Component {
  providers?: ProviderMap = {
    [CacheBindings.TIMER.key]: TimerProvider,
    [CacheBindings.CACHE_STRATEGY.key]: CacheStrategyResolverProvider
  };
}
