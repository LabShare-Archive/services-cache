# Services-Cache 

[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Greenkeeper badge](https://badges.greenkeeper.io/LabShare/services-cache.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.com/LabShare/services-cache.svg?token=zsifsALL6Np5avzzjVp1&branch=master)](https://travis-ci.com/LabShare/services-cache)

Services-cache is a Redis cache plugin for [LabShare Services](https://github.com/LabShare/services).

## Requirements

- [Node.js](https://nodejs.org/) v6+
- Redis (if Redis is not installed locally you can use this [docker file](https://github.com/LabShare/services-cache/blob/master/run/Dockerfile))

## Development
```sh
npm i @labshare/services-cache
```
*You might need to use sudo (UNIX).


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

## Steps to use directly in Simple Express Application

### Step: 1

Create a Config folder in the root and add config file under config/default.json

    ```json
    "cache": {
      "strategy": "redis",
      "redisOptions": {
        "host": "ec2-52-90-18-4.compute-2.amazonaws.com", // eg : redis server 
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
          message: 'Successfully',
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
## Steps to use in Simple Loopback Application

### Step 1 : add to global config

- create a Config folder in the root and add to global configuration under it config/default.json

  - The global configuration can be set at the main config file.
  - The unique key will be:

    ```json
    "cache": {
      "strategy": "redis",
      "redisOptions": {
        "host": "redis", // eg : redis server ec2-52-90-18-4.compute-1.amazonaws.com
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

## Directly in the code with loopback application.

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

# Strategies
## LabShareCache
Cached items expire after a given amount of time.

 - `ttl`: *(Default: 60)* Number of seconds to expire the cachte item
 - `isLazy`: *(Default: true)* If true, expired cache entries will be deleted on touch. If false, entries will be deleted after the given *ttl*.
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
## Note

The cache's duration is in seconds, also maxTime is used if no duration is given. 

License
----

MIT