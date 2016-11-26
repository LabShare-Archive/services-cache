//TEST Scripts for Redis
let request = require('supertest');
let express = require('express');
let cache = require('../index.js').Cache;
let middleware = require('../index.js').Middleware;


describe("Cache package test", function() {
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
let middlewareClient = new middleware(redisOptions);
middlewareClient.initialize();

var app = express();
app.use(middlewareClient.getMiddleware(10));

app.get('/getvalue/:key', function (req, res) {
  middlewareClient.providerClient.setObjectValue = ((value)=>{return JSON.stringify(value.data);})
  middlewareClient.providerClient.formatObjectValue = ((value)=>{return JSON.parse(value);})  
  res.send('Hello World!')
}); 
    
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
it('responds Middleware Hello world test', function(done) {
    request(app)
      .get('/getvalue/1')
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        done();
      });
  });
it('responds Middleware Hello world 2 test for cache test', function(done) {
    request(app)
      .get('/getvalue/1')
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        done();
      });
  });  
it('It will test the storage of a string', function(done) {
   
    cacheClient.save(['test-string'],20,10,(error,data)=>
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
    cacheClient.saveObject('test-object',{name:'test',age:20 },10,(error,data)=>
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
        {id:3, name:'test 3', age:15},
        {id:4, name:'test 4', age:55},
        {id:5, name:'test 5', age:75}
    ];
    cacheClient.deepSaveObjectList(['User','1'],"id",data,10,(error,data)=>
    {
      
        expect(error).toBeNull();
        done();

    });
})
it('It will test the append of data to the array in storage', function(done) {

    let data = [
       
        {id:6, name:'test 6', age:85},
        {id:7, name:'test 7', age:95},
        {id:8, name:'test 8', age:45},
        {id:9, name:'test 9', age:25},
        {id:10, name:'test 10', age:85}
    ];
    cacheClient.deepSaveObjectList(['User','1'],"id",data,10,(error,data)=>
    {
      
        expect(error).toBeNull();
        done();

    });
})
it('It will test the retreival of an stored array', function(done) {
     cacheClient.getAllObjectsList(['User','1'],(error,data)=>
    {
  
        expect(data.length).toBe(10);
        done();

    });

})
it('It will test the range retreival of an stored array from 5 to 10', function(done) {
     cacheClient.getObjectsListByRange(['User','1'],5,10,(error,data)=>
    {
       
        expect(data.length).toBe(5);
        done();

    });

})
it('It will test the refresh of the storage of an array', function(done) {

    let data = [
        {id:1, name:'2test 1', age:35},
        {id:2, name:'2test 2', age:25},
        {id:3, name:'2test 3', age:15},
        {id:4, name:'2test 4', age:55},
        {id:5, name:'2test 5', age:75},
    
    ];
    cacheClient.refreshDeepSaveObjectList(['User','1'],"id",data,10,(error,data)=>
    {
        expect(error).toBeNull();
        done();

    });
})
it('It will test the range retreival of an stored array from 0 to 5', function(done) {
     cacheClient.getObjectsListByRange(['User','1'],0,4,(error,data)=>
    {
        expect(data.length).toBe(5);
        done();

    });

})
it('It will test the update of an object in the list', function(done) {
     let data ={id:1, name:'3test 1', age:35};
     cacheClient.saveObjectInList(['User','1'],'1',1,data,10,(error,data)=>
    {
        expect(error).toBeNull();
        done();

    });

})
it('It will test the deletion of an object in the list', function(done) {
     cacheClient.deleteObjectFromList(['User','1'],'2',(error,data)=>
    {
 
        expect(error).toBeNull();
        done();

    });

})
it('It will test the range retreival of an stored array from 0 to 5', function(done) {
     cacheClient.getObjectsListByRange(['User','1'],0,4,(error,data)=>
    {

        expect(data.length).toBe(4);
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