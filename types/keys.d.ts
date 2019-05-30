/// <reference types="express" />
import { BindingKey } from '@loopback/context';
import { ExpirationStrategy } from './strategies/expiration.strategy';
import { Request, Response } from '@loopback/rest';
export interface CacheRequest {
    (request: Request, response: Response): Promise<any>;
}
export declare namespace CacheBindings {
    const CACHE_STRATEGY: BindingKey<ExpirationStrategy>;
    const REDIS_STORAGE: BindingKey<ExpirationStrategy>;
    const MEMORY_STORAGE: BindingKey<ExpirationStrategy>;
}
