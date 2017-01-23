'use strict';

const redisCli = require('redis'),
    assert = require('assert'),
    q = require('q'),
    {EventEmitter} = require('events'),
    _ = require('lodash');
/**
 *
 * @Throws {Error} if is unable to connect with redis
 * {Object} redisConfiguration - Connection string information for Redis.
 * {number}  maxTime - The default max time of each object for store in cache. Default : 24 hours.
 * {bool}  isPubSub(optional) - Allows pubsub functionality to the object. 
 * @constructor
 */
class Cache extends EventEmitter {
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
    deepSaveObjectList(listKey, objectKeyField, data, duration, callback) {
        listKey = this.createKey(listKey);
        let multi = this.client.multi();
        for (let i = 0; i < data.length; i++) {
            let newData = this.setObjectValue(data[i]);
            let newKey = this.createKey([listKey, data[i][objectKeyField]]);
            this._hsetTypeSave(multi, newKey, newData);
            let zorder = typeof data[i][objectKeyField] === 'number' ? data[i][objectKeyField] : i;
            multi.zadd(listKey, zorder, newKey);
            this._setExpiracy(multi, newKey, duration);
        };
        this._setExpiracy(multi, listKey, duration);
        return q.ninvoke(multi, 'exec').nodeify(callback);
    };
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
    refreshDeepSaveObjectList(listKey, objectKeyField, data, duration, callback) {
        return this.deleteAllList(listKey).
        then(() => {
            return this.deepSaveObjectList(listKey, objectKeyField, data, duration);;
        }).nodeify(callback);
    };
    /**
     * @description Saves an object in the list of objects.
     * NOTE: It uses the format method setObjectValue.
     * @param {string | array} [listKey] - The unique ID used for the cache list the object.
     * @param {string | array} [key] - The unique ID of the object.
     * @param {int} [order] - The order number for store the object in the list (a number ID may be provided). 
     * @param {object} [data] - object for cache.
     * @param {int} [duration] - The duration in seconds, -1 for infinite duration.
     * @param {callback} [callback] - The callback returning the result of the transaction.
     * 
     * */
    saveObjectInList(listKey, key, order, data, duration, callback) {
        listKey = this.createKey(listKey);
        key = this.createKey([listKey, key]);
        let newData = this.setObjectValue(data);
        let multi = this.client.multi();
        this._hsetTypeSave(multi, key, newData);
        multi.zadd(listKey, order, key);
        this._setExpiracy(multi, key, duration);
        return q.ninvoke(multi, 'exec').nodeify(callback);
    };
    /**
     * @description Deletes object and removes it from the list in cache.
     * @param {string | array} [listKey] - The unique ID used for the list of object in cache.
     * @param {string | array} [key] - The unique ID used for cache the object.
     * @param {callback} [callback] - The callback returning the result of the transaction.
     * 
     */
    deleteObjectFromList(listKey, key, callback) {
        listKey = this.createKey(listKey);
        key = this.createKey([listKey, key]);
        let idList = new Array();
        idList.push(['del', key]);
        idList.push(['zrem', listKey, key]);
        return q.ninvoke(this.client.multi(idList), "exec").nodeify(callback);
    };
    /**
     * @description Gets a list of objects from cache.
     * NOTE: It uses the format method formatObjectValue.
     * @param {string | array} [listKey] - The unique ID used for the list of object in cache.
     * @param {callback} [callback] - The callback returning the result of the transaction.
     * 
     */
    getAllObjectsList(listKey, callback) {
        return this.getObjectsListByRange(listKey, 0, -1, callback);
    };
    /**
     * @description Gets a list of objects by range from cache.
     * NOTE: It uses the format method formatObjectValue.
     * @param {string | array} [listKey] - The unique ID used for the list of object in cache.
     * @param {int} [from] - From, for query the objects in the cache list.
     * @param {int} [to] - To, for query the objects in the cache list.
     * @param {callback} [callback] - The callback returning the result of the transaction.
     * 
     */
    getObjectsListByRange(listKey, from, to, callback) {
        let self = this;
        let data = q.async(function* () {
            let result = new Array();
            listKey = self.createKey(listKey);
            let members = yield q.ninvoke(self.client, 'zrange', listKey, from, to);
            for (let i = 0; i < members.length; i++) {
                let obj = yield q.ninvoke(self.client, 'hgetall', members[i]);
                result.push(self.formatObjectValue(obj));
            }
            return result;
        });
        return data().nodeify(callback);
    };

