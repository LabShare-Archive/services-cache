### Cache
Cache is the main library for the services-cache library. It provides all the methods for cache the data in Redis.
You can use it with callbacks or with promises.
```sh
/**
 *
 * @Throws {Error} if is unable to connect with redis
 * {Object} redisConfiguration - Connection string information for Redis.
 * {number}  maxTime - The default max time of each object for store in cache. Default : 24 hours.
 *  {Function} options.createKey - Create key Method.
 * @param {Array} [objectID] - String's list for key creation.
 * {Function} options.setValue - Format value for store a value on Redis using set.
 *  @param {Object} [value] - Value for store in Redis.
 * {Function} options.formatValue - Format when a value is retreived from Redis using get.
 *  @param {Object} [value] - Retreived value from Redis.
 * {Function} options.setObjectValue - Format value for store a value on Redis using hset.
 *  @param {Object} [value] - Value for store in Redis.
 * {Function} options.formatObjectValue - Format when a value is retreived from Redis using hgetall.
 *  @param {Object} [value] - Retreived value from Redis.
 * {Array} options.configuration - Redis API configuration. Default: null
 * @constructor
 */
class Cache {
    /**
     * @description Property for set the internal redis client.
     */
    get redisClient() {
        return this.client;
    }
    constructor(redis, maxTime , ...isPubSub) {
        super();
        this.isPubSub = isPubSub;  
        this.maxTime = null;
        this.client = null;
        assert(_.isObject(redis) && redis.host, '`redisConfiguration` must be a valid connection string');
        if (maxTime) {
            assert.ok(_.isNumber(maxTime), 'maxTime` needs to be a valid number');
            this.maxTime = maxTime;
        } else {
            this.maxTime = 24 * 60 * 60; //24 hours.
        }
        this.createKey = (objectID) => {
                assert(objectID != null);
                if (_.isArray(objectID))
                    return _.join(objectID, ':');
                return String(objectID);
            },
            this.setValue = (value) => {
                return value;

            },
            this.formatValue = (value) => {
                return value;

            },
            this.setObjectValue = (value) => {
                return value;
            },
            this.formatObjectValue = (value) => {
                return value;

            }
        this.client = redisCli.createClient(redis);

         if( this.isPubSub)
            {
    /**
     * @description On Subscribe event, method invoqued when somebody subscribes to redis.
     * @return channel : the channel where the client subscribed. 
     * @return count : the number of susbcribers.
     * */
                this.client.on("subscribe", (channel, count)=>
                {
                    this.emit("subscribe",channel, count);
                });
     /**
     * @description On PSubscribe event, method invoqued when somebody subscribes to redis.
     * @return pattern : the pattern (channel) where the client subscribed. Note : a pattern can be /testchanel/* where * can be anything.
     * @return count : the number of susbcribers.
     * */           
                this.client.on("psubscribe", (pattern, count)=>
                {
                    this.emit("psubscribe",pattern, count);
                });
      /**
     * @description On Message event, method invoqued when the object receives a message.
     * @return channel : the channel where the client subscribed.
     * @return message: The message delivered from the subscription in redis.
     * */                      
                this.client.on("message",(channel, message )=>
                {
                    this.emit("message",channel, this.formatObjectValue( message));
                });
    /**
     * @description On PMessage event, method invoqued when the object receives a message.
     * @return pattern : the pattern (channel) where the client subscribed. Note : a pattern can be /testchanel/* where * can be anything.
     * @return channel : the channel where the client subscribed.
     * @return message: The message delivered from the subscription in redis.
     * */

                this.client.on("pmessage",(pattern,channel, message )=>
                {
                    this.emit("pmessage",pattern ,channel, this.formatObjectValue( message));
                });
     /**
     * @description On Unsubscribe event, method invoqued when somebody unsubscribes to redis.
     * @return channel : the channel where the client subscribed.
     * @return count : the number of susbcribers.
     * */
                this.client.on("unsubscribe", (channel, count)=>
                {
                    this.emit("unsubscribe",channel, count);
                });
      /**
     * @description On Punsubscribe event, method invoqued when somebody unsubscribes to redis.
     * @return pattern : the pattern (channel) where the client subscribed. Note : a pattern can be /testchanel/* where * can be anything.
     * @return count : the number of susbcribers.
     * */            
                this.client.on("punsubscribe", (pattern, count)=>
                {
                    this.emit("punsubscribe",pattern, count);
                });
         }
    };
```


### Usage
```sh
//add a reference to the package
let cache = require('service-cache').Cache;
//create the connection string to Redis
let cacheClient = new cache(redis: {
        "host": "127.0.0.1",
        "port": 6379
    }, config.maxTime);
