'use strict';
const cacheProvider = require('../../cache'),
    _ = require('lodash'),
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
        redis, maxTime, prefix = '',catalog=null, catalogDuration = -1
    }, logger = null) {
        if (logger)
            assert(_.isFunction(logger.error), '`logger` must define an `error` function');
        this.logger = logger;
        assert.ok(_.isObject(redis) && redis.host, '`redis` must be a valid connection string');
        if (maxTime)
            assert.ok(_.isNumber(maxTime), 'maxTime` needs to be a valid number');
        assert(_.isString(prefix), '`prefix` must be a valid string');
        assert.ok(_.isNumber(catalogDuration), 'catalogDuration` needs to be a valid number. Default : -1 (not expire)');
        this.catalog =catalog;
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
                    // the client can set also a duration
                    let key = this._createKey(req);
                    //attach cache method
                    this._getfromCache(key, (error, data) => {
                        try {
                            if (error)
                                throw error;
                            if (data) {
                                return this._createCachedResponse(res, data);
                            } else {
                                return this._generateResponseForCache(req, res, next, key,duration);
                            }
                        } catch (error) {
                            error.message = 'Failed to get the response from cache: ' + error.message;
                            this._handleError(error);
                            next();
                        }
                    });
                } catch (error) {
                    error.message = 'Failed to get the response from cache: ' + error.message;
                    this._handleError(error);
                    next();
                }
            }
        }
        /**
         * @description Private method for save the response in cache.
         * @param {string} [key] - The unique ID of the object.
         * @param {object} [data] - Object for store in cache.
         * @param {int} [duration] - The duration in seconds, -1 for infinite duration.
         */
    _cacheResponse(key, data, duration, catalog) {
        try {
            let self = this;
            self.cacheClient.saveObject(key, data, duration, (error, data) => {
                if (error) {
                    error.message = 'Failed to cached the responses: ' + error.message;
                    self._handleError(error);
                }
                if (catalog)
                    self._addToCatalog(catalog, key);
            });

        } catch (error) {
            error.message = 'Failed to cached the responses: ' + error.message;
            this._handleError(error);
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
            this.cacheClient.getObject(key, (error, data) => {
                return callback(error, data);
            });
        } catch (error) {
            error.message = 'Failed to get the response from cache: ' + error.message;
            this._handleError(error);
        }
    };
    /**
     * @description Private method for attach the object from cache into the response.
     * @param {object} [response] - The response object.
     * @param {object} [data] - Object from cache.
     */
    _createCachedResponse(response, cacheObj) {
            Object.assign(response._headers, cacheObj.headers)
            let data = cacheObj.data
            if (data.type === 'Buffer') {
                data = new Buffer(data.data)
            }
            response.writeHead(cacheObj.status || 200, response._headers)
            return response.end(data, cacheObj.encoding)
        }
        /**
         * @description Private method for creates an cacheable object from the response for cache.
         * @param {object} [req] - The request object.
         * @param {object} [res] - The response object.
         * @param {function} [next] - Next method to call.
         * @param {string} [key] - The unique ID of the object.
         * @param {int} [duration] - The duration in seconds, -1 for infinite duration.
         */
    _generateResponseForCache(req, res, next, key, duration) {
        let self = this;
        res._end = res.end;
        res.end = (content, encoding) => {
            let catalog = res.req.catalog || this.catalog;
            //if the duration is changed on the request
            duration = res.req.cacheDuration || duration;
                if (res && res.req.allowCache === true) {
                    res.header({
                        'cache-control': 'max-age=' + duration
                    });
                    self._cacheResponse(key, {
                        status: res.statusCode,
                        headers: res._headers,
                        data: content,
                        encoding: encoding
                    }, duration, catalog);
                } else {
                    self._deleteCatalog(catalog, (error, data) => {
                        if (error) {
                            error.message = 'Failed to refresh the response: ' + error.message;
                            self._handleError(error);
                        }
                    });
                }

            return res._end(content, encoding)
        }
        next();
    };
    /**
     * @description Private method for add the request url to a catalog.
     * @param {string} [catalog] - The catalog's name. 
     * @param {string} [name] - The url name. 
     */
    _addToCatalog(catalog, name) {
        try {
            this.cacheClient.addToCatalog([this.prefix, catalog], name);
        } catch (error) {

            error.message = 'Failed to add item to the Catalog: ' + error.message;
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
            this.cacheClient.deleteCatalog([this.prefix, catalog], callback);
        } catch (error) {

            error.message = 'Failed to delete the catalog: ' + error.message;
            this._handleError(error);

        }
    };
    /**
     * @description Private method for create the key for cache
     * @param {object} [req] - The express' request object. 
     */
    _createKey(req) {
            let key = [];
            if (!_.isEmpty(this.prefix))
                key.push(this.prefix);
            let bodyKeys = _.flatten(_.toPairs(req.body));
            key.push(req.originalUrl || req.url);
            if (bodyKeys.length > 0) {
                return _.concat(key, bodyKeys);
            }
            return key;
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