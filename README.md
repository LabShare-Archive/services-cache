# Services-Cache

[![N|Solid](https://avatars2.githubusercontent.com/u/2578064?v=3&s=200)](https://github.com/LabShare)

Services-cache is Redis chache wrapper which allows the easy integration with any component.

### Save and Get (hash) Methods
- **save**: method for store a value.
  -  Save formater - **setValue**
- **get**: method for retreive a value.
    -  Get formater -  **formatObjectValue**
### Objects (hash) Methods
- **saveObject**: method for store an object.
  -  Save formater - **setObjectValue**
- **getObject**: method for retreive an objects.
    -  Get formater -  **formatObjectValue**
### Feature Methods
- **deepSaveObject**: method for object's lists storage.
- **getAllObjects**: method for retreive a list of objects
- **deleteAll**: method for delete a list its contents.
 ### Generic Methods
- **delete**: Generic delete method.
- **quit**: Quits the client connection with Redis.

You can also:
  - Retreive the Redis client object for create more operations.
  - Create your own formaters.
  - Define the deepSaveObjects child objects id in Redis.

### Installation

Services-cache requires [Node.js](https://nodejs.org/) v4+ to run.

Execute npm install https://github.com/LabShare/services-cache.git --save

*You might need to use sudo (UNIX).

# Usage
```sh
//add a reference to the package
let cache = require('service-cache');
//create the connection string to Redis
//Default redis connection
let baseConnection = { 
"host":"127.0.0.1",
"port":6379 
    };
//Add an error logger method
let logger  = {
error :function (error)
{
// you can add console.log(error) here
        throw error;
}
};
//create an object with all the configurations
const options = {
//sets maxTime for expiracy in seconds, null will not expire the object
configuration: 
{
    maxTime:null    
},
//reference to the connection string
connection : baseConnection,
//reference to the error logger method
logger:logger
};
```

Create and initiate the service-cache object 
```sh
let cacheClient = new cache(options);
cacheClient.initialize(); 
```
## Redis' set and get methods
For save a value as Redis' set 
```sh
  cacheClient.save({ID},{value},(error,data)=>
    {
       ...
    });

```
For get a value as Redis' get 
```sh
  cacheClient.get({ID},(error,data)=>
    {
       ...
    });

```
## Redis' hmset and hgetall methods
For save an object as Redis' hmset 
```sh
  cacheClient.saveObject({ID},{Object},(error,data)=>
    {
       ...
    });
```
For retreive an object as Redis' hgetall 
```sh
  cacheClient.getObject({ID},(error,data)=>
    {
       ...
    });
```
## Service-Cache feature methods
### deepSaveObject
Stores a list of objects in Redis' cache.
```sh
  cacheClient.saveObject({ID},{Object},(error,data)=>
    {
        cacheClient.deepSaveObject({ID},{Array of objects},{keyfunction, if not function is declared set undefined},(error,data)=>
        {
          .....
        });
    });
```
#### The keyFunction must be declared in options.keyFunction: the default method creates a random ID
```sh
   keyFunction:(value)=>
            {
                return _.random(0,1000);

            }
```
### Todos

 - Complete Readme File
 - Add docker container

License
----

MIT