//set the formaters, by default the formaters will be plain    
cacheClient.setObjectValue = ((value) =>{
        return value;
});
        cacheClient.formatObjectValue = ((value) => {
            return value;
        });
        cacheClient.setValue = ((value) => {
            return value
        });
        cacheClient.formatValue = ((value) => {
            return (value)
        });
```
If you want to use JSON as a formater for objects, you can use this example:

```sh
        cacheClient.setObjectValue = ((value) => {
                return JSON.stringify(value);
            });
            this.cacheClient.formatObjectValue = ((value) => {
                return (value) ? JSON.parse(value.data) : null;
            });
```

By default, you can send an array of primitive values or a string for create a key, if you want to change
the creation of keys you need to set a new createKey method.

```sh
//Default implementation
       cacheClient.createKey = (objectID) => {
                assert(objectID != null);
                if (_.isArray(objectID))
                    return _.join(objectID, ':');
                return String(objectID);
            }
```
**Note: A Hash is described as an object in this library, a value is a string value.**

### Methods
**set**: Method for store a value in cache.
```sh
   /**
     * @description Saves the value in cache.
     * NOTE: It uses the format method setValue.
     * @param {string | array} [key] - The unique ID used for cache the value.
     * @param {object} [data] - The value for store in cache.
     * @param {int} [duration] - The duration in seconds, -1 for infinite duration.
     * @param {callback} [callback] - The callback returning the result of the transaction.
     * 
     */
    set(key, data, duration, callback)
```
Callback example
```sh
    cacheClient.set(['test-string'], 'test value', 20, (error, response) => {
        });
```
Promises example
```sh
    cacheClient.set(['test-string'], 'test value', 20).then((response)=>{})
```
**get**: Method for retreive a value from cache.
```sh
    /**
     * @description Gets the value from cache.
     * NOTE: It uses the format method formatValue.
     * @param {string | array} [key] - The unique ID used for cache the value.
     * @param {callback} [callback] - The callback returning the result of the transaction.
     * 
     */
    get(key, callback) 
```
Callback example
```sh
   cacheClient.get(['test-string'], (error, data) => {
        });
```
Promises example
```sh
    cacheClient.get(['test-string']).then((data)=>{})
```
**delete**: Method for delete a value stored in cache.
```sh
   /**
     * @description Deletes an object , a list or a value from cache.
     * @param {string | array} [key] - The unique ID used for cache the object.
     * @param {callback} [callback] - The callback returning the result of the transaction.
     * 
     */
    delete(key, callback) 
```
Callback example
```sh
    cacheClient.delete(['test-string'], (error, response) => {
        });
```
Promises example
```sh
    cacheClient.delete(['test-string']).then((response)=>{})
```
**saveObject**: Method for store an object in cache.
```sh
   /**
     * @description Saves the object in cache.
     * NOTE: It uses the format method setObjectValue.
     * @param {string | array} [key] - The unique ID used for cache the object.
     * @param {object} [data] - The object for store in cache.
     * @param {int} [duration] - The duration in seconds, -1 for infinite duration.
     * @param {callback} [callback] - The callback returning the result of the transaction.
     */
    saveObject(key, data, duration, callback)
```
Callback example
```sh
     cacheClient.saveObject('test-object', {
            name: 'test',
            age: 20
        }, 20, (error, response) => {
        });
```
Promises example
```sh
   cacheClient.saveObject('test-object', {
            name: 'test',
            age: 20
        }, 20).then((response)=>{})
```
**getObject**: Method for retreive an object from cache.
```sh
   /**
     * @description Gets the object from cache.
     * NOTE: It uses the format method formatObjectValue.
     * @param {string | array} [key] - The unique ID used for cache the object.
     * @param {callback} [callback] - The callback returning the result of the transaction.
     * 
     */
    getObject(key, callback)
```
Callback example
```sh
      cacheClient.getObject(['test-object'], (error, data) => {
        });
```
Promises example
```sh
     cacheClient.getObject(['test-object']).then((data)=>{})
```
**deepSaveObjectList**: Method for store an array of objects in cache. Append new objects and replace the object if is not new.
```sh
 /**
     * @description Deep saves a list of objects.
     * NOTE: It uses the format method setObjectValue.
     * @param {string | array} [listKey] - The unique ID used for the list of object in cache.
     * @param {string} [objectKeyField field] - ID field for each of the objects.
     * @param {array} [data] - Arrays of objects for store in cache.
     * @param {int} [duration] - The duration in seconds, -1 for infinite duration.
     * @param {callback} [callback] - The callback returning the result of the transaction.
     * 
     * */
    deepSaveObjectList(listKey, objectKeyField, data, duration, callback)
```
Data example
```sh
 let objectArray = [
            {
                id: 1,
                name: 'test 1',
                age: 35
            },
            {
                id: 2,
                name: 'test 2',
                age: 25
            }
    ];
```
Callback example
```sh
       cacheClient.deepSaveObjectList(['User', '1'], "id", objectArray, 20, (error, response) => {
        });
