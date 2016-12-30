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
| catalog    | string | The default's cache catalog value, for refresh the information between requests. Required. |
| catalogDuration        | number | The duration of the catalog in cache. (-1) no expire. |
| prefix    | string | Prefix values for each of the objects in cache. Required. |
| redis    | object |[Redis](https://github.com/NodeRedis/node_redis) configuration. Required. |

Also you may send an error method:
```sh
 options: {
       
            error: function (error) {
                console.log(error);

```

### Properties
- **req.catalog**: Add the response to an specific catalog, if the request has a PUT, DELETE, POST type will refresh this catalog.
```sh
  app.get('/getvalue', function (req, res) {
        req.allowCache = true;
        req.catalog = 'CATALOG';
        res.send('Hello World!');
    });
```
- **req.allowCache**: Allows to cache a request.
```sh
    app.post('/postData', function (req, res) {
        req.catalog = 'CATALOG';
        req.allowCache = true;
        res.send('cached')

    });
``` 
- **If req.allowCache is null or undefined**: Ignores to cache a request.
```sh
    //ignores to cache the value
    app.get('/ignore', function (req, res) {
        req.catalog = 'CATALOG';
        res.send('Hello World Ignored!');
    });
```
- **req.cacheDuration**: Overloads the duration default value, must be a valid number.
```sh
  app.get('/getvalue', function (req, res) {
        req.allowCache = true;
        req.cacheDuration = 60;
        req.catalog = 'CATALOG';
        res.send('Hello World!');
    });
```
- **req.refreshCache**: Force to refresh the cache.
```sh
    app.post('/test/update', function (req, res) {
        req.catalog = 'TEST-CATALOG';
        req.refreshCache = true;
        res.send('updated')

    });
```
#### Important
- For default any request is disabled, you need to add req.allowCache= true for cache the request.
- If no req.catalog is set, the catalog value will be taken from catalog in config. 
- If a new catalog is defined in req.catalog, that catalog will hold the new values and for refresh the data
you need to add req.refreshCatalog with that catalog.