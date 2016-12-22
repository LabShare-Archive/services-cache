###Cache

Cache is the main library for the services-cache library. It provides all the methods for cache the data in Redis.
You can use it with callbacks or with promises.
### Methods

***A Hash is described as Object in this library**.
***A value is a string value**.
### Save and Get (Value) Methods
- **save**: method for store a value in cache.
  -  Save formater - **setValue**
- **get**: method for retreive a value from cache.
    -  Get formater -  **formatValue**
- **saveElementsInSortedSet**: method for save a list of elements in cache.
- **getElementsFromSortedSet**: method for retreive a list of elements from cache.
### Objects (hash) Methods
- **saveObject**: method for store an object in cache.
  -  Save formater - **setObjectValue**
- **getObject**: method for retreive an object from cache.
    -  Get formater -  **formatObjectValue**
- **deepSaveObjectList**: method for save object and creates a lists in cache storage.
- **refreshDeepSaveObjectList**: method for save object and creates a lists in cache storage, 
    -this method deletes all the previous information in the cached list.
- **saveObjectInList**: method for attache or replace an object in a list in cache.
- **deleteObjectFromList**: method for delete an object in a cached list.
- **getAllObjectsList**: method for retreive all the objects from a list in cache.
- **getObjectsListByRange**: method for retreive all the objects by range (paged) 
    -from a list in cache.
- **deleteAllList**: method for delete a list and its objects from cache.

### Generic Methods
- **delete**: Generic delete method.
- **quit**: Terminates the client connection with Redis.

You can also:
  - Retreive the Redis client object for create more operations.
  - Create your own formaters.
  - Define the deepSaveObjects child objects id in Redis.

### Usage
```sh
//add a reference to the package
let cache = require('service-cache').cache;
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
# Simple Value Methods
For save a value in Redis use the **save** method: 
```sh
/**
 * @description Saves the value in cache.
 * NOTE: It uses the format method setValue.
 * @param {string | array} [key] - The unique ID used for cache the value.
 * @param {object} [data] - The value for store in cache.
 * @param {callback} [callback] - The callback returning the result of the transaction.
 * 
 */  
  cacheClient.save({key},{data},(error,data)=>
    {
       ...
    });

```
**Note: The key can be a single string or an array of strings.**

For get a value from Redis use the **get** method:
```sh
/**
 * @description Gets the value from cache.
 * NOTE: It uses the format method formatValue.
 * @param {string | array} [key] - The unique ID used for cache the value.
 * @param {callback} [callback] - The callback returning the result of the transaction.
 * 
 */
  cacheClient.get({key},(error,data)=>
    {
       ...
    });

```
## 
For save an entire value's list in cache use the **saveElementsInSortedSet** method:
```sh
/**
 * @description Creates a sorted list of elements|values in cache.
 * NOTE: It uses the format method setValue.
 * @param {string | array} [listKey] - The unique ID used for the list of values in cache.
 * @param {array} [data] - Arrays of values for store in cache.
 * @param {callback} [callback] - The callback returning the result of the transaction.
 * 
 * */ 
  cacheClient.saveElementsInSortedSet({listKey},{data},{duration} ,(error,data)=>
    {
       ...
    });
```
For retreive the entire value's list from cache use the **getElementsFromSortedSet** method:
```sh
/**
 * @description Gets a list of elements|values from the sorted set from cache.
 * NOTE: It uses the format method formatValue.
 * @param {string | array} [listKey] - The unique ID used for the list of values in cache.
 * @param {callback} [callback] - The callback returning the result of the transaction.
 * 
 */    
  cacheClient.getElementsFromSortedSet({listKey},(error,data)=>
    {
       ...
    });
```
## Value Formaters
Each of the value methods use formaters for set format of value for insert and for set the format of the 
value when is retreived from the cache.
This formaters are : **setValue** and  **formatValue**, you can change them as follows:
 ```sh 
  cacheClient.setObjectValue = ((value)=>{return JSON.stringify(value.data);})
  cacheClient.formatObjectValue = ((value)=>{return JSON.parse(value);})  
```
You can change this function by using the **options.setValue** and **options.formatValue** in the Cache constructor , or by accesing the Cache properties **setValue** and **formatValue** as described above.
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