    /**
     * @description Deletes the list and referenced objects from cache.
     * @param {string | array} [listKey] - The unique ID used for the list of object in cache.
     * @param {callback} [callback] - The callback returning the result of the transaction.
     * 
     */
    deleteAllList(listKey, callback) {
        let self = this;
        listKey = self.createKey(listKey);
        let data = q.async(function* () {
            let members = yield q.ninvoke(self.client, 'zrange', listKey, 0, -1);
            let replies = new Array();
            for (let i = 0; i < members.length; i++) {
                replies.push(['del', members[i]]);
            }
            replies.push(['del', listKey]);
            yield q.ninvoke(self.client.multi(replies), "exec");
        });
        return data().nodeify(callback);
    };
    /**
     * @description Saves the object in cache.
     * NOTE: It uses the format method setObjectValue.
     * @param {string | array} [key] - The unique ID used for cache the object.
     * @param {object} [data] - The object for store in cache.
     * @param {int} [duration] - The duration in seconds, -1 for infinite duration.
     * @param {callback} [callback] - The callback returning the result of the transaction.
     */
    saveObject(key, data, duration, callback) {
        key = this.createKey(key);
        let newData = this.setObjectValue(data);
        return this._hsetTypeSave(this.client, key, newData)
            .then((response) => {
                this._setExpiracy(this.client, key, duration);
                return response;
            }).nodeify(callback);
    };
    /**
     * @description Gets the object from cache.
     * NOTE: It uses the format method formatObjectValue.
     * @param {string | array} [key] - The unique ID used for cache the object.
     * @param {callback} [callback] - The callback returning the result of the transaction.
     * 
     */
    getObject(key, callback) {  
        key = this.createKey(key);
        return q.ninvoke(this.client, 'hgetall', key)
            .then((reply) => {
                return this.formatObjectValue(reply);
            }).nodeify(callback);
    };
    /**
     * @description Saves the value in cache.
     * NOTE: It uses the format method setValue.
     * @param {string | array} [key] - The unique ID used for cache the value.
     * @param {object} [data] - The value for store in cache.
     * @param {int} [duration] - The duration in seconds, -1 for infinite duration.
     * @param {callback} [callback] - The callback returning the result of the transaction.
     * 
     */
    set(key, data, duration, callback) {
        key = this.createKey(key);
        return q.ninvoke(this.client, 'set', key, this.setValue(data))
            .then((response) => {
                this._setExpiracy(this.client, key, duration);
                return  response;
            }).nodeify(callback);
    };
    /**
     * @description Gets the value from cache.
     * NOTE: It uses the format method formatValue.
     * @param {string | array} [key] - The unique ID used for cache the value.
     * @param {callback} [callback] - The callback returning the result of the transaction.
     * 
     */
    get(key, callback) {
        key = this.createKey(key);
        return q.ninvoke(this.client, "get", key)
            .then((response) => {
                return this.formatValue(response);
            }).nodeify(callback);
    };

    /**
     * @description Deletes an object , a list or a value from cache.
     * @param {string | array} [key] - The unique ID used for cache the object.
     * @param {callback} [callback] - The callback returning the result of the transaction.
     * 
     */
    delete(key, callback) {
        key = this.createKey(key);
        return q.ninvoke(this.client, "del", key).nodeify(callback);
    };

