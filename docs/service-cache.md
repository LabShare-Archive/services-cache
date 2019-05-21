# @labshare/[services-cache](https://github.com/LabShare/services-cache)

A library that helps you to have cache as a feature for your project. This library uses Redis and node In-Memory cache.
If the Redis is not found, cache will gracefully downgrade to In-memory cache.

This can be used in two different way:

1. using LSC

2. Manually - explicitly injecting cache service in your service code

You can create any service using LSC, e.g

`LSC -create Service -include Cache, config, notification`

And a service will be created which will have caching as part of the service

### **Manually**

To use this caching functionality

add the @labshare/services-cache component to your Application

`npm install @labshare/services-cache`

Add an attribute on the function whose results you want to cache.

```ts
@cache({ttl= 50})
async getAll(): Promise<Facility> {}
```

This will help you change the ttl per method. Keys for the cache will be the URL for the method, but user should be able to override it. Once you will put the attribute to the method all consequently calls will be served by the cache if it is under ttl.

**No other action needed from user.**

For post and put you may not prefer the default caching and would like to have more control.
Because for Post often you would like to take the id of the recordset and use that as the key of the cache.
In that case you will just write a one line command.

```ts
this.cacheLib.add('key', 'test');
```

### **Example Usage**

```ts
import {ServicesCacheComponent} from '@labshare/services-cache';
import {LbServicesConfigComponent} from '@labshare/lb-services-config';

// Other imports …
exportclassLbServicesExampleApplication

{
constructor(options: ApplicationConfig = {}){
this. Component(LbServicesConfigComponent); // Binding the lb-services-logger component
this.component(ServiceCacheComponent); // Method implementation ...
  }
}
```

```ts
import {CacheStrategy, cache} from'@labshare/lb-services-cache';
exportclassFacilityController { constructor(@inject(CacheBindings.CACHE)
privatecacheLib: CacheStrategy) {}
//Any generic method using Cache
asynccreate(facility: Facility): Promise<Facility> {
this.cacheLib.add(`key`, 'test'); // Method implementation ... }}
}
//option -2 Decorator
@cache()
asyncgetAll(): Promise<Facility> {}
```

### **Requirements**

- Cache

  - Allow cache for APIs and libraries.
  - Driver support
    - Redis
    - Memory
  - LoopBack4 component for injection.
  - Should be creating inside the [https://github.com/labshare/lb-services](https://github.com/labshare/lb-services) repo
  - The developer can give a global prefix which will be added to all the keys if the application will use a shared Redis.
  - Allow Cache for get APIs
  - The developer should be able to set which API should be cached by using a decorator.
  - The developer can set the ttl per API.
  - The developer can set the name of the caches key, if is not defined it will take the complete request to be cached.
  - The developer can send a header 'no-cache' or 'refresh-cache' in the request to refresh the cache.
  - The cache is for every action, auto cache can be done by decorator, and manually (code) can do the caching for put and post
  - Allowing Cache for logic
  - The developer should be able to use cache by using a library.
  - The developer can add cache by using a method.
  - The Cache library should have the following interface:

    ```ts
      delete(key: strings): Promise<void>;
      deleteAll(): Promise<void>;
      get(key: string): Promise<T>;
      set(key: string, value: DataObject<T>, options?:{ttl:int}): Promise<void>;
      keys?(filter?: KeyValueFilter): AsyncIterable<string>;
    ```

- Configuration

  - The global configuration can be set at the main config file.
  - The unique key will be:

    ```ts
    cache:{
    driver: name of the driver,
    ttl?: Max time,
    collection?: a prefix which can be attached to all the keys,
    driverConfiguration:{
      }
    }
    ```

### **Implementation Details**

1. Create implementation for in-memory cache functionality.
2. Create implementation for Redis-cache functionality.
3. Decorator will be implemented similar as discussed below.
4. Create provider and components to wrap and available for extensibility.

- Usage With decorator

Caches function response using the given options. Works with different strategies and storages. Uses all arguments to build a unique key.

@Cache(options)
-options: Options passed to the strategy for this particular method

```ts
import { Cache, ExpirationStrategy, MemoryStorage } from'node-ts-cache';
constmyStrategy = newExpirationStrategy(newMemoryStorage());
exportclassExampleRepository {

    @Cache()
    publicgetBar(foo: string): Promise<string> {
       returnPromise.resolve(stuff + 'bar');
      }
    }

    @Cache( { ttl:60 })
     publicasyncgetUsers(): Promise<string[]> {
       return ['Max', 'User'];
     }
```

### Without Decorator Directly by code

```ts
import { ExpirationStrategy, MemoryStorage } from'node-ts-cache';
awaitmyCache = newExpirationStrategy(newMemoryStorage());

classMyService {
    publicasyncgetUsers(): Promise<string[]> {
        constcachedUsers = awaitmyCache.getItem<string[]>('users');
        if (cachedUsers) {
            returncachedUsers;
        }
        constnewUsers = ['Max', 'User'];
        awaitmyCache.setItem('users', newUsers, {  ttl:60 });
        returnnewUsers;
    }
}
```

### Strategies - ExpirationStrategy

Cached items expire after a given amount of time.

- ttl: '(Default: 60)' Number of seconds to expire the cache item

- isLazy: '(Default: true)' If true, expired cache entries will be deleted on touch. If false, entries will be deleted after the given 'ttl'.

- isCachedForver: '(Default: false)' If true, cache entry has no expiration.

### To Retrieve the Cache.

No changes are needed inside your code to cache the returned value. Only add the decorator to your method, and the return value is cached
  ```ts
   // If getUserById('123') were called, the return value would be cached

  // which would expire in 86400 seconds

    @Cache({ cacheKey: 'user', ttl: 86400 })

  public async getUserById(id: string): Promise<any> {

    return this.userRepository.findOne(id);

  }

  // If setProp('123', 'newVal') were called, the value cached under

  // key 123 would be deleted in this case.

  @CacheClear({ cacheKey:TestClass.setCacheKey })

  publicasyncsetProp(id: string, value: string): Promise<void> {

    this.aProp = value;
  }
  ```

# Questions and Answers

### Why decorator is on method and not on class?

Because we would like to control the ttl per function and decide when we want the default behavior and one custom

- Reference:
  - [https://github.com/strongloop/loopback-next/blob/master/packages/repository/src/repositories/kv.repository.ts](https://github.com/strongloop/loopback-next/blob/master/packages/repository/src/repositories/kv.repository.ts)
  - [https://github.com/labshare/services-cache](https://github.com/labshare/services-cache)
  - [https://github.com/havsar/node-ts-cache#usage](https://github.com/havsar/node-ts-cache)
