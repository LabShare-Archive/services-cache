'use strict';

const cacheMiddleware = require('./middleware'),
    assert = require('assert'),
    _ = require('lodash');

/**
 * @description
 * @param {object} redisConfiguration - The connection string information for Redis.
 * @returns {function()} A LabShare Services configuration function that adds cache middleware to each route
 */
module.exports = function authServices({redisConfiguration},maxTime,...options) {
    assert(redisConfiguration != null, `services-cache: "redisConfiguration" is required!`);
     assert(maxTime != null && typeof maxTime == number, `services-cache: "maxTime" is not a valid value!`);
    let cache = new cacheMiddleware(redisConfiguration);
    return ({services}) => {
        _.each(services, routes => {
            routes.forEach(route => {
                    route.middleware.unshift(cache.getMiddleware((maxTime)?maxTime:-1,options));
            });
        });
    }
};
