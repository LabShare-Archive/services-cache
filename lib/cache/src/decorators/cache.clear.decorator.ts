import { ExpirationStrategy } from '../strategies/expiration.strategy';
import { RedisStorage } from '../storages/redis.storeage';
import { MemoryStorage } from '../storages/memory.storage';
import * as _ from 'lodash';
import { MissingClientError } from '../errors/index';
const redisStorage = new ExpirationStrategy(new RedisStorage({ host: '127.0.0.1', port: 6379 }));
const memoryStorage = new ExpirationStrategy(new MemoryStorage());

export function CacheClear(options: any): Function {
    return function (target: any, methodName: string, descriptor: PropertyDescriptor) {
        const className = target.constructor.name;
        let cachingStrategy: ExpirationStrategy;
        descriptor.value = async function (...args: any[]) {
            cachingStrategy = (_.get(redisStorage, "storage.connectionStatus") === 'connected') ? redisStorage: memoryStorage;
            const generatedCacheKey = (!Array.isArray(args) || !args.length) ? `${className}:${methodName}` : `${className}:${methodName}:${JSON.stringify(args)}`;
            const hashKey = !_.isEmpty(options.cacheKey) ? options.cacheKey : generatedCacheKey;

            // If there is no client, no-op is enabled (else we would have thrown before),
            // just return the result of the decorated method (no caching)
            if (!cachingStrategy) {
                if (options && options.noop) {
                return descriptor.value!.apply(this, args);
                }
                // A caching client must exist if not set to noop, otherwise this library is doing nothing.
                throw new MissingClientError(hashKey);
            }


            const entry = await cachingStrategy.getItem(hashKey);

            if (entry) {
                return await cachingStrategy.deleteItem(hashKey);
            } else{
                return undefined;
            }
        };
        return descriptor;
    };
}