```
Promises example
```sh
     cacheClient.deepSaveObjectList(['User', '1'], "id", objectArray, 20).then((response)=>{})
```
**refreshDeepSaveObjectList**: Method similar as deepSaveObjectList but deletes all the objects first.
```sh
  /**
     * @description Deletes and performs a Deep saves of a list of objects.
     * NOTE: It uses the format method setObjectValue.
     * @param {string | array} [listKey] - The unique ID used for the list of object in cache.
     * @param {string} [ID field] - ID field for each of the objects.
     * @param {array} [data] - Arrays of objects for store in cache.
     * @param {int} [duration] - The duration in seconds, -1 for infinite duration.
     * @param {callback} [callback] - The callback returning the result of the transaction.
     * 
     * */
    refreshDeepSaveObjectList(listKey, objectKeyField, data, duration, callback) 
```
Data example
```sh
 let objectArray = [
            {
                id: 1,
                name: 'test 1',
                age: 35
            },
            {
                id: 2,
                name: 'test 2',
                age: 25
            }
    ];
```
Callback example
```sh
       cacheClient.refreshDeepSaveObjectList(['User', '1'], "id", objectArray, 20, (error, response) => {
        });
```
Promises example
```sh
     cacheClient.refreshDeepSaveObjectList(['User', '1'], "id", objectArray, 20).then((response)=>{})
```
**Note: If the object has inner objects or has a complex structure, user the JSON format explained above.**

**getAllObjectsList**: Method for retreive all the object's array from cache.
```sh
 /**
     * @description Gets a list of objects from cache.
     * NOTE: It uses the format method formatObjectValue.
     * @param {string | array} [listKey] - The unique ID used for the list of object in cache.
     * @param {callback} [callback] - The callback returning the result of the transaction.
     * 
     */
    getAllObjectsList(listKey, callback) 
```
Callback example
```sh
       cacheClient.getAllObjectsList(['User', '1'], (error, data) => {
        });
```
Promises example
```sh
     cacheClient.getAllObjectsList(['User', '1']).then((data)=>{})
```
**Note: If the object has inner objects or has a complex structure, user the JSON format explained above.**

**getObjectsListByRange**: Method for retreive the object's array from cache per range (paging).

```sh
  /**
     * @description Gets a list of objects by range from cache.
     * NOTE: It uses the format method formatObjectValue.
     * @param {string | array} [listKey] - The unique ID used for the list of object in cache.
     * @param {int} [from] - From, for query the objects in the cache list.
     * @param {int} [to] - To, for query the objects in the cache list.
     * @param {callback} [callback] - The callback returning the result of the transaction.
     * 
     */
    getObjectsListByRange(listKey, from, to, callback) 
```

Callback example
```sh
       cacheClient.getObjectsListByRange(['User', '1'],0,2, (error, data) => {
        });
```
Promises example
```sh
     cacheClient.getObjectsListByRange(['User', '1'],0,2).then((data)=>{})
```
**Note: If the object has inner objects or has a complex structure, user the JSON format explained above.**

**deleteAllList**: Method for delete all the object's array from cache.

```sh
/**
     * @description Deletes the list and referenced objects from cache.
     * @param {string | array} [listKey] - The unique ID used for the list of object in cache.
     * @param {callback} [callback] - The callback returning the result of the transaction.
     * 
     */
    deleteAllList(listKey, callback)
```

Callback example
```sh
       cacheClient.deleteAllList(['User', '1'], (error, response) => {
        });
```
Promises example
```sh
     cacheClient.deleteAllList(['User', '1']).then((response)=>{})
```
**deleteObjectFromList**: Method for delete an object by id in the object's array from cache.

```sh
/**
     * @description Deletes the list and referenced objects from cache.
     * @param {string | array} [listKey] - The unique ID used for the list of object in cache.
     * @param {callback} [callback] - The callback returning the result of the transaction.
     * 
     */
    deleteAllList(listKey, callback)
```

Callback example
```sh
       cacheClient.deleteObjectFromList(['User', '1'],id, (error, response) => {
        });
```
Promises example
```sh
     cacheClient.deleteObjectFromList(['User', '1'],id).then((response)=>{})
```
**addToCatalog**: Method for create a catalog for transactions.
```sh
 /**
     * @description Creates a set of elements|values in cache.
     * NOTE: It uses the format method setValue.
     * @param {string | array} [listKey] - The unique ID used for the list of values in cache.
     * @param {string | array} [itemID] - Item id for store in catalog.
     * @param {int} [duration] - The duration in seconds, -1 for infinite duration.
     * 
     * */
    addToCatalog(listKey, itemID, duration, callback)
```
Callback example
```sh
        cacheClient.addToCatalog(['User', '1'], (error, response) => {
        });
