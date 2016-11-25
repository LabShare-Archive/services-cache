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
        if(options.configuration && options.configuration.maxTime)
            assert.ok(typeof options.configuration.maxTime === "number" && options.configuration.maxTime  >0, '`options.configuration` must define `maxTime` as a valid number');
        if (options.logger)
            assert.ok(_.isFunction(options.logger.error), '`options.logger` must define an `error` function');
        this.options = _.defaults(options, {
            logger: null  
        });       
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
            this.cacheClient = new cacheProvider(this.options);
            this.cacheClient.setObjectValue = ((value)=>{return JSON.stringify(value)});
            this.cacheClient.formatObjectValue = ((value)=>{return (value)?JSON.parse(value.data):null;}); 
          
            this.notAllowedCacheRoutes = new Set();
            this.cacheClient.initialize();
        } catch (error) {
            error.message = 'Failed to stablish a connection with Redis: ' + error.message;
            this._handleError(error);
        }
    };


    addDisabledCache(req)
    {
        try
        {
            this.notAllowedCacheRoutes.add(req.originalUrl);
        }catch(error)
        {

            error.message = 'Failed to add disabled cache ' + error.message;
            this._handleError(error);

        }
    };
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
            if(this.notAllowedCacheRoutes.has(req.originalUrl))
            {
              return next();
            }
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

    }
    _cacheResponse (key,data,duration)
    {
        try
        {
            this.cacheClient.saveObject(key,data,duration,(error,data)=>{
                if(error)
                {
                    error.message = 'Failed to cached the responses: ' + error.message;
                    this._handleError(error); 
                }

            });

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
            this.cacheClient.getObject(key,(error,data)=>{
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
            if(res){
            res.header({'cache-control': 'max-age=' + duration });
            self._cacheResponse(key,{status: res.statusCode,headers:res._headers,data:content,encoding:encoding},duration);
            };
            return res._end(content, encoding)

        }
        next();
     
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