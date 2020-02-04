import * as _ from 'lodash';
import {IOptions} from '../types';
import {CacheConstants} from '../constants/index';
import {IStorage} from '../storages/IStorage';

export function CacheClear(options: IOptions): Function {
  return function(
    target: Object,
    methodName: string,
    descriptor: PropertyDescriptor,
  ) {
    const className = target.constructor.name;

    descriptor.value = async function(...args: any[]) {
      const cachingStrategy: IStorage = _.get(
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
        if (options?.noop) {
          return descriptor.value!.apply(this, args);
        }
      }

      const entry = await cachingStrategy.getItem(hashKey);

      if (entry) {
        await cachingStrategy.deleteItem(hashKey);
      }
      return;
    };
    return descriptor;
  };
}
