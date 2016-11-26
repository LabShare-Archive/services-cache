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
 * @param {string | array} [listKey] - The unique ID used for the list of object in cache.
 * @param {string} [objectKeyField field] - ID field for each of the objects.
 * @param {array} [data] - Arrays of objects for cache.
 * @param {callback} [callback] - The callback returning the result of the transaction.
 * 
 * */    
    deepSaveObjectList(listKey,objectKeyField,data,duration, callback)
    {
        try 
        {
            listKey = this.options.createKey(listKey); 
            let multi = this.client.multi();
            for(let i = 0 ; i < data.length ; i++ )
            {
                let newData = this.options.setObjectValue(data[i]);
                let newKey = this.options.createKey([listKey,data[i][objectKeyField]]);
                this._hsetTypeSave(multi,newKey,newData);
                multi.zadd(listKey,i,newKey);
                this._setExpiracy(multi,newKey,duration);   
                    
            };
                this._setExpiracy(multi,listKey,duration);   
                multi.exec((error,replies) =>{
                return callback(error,replies);
            });
	    }
     catch(error) {
        error.message = 'Failed to deep save all the objects in cache: ' + error.message;
        this._handleError(error); 
		return callback(error);
	}
    };
/**
 * @description Deletes and performs a Deep saves a list of objects
 * @param {string | array} [listKey] - The unique ID used for the list of object in cache.
 * @param {string} [ID field] - ID field for each of the objects.
 * @param {array} [data] - Arrays of objects for cache.
 * @param {callback} [callback] - The callback returning the result of the transaction.
 * 
 * */    
    refreshDeepSaveObjectList(listKey,objectKeyField,data,duration, callback)
    {
       this.deleteAllList(listKey,(error,response)=>{
        if(error)
            return callback(error);
        this.deepSaveObjectList(listKey,objectKeyField,data,duration, callback)
       });
    };    
/**
 * @description saves an object in the list of objects
 * @param {string | array} [listKey] - The unique ID used for cache list the object.
 * @param {string | array} [key] - The unique ID of the object.
 * @param {int} [order] - The order number for store the object in the list. 
 * @param {object} [data] - object for cache.
 * @param {callback} [callback] - The callback returning the result of the transaction.
 * 
 * */    
  saveObjectInList(listKey,key,order,data,duration, callback)
    {
        try 
        {
            listKey = this.options.createKey(listKey);
            key = this.options.createKey([listKey,key]); 
            let newData = this.options.setObjectValue(data);
            let multi = this.client.multi();
            this._hsetTypeSave(multi,key,newData);
            multi.zadd(listKey,key,order);
            this._setExpiracy(multi,key,duration);   
            multi.exec((error,replies) =>{
                return callback(error,replies);
            });
	    }
     catch(error) {
        error.message = 'Failed to save an object into the list in cache: ' + error.message;
        this._handleError(error); 
		return callback(error);
	    }
    };
 /**
 * @description Deletes object and removes it from the list in cache.
 * @param {string | array} [listKey] - The unique ID used for cache the object.
 * @param {string | array} [key] - The unique ID used for cache the object.
 * @param {callback} [callback] - The callback returning the result of the transaction.
 * 
 */    
   deleteObjectFromList(listKey, key, callback) {
	try {
        listKey = this.options.createKey(listKey);
        key = this.options.createKey([listKey,key]); 
        let multi = this.client.multi();
        multi.del(key);
        multi.zrem(listKey,key);   
        multi.exec((error,replies) =>{
            return callback(error,replies);
        });

	} catch(error) {
        error.message = 'Failed to delete the object from the list in cache: ' + error.message;
        this._handleError(error);
		return callback(error);
	}    
};
/**
 * @description Gets a list of objects from cache
 * @param {string | array} [key] - The unique ID used for cache the object.
 * @param {callback} [callback] - The callback returning the result of the transaction.
 * 
 */    
   getAllObjectsList(listKey , callback) {
        this.getObjectsListByRange(listKey,0,-1,callback);
    };
