import { ApplicationConfig } from '@loopback/core';
import { Provider } from '@loopback/context';
import { ExpirationStrategy } from '../index';
export declare class CacheStrategyResolverProvider implements Provider<ExpirationStrategy> {
    protected labShareConfiguration: ApplicationConfig;
    constructor(labShareConfiguration: ApplicationConfig);
    value(): Promise<ExpirationStrategy>;
}
