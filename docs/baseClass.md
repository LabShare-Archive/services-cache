### Base Class

This base class delivers generic methods for store and retreive data in Redis.

### Usage

Extends your class with Base Class and add the super method in the contructor.
```sh
const baseClass = require('services-cache').Class;
  class testClass extends baseClass {

        get TestTime() {
            return this._testTime;

        }
        set TestTime(value) {
            this._testTime = value;
        }

        _dummyData(time) {
            return [
                { id: 1, name: "test1", testTime: time },
                { id: 2, name: "test2", testTime: time },
                { id: 3, name: "test3", testTime: time },
                { id: 4, name: "test4", testTime: time },
                { id: 5, name: "test5", testTime: time }
            ];
        }

        getData() {
            return this._getCacheData(this._catalog, config.catalogDuration, "TESTClass", config.duration, this._dummyData, [this._testTime]);
        }
        updateData() {
            return this._refreshCache(this._catalog);
        }
        constructor() {

            super(config.redis, config.maxTime);
            this._catalog = "TEST-CLASS-CATALOG";
            this._testTime = null;

        }
    }

```

### Methods
- **_getCacheData**: Generic method for save and retreive data from cache.
```sh
        / * @description Method for store information in cache from any source.
         * NOTE: It uses the format method setObjectValue and the return format method formatObjectValue .
         * @param {string | array} [catalog] - The unique ID used for the catalog in cache.
         * @param {int} [catalogDuration] - The catalog's duration in seconds, -1 for infinite duration.
         * @param {string | array} [id] - The unique ID used for the object in cache.
         * @param {int} [duration] - The duration in seconds, -1 for infinite duration.
         * @param {function} [queryMethod] - A method for retreive data.
         * @param {array} [data] - Arrays of arguments for the queryMethod.
         * @param {callback} [callback] - The callback returning the result of the transaction.
         * 
         * */
         _getCacheData(catalog = null, catalogDuration = -1, id, duration = 60, queryMethod, queryArgs = [null], callback)
```
Note: Is ready for promises, you dont need to send a callback.
- **_refreshCache**: method for retreive a value from cache.
```sh
         /**
         * @description Method for delete a Catalog and its elements.
         * NOTE: It uses the format method setObjectValue and the return format method formatObjectValue .
         * @param {string | array} [catalog] - The unique ID used for the catalog in cache.
         * @param {callback} [callback] - The callback returning the result of the transaction.
         * 
         * */
    _refreshCache(catalog, callback)
```
Note: Is ready for promises, you dont need to send a callback.
