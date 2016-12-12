//TEST Scripts for Redis
let request = require('supertest');
let express = require('express');
let bodyParser = require('body-parser');
let cache = require('./../lib/cache');
let config = require('./config');
let middleware = require('./../lib/middleware/base');
describe("Cache package test", function () {
    let cacheClient = null;
    let middlewareClient = new middleware(config.redisOptions, config.maxTime, config.options);
    let app = express();
    app.use(bodyParser.json()); // to support JSON-encoded bodies
    app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
        extended: true
    }));
    app.use(middlewareClient.getMiddleware(config.duration));
    //caches the value 
    app.get('/test/getvalue', function (req, res) {
        req.catalog = 'TEST-CATALOG';
        res.send('Hello World!');
    });
    //ignores to cache the value
    app.get('/test/ignore', function (req, res) {
        req.catalog = 'TEST-CATALOG';
        req.ignoreCache = true;
        res.send('Hello World Ignored!');
    });
    //clears the cache 
    app.post('/test/update', function (req, res) {
        req.catalog = 'TEST-CATALOG';
        res.send('updated')

    });
    //cache the post
    app.post('/test/postData', function (req, res) {
        req.catalog = 'TEST-CATALOG';
        req.allowCache = true;
        res.send('cached')

    });
    //before any test ,all the pubsub objects are instantiated
    beforeEach(function () {

        cacheClient = new cache(config.redisOptions, config.maxTime);
        cacheClient.setObjectValue = ((value) => {
            return value;
        });
        cacheClient.formatObjectValue = ((value) => {
            return value;
        });
        cacheClient.setValue = ((value) => {
            return value
        });
        cacheClient.formatValue = ((value) => {
            return (value)
        });
    });
    //after any test ,all the pubsub objects are set to null
    afterEach(function () {
        cacheClient.quit();
        cacheClient = null;
    });
    it('It will test if the middleware stores the object in cache', function (done) {
        request(app)
            .get('/test/getvalue')
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                done();
            });
    });
    it('It will test if the object stored in the middleware is in cache', function (done) {
        cacheClient.getObject(['/test/getvalue'], (error, data) => {
            expect(data).not.toBeNull();
            done();

        });
    });
    it('It will test if the middleware deletes the cache', function (done) {
        request(app)
            .post('/test/update')
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                done();
            });
    });
    it('It will test if the object stored in the middleware is deleted in cache', function (done) {
        cacheClient.getObject(['/test/getvalue'], (error, data) => {
            expect(data).toBeNull();
            done();

        });
    });
    it('It will test if the middleware allows to cache a post method', function (done) {
        request(app)
            .post('/test/postData')
            .send({
                test: "value"
            })
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                done();
            });
    });
    it('It will test if the object stored in the post middleware is stored in cache', function (done) {
        cacheClient.getObject(['/test/postData:test:value'], (error, data) => {
            expect(data).not.toBeNull();
            done();

        });
    });
    it('It will test if the middleware ignores a method', function (done) {
        request(app)
            .get('/test/ignore')
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                done();
            });
    });
    it('It will test if the middleware dont stores the object in cache', function (done) {
        cacheClient.getObject(['/test/ignore'], (error, data) => {
            expect(data).toBeNull();
            done();

        });
    });
    it('It will test the storage of a string', function (done) {

        cacheClient.set(['test-string'], 20, config.duration, (error, data) => {
            expect(error).toBeNull();
            done();

        });

    });
    it('It will test the retreival of a string', function (done) {

        cacheClient.get(['test-string'], (error, data) => {
            expect(data).toEqual('20');
            done();

        });

    });
    it('It will test the deletion of the cache', function (done) {
        cacheClient.delete(['test-string'], (error, data) => {
            expect(error).toBeNull();
            done();

        });

    });
    it('It will test the retreival of a non-existence string', function (done) {

        cacheClient.get(['test-string'], (error, data) => {
            expect(data).toBeNull();
            done();

        });

    });
    it('It will test the storage of an object', function (done) {
        cacheClient.saveObject('test-object', {
            name: 'test',
            age: 20
        }, config.duration, (error, data) => {
            expect(error).toBeNull();
            done();

        });

    });
    it('It will test the retreival of an object', function (done) {
        cacheClient.getObject(['test-object'], (error, data) => {
            expect(data).not.toBeNull();
            done();

        });

    });

    it('It will test the storage of an array', function (done) {

        let data = [
            {
                id: 1,
                name: 'test 1',
                age: 35
            },
            {
                id: 2,
                name: 'test 2',
                age: 25
            },
            {
                id: 3,
                name: 'test 3',
                age: 15
            },
            {
                id: 4,
                name: 'test 4',
                age: 55
            },
            {
                id: 5,
                name: 'test 5',
                age: 75
            }
    ];
        cacheClient.deepSaveObjectList(['User', '1'], "id", data, config.duration, (error, data) => {

            expect(error).toBeNull();
            done();

        });
    })
    it('It will test the append of data to the array in storage', function (done) {

        let data = [

            {
                id: 6,
                name: 'test 6',
                age: 85
            },
            {
                id: 7,
                name: 'test 7',
                age: 95
            },
            {
                id: 8,
                name: 'test 8',
                age: 45
            },
            {
                id: 9,
                name: 'test 9',
                age: 25
            },
            {
                id: 10,
                name: 'test 10',
                age: 85
            }
    ];
        cacheClient.deepSaveObjectList(['User', '1'], "id", data, config.duration, (error, data) => {

            expect(error).toBeNull();
            done();

        });
    })
    it('It will test the retreival of an stored array', function (done) {
        cacheClient.getAllObjectsList(['User', '1'], (error, data) => {

            expect(data.length).toBe(10);
            done();

        });

    })
    it('It will test the range retreival of an stored array from 5 to 10', function (done) {
        cacheClient.getObjectsListByRange(['User', '1'], 5, config.duration, (error, data) => {

            expect(data.length).toBe(5);
            done();

        });

    })
    it('It will test the refresh of the storage of an array', function (done) {

        let data = [
            {
                id: 1,
                name: '2test 1',
                age: 35
            },
            {
                id: 2,
                name: '2test 2',
                age: 25
            },
            {
                id: 3,
                name: '2test 3',
                age: 15
            },
            {
                id: 4,
                name: '2test 4',
                age: 55
            },
            {
                id: 5,
                name: '2test 5',
                age: 75
            },

    ];
        cacheClient.refreshDeepSaveObjectList(['User', '1'], "id", data, config.duration, (error, data) => {
            expect(error).toBeNull();
            done();

        });
    })
    it('It will test the range retreival of an stored array from 0 to 5', function (done) {
        cacheClient.getObjectsListByRange(['User', '1'], 0, 4, (error, data) => {
            expect(data.length).toBe(5);
            done();

        });

    })
    it('It will test the update of an object in the list', function (done) {
        let data = {
            id: 1,
            name: '3test 1',
            age: 35
        };
        cacheClient.addToCatalog('Test', ['User', '1']);
        cacheClient.saveObjectInList(['User', '1'], '1', 1, data, config.duration, (error, data) => {

            expect(error).toBeNull();
            done();

        });

    })
    it('It will test the update of an object in the list', function (done) {
        let data = {
            id: 1,
            name: '3test 1',
            age: 35
        };
        cacheClient.addToCatalog('Test', ['User', '2']);
        cacheClient.saveObjectInList(['User', '2'], '1', 1, data, config.duration, (error, data) => {

            expect(error).toBeNull();
            done();

        });

    })
    it('It will test the deletion of an object in the list', function (done) {
        cacheClient.deleteObjectFromList(['User', '1'], '2', (error, data) => {

            expect(error).toBeNull();
            done();

        });

    })
    it('It will test the range retreival of an stored array from 0 to 5', function (done) {
        cacheClient.getObjectsListByRange(['User', '1'], 0, 4, (error, data) => {

            expect(data.length).toBe(4);
            done();

        });

    })
    it('It will test the retreival of the catalog', function (done) {
        cacheClient.getAllFromCatalog('Test', (error, data) => {

            expect(error).toBeNull();
            done();

        });

    })
    it('It will test the deletion of the catalog', function (done) {
        cacheClient.deleteCatalog('Test', (error, data) => {

            expect(error).toBeNull();
            done();

        });

    })
    it('It will delete stored array', function (done) {
        cacheClient.deleteAllList(['User', '1'], (error, data) => {
            cacheClient.getAllObjectsList(['User', '1'], (error, data) => {
                expect(data.length).toBe(0);
                done();

            });
        });

    })


});