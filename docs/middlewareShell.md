### Middleware fo Shell

Plug in for Shell.
### Usage

Add the following configuration inside Shell's  configuration:
```sh
"shell": {
    "LoadServices": false,
    "ServicePath": "",
    "ServiceUrl": "",
    "Auth": {
      "Providers": [
        "google",
        "azure",
        "nih/wsfed"
      ],
      "Url": "https://a.labshare.org"
    },
     
    "Cache":{
    "enable":true,
    "duration": 180,
    "maxTime": 600,
    "catalog":"DEFAULT",
    "catalogDuration":-1,
    "prefix":"PROJECTS",
    "redis": {
        "host": "127.0.0.1",
        "port": 6379
    }
    }
  }
``` 
The values of the configuration are:

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

### Usage with LabShare

Is alredy configurated for use it with lsc, just add the following configuration.

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
#### Important
- For default any request is disabled, you need to add req.allowCache= true for cache the request.
- If no req.catalog is set, the catalog value will be taken from catalog in config. 
- If a new catalog is defined in req.catalog, that catalog will hold the new values and for refresh the data
you need to add the same catalog in the PUT, DELETE, POST request.