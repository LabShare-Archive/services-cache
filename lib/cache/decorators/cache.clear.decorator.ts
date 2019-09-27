import * as _ from 'lodash';
import {IOptions} from '../types';
import {CacheConstants} from '../constants/index';

export function CacheClear(options: IOptions): Function {
  return function(
    target: any,
    methodName: string,
    descriptor: PropertyDescriptor,
  ) {
    const className = target.constructor.name;

    descriptor.value = async function(...args: any[]) {
      const cachingStrategy = _.get(
        global,
        CacheConstants.LABSHARE_CACHE,
        undefined,
      );
      const generatedCacheKey =
        !Array.isArray(args) || !args.length
          ? `${className}:${methodName}`
          : `${className}:${methodName}:${JSON.stringify(args)}`;
      const hashKey = !_.isEmpty(options.cacheKey)
        ? options.cacheKey
        : generatedCacheKey;

      // If there is no client, no-op is enabled (else we would have thrown before),
      // just return the result of the decorated method (no caching)
      if (!cachingStrategy) {
        if (options && options.noop) {
          return descriptor.value!.apply(this, args);
        }
      }

      const entry = await cachingStrategy.getItem(hashKey);

      if (entry) {
        return await cachingStrategy.deleteItem(hashKey);
      } else {
        return;
      }
    };
    return descriptor;
  };
}
