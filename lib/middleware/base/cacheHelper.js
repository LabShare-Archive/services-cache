const _ = require('lodash');   
     /**
     * @description Helper method for cache in requests
     * @param {object} [req] - The request object.
     */
     class CacheHelper{
        constructor(req)
        {
            this.req =req;
        }
    /**
     * @description Cache the request
     * @param {string} [catalog] - the name of the catalog for the transaction. Default null.
     * @param {int} [duration] - The duration in seconds, -1 for infinite duration.
     */
        add(catalog , duration)
        {
            this.req.allowCache =true;
             if(!_.isNil(catalog))
            this.req.catalog = catalog;
            if(_.isNumber(duration))
            this.req.cacheDuration = duration;
        }
    /**
     * @description Refresh the cache
     * @param {string} [catalog] - the name of the catalog for the transaction. Default null.
     */
        refresh(catalog)
        {
            this.req.refreshCache = true;
            if(!_.isNil(catalog))
            this.req.catalog = catalog;
        }

    }
module.exports = CacheHelper;    