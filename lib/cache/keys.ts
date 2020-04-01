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
  export const CACHE = BindingKey.create<LabShareCache>('cache.cache');
  // binding label for cache config
  export const CACHE_CONFIG = BindingKey.create<LabShareCache>('cache.config');
}
