'use strict';

const cacheProvider = require('../cache'),
assert = require('assert'),
flatten = require('flat'),
q = require('q'),
 _ = require('lodash');

/**
 *
 * @Throws {Error} if is unable to connect with redis
 * @param {Object} options - List of connection information for Redis access.
 *
 * options:
 * {Object} options.connection - Connection string information for Redis.
 * {Object} options.logger - Error logging provider. It must define an `error` function. Default: null
 * {Function} options.createKey - Create key Method.
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
 *
 * @constructor
 */
class Middleware 
{
    constructor(options={})
    {
   
        this.cacheClient = new cacheProvider(options);
        this.allowedCacheRequests =[];
    };
/**
 * @description Assigns all the connection and configuration information for the Redis provider for LabShare
 *
 * Throws an exception when:
 *   - Is unable to create a connection with Redis
 *   
 */
    initialize() {
        try {
            this.cacheClient.initialize();
        } catch (error) {
            error.message = 'Failed to stablish a connection with Redis: ' + error.message;
            this._handleError(error);
        }
    };
    _cacheResponse (key,data,duration)
    {
        try
        {
            this.cacheClient.saveForCache(key,data,duration,(error,data)=>{});

        }
        catch(error)
        {
            error.message = 'Failed to cached the responses: ' + error.message;
            this._handleError(error); 
        }
    };
    _getfromCache(key,callback)
    {
        try
        {
            this.cacheClient.getObjectForCache(key,(error,data)=>{
                return callback(error,data);
            }
            );
        }
        catch(error)
        {
            error.message = 'Failed to get the response from cache: ' + error.message;
            this._handleError(error); 
        }
    };
    _generateObjectForCache(status, headers, data, encoding)
    {
        return {status,headers,data,encoding};
    };  
    _createCachedResponse(response, cacheObj) {
        Object.assign(response._headers, cacheObj.headers)
        let data = cacheObj.data
        if (data.type === 'Buffer') {
            data = new Buffer(data.data)
        }
        response.writeHead(cacheObj.status || 200, response._headers)
    return response.end(data, cacheObj.encoding)
  }
   _generateResponseForCache(req,res,next, key , duration)
    {
        let self =this;
        res._end = res.end;
        res.end = function(content, encoding){
        if (self._isAllowedForCache(res)) {
            res.header({
            'cache-control': 'max-age=' + (duration / 1000).toFixed(0)
        })
        let cacheObject = self._generateObjectForCache(res.statusCode, res._headers, content, encoding);
        self._cacheResponse(key,cacheObject,duration);
      }
      return res._end(content, encoding)
    }
    next()
    }
    getMiddleware(duration,middlewareHelper)
    {
        if (typeof middlewareHelper === 'function') {
            if (!middlewareHelper(req, res)) return next()
        } else if (middlewareHelper !== undefined && !middlewareHelper) {
            return next();
      }
      return (req,res,next)=>{
          try
          {
            let key = req.originalUrl || req.url;
            this._getfromCache(key, (error,data)=>
            {
                try
                {
                if(error)
                    throw error;
                if(data)
                {
                    return this._createCachedResponse(res,data);
                }
                else
                {
                    return this._generateResponseForCache(req,res,next,key,duration);
                }
                }
                catch(error)
                {
                    error.message = 'Failed to get the response from cache: ' + error.message;
                    this._handleError(error);
                    next();
                }   
            }
            );
          }catch(error)
          {
                error.message = 'Failed to get the response from cache: ' + error.message;
                this._handleError(error);
                next();
          }
      }

    };
     _isAllowedForCache(response)
    {
     return (response);
        

    };
 /**
 * @description Exception handler
 * @param {string} [error] - Execution error.
 */   
  _handleError(error) {
        if (this.options.logger) {
            this.options.logger.error(error.stack || error.message || error);
            return;
        }
        throw error;
    };      


}
module.exports = Middleware;