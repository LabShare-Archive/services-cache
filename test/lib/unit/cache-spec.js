//TEST Scripts for Redis
let cache = require('./../../../lib/cache');
let config = require('./config');
describe("Cache package test", function () {
    let cacheClient = null;

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
      it('It will delete all data that starts with test', function (done) {
        cacheClient.deleteDataByScan('test', (error, data) => {
            expect(data.length).toBeGreaterThanOrEqual(1);
            done();
        });

    })

    it('It will publish and receive a message', function (done) {

        let pubSubClient = new cache(config.redis, 
        config.maxTime,
        true);
        pubSubClient.setObjectValue = ((value) => {
            return value;
        });
        pubSubClient.formatObjectValue = ((value) => {
            return value;
        });
       let pubSubClientB = new cache(config.redis, 
        config.maxTime,
        true);
        //let pubSubClientB = pubSubClient.clone();
        pubSubClient.subscribe('test');
        setTimeout(function() {
            pubSubClientB.publish('test',"this is a test");
        }, 2000);
        pubSubClient.on('message',(channel,message)=>
        {
            expect(message).toEqual('this is a test');
            done();
        });

    })

        it('It will publish and receive a message with pattern', function (done) {

        let pubSubClient = new cache(config.redis, 
        config.maxTime,
        true);
        pubSubClient.setObjectValue = ((value) => {
            return value;
        });
        pubSubClient.formatObjectValue = ((value) => {
            return value;
        });
       let pubSubClientB = new cache(config.redis, 
        config.maxTime,
        true);
        //let pubSubClientB = pubSubClient.clone();
        pubSubClient.psubscribe('test/*');
        setTimeout(function() {
            pubSubClientB.publish('test/12',"this is a test");
        }, 2000);
        pubSubClient.on('pmessage',(pattern,channel,message)=>
        {
            expect(message).toEqual('this is a test');
            done();
        });

    })




});