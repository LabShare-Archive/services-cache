'use strict';

const cacheMiddleware = require('./base'),
    assert = require('assert'),
    _ = require('lodash');

/**
 * @description
 * @param {object} cacheConfiguration - The connection string information for Redis.
 * @param {object} logger - Error logger for the Redis' middleware.
 * @returns {function()} A LabShare Services configuration function that adds cache middleware to each route
 */
module.exports = function cacheServices({cacheConfiguration},logger =null) {

     assert(_.isObject(cacheConfiguration), '`services-cache: "cache configuration" is required!`');
     assert(_.isObject(cacheConfiguration.redis) && cacheConfiguration.redis.host, '`services-cache: "redis" is required!`');
     assert(cacheConfiguration.maxTime != null && _.isNumber(cacheConfiguration.maxTime), `services-cache: "maxTime" is not a valid value!`);
     assert(_.isNumber(cacheConfiguration.duration), `services-cache: "duration" is not a valid value!`);
     assert(_.isString(cacheConfiguration.prefix), '`prefix` must be a valid string');
     assert.ok(_.isNumber(cacheConfiguration.catalogDuration), 'catalogDuration` needs to be a valid number. Default : -1 (not expire)');
    let cache = new cacheMiddleware(cacheConfiguration.redis,cacheConfiguration.maxTime,cacheConfiguration.prefix,cacheConfiguration.catalogDuration,logger);
    return ({services}) => {
        _.each(services, routes => {
            routes.forEach(route => {
                    route.middleware.unshift(cache.getMiddleware((cacheConfiguration.duration)));
            });
        });
    }
};
