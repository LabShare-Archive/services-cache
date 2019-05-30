import {RedisStorage} from './storages/redis.storage';
import {MemoryStorage} from './storages/memory.storage';
import {ExpirationStrategy} from './strategies/expiration.strategy';
import {ServicesCache} from './component';
import {CacheStrategyResolverProvider} from './providers';
import {CacheBindings, CacheRequest} from './keys';
import {Cache} from './decorators/cache.decorator';
import {CacheClear} from './decorators/cache.clear.decorator';


export {Cache, CacheClear, ExpirationStrategy, MemoryStorage, RedisStorage, 
    ServicesCache, CacheBindings, CacheRequest, CacheStrategyResolverProvider};