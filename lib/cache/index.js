'use strict';

const redis = require('redis'),
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
class Cache 
{
    constructor(options={})
    {
        
        this.client = null;
        if(options.configuration && options.configuration.maxTime)
            assert.ok(typeof options.configuration.maxTime === "number" && options.configuration.maxTime  >0, '`options.configuration` must define `maxTime` as a valid number');
        if (options.logger)
            assert.ok(_.isFunction(options.logger.error), '`options.logger` must define an `error` function');
        this.options = _.defaults(options, {
            logger: null,
            createKey :(objectID)=> 
            {
                assert(objectID != null);
                if(_.isArray(objectID))
                   return _.join(objectID,':');
                 return String(objectID);  
            },
            setValue:(value)=>
            {
                return (value)?JSON.stringify(value):null;
    
            },
            formatValue:(value)=>
            {
                return (value)?JSON.parse(value):null;
    
            },
            setObjectValue:(value)=>
            {
              return (value)?JSON.stringify(value):null;

            },
            formatObjectValue:(value)=>
            {
               return (value)?JSON.parse(value.data):null;
    
            },
            keyFunction:(value)=>
            {
                return _.random(0,1000);

            },
            configuration: {
            },connection:{}   
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
            this.client = redis.createClient(this.options.connection);
        } catch (error) {
            error.message = 'Failed to stablish a connection with Redis: ' + error.message;
            this._handleError(error);
        }
    };    
/**
 * @description Deep saves a list of objects
 * @param {string | array} [key] - The unique ID used for cache the object.
 * @param {array} [data] - Arrays of objects for cache.
 * @param {function} [keyFunction] - Arrays of objects for cache. Default: Function that generates a random ID
 * @param {callback} [callback] - The callback returning the result of the transaction.
 * 
 * */    
    deepSaveObjectList(key,data,keyFunction =this.options.keyFunction, callback)
    {
        try 
        {
            let referenceListID = this.options.createKey(key); 
            let multi = this.client.multi();
            for(let i = 0 ; i < data.length ; i++ )
            {
                let newData = this.options.setObjectValue(data[i]);
                let newKeyArray = key.slice();
                newKeyArray.push(keyFunction(i));
                let newKey = this.options.createKey(newKeyArray);
                multi.hmset(newKey, newData);
                multi.sadd(referenceListID,newKey);
                //if maxTime is set, setting expiracy to the object in redis
                if(this.options.configuration.maxTime)
                {
                    multi.expire(newKey, this.options.configuration.maxTime);   
                }    
            };
               //if maxTime is set, setting expiracy to the object in redis
                if(this.options.configuration.maxTime)
                {
                    multi.expire(referenceListID, this.options.configuration.maxTime);   
                }    
              multi.exec((error,replies) =>{
            
                return callback(error,replies);
            });
	    }
     catch(error) {
        error.message = 'Failed to deep save all the objects in cache: ' + error.message;
        this._handleError(error); 
		return callback(error,null);
	}
    };
/**
 * @description saves an object in the list of objects
 * @param {string | array} [Listkey] - The unique ID used for cache the object.
 * @param {string | array} [key] - The unique ID used for cache the object.
 * @param {array} [data] - Arrays of objects for cache.
 * @param {function} [keyFunction] - Arrays of objects for cache. Default: Function that generates a random ID
 * @param {callback} [callback] - The callback returning the result of the transaction.
 * 
 * */    
  saveObjectList(ListKey,key,data,keyFunction =this.options.keyFunction, callback)
    {
        try 
        {
            ListKey = this.options.createKey(ListKey);
            key = this.options.createKey(key); 
            let newData = this.options.setObjectValue(data);
            let multi = this.client.multi();
            multi.hmset(key, newData);
            multi.sadd(ListKey,key);
            //if maxTime is set, setting expiracy to the object in redis
            if(this.options.configuration.maxTime)
            {
                multi.expire(key, this.options.configuration.maxTime);   
            }    
            //if maxTime is set, setting expiracy to the object in redis
            if(this.options.configuration.maxTime)
            {
                multi.expire(ListKey, this.options.configuration.maxTime);   
            }    
            multi.exec((error,replies) =>{
                return callback(error,replies);
            });
	    }
     catch(error) {
        error.message = 'Failed to save an object into the list in cache: ' + error.message;
        this._handleError(error); 
		return callback(error,null);
	}
    };
 /**
 * @description Deletes object and removes it from the list in cache.
 * @param {string | array} [Listkey] - The unique ID used for cache the object.
 * @param {string | array} [key] - The unique ID used for cache the object.
 * @param {callback} [callback] - The callback returning the result of the transaction.
 * 
 */    
   deleteObjectFromList(ListKey, key, callback) {
	try {



            ListKey = this.options.createKey(ListKey);
            key = this.options.createKey(key); 
            let multi = this.client.multi();
            multi.del(key, newData);
            multi.srem(ListKey,key);   
            multi.exec((error,replies) =>{
                return callback(error,replies);
            });

	} catch(error) {
        error.message = 'Failed to delete the object from the list in cache: ' + error.message;
        this._handleError(error);
		return callback(error,null);
	}    
};
      

/**
 * @description Gets a list of objects from cache
 * @param {string | array} [key] - The unique ID used for cache the object.
 * @param {callback} [callback] - The callback returning the result of the transaction.
 * 
 */    
    getAllObjectsList(key , callback) {
    var self = this;
    var methods = {
    smembers: q.nbind(self.client.smembers, self.client),
    hgetall: q.nbind(self.client.hgetall, self.client),
    };    
    let data = q.async(function*() {
	try {
        key = self.options.createKey(key);
        let smembers  = yield methods.smembers(key);
        return q.all(smembers.map ( function(member){
             let obj =methods.hgetall(member);
             return self.options.formatObjectValue(obj);
        }));
	} catch(error) {
  
		throw(error);
	}
    });
   data().then((replies)=>{
       return callback(null,replies)
    }).catch((error)=>{      
        error.message = 'Failed to get all the objects from cache: ' + error.message;
        this._handleError(error); return callback(error,null);
    }).done(()=>
       {
         self =null;
         methods = null;
       });
};
/**
 * @description Deletes object from cache
 * @param {string | array} [key] - The unique ID used for cache the object.
 * @param {callback} [callback] - The callback returning the result of the transaction.
 * 
 */    
    deleteAllList(key, callback) {
    var self = this;
    var methods = {
    smembers: q.nbind(self.client.smembers, self.client)
    };
    key = self.options.createKey(key);        
    let data = q.async(function*() {
	try {
        let smembers  = yield methods.smembers(key);
        return q.all(smembers.map ( function(member){
             return ['del',member];
        }));
	} catch(error) {  
		throw(error);
	}
    });
   data().then((replies)=>{
       replies.push(['del',key]);
        self.client.multi(replies).exec((error,reply )=>
            {
	            return callback(error,reply);
            });   
    }).catch((error)=>{      
        error.message = 'Failed to delete all the objects from cache: ' + error.message;
        self._handleError(error); return callback(error,null);
    }).done(()=>
    {
         self =null;
         methods = null;
    });
};    
/**
 * @description Saves the object in cache
 * @param {string | array} [key] - The unique ID used for cache the object.
 * @param {object} [data] - The object for cache.
 * @param {callback} [callback] - The callback returning the result of the transaction.
 * 
 *    
    saveObject(key,data, callback)
    {
        try 
        {
            key = this.options.createKey(key);
            let newData = this.options.setObjectValue(data);
                //creating the object in redis
                this.client.hmset(key, newData, (error,response) =>{

                //if maxTime is set, setting expiracy to the object in redis
                    if(this.options.configuration.maxTime)
                    {
                        this.client.expire(key, this.options.configuration.maxTime);   
                    }
                   return callback(error,response);
                });
	    }
     catch(error) {
        error.message = 'Failed to save the object in cache: ' + error.message;
        this._handleError(error);  
		return callback(error,null);
	}

    };
/**
 * @description Saves the object in cache
 * @param {string | array} [key] - The unique ID used for cache the object.
 * @param {object} [data] - The object for cache.
 * @param {int} [duration] - Duration for the cache.
 * @param {callback} [callback] - The callback returning the result of the transaction.
 * 
 */    
    saveForCache(key,data,duration, callback)
    {
        try 
        {
            key = this.options.createKey(key);
            let newData = this.options.setObjectValue(data);
                //creating the object in redis
                this.client.hset(key,'data', newData, (error,response) =>{
                   this.client.expire(key, duration);   
                   return callback(error,response);
                });
	    }
     catch(error) {
        error.message = 'Failed to save the object in cache: ' + error.message;
        this._handleError(error);  
		return callback(error,null);
	}

    };    
/**
 * @description Gets the object from cache
 * @param {string | array} [key] - The unique ID used for cache the object.
 * @param {callback} [callback] - The callback returning the result of the transaction.
 * 
 */    
    getObjectForCache(key, callback) {
	try {

            key = this.options.createKey(key);
           
            this.client.hgetall(key, (error, reply)=> 
            {
                return callback(error,this.options.formatObjectValue(reply));
            });
	} catch(error) {
        error.message = 'Failed to get the object from cache: ' + error.message;
        this._handleError(error);  
		return callback(error,null);
	}
};
/**
 * @description Saves the value in cache
 * @param {string | array} [key] - The unique ID used for cache the object.
 * @param {object} [data] - The object for cache.
 * @param {callback} [callback] - The callback returning the result of the transaction.
 * 
 */    
    save(key,data, callback)
    {
        try 
        {
            key = this.options.createKey(key);
            //creating the object in redis
            if(data)
            {
                this.client.set(key, this.options.setValue(data), (error) =>{
                //if maxTime is set, setting expiracy to the object in redis
                    if(this.options.configuration.maxTime)
                    {
                    this.client.expire(key, this.options.configuration.maxTime);   
                    }
                    callback(error,data);
                });   
                
            }
            else callback(null,null);
           
	    }
     catch(error) {
        error.message = 'Failed to save the value in cache: ' + error.message;
        this._handleError(error);  
		return callback(error,null);
	}

    };
/**
 * @description Gets the value from cache
 * @param {string | array} [key] - The unique ID used for cache the object.
 * @param {callback} [callback] - The callback returning the result of the transaction.
 * 
 */
    get(key, callback) {
	try {
            key = this.options.createKey(key);
            this.client.get(key, (error, reply)=> 
            {
                if(reply)
                    return callback(error,this.options.formatValue(reply));
                    else
                    return callback(null,null);
            });
	} catch(error) {
        error.message = 'Failed to get the value from cache: ' + error.message;
        this._handleError(error);
		return callback(error,null);
	}
};

/**
 * @description Deletes object from cache
 * @param {string | array} [key] - The unique ID used for cache the object.
 * @param {callback} [callback] - The callback returning the result of the transaction.
 * 
 */    
    delete(key, callback) {
	try {
            key = this.options.createKey(key);
            this.client.del(key, (error, reply)=> 
            {
                    return callback(error,reply);
            });
	} catch(error) {
        error.message = 'Failed to delete the object from cache: ' + error.message;
        this._handleError(error);
		return callback(error,null);
	}    
};
   

 /**
 * @description Method for terminate the connection with Redis.
 */
    quit()
    {
        try {
        
            this.client.quit(); 
            return;

        } catch (error) {
            error.message = 'Failed to quit the connection: ' + error.message;
            this._handleError(error);
        }

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
module.exports = Cache;