```
Promises example
```sh
        cacheClient.addToCatalog(['User', '1']).then((response)=>{})
```
**deleteCatalog**: Method for delete the catalog and the objects associated with that catalog.

```sh
  /**
     * @description Deletes a list of elements|values from the set from cache.
     * NOTE: It uses the format method formatValue.
     * @param {string | array} [listKey] - The unique ID used for the list of values in cache.
     * @param {callback} [callback] - The callback returning the result of the transaction.
     * 
     */
    deleteCatalog(listKey, callback) 
```

Callback example
```sh
        cacheClient.deleteCatalog("Catalog Name", (error, response) => {
        });
```
Promises example
```sh
        cacheClient.deleteCatalog("Catalog Name").then((response)=>{})
```
**getAllFromCatalog**: Method for retreive all the elements inside a catalog.

```sh
     /**
     * @description Gets a list of elements|values from the set from cache.
     * NOTE: It uses the format method formatValue.
     * @param {string | array} [listKey] - The unique ID used for the list of values in cache.
     * @param {callback} [callback] - The callback returning the result of the transaction.
     * 
     */
    getAllFromCatalog(listKey, callback) 
```

Callback example
```sh
        cacheClient.getAllFromCatalog("Catalog Name", (error, data) => {
        });
```
Promises example
```sh
        cacheClient.getAllFromCatalog("Catalog Name").then((data)=>{})
```

**deleteDataByScan**: Method for delete a list of elements|values by scanning them.

```sh
     /**
  * @description Deletes a list of elements|values by scanning them
  * @param {string|Array} [prefix] - The prefix of the names of the objects in redis.
  * @param {callback} [callback] - The callback returning the result of the transaction.
  * 
  */
    deleteDataByScan(prefix, callback)
```

Callback example
```sh
        cacheClient.deleteDataByScan("Prefix", (error, data) => {
            expect(data.length).toBeGreaterThanOrEqual(1);
            done();
        });
```
Promises example
```sh
          cacheClient.deleteDataByScan("Prefix").then(data => {
        });

```
**susbcribe**: Method for susbcribe the object to a redis channel. Requires isPubsub = true

```sh
   /**
     * @description Method for subscribe to the Redis pubsub.
     * @param {string} [channel] - Channel to subscribe
     */ 
    subscribe(channel)
```

Example
```sh
        subscriberClient.subscribe("Channel Name");
        });

        EVENTS:
        publisherClient.on('subscribe',(channel,count)=>
        {
            //Expects channel: "Channel Name" , count: 1
        });

        
```

**psusbcribe**: Method for susbcribe the object to a redis channel by a giving pattern. Requires isPubsub = true

```sh
      /**
     * @description Method for subscribe to the Redis pubsub.
     * @param {string} [pattern] - Pattern to subscribe. Note : a pattern can be /testchanel/* where * can be anything.
     */ 
    psubscribe(pattern)
```

Example
```sh
        subscriberClient.psubscribe("/testchanel/*");
        });

        EVENTS:
        publisherClient.on('psubscribe',(pattern,count)=>
        {
            //Expects pattern: "/testchanel/*" , count: 1
        });

        
```
**unsusbcribe**: Method for unsusbcribe the object from a redis channel. Requires isPubsub = true

```sh
  /**
     * @description Method for unsubscribe from the Redis pubusb.
     */
    unsubscribe()
```

Example
```sh
        subscriberClient.unsubscribe();
        });

        EVENTS:
        publisherClient.on('unsubscribe',(channel,count)=>
        {
            //Expects channel: "Channel Name" , count: 1
        });

        
```

**punsusbcribe**: Method for unsusbcribe the object from a redis channel defined by a pattern. Requires isPubsub = true

```sh
 /**
     * @description Method for unsubscribe from the Redis pubsub.
     */
    punsubscribe()
```

Example
```sh
        subscriberClient.punsubscribe();
        });

        EVENTS:
        publisherClient.on('punsubscribe',(pattern,count)=>
        {
            //Expects pattern: "/testchanel/*" , count: 1
        });

        
```

**publish**: Method for publish a message on a channel(string), requires isPubsub = true

```sh
    /**
     * @description Method for publish a message in Redis pubsub.
     * @param {string} [channel] - Channel to subscribe
     * @param {object} [message] - Message Object 
     */ 
    publish(channel,message)
```

Example
```sh
        publisherClient.publish("Channel Name", 'TEST');
        });

        publisherClient.publish("test/ChannelName", 'TEST');
        });

        EVENTS:
        subscriberClient.on('message',(channel,message)=>
        {
            //Expects channel: "Channel Name" , message: 'TEST'
        });

        subscriberClient.on('pmessage',(pattern,channel,message)=>
        {
            //Expects pattern:"test/*" , channel: "ChannelName" , message: 'TEST'
        });
```
