'use strict';

const cacheMiddleware = require('./base'),
    assert = require('assert'),
    _ = require('lodash');

/**
 * @description
 * @param {object} redisConfiguration - The connection string information for Redis.
 * @returns {function()} A LabShare Services configuration function that adds cache middleware to each route
 */
module.exports = function cacheServices({redisConfiguration},duration,maxTime,...options) {
    assert(_.isObject(redisConfiguration) && redisConfiguration.host, '`services-cache: "redisConfiguration" is required!`);
     assert(maxTime != null && _.isNumber(maxTime), `services-cache: "maxTime" is not a valid value!`);
     assert(_.isNumber(duration), `services-cache: "duration" is not a valid value!`);
    let cache = new cacheMiddleware(redisConfiguration,maxTime,options);
    return ({services}) => {
        _.each(services, routes => {
            routes.forEach(route => {
                    route.middleware.unshift(cache.getMiddleware((duration));
            });
        });
    }
};
