'use strict';
const cacheProvider = require('../../cache'),
    _ = require('lodash'),
    q = require('q'),
    assert = require('assert');
/**
 *
 * @Throws {Error} if is unable to connect with redis.
 * @param {Object} redis - Redis API configuration.
 * @param {Number} maxTime - The cache maxTime.
 * @param {String} prefix - Cache prefix for identification. Default : '' .
 * @param {String} catalog - Default catalog. Default : null .
 * @param {Number} catalogDuration - Catalog duration time. Default : -1 (not expire)'' .
 * {Object} logger - Error logging provider. It must define an `error` function. Default: null
 * @constructor
 */
class Middleware {
    constructor({
        redis,
        maxTime,
        prefix = '',
        catalog = null,
        catalogDuration = -1
    }, logger = null) {
        if (logger)
            assert(_.isFunction(logger.error), '`logger` must define an `error` function');
        this.logger = logger;
        assert.ok(_.isObject(redis) && redis.host, '`redis` must be a valid connection string');
        if (maxTime)
            assert.ok(_.isNumber(maxTime), 'maxTime` needs to be a valid number');
        assert(_.isString(prefix), '`prefix` must be a valid string');
        assert.ok(_.isNumber(catalogDuration), 'catalogDuration` needs to be a valid number. Default : -1 (not expire)');
        this.catalog = catalog;
        this.prefix = prefix;
        this.maxTime = maxTime;
        this.catalogDuration = catalogDuration;
        this.cacheClient = new cacheProvider(redis, this.maxTime);
        this.cacheClient.setObjectValue = ((value) => {
            return JSON.stringify(value);
        });
        this.cacheClient.formatObjectValue = ((value) => {
            return (value) ? JSON.parse(value.data) : null;
        });
    };

