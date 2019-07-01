
# labshare/services-cache 
Simple and extensible caching module with redis and memory storage and supporting decorators.

<!-- TOC depthTo:2 -->

- [services-cache](#labshare/services-cache )
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


## Usage


### Step 1 : add to global config

- Add to global configuration

  - The global configuration can be set at the main config file.
  - The unique key will be:

    ```json
    "cache": {
      "strategy": "redis",
      "redisOptions": {
        "host": "redis", // redis server
        "port": 6379
      }
    }
    ```
### Step 2 : Bind the ServicesCache component to application

```ts
import {ServicesCache} from '@labshare/services-cache';
import {ServicesConfigComponent} from '@labshare/services-config';

// Other imports …
export class LbServicesExampleApplication

{
constructor(options: ApplicationConfig = {}){
this. Component(ServicesConfigComponent); // Binding the lb-services-logger component
this.component(ServicesCache); // Method implementation ...
this.loadCacheStrategy(); // loading cache strategy
  }
}
...
  ...

  private async loadCacheStrategy() {
    await super.boot();
    try {
      await this.get(CACHE_STRATEGY);
    } catch (error) {
    // tslint:disable-next-line: no-console
      console.error(error);
    }
  }

```
### Step 3 : With decorator

## With decorator
Caches function response using the given options. Works with different strategies and storages. Uses all arguments to build an unique key.

`@Cache(options)`
- `options`: Options passed to the strategy for this particular method

*Note: @Cache always converts the method response to a promise because caching might be async.* 

```ts
import { Cache } from "@labshare/services-cache";

class MyService {
    
    @Cache({ ttl: 60 })
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
    
    public async getShipToUsers(): Promise<string[]> {
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

## Directly with Express App

### Step: 1

Add config file under config/default.json

    ```json
    "cache": {
      "strategy": "redis",
      "redisOptions": {
        "host": "redis", // redis server ec2-52-90-18-4.compute-1.amazonaws.com
        "port": 6379
      }
    }
    ```

### Step: 2

```ts
import {RedisStorage, LabShareCache} from "@labshare/services-cache";
const config = require('config');
...
...
// if redis 
const myRedisCache = new LabShareCache(new RedisStorage(config.get('cache.redisOptions')));
// if memory 

const memoryCache = new LabShareCache(new MemoryStorage());

class MyService {
    
/**
   * GET one hero by id
   */
  public async getOne(req: Request, res: Response, next: NextFunction) {
    let query = parseInt(req.params.id);
    const cachekey = "cacheKey:"+query;

    const cachedSearchResults = await myRedisCache.getItem<string>(cachekey);

    if (cachedSearchResults) {
      return cachedSearchResults;
    }

    let hero = Heroes.find(hero => hero.id === query);
    await myRedisCache.setItem(cachekey, hero, { ttl: 120, isCachedForever: false });

    if (hero) {
      res.status(200)
        .send({
          message: 'Success',
          status: res.status,
          hero
        });
    }
    else {
      res.status(404)
        .send({
          message: 'No hero found with the given id.',
          status: res.status
        });
    }
  }
}
```


# Strategies
## LabShareCache
Cached items expire after a given amount of time.

 - `ttl`: *(Default: 60)* Number of seconds to expire the cachte item
 - `isLazy`: *(Default: true)* If true, expired cache entries will be deleted on touch. If false, entries will be deleted after the given *ttl*.
 - `isCachedForever?`: boolean;
 - `noop?`: boolean; // Allows for consuming libraries to conditionally disable caching. Set this to true to disable caching for some reason.
 - `cacheKey?`: string
 - `refreshCache`: boolean.
  
# Storages

*Note: For specific storages, client libraries must be installed:*

| Storage      | Needed client library |
|--------------|:---------------------:|
| RedisStorage |  `npm install redis`  |

#### MemoryStorage()
#### RedisStorage(`clientOpts:` [RedisClientOptions](https://github.com/NodeRedis/node_redis#options-object-properties))


# Test
```bash
   npm test
```