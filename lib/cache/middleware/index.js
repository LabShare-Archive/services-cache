'use strict';

const cacheMiddleware = require('./base'),
  assert = require('assert'),
  _ = require('lodash');

/**
 * @description
 * @param {Object} redis - Redis API configuration.
 * @param {Number} maxTime - The cache maxTime.
 * @param {String} prefix - Cache prefix for identification. Default : '' .
 * @param {String} catalog - Default catalog. Default : null .
 * @param {Number} catalogDuration - Catalog duration time. Default : -1 (not expire)'' .
 * {Object} logger - Error logging provider. It must define an `error` function. Default: null
 * @returns {function()} A LabShare Services configuration function that adds cache middleware to each route
 */
module.exports = function cacheServices(
  {redis, maxTime, prefix = '', duration, catalog = null, catalogDuration = -1},
  logger = null,
) {
  assert(
    _.isObject(redis) && redis.host,
    '`services-cache: "redis" is required!`',
  );
  assert(
    maxTime != null && _.isNumber(maxTime),
    `services-cache: "maxTime" is not a valid value!`,
  );
  assert(
    _.isNumber(duration),
    `services-cache: "duration" is not a valid value!`,
  );
  assert(_.isString(prefix), '`prefix` must be a valid string');
  assert.ok(
    _.isNumber(catalogDuration),
    'catalogDuration` needs to be a valid number. Default : -1 (not expire)',
  );
  let cache = new cacheMiddleware(
    {redis, maxTime, prefix, catalog, catalogDuration},
    logger,
  );
  return ({services}) => {
    _.each(services, routes => {
      routes.forEach(route => {
        route.middleware.unshift(cache.getMiddleware(duration));
      });
    });
  };
};