    /**
     * @description Gets the Middleware for response's cache.
     * For add the response to a catalog (for control the information with other methods)
     * use req.catalog = '<TO CATALOG>'.
     * For allow cache to any method 
     * use req.allowCache = true.  
     * @param {int} [duration] - The duration in seconds, -1 for infinite duration.
     */
    getMiddleware(duration) {
        return (req, res, next) => {
            try {
                //attaching the new cacheHelper method
                req.cacheHelper = {}
                let self = this;
                /**
                 * @description add the data directly to cache
                 * @param {string|array} [key] - The unique ID of the object.
                 * @param {object} [data] - Object for store in cache.
                 * @param {int} [duration] - The duration in seconds, -1 for infinite duration.
                 * @param {string} [catalog] - The catalog's name for the keys in cache.
                 * @param {callback} [callback] - The callback returning the result of the transaction.
                 */
                req.cacheHelper.cacheData = (key, data, duration, catalog, callback) => {
                    self._cacheData(self._createKeyForExtendedMethods(key), data, duration, catalog, callback);
                }
                 /**
                 * @description Method for create the key with the req parameters
                 * @param {object} [req] - Request object.
                 * @param {string || array} [catalog] - Catalog name.
                 * @param {string || array} [optional] - Optional parameter for key generation.
                 * @param {callback} [callback] - The callback returning the result of the transaction.
                 */
                req.cacheHelper.createKey = (req, catalog, optional) => {
                    return self._createKey(req, catalog, optional);
                }
                /**
                 * @description gets the data directly from cache
                 * @param {string|array} [key] - the key for the transaction. Default null.
                 * @param {callback} [callback] - The callback returning the result of the transaction.
                 */
                req.cacheHelper.getfromCache = (key, callback) => {
                     return self._getfromCache(self._createKeyForExtendedMethods(key), callback)
                    },
                    /**
                     * @description Deletes the cache by using a prefix
                     * @param {string|array} [key] - the key for the transaction. Default null.
                     * @param {callback} [callback] - The callback returning the result of the transaction.
                     */
                    req.cacheHelper.deleteDataByScan = (key, callback) => {
                        try {
                            if (_.isNil(key)) {
                                return;
                            }
                            self.cacheClient.deleteDataByScan(self._createKeyForExtendedMethods(key), callback);
                        } catch (error) {
                            self._handleError(error);
                        }
                    }
                /**
                 * @description Refresh the cache
                 * @param {string} [catalog] - the name of the catalog for the transaction. Default null.
                 * @param {callback} [callback] - The callback returning the result of the transaction.
                 */
                req.cacheHelper.refresh = (catalog, callback) => {
                    try {
                        if (_.isNil(catalog)) {
                            return;
                        }
                        self.cacheClient.deleteCatalog([self.prefix].concat(catalog), callback);
                    } catch (error) {
                        self._handleError(error);
                    }
                };
            } catch (error) {
                error.message = 'Failed to get the enable services-cache: ' + error.message;
                self._handleError(error);
                next();
            }
            next();
        }
    }
    /**
     * @description Private method for save the response in cache.
     * @param {string} [key] - The unique ID of the object.
     * @param {object} [data] - Object for store in cache.
     * @param {int} [duration] - The duration in seconds, -1 for infinite duration.
     * @param {string} [catalog] - The catalog's name for the keys in cache.
     * @param {callback} [callback] - The callback returning the result of the transaction.
     */
    _cacheData(key, data, duration, catalog, callback) {
        try {
            let self = this;
            if (catalog) {
                key.concat(catalog);
            }
            self.cacheClient.saveObject(key, data, duration, (error, data) => {
                if (error) {
                    error.message = 'Failed to cached the responses: ' + error.message;
                    self._handleError(error);
                }

                if (catalog)
                    self._addToCatalog(catalog, key);
                if (callback)
                    callback(error, data);
            });

        } catch (error) {
            error.message = 'Failed to cached the responses: ' + error.message;
            this._handleError(error);
            if (callback)
                callback(error, null);
        }
    };
    /**
     * @description Private method for retreives the response from cache.
     * @param {string} [key] - The unique ID of the object.
     * @param {object} [data] - Object for store in cache.
     * @param {callback} [callback] - The callback returning the result of the transaction.
     */
    _getfromCache(key, callback) {
        try {
            return this.cacheClient.getObject(key,callback);
        } catch (error) {
            error.message = 'Failed to get the response from cache: ' + error.message;
            this._handleError(error);
            return callback(error, null);
        }
    };
    /**
     * @description Private method for add the request url to a catalog.
     * @param {string} [catalog] - The catalog's name. 
     * @param {string} [name] - The url name. 
     */
    _addToCatalog(catalog, name) {
        try {
            if (_.isNil(catalog)) {
                return;
            }
            this.cacheClient.addToCatalog([this.prefix].concat(catalog), name, this.catalogDuration);
        } catch (error) {
            this._handleError(error);

        }
    };
    /**
     * @description Private method for delete the catalog and it's contents.
     * @param {string | array} [catalog] - The catalog's name. 
     * @param {object} [req] - The express' request object. 
     */
    _deleteCatalog(catalog, callback) {
        try {
            if (_.isNil(catalog)) {
                return;
            }
            this.cacheClient.deleteCatalog([this.prefix].concat(catalog),callback);
        } catch (error) {
            this._handleError(error);

        }
    };
    /**
     * @description Private method for create the key for cache
     * @param {object} [req] - The express' request object. 
     * @param {string} [catalog] - Optional the catalog name. 
     * @param {string} [optional] - Optional extra parameters for key. 
     */
    _createKey(req,catalog,optional) {
        let key = [];
        let bodyKeys = _.flatten(_.toPairs(req.body));
        key.push(req.originalUrl || req.url);
        if (bodyKeys.length > 0) {
            if (_.isObject(bodyKeys)) {
                bodyKeys = JSON.stringify(bodyKeys);
            }
            key = _.concat(key, bodyKeys);
        }
        if (!_.isNil(catalog)) {
            key = catalog.concat(key);
        }
        if (!_.isNil(optional)) {
            key = key.concat(optional);
        }
        return key;
    }
    /**
     * @description Private method for create the key for cache
     * @param {string||array} [key] - the object's key. 
     */
    _createKeyForExtendedMethods(key) {
        let newKey = [];
        if (!_.isEmpty(this.prefix))
            newKey.push(this.prefix);
        return _.concat(newKey, key);
    }
    /**
     * @description Exception handler
     * @param {string} [error] - Execution error.
     */
    _handleError(error) {
        if (this.logger) {
            this.logger.error(error.stack || error.message || error);
            return;
        }
    };


}
module.exports = Middleware;