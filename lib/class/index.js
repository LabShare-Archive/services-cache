'use strict';
const servicesCache = require('../cache'),
    q = require('q');
/**
 *
 * @Throws {Error} if is unable to connect with redis.
 * @param {Object} redis - Redis API configuration.
 * @param {Number} maxTime - The cache maxTime.
 * @constructor
 */
class CacheClass {

    /**
     * @description Property for set the internal redis client.
     */
    get redisClient() {
        return this.client;
    }
    constructor(redisConfiguration, maxTime) {
            this.cacheClient = new servicesCache(redisConfiguration, maxTime);
        }
        /**
         * @description Method for store information in cache from any source.
         * NOTE: It uses the format method setObjectValue and the return format method formatObjectValue .
         * @param {string | array} [catalog] - The unique ID used for the catalog in cache.
         * @param {int} [catalogDuration] - The catalog's duration in seconds, -1 for infinite duration.
         * @param {string | array} [id] - The unique ID used for the object in cache.
         * @param {int} [duration] - The duration in seconds, -1 for infinite duration.
         * @param {function} [queryMethod] - A method for retreive data.
         * @param {array} [data] - Arrays of arguments for the queryMethod.
         * @param {callback} [callback] - The callback returning the result of the transaction.
         * 
         * */
    _getCacheData(catalog = null, catalogDuration = -1, id, duration = 60, queryMethod, queryArgs = [null], callback) {
            let self = this;
            let dataMethod = q.async(function* () {
                let cData = yield self.cacheClient.getObject(id);
                if (cData && cData.length != 0)
                    return cData;
                // if not the data is returned from the provider    
                let data = new Object()
                data = yield queryMethod.apply(data, queryArgs);
                if (!data)
                    return null;
                // cache the data
                let cache = yield self.cacheClient.saveObject(id, data, duration);
                if (cache && catalog) {
                    let catalogData = yield self.cacheClient.addToCatalog(catalog, id, catalogDuration);
                }
                return data;
            });
            return dataMethod().nodeify(callback);
        }
        /**
         * @description Method for delete a Catalog and its elements.
         * NOTE: It uses the format method setObjectValue and the return format method formatObjectValue .
         * @param {string | array} [catalog] - The unique ID used for the catalog in cache.
         * @param {callback} [callback] - The callback returning the result of the transaction.
         * 
         * */
    _refreshCache(catalog, callback) {
        return this.cacheClient.deleteCatalog(catalog).nodeify(callback);
    }


};
module.exports = CacheClass;