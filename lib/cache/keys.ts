import {BindingKey} from '@loopback/context';
import {LabShareCache} from './strategies/labshare.cache';
import {Request, Response} from '@loopback/rest';

/**
 * interface definition of a function which accepts a request
 * and returns an authenticated user
 */
export interface CacheRequest {
  (request: Request, response: Response): Promise<any>;
}

// namespace for binding cache
export namespace CacheBindings {
  // binding label for cache strategy
  export const CACHE_STRATEGY = BindingKey.create<LabShareCache>(
    'cache.strategy',
  );
  // binding label for cache config
  export const CACHE_CONFIG = BindingKey.create<LabShareCache>('cache.config');
  // binding label for redis storage
  export const REDIS_STORAGE = BindingKey.create<LabShareCache>(
    'redis.storage',
  );
  // binding label for memory storage
  export const MEMORY_STORAGE = BindingKey.create<LabShareCache>(
    'memory.storage',
  );
}
