'use strict';
const servicesCache = require('../cache'),
q = require('q');

class  CacheClass {

     /**
     * @description Property for set the internal redis client.
     */
    get redisClient() {
        return  this.client;
    }

    constructor(redisConfiguration,maxTime,...options)
    {
           this.cacheClient = new servicesCache(redisConfiguration,options);
           this.cacheClient.setObjectValue = ((value)=>{return  JSON.stringify(value);});
           this.cacheClient.formatObjectValue = ((value)=>{
              return (value)?JSON.parse(value.data):null;});
    }

    _getCacheData(catalog,id,duration=60,queryMethod,queryArgs=[null],callback)
    {
        let steps = {
                getCacheData: q.nbind(this.cacheClient.getObject, this.cacheClient),
                getData: queryMethod,
                cacheData:q.nbind(this.cacheClient.saveObject, this.cacheClient),
                addToCatalog:q.nbind(this.cacheClient.addToCatalogAsync, this.cacheClient)
        };
        let dataMethod = q.async(function*() {
        let cData = yield steps.getCacheData(id);
        if(cData && cData.length != 0)
            return cData;
        // if not the data is returned from the provider    
        let data = new Object()
        data = yield steps.getData.apply(data,queryArgs);
        if(!data)
          return null;
        // cache the data
            let cache = yield steps.cacheData(id,data,duration);
        if(cache)
        {
            let catalogData =  yield steps.addToCatalog(catalog,id);
        }
          return data;
        });
        dataMethod().then((replies)=>{
        return callback(null,replies)
        }).catch((error)=>{      
            error.message = 'There was an error with the cache layer: ' + error.message;
            return callback(error);
        }).done(()=>
        {
        });
    }
   _refreshCache(catalog,callback)
   {
       this.cacheClient.deleteCatalog(catalog,callback);
   } 

  
};
module.exports = CacheClass;





