import {BindingKey} from '@loopback/context';
import {ExpirationStrategy} from './strategies/expiration.strategy';
import { Request, Response } from '@loopback/rest';

// import { AuthenticationMetadata } from './decorators/authenticate.decorator';
// import { MetadataAccessor } from '@loopback/metadata';

/**
 * interface definition of a function which accepts a request
 * and returns an authenticated user
 */
export interface CacheRequest {
  (request: Request, response: Response): Promise<any>;
}
import {TimerFn} from './types';

// namespace for binding cache
export namespace CacheBindings {
  // binding label for cache strategy
  export const CACHE_STRATEGY = BindingKey.create<ExpirationStrategy>('cache.strategy');
  // binding label for redis storage
  export const REDIS_STORAGE = BindingKey.create<ExpirationStrategy>('redis.storage');
  // binding label for memory storage
  export const MEMORY_STORAGE = BindingKey.create<ExpirationStrategy>('memory.storage');
  export const TIMER = BindingKey.create<TimerFn>('example.log.timer');
}
