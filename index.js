module.exports= 
{
  Cache : require('./lib/cache'),
  Middleware: require('./lib/middleware'),
  MiddlewareBase: require('./lib/middleware/middleware'),
  Class: require('./lib/class')
}

var express = require('express')
var MiddlewareBase = require('./lib/middleware/middleware');


//base connection
let redisOptions = { "host":"127.0.0.1",
          "port":6379 
    };
let randomValue = null; 
let cacheClient = null;

//error logger
let logger  = {
error :function (error)
{
    //console.log( error);
}
};
//connection settings for redis client
const options = {
    logger:logger
};
let middleware = new MiddlewareBase(redisOptions,null,options);

var app = express()
app.use(middleware.getMiddleware(10));
app.get('/', function (req, res) {
    req.catalog = 'TEST';
  res.send('Hello World!')
})
app.get('/ignore', function (req, res) {
    req.ignoreCache =  true;
  res.send('Hello World 2!')
})
app.post('/post', function (req, res) {
     req.catalog = 'TEST'; res.send('OK!')
});
app.post('/allowpost', function (req, res) {
     req.catalog = 'TEST';
     req.allowCache =true;
      res.send('OK!')
});
app.post('/post2', function (req, res) {
     req.ignoreCache = true; res.send('OK!2')
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})