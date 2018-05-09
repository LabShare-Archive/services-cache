//TEST Scripts for Redis
let request = require('supertest');
let express = require('express');
let bodyParser = require('body-parser');
let cache = require('./../../../lib/cache');
let config = require('./config');
let middleware = require('./../../../lib/middleware/base');
let delay = require('delay');
describe("Middleware package test", function () {
    let cacheClient = null;
    let mockData = {
        a: 1,
        b: 1
    };
    let middlewareClient = new middleware({ redis: config.redis, maxTime: config.maxTime, prefix: config.prefix, catalog: config.catalog, catalogDuration: config.catalogDuration, logger: config.options });
    let app = express();
    app.use(bodyParser.json()); // to support JSON-encoded bodies
    app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
        extended: true
    }));
    app.use(middlewareClient.getMiddleware(config.duration));
    //adds data by using the method directly
    app.post('/test/addDataDirectly', function (req, res) {
        req.cacheHelper.cacheData('TEST', mockData, null, "TEST-CATALOG", (err, data) => {
            if (!err)
                res.send('cached');
            else
                res.status(500).send({ error: err });
        });
    });
    //gets data by using the method directly
    app.get('/test/getDataDirectly', function (req, res) {
        req.cacheHelper.getfromCache('TEST', (err, data) => {
            if (!err)
                res.send(data)
            else
                res.status(500).send({ error: err });
        });
    });
    //deletes all the data by using a prefix
    app.post('/test/clearData', function (req, res) {
        req.cacheHelper.deleteDataByScan('', (err, data) => {
            if (!err)
                res.send('cached')
            else
                req.cacheHelper.getData('TEST', (err, data) => {
                    if (!err)
                        res.send(data)
                    else
                        res.status(500).send({ error: err });
                });
        });
    });
    //before any test ,all the pubsub objects are instantiated
    beforeEach(function () {

        cacheClient = new cache(config.redis, config.maxTime);
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
                cacheClient.getObject(['TEST-MIDDLEWARE', '/test/getvalue'], (error, data) => {
                    expect(data).not.toBeNull();
                    done();
                });
            });
    });
    it('It will test if the middleware deletes the cache', function (done) {
        request(app)
            .post('/test/update')
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                delay(200)
                    .then(() => {
                        cacheClient.getObject(['TEST-MIDDLEWARE', '/test/getvalue'], (error, data) => {
                            expect(data).toBeNull();
                            done();
                        });
                    });
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
                cacheClient.getObject(['TEST-MIDDLEWARE', '/test/postData:test:value'], (error, data) => {
                    expect(data).not.toBeNull();
                    done();

                });
            });
    });
    it('It will test if the middleware ignores a method', function (done) {
        request(app)
            .get('/test/ignore')
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                cacheClient.getObject(['TEST-MIDDLEWARE', '/test/ignore'], (error, data) => {
                    expect(data).toBeNull();
                    done();

                });
            });
    });

    it('It will test if the middleware cache data directly', function (done) {
        request(app)
            .post('/test/addDataDirectly')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, res) {
                expect(res.text).toBe('cached');
                done();
            });
    });
    it('It will test if the middleware gets data directly from cache', function (done) {
        request(app)
            .get('/test/getDataDirectly')
            .expect(200)
            .end(function (err, res) {
                expect(res.body).toEqual(mockData);
                done();
            });
    });
     it('It will test the recreateResponse method', function (done) {
        request(app)
            .get('/test/recreateResponse')
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                cacheClient.getObject(['TEST-MIDDLEWARE', '/test/recreateResponse','TEST'], (error, data) => {
                    expect(data).not.toBeNull();
                    done();

                });
            });
    });
     it('It will test if the middleware clears data by prefix directly', function (done) {
        request(app)
            .post('/test/clearData')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, res) {
                expect(res.body).toEqual({});
                done();
            });
    });

});