/**
 * @description Gets a list of objects by range from cache
 * @param {string | array} [key] - The unique ID used for cache the object.
 * @param {callback} [callback] - The callback returning the result of the transaction.
 * 
 */    
    getObjectsListByRange(listKey,from,to , callback) {
    var self = this;
    var methods = {
        zrange: q.nbind(self.client.zrange, self.client),
        hgetall: q.nbind(self.client.hgetall, self.client),
    };    
    let data = q.async(function*() {
	try {
        listKey = self.options.createKey(listKey);
        let members  = yield methods.zrange(listKey,from,to);
        return q.all(members.map ( function(member){
             let obj =methods.hgetall(member);
             return self.options.formatObjectValue(obj);
        }));
	} catch(error) {
  
		return callback(error);
	}
    });
   data().then((replies)=>{
        return callback(null,replies)
    }).catch((error)=>{      
            error.message = 'Failed to get all the objects by range from cache: ' + error.message;
            this._handleError(error); return callback(error);
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
    deleteAllList(listKey, callback) {
    var self = this;
    var methods = {
        zrange: q.nbind(self.client.zrange, self.client)
    };
    listKey = self.options.createKey(listKey);        
    let data = q.async(function*() {
	try {
        let members  = yield methods.zrange(listKey,0,-1);
        return q.all(members.map ( function(member){
             return ['del',member];
        }));
	} catch(error) {  
		return callback(error);
	}
    });
   data().then((replies)=>{
       replies.push(['del',listKey]);
       self.client.multi(replies).exec((error,reply )=>
            {
	            return callback(error,reply);
            });   
    }).catch((error)=>{      
        error.message = 'Failed to delete all the objects from cache: ' + error.message;
        self._handleError(error); return callback(error);
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
  saveObject(key,data,duration, callback)
    {
        try 
        {
            key = this.options.createKey(key);
            let newData = this.options.setObjectValue(data);
            let fn = (error,response) =>{
                   this._setExpiracy(this.client,key,duration);    
                   return callback(error,response);
                };
            this._hsetTypeSave(this.client,key,newData,fn);
	    }
     catch(error) {
        error.message = 'Failed to save the object in cache: ' + error.message;
        this._handleError(error);  
		return callback(error);
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
		return callback(error);
	}
};    
/**
 * @description Saves the value in cache
 * @param {string | array} [key] - The unique ID used for cache the object.
 * @param {object} [data] - The object for cache.
 * @param {callback} [callback] - The callback returning the result of the transaction.
 * 
 */    
    save(key,data,duration, callback)
    {
        try 
        {
            key = this.options.createKey(key);
            this.client.set(key, this.options.setValue(data), (error,response) =>{
                    this._setExpiracy(this.client,key,duration);  
                    return callback(error,response);
                });   
  
	    }
     catch(error) {
        error.message = 'Failed to save the value in cache: ' + error.message;
        this._handleError(error);  
		return callback(error);
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
		return callback(error);
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
		return callback(error);
	}    
};

/**
 * @description Creates a sorted list of elements in cache.
 * *NOTE: It will use the format methods setOValue and formatValue
 * @param {string | array} [key] - The unique ID used for cache the object.
 * @param {array} [data] - Arrays of objects for cache.
 * @param {callback} [callback] - The callback returning the result of the transaction.
 * 
 * */ 
    saveElementsInSortedSet(listKey,data,duration, callback)
    {
        try 
        {
            listKey = this.options.createKey(listKey); 
            let multi = this.client.multi();
            for(let i = 0 ; i < data.length ; i++ )
            {
                let newData = this.options.setValue(data[i]);
                multi.sadd(listKey,i,newData);
            };
              this._setExpiracy(multi,listKey,duration);
              multi.exec((error,replies) =>{
            
                return callback(error,replies);
            });
	    }
     catch(error) {
        error.message = 'Failed to save the objects in the sorted set in cache: ' + error.message;
        this._handleError(error); 
		return callback(error);
	}
    };
/**
 * @description Gets a list of objects from the sorted set from cache
 * @param {string | array} [key] - The unique ID used for cache the object.
 * @param {callback} [callback] - The callback returning the result of the transaction.
 * 
 */    
    getElementsFromSortedSet(listKey , callback) {
    var self = this;
    var methods = {
        smembers: q.nbind(self.client.smembers, self.client),
        hgetall: q.nbind(self.client.hgetall, self.client),
    };    
    let data = q.async(function*() {
	try {
        listKey = self.options.createKey(listKey);
        let members  = yield methods.smembers(listKey);
        return q.all(members.map ( function(member){
             let obj =methods.hgetall(member);
             return self.options.formatValue(obj);
        }));
	} catch(error) {
  
		return callback(error);
	}
    });
   data().then((replies)=>{
        return callback(null,replies)
    }).catch((error)=>{      
            error.message = 'Failed to get all the objects from the sorted set from cache: ' + error.message;
            this._handleError(error); return callback(error);
    }).done(()=>
       {
         self =null;
         methods = null;
    });
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
  _hsetTypeSave(client,key, data,callback) {
      if(typeof data === 'string')
                    client.hset(key,'data', data,callback);
                else
                    client.hmset(key, data,callback);
       
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