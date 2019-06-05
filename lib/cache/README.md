
# labshare/services-cache 
Simple and extensible caching module with redis and memory storage and supporting decorators.

<!-- TOC depthTo:2 -->

- [node-ts-cache](#labshare/services-cache )
- [Install](#install)
- [Usage](#usage)
    - [With decorator](#with-decorator)
    - [Directly](#directly)
- [Strategies](#strategies)
    - [LabShareCache](#labsharecache)
- [Storages](#storages)
- [Test](#test)

<!-- /TOC -->

# Install
```bash
npm install --save @labshare/services-cache 
```

# Usage
## With decorator
Caches function response using the given options. Works with different strategies and storages. Uses all arguments to build an unique key.

`@Cache(options)`
- `options`: Options passed to the strategy for this particular method

*Note: @Cache always converts the method response to a promise because caching might be async.* 

```ts
import { Cache, LabShareCache, MemoryStorage } from "@labshare/services-cache";

class MyService {
    
    @Cache(myStrategy, { ttl: 60 })
    public async getUsers(): Promise<string[]> {
        return ["John", "Doe"];
    }
}
```

## Directly

```ts
import { LabShareCache, MemoryStorage } from "@labshare/services-cache";

const memoryCache = new LabShareCache(new MemoryStorage());

class MyService {
    
    public async getUsers(): Promise<string[]> {
        const cachedUsers = await memoryCache.getItem<string[]>("users");
        if (cachedUsers) {
            return cachedUsers;
        }

        const newUsers = ["John", "Doe"];
        await memoryCache.setItem("users", newUsers, {  ttl: 60 });

        return newUsers;
    }
}
```

# Strategies
## LabShareCache
Cached items expire after a given amount of time.

 - `ttl`: *(Default: 60)* Number of seconds to expire the cachte item
 - `isLazy`: *(Default: true)* If true, expired cache entries will be deleted on touch. If false, entries will be deleted after the given *ttl*.
 - `isCachedForver`: *(Default: false)* If true, cache entry has no expiration.
 - `refreshCache,`: boolean.
 - `noop?`: boolean; // Allows for consuming libraries to conditionally disable caching. Set this to true to disable caching for some reason.


# Storages

*Note: For specific storages, client libraries must be installed:*

| Storage      | Needed client library |
|--------------|:---------------------:|
| RedisStorage |  `npm install redis`  |

#### MemoryStorage()
#### FsJsonStorage(`fileName: string`)
#### RedisStorage(`clientOpts:` [RedisClientOptions](https://github.com/NodeRedis/node_redis#options-object-properties))


# Test
```bash
npm test
```