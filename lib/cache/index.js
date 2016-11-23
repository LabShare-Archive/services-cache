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


    get redisClient() {
        return  this.client;
    }
    set redisClient(value) {
        this.client = value;
    }
    
    set createKey(fn) {
        this.options.createKey = fn;
    }
    set setValue(fn) {
        this.options.setValue = fn;
    }   
    set setObjectValue(fn) {
        this.options.setObjectValue = fn;
    }
     set formatValue(fn) {
        this.options.formatValue = fn;
    }   
    set formatObjectValue(fn) {
        this.options.formatObjectValue = fn;
    }
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
                return value;
    
            },
            formatValue:(value)=>
            {
                return value;
    
            },
            setObjectValue:(value)=>
            {
              return value;
            },
            formatObjectValue:(value)=>
            {
               return value;
    
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
 * @param {string | array} [ListKey] - The unique ID used for the list of object in cache.
 * @param {string} [ID field] - ID field for each of the objects.
 * @param {array} [data] - Arrays of objects for cache.
 * @param {callback} [callback] - The callback returning the result of the transaction.
 * 
 * */    
    deepSaveObjectList(ListKey,objectKeyField,data, callback)
    {
        try 
        {
            ListKey = this.options.createKey(ListKey); 
            let multi = this.client.multi();
            for(let i = 0 ; i < data.length ; i++ )
            {
                let newData = this.options.setObjectValue(data[i]);
                let newKey = this.options.createKey([ListKey,data[i][objectKeyField]]);
                if(typeof newData === 'string')
                    multi.hset(newKey,'data', newData);
                else
                    multi.hmset(newKey, newData);
                multi.zadd(ListKey,i,newKey);
                this._setExpiracy(multi,newKey);   
                    
            };
                this._setExpiracy(multi,ListKey);   
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
 * @param {string | array} [ListKey] - The unique ID used for cache the object.
 * @param {array} [data] - Arrays of objects for cache.
 * @param {function} [keyFunction] - Arrays of objects for cache. Default: Function that generates a random ID
 * @param {callback} [callback] - The callback returning the result of the transaction.
 * 
 * */    
  saveObjectList(ListKey,objectKeyField,data, callback)
    {
        try 
        {
            ListKey = this.options.createKey(ListKey);
            let key = this.options.createKey([key,data[i][objectKeyField]]); 
            let newData = this.options.setObjectValue(data);
            let multi = this.client.multi();
            if(typeof newData === 'string')
                multi.hset(key,'data', newData);
            else
                multi.hmset(key, newData);
            multi.zadd(ListKey,key);
            this._setExpiracy(multi,key);
            this._setExpiracy(multi,ListKey);      
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
            multi.zrem(ListKey,key);   
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
    getAllObjectsList(ListKey , callback) {
    var self = this;
    var methods = {
    zrange: q.nbind(self.client.zrange, self.client),
    hgetall: q.nbind(self.client.hgetall, self.client),
    };    
    let data = q.async(function*() {
	try {
        ListKey = self.options.createKey(ListKey);
        let members  = yield methods.zrange(ListKey,0,-1);
        return q.all(members.map ( function(member){
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
    deleteAllList(ListKey, callback) {
    var self = this;
    var methods = {
        zrange: q.nbind(self.client.zrange, self.client)
    };
    ListKey = self.options.createKey(ListKey);        
    let data = q.async(function*() {
	try {
        let members  = yield methods.zrange(ListKey,0,-1);
        return q.all(members.map ( function(member){
             return ['del',member];
        }));
	} catch(error) {  
		throw(error);
	}
    });
   data().then((replies)=>{
       replies.push(['del',ListKey]);
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
 */   
  saveObject(key,data, callback)
    {
        try 
        {
            key = this.options.createKey(key);
            let newData = this.options.setObjectValue(data);
            let fn = (error,response) =>{
                   this._setExpiracy(this.client,key);    
                   return callback(error,response);
                };
            if(typeof newData === 'string')
                this.client.hset(key,'data', newData,fn);
            else
                this.client.hmset(key, newData,fn); 
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
getObject(key, callback) {
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
            this.client.set(key, this.options.setValue(data), (error,response) =>{
                    this._setExpiracy(this.client,key);  
                    return callback(error,response);
                });   
  
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
                return callback(error,this.options.formatValue(reply));
             
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
 * @description Creates an ordered sorted list of elements.
 * *NOTE: It will use the format methods setValue and formatValue
 * @param {string | array} [key] - The unique ID used for cache the object.
 * @param {array} [data] - Arrays of objects for cache.
 * @param {callback} [callback] - The callback returning the result of the transaction.
 * 
 * */    
    saveArrayInOrderedSortedSet(ListKey,data, callback)
    {
        try 
        {
            ListKey = this.options.createKey(ListKey); 
            let multi = this.client.multi();
            for(let i = 0 ; i < data.length ; i++ )
            {
                let newData = this.options.setObjectValue(data[i]);
                multi.zadd(ListKey,i,newData);
            };
              this._setExpiracy(multi,ListKey);        
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
 * @description Creates a sorted list of elements.
 * *NOTE: It will use the format methods setOValue and formatValue
 * @param {string | array} [key] - The unique ID used for cache the object.
 * @param {array} [data] - Arrays of objects for cache.
 * @param {callback} [callback] - The callback returning the result of the transaction.
 * 
 * */    
    saveArrayInSortedSet(ListKey,data, callback)
    {
        try 
        {
            ListKey = this.options.createKey(ListKey); 
            let multi = this.client.multi();
            for(let i = 0 ; i < data.length ; i++ )
            {
                let newData = this.options.setObjectValue(data[i]);
                multi.sadd(ListKey,i,newData);
            };
              this._setExpiracy(multi,ListKey);
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
/**
 * @description Exception handler
 * @param {string} [error] - Execution error.
 */   
  _setExpiracy(client, key,duration) {
      if(duration|| this.options.configuration.maxTime)
        client.expire(key,duration|| this.options.configuration.maxTime);   
       
    };     



}
module.exports = Cache;