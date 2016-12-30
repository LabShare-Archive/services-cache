module.exports = {
    duration: 10,
    maxTime: 60,
    catalog:"TEST-CATALOG",
    catalogDuration:60,
    prefix:"TEST-MIDDLEWARE",
    redis: {
        "host": "127.0.0.1",
        "port": 6379
    },
    options: {
       
            error: function (error) {
                console.log(error);
            
        }
    }
}