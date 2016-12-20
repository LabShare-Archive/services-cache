'use strict';
const servicesCache = require('../cache'),
    q = require('q');

class CacheClass {

    /**
     * @description Property for set the internal redis client.
     */
    get redisClient() {
        return this.client;
    }

    constructor(redisConfiguration, maxTime) {
        this.cacheClient = new servicesCache(redisConfiguration, maxTime);
        this.cacheClient.setObjectValue = ((value) => {
            return JSON.stringify(value);
        });
        this.cacheClient.formatObjectValue = ((value) => {
            return (value) ? JSON.parse(value.data) : null;
        });
    }

    _getCacheData(catalog, id, duration = 60, queryMethod, queryArgs = [null], callback) {
        let dataMethod = q.async(function* () {
            let cData = yield this.cacheClient.getObject(id);
            if (cData && cData.length != 0)
                return cData;
            // if not the data is returned from the provider    
            let data = new Object()
            data = yield steps.queryMethod.apply(data, queryArgs);
            if (!data)
                return null;
            // cache the data
            let cache = yield this.cacheClient.saveObject(id, data, duration);
            if (cache) {
                let catalogData = yield this.cacheClient.addToCatalog(catalog, id);
            }
            return data;
        });
        return dataMethod().nodeify(callback);
    }
    _refreshCache(catalog, callback) {
        this.cacheClient.deleteCatalog(catalog).nodeify(callback);
    }


};
module.exports = CacheClass;