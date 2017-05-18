### Middleware

This Middleware allows to cache any response from your express web server

### Usage

Just set express.use( Middleware ).

### Configuration
The values of the configuration in the middleware constructor are:

```sh
     const middleware = require ('services-cache').Middleware;
    let middlewareClient = new middleware({redis:config.redis, maxTime:config.maxTime, prefix:config.prefix, catalogDuration: config.catalogDuration, logger: config.options });
```
| Property  | Type | Details |
| :-------------- |:------:|:----- |
|enable        | bool | Enables the cache in the service. Required. |
| duration        | number | The duration of each object in cache. (-1) no expire.|
| maxTime        | number | Default max time if duration or catalog duration is missing. Required. |
| catalog    | string | The default's cache catalog value, for refresh the information between requests. |
| catalogDuration        | number | The duration of the catalog in cache. (-1) no expire. |
| prefix    | string | Prefix values for each of the objects in cache. Required. |
| redis    | object |[Redis](https://github.com/NodeRedis/node_redis) configuration. Required. |

Also you may send an error method:
```sh
 options: {
       
            error: function (error) {
                console.log(error);

```

### Method
- **req.cacheHelper**: Helper Method for cache or refresh the request.
```sh
         /**
   * @description Cache the request
   * @param {string|array} [catalog] - the name of the catalog for the transaction. Default null.
   * @param {int} [duration] - The duration in seconds, -1 for infinite duration.
   */
                req.cacheHelper.add = (catalog, duration) => {
                  ........
                }
                /**
* @description add the data directly to cache
* @param {string|array} [key] - The unique ID of the object.
     * @param {object} [data] - Object for store in cache.
     * @param {int} [duration] - The duration in seconds, -1 for infinite duration.
     * @param {string} [catalog] - The catalog's name for the keys in cache.
     * @param {callback} [callback] - The callback returning the result of the transaction.
*/
                req.cacheHelper.addData = (key, data, duration, catalog, callback) => {
                ........
                }
                /**
* @description gets the data directly from cache
* @param {string|array} [key] - the key for the transaction. Default null.
* @param {callback} [callback] - The callback returning the result of the transaction.
*/
                req.cacheHelper.getData = (key, callback) => {
                    ........
                },
                    /**
       * @description Deletes the cache by using a prefix
       * @param {string|array} [key] - the key for the transaction. Default null.
       * @param {callback} [callback] - The callback returning the result of the transaction.
       */
                    req.cacheHelper.deleteDataByScan = (key, callback) => {
                         ........
                    }
                /**
   * @description Refresh the cache
   * @param {string} [catalog] - the name of the catalog for the transaction. Default null.
   * @param {callback} [callback] - The callback returning the result of the transaction.
   */
                req.cacheHelper.refresh = (catalog, callback) => {
                     ........
                }
```
Example

```sh
     app.get('/test/data', function (req, res) {
        req.cacheHelper.add("TEST-CATALOG");
        res.send('cached')

    });
    app.get('/test/dataFive', function (req, res) {
     req.cacheHelper.add("TEST-CATALOG",5);
    res.send('cached for 5 seconds')

    });
     app.get('/test/dataIngore', function (req, res) {
        res.send('no cached')

    });

     app.post('/test/postData', function (req, res) {
        req.cacheHelper.refresh("TEST-CATALOG");
        res.send('refreshed')

    });
     //adds data by using the method directly
    app.post('/test/addDataDirectly', function (req, res) {
        req.cacheHelper.addData('TEST', mockData,null,"TEST-CATALOG", (err, data) => {
            if (!err)
                res.send('cached');
            else
                res.status(500).send({ error: err });
        });
    });
    //gets data by using the method directly
    app.get('/test/getDataDirectly', function (req, res) {
        req.cacheHelper.getData('TEST', (err, data) => {
            if (!err)
                res.send(data)
            else
                res.status(500).send({ error: err });
        });
    });
    //deletes all the data by using a prefix
    app.post('/test/clearData', function (req, res) {
        req.cacheHelper.deleteDataByScan('', (err, data) => {
            if (!err)
                res.send('cached')
            else
                req.cacheHelper.getData('TEST', (err, data) => {
                    if (!err)
                        res.send(data)
                    else
                        res.status(500).send({ error: err });
                });
        });
    });
```
#### Important
- For default any request does not have cache, you need to add the method cacheHelper for cache.
- If no catalog is set, the catalog value will be taken from catalog in config.json.
- The catalog time always comes from catalogDuration in config. Please manage the time carefully. 
- If a new catalog is defined that catalog will hold the new values and for refresh the data
you need to work with that catalog.
- If no catalog needs to be specify , set catalog = null in config.json