    /**
     * @description Creates a set of elements|values in cache.
     * NOTE: It uses the format method setValue.
     * @param {string | array} [listKey] - The unique ID used for the list of values in cache.
     * @param {string | array} [itemID] - Item id for store in catalog.
     * @param {int} [duration] - The duration in seconds, -1 for infinite duration.
     * 
     * */
    addToCatalog(listKey, itemID, duration, callback) {
        listKey = this.createKey(listKey);
        let newID = this.createKey(itemID);
        return q.ninvoke(this.client, "sadd", listKey, newID)
            .then((data) => {
                this._setExpiracy(this.client, listKey, duration);
                return data;
            }).nodeify(callback);
    };
    /**
     * @description Gets a list of elements|values from the set from cache.
     * NOTE: It uses the format method formatValue.
     * @param {string | array} [listKey] - The unique ID used for the list of values in cache.
     * @param {callback} [callback] - The callback returning the result of the transaction.
     * 
     */
    getAllFromCatalog(listKey, callback) {
        listKey = this.createKey(listKey);
        let data = new Array();
        return q.ninvoke(this.client, "smembers", listKey).then((members) => {
            for (let i = 0; i < members.length; i++)
                data.push(this.formatValue(members[i]));
            return data;
        }).nodeify(callback);
    };
    /**
     * @description Deletes a list of elements|values from the set from cache.
     * NOTE: It uses the format method formatValue.
     * @param {string | array} [listKey] - The unique ID used for the list of values in cache.
     * @param {callback} [callback] - The callback returning the result of the transaction.
     * 
     */
    deleteCatalog(listKey, callback) {

        let self = this;
        let idList = new Array();
        listKey = self.createKey(listKey);
        let data = q.async(function* () {
            let listItems = yield q.ninvoke(self.client, 'smembers', listKey);
            for (let i = 0; i < listItems.length; i++) {
                let type = yield q.ninvoke(self.client, 'send_command', 'TYPE', [listItems[i]]);
                if (type === 'zset') {
                    let members = yield q.ninvoke(self.client, 'zrange', listItems[i], 0, -1);
                    for (let j = 0; j < members.length; j++) {
                        idList.push(['del', members[j]]);
                    }
                }
                idList.push(['del', listItems[i]]);
            }
            idList.push(['del', listKey]);
            yield q.ninvoke(self.client.multi(idList), "exec")
        });
        return data().nodeify(callback);
    };

    /**
     * @description Method for terminate the connection with Redis.
     */
    quit() {

        this.client.quit();
        return;
    };
    /**
     * @description Method for publish a message in Redis pubsub.
     * @param {string} [channel] - Channel to subscribe
     * @param {object} [message] - Message Object 
     */ 
    publish(channel,message)
    {
        this.client.publish(channel,this.setObjectValue( message));

    };
     /**
     * @description Method for subscribe to the Redis pubsub.
     * @param {string} [channel] - Channel to subscribe
     */ 
    subscribe(channel)
    {
        this.client.subscribe(channel);

    };

    /**
     * @description Method for unsubscribe from the Redis pubusb.
     */
    unsubscribe()
    {
            this.client.unsubscribe(); 
    };

    /**
     * @description Method for subscribe to the Redis pubsub.
     * @param {string} [pattern] - Pattern to subscribe. Note : a pattern can be /testchanel/* where * can be anything.
     */ 
    psubscribe(pattern)
    {
        this.client.psubscribe(pattern);

    };

    /**
     * @description Method for unsubscribe from the Redis pubsub.
     */
    punsubscribe()
    {
            this.client.punsubscribe(); 
    };



    /**
     * @description Private method for check if is required to use the HSET or HMSET methods. 
     * @param {object} [client] - The Redis' connection client.
     * @param {string} [key] - The unique ID of the object.
     * @param {object} [data] - object for store in cache.
     * @param {callback} [callback] - The callback if is required for returning the result of the transaction from Redis.
     */
    _hsetTypeSave(client, key, data) {
        if (typeof data === 'string')
            return q.ninvoke(client, "hset", key, 'data', data);
        else
            return q.ninvoke(client, "hmset", key, data);
    };
    /**
     * @description Private method for set the expiracy of the objects, if maxTime or 
     * if the duration is set to -1. The cache will not expire.
     * @param {object} [client] - The Redis' connection client.
     * @param {string} [key] - The unique ID of the object.
     * @param {int} [duration] - The duration in seconds, -1 for infinite duration.
     */
    _setExpiracy(client, key, duration) {
        if (!(duration == -1 || this.maxTime == -1))
            client.expire(key, duration || this.maxTime);

    };
}
module.exports = Cache;