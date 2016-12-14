module.exports = {
    duration: 10,
    maxTime: 60,
    redis: {
        "host": "127.0.0.1",
        "port": 6379
    },
    options: {
        logger: {
            error: function (error) {
                console.log(error);
            }
        }
    }
}