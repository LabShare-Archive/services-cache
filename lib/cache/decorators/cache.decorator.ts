import * as _ from 'lodash';

export function Cache(options: any): Function {

    return function (target: any, methodName: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
        const className = target.constructor.name;

        descriptor.value = async function (...args: any[]) {

            const generatedCacheKey = (!Array.isArray(args) || !args.length) ? `${className}:${methodName}` : `${className}:${methodName}:${JSON.stringify(args)}`;
            const cacheKey = !_.isEmpty(options.cacheKey) ? options.cacheKey : generatedCacheKey;
            let cachingStrategy  = _.get(global, 'LABSHARE_CACHE', undefined);


            if (cachingStrategy) {
                if (options && options.noop) {
                    return originalMethod.apply(this, args);
                }
            }
            if (_.isUndefined(cachingStrategy)) {
                return undefined;
            }
            
            const entry = await cachingStrategy.getItem(cacheKey);

            if (cachingStrategy) {
                if (options && options.refreshCache && entry) {
                    await cachingStrategy.deleteItem(cacheKey);
                }
            }

            if (entry) {
                return entry;
            }

            const methodCall = originalMethod.apply(this, args);
            let methodResult;
            if (methodCall && methodCall.then) {
                methodResult = await methodCall;
            } else {
                methodResult = methodCall;
            }
            await cachingStrategy.setItem(cacheKey, methodResult, options);
            return methodResult;
        };

        return descriptor;
    };
}