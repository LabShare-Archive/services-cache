'use strict';

const redisCli = require('redis'),
    assert = require('assert'),
    q = require('q'),
    _ = require('lodash');
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
    constructor(redis, maxTime) {
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
        try {
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
            multi.exec((error, replies) => {
                return callback(error, replies);
            });
        } catch (error) {
            error.message = 'Failed to deep save all the objects in cache: ' + error.message;
            return callback(error);
        }
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
        this.deleteAllList(listKey, (error, response) => {
            if (error)
                return callback(error);
            this.deepSaveObjectList(listKey, objectKeyField, data, duration, callback)
        });
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
        try {
            listKey = this.createKey(listKey);
            key = this.createKey([listKey, key]);
            let newData = this.setObjectValue(data);
            let multi = this.client.multi();
            this._hsetTypeSave(multi, key, newData);
            multi.zadd(listKey, order, key);
            this._setExpiracy(multi, key, duration);
            multi.exec((error, replies) => {
                return callback(error, replies);
            });
        } catch (error) {
            error.message = 'Failed to save an object into the list in cache: ' + error.message;
            return callback(error);
        }
    };
    /**
     * @description Deletes object and removes it from the list in cache.
     * @param {string | array} [listKey] - The unique ID used for the list of object in cache.
     * @param {string | array} [key] - The unique ID used for cache the object.
     * @param {callback} [callback] - The callback returning the result of the transaction.
     * 
     */
    deleteObjectFromList(listKey, key, callback) {
        try {
            listKey = this.createKey(listKey);
            key = this.createKey([listKey, key]);
            let multi = this.client.multi();
            multi.del(key);
            multi.zrem(listKey, key);
            multi.exec((error, replies) => {
                return callback(error, replies);
            });
        } catch (error) {
            error.message = 'Failed to delete the object from the list in cache: ' + error.message;
            return callback(error);
        }
    };
    /**
     * @description Gets a list of objects from cache.
     * NOTE: It uses the format method formatObjectValue.
     * @param {string | array} [listKey] - The unique ID used for the list of object in cache.
     * @param {callback} [callback] - The callback returning the result of the transaction.
     * 
     */
    getAllObjectsList(listKey, callback) {
        this.getObjectsListByRange(listKey, 0, -1, callback);
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
            let members = yield q.ninvoke(self.client, 'zrange',listKey, from, to);
            for (let i = 0; i < members.length; i++) {
                let obj = yield  q.ninvoke(self.client, 'hgetall',members[i]);
                result.push(self.formatObjectValue(obj));

            }
            return result;

        });
        data().then((replies) => {
            return callback(null, replies)
        }).catch((error) => {
            error.message = 'Failed to get all the objects by range from cache: ' + error.message;
            return callback(error);
        }).done(() => {
            self = null;
        });
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
            let members = yield q.ninvoke(self.client,'zrange',listKey, 0, -1);
            return q.all(members.map(function (member) {
                return ['del', member];
            }));
        });
        data().then((replies) => {
            replies.push(['del', listKey]);
            self.client.multi(replies).exec((error, reply) => {
                return callback(error, reply);
            });
        }).catch((error) => {
            error.message = 'Failed to delete all the objects from cache: ' + error.message;
            return callback(error);
        }).done(() => {
            self = null;
        });
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
        try {
            key = this.createKey(key);
            let newData = this.setObjectValue(data);
            let fn = (error, response) => {
                this._setExpiracy(this.client, key, duration);
                return callback(error, response);
            };
            this._hsetTypeSave(this.client, key, newData, fn);
        } catch (error) {
            error.message = 'Failed to save the object in cache: ' + error.message;
            return callback(error);
        }

    };
    /**
     * @description Gets the object from cache.
     * NOTE: It uses the format method formatObjectValue.
     * @param {string | array} [key] - The unique ID used for cache the object.
     * @param {callback} [callback] - The callback returning the result of the transaction.
     * 
     */
    getObject(key, callback) {
        try {

            key = this.createKey(key);
            this.client.hgetall(key, (error, reply) => {
                return callback(error, this.formatObjectValue(reply));
            });
        } catch (error) {
            error.message = 'Failed to get the object from cache: ' + error.message;
            return callback(error);
        }
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
        try {
            key = this.createKey(key);
            this.client.set(key, this.setValue(data), (error, response) => {
                this._setExpiracy(this.client, key, duration);
                return callback(error, response);
            });

        } catch (error) {
            error.message = 'Failed to save the value in cache: ' + error.message;
            return callback(error);
        }

    };
    /**
     * @description Gets the value from cache.
     * NOTE: It uses the format method formatValue.
     * @param {string | array} [key] - The unique ID used for cache the value.
     * @param {callback} [callback] - The callback returning the result of the transaction.
     * 
     */
    get(key, callback) {
        try {
            key = this.createKey(key);
            this.client.get(key, (error, reply) => {
                return callback(error, this.formatValue(reply));

            });
        } catch (error) {
            error.message = 'Failed to get the value from cache: ' + error.message;
            return callback(error);
        }
    };

    /**
     * @description Deletes an object , a list or a value from cache.
     * @param {string | array} [key] - The unique ID used for cache the object.
     * @param {callback} [callback] - The callback returning the result of the transaction.
     * 
     */
    delete(key, callback) {
        try {
            key = this.createKey(key);
            this.client.del(key, (error, reply) => {
                return callback(error, reply);
            });
        } catch (error) {
            error.message = 'Failed to delete the object from cache: ' + error.message;
            return callback(error);
        }
    };

    /**
     * @description Creates a set of elements|values in cache.
     * NOTE: It uses the format method setValue.
     * @param {string | array} [listKey] - The unique ID used for the list of values in cache.
     * @param {string | array} [itemID] - Item id for store in catalog.
     * @param {int} [duration] - The duration in seconds, -1 for infinite duration.
     * 
     * */
    addToCatalog(listKey, itemID,duration) {
        try {
            listKey = this.createKey(listKey);
            let newID = this.createKey(itemID);
            this.client.sadd(listKey, newID);
            this._setExpiracy(this.client, listKey, duration);
        } catch (error) {
            error.message = 'Failed to save the objects in the catalog: ' + error.message;
            throw error;
        }
    };
    /**
     * @description Creates a set of elements|values in cache async.
     * NOTE: It uses the format method setValue.
     * @param {string | array} [listKey] - The unique ID used for the list of values in cache.
     * @param {string | array} [itemID] - Item id for store in catalog.
     * @param {int} [duration] - The duration in seconds, -1 for infinite duration.
     * @param {callback} [callback] - The callback returning the result of the transaction.
     * 
     * */
    addToCatalogAsync(listKey, itemID, duration ,callback) {
        try {
            listKey = this.createKey(listKey);
            let newID = this.createKey(itemID);
            this.client.sadd(listKey, newID, (error, data) => {
                this._setExpiracy(this.client, listKey, duration);
                return callback(error, data);
            });

        } catch (error) {
            error.message = 'Failed to save the objects in the catalog: ' + error.message;
            return callback(error);
        }
    };
    /**
     * @description Gets a list of elements|values from the set from cache.
     * NOTE: It uses the format method formatValue.
     * @param {string | array} [listKey] - The unique ID used for the list of values in cache.
     * @param {callback} [callback] - The callback returning the result of the transaction.
     * 
     */
    getAllFromCatalog(listKey, callback) {
        try {
            listKey = this.createKey(listKey);
            let data = new Array();
            this.client.smembers(listKey, (error, members) => {
                for (let i = 0; i < members.length; i++)
                    data.push(this.formatValue(members[i]));
                return callback(error, data);
            });
        } catch (error) {
            error.message = 'Failed to get all the objects from the catalog: ' + error.message;
            return callback(error);
        }

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
            try {
                let listItems = yield q.ninvoke(self.client, 'smembers',listKey);

                for (let i = 0; i < listItems.length; i++) {
                    let type = yield q.ninvoke(self.client, 'send_command','TYPE', [listItems[i]]);
                    if (type === 'zset') {
                        let members = yield q.ninvoke(self.client, 'zrange',listItems[i], 0, -1);
                        q.all(members.map(function (member) {
                            idList.push(['del', member]);
                        }));
                    }
                    idList.push(['del', listItems[i]]);
                }
                return idList;
            } catch (error) {
                return callback(error);
            }
        });
        data().then((replies) => {
            replies.push(['del', listKey]);
            self.client.multi(replies).exec((error, reply) => {
                return callback(error, reply);
            });
        }).catch((error) => {
            error.message = 'Failed to delete the catalog: ' + error.message;
            return callback(error);
        }).done(() => {
            self = null;
        });
    };

    /**
     * @description Method for terminate the connection with Redis.
     */
    quit() {

        this.client.quit();
        return;
    };
    /**
     * @description Private method for check if is required to use the HSET or HMSET methods. 
     * @param {object} [client] - The Redis' connection client.
     * @param {string} [key] - The unique ID of the object.
     * @param {object} [data] - object for store in cache.
     * @param {callback} [callback] - The callback if is required for returning the result of the transaction from Redis.
     */
    _hsetTypeSave(client, key, data, callback) {
        if (typeof data === 'string')
            client.hset(key, 'data', data, callback);
        else
            client.hmset(key, data, callback);
    };
    /**
     * @description Private method for set the expiracy of the objects, if maxTime or 
     * if the duration is set to -1. The cache will not expire.
     * @param {object} [client] - The Redis' connection client.
     * @param {string} [key] - The unique ID of the object.
     * @param {int} [duration] - The duration in seconds, -1 for infinite duration.
     */
    _setExpiracy(client, key, duration) {
        if(!(duration == -1 || this.maxTime == -1))
        client.expire(key, duration || this.maxTime);
    };
}
module.exports = Cache;