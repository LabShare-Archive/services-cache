//TEST Scripts for Redis

let cache = require('../lib/cache');
//base connection
let baseConnection = { "host":"127.0.0.1",
          "port":6379 
    };
//error logger
let logger  = {
error :function (error)
{
        throw error;
}
};
//connection settings for redis client
const redisOptions = {
configuration: 
{
    maxTime:null    
},
connection : baseConnection,
logger:logger
};

let randomValue = null; 
let cacheClient = null;
describe("Cache package test", function() {
    
//before any test ,all the pubsub objects are instantiated
beforeEach(function() {

   cacheClient = new cache(redisOptions);
   cacheClient.initialize(); 
   cacheClient.setObjectValue = ((value)=>{return value;});
   cacheClient.formatObjectValue = ((value)=>{return value;});
   cacheClient.setValue= ((value)=>{return JSON.stringify(value)});
   cacheClient.formatValue = ((value)=>{return (value)?JSON.parse(value):null;});  
  });
//after any test ,all the pubsub objects are set to null
afterEach(function() {  
    cacheClient.quit();
    cacheClient = null;   
  });

it('It will test the storage of a string', function(done) {
   
    cacheClient.save(['test-string'],20,(error,data)=>
    {
        expect(error).toBeNull();
        done();

    });

});
it('It will test the retreival of a string', function(done) {
    
    cacheClient.get(['test-string'],(error,data)=>
    {
        expect(data).toEqual(20);
        done();

    });

});
it('It will test the deletion of the cache', function(done) {
    cacheClient.delete(['test-string'],(error,data)=>
    {
        expect(error).toBeNull();
        done();

    });

});
it('It will test the retreival of a non-existence string', function(done) {

    cacheClient.get(['test-string'],(error,data)=>
    {
        expect(data).toBeNull();
        done();

    });

});

it('It will test the storage of an object', function(done) {
    cacheClient.saveObject('test-object',{name:'test',age:20 },(error,data)=>
    {
        expect(error).toBeNull();
        done();

    });

});
it('It will test the retreival of an object', function(done) {
    cacheClient.getObject(['test-object'],(error,data)=>
    {
        expect(data).not.toBeNull();
        done();

    });

});

it('It will test the storage of an array', function(done) {

    let data = [
        {id:1, name:'test 1', age:35},
        {id:2, name:'test 2', age:25},
        {id:3, name:'test 3', age:15}
    ];
    cacheClient.deepSaveObjectList(['User','1'],"id",data,(error,data)=>
    {
      
        expect(error).toBeNull();
        done();

    });
})
it('It will test the retreival of an stored array', function(done) {
     cacheClient.getAllObjectsList(['User','1'],(error,data)=>
    {
        console.log(data);
        expect(error).toBeNull();
        done();

    });

})
it('It will delete stored array', function(done) {
    cacheClient.deleteAllList(['User','1'],(error,data)=>
    {
        cacheClient.getAllObjectsList(['User','1'],(error,data)=>
        {
           expect(data.length).toBe(0);
           done();

        });
    });

})


});