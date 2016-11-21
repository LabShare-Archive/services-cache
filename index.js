let lib = require('./lib/middleware');


const express = require('express')
const app = express()
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

cache = new lib(redisOptions);
cache.initialize();
app.use(cache.getMiddleware(120));
app.get('/', function (req, res) {
  res.send('Hello World!')
});

app.listen(5000);