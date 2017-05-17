//TEST Scripts for Redis
let cache = require('./../../../lib/cache');
let config = require('./config');
describe("Promises with cache package test", function () {
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

    it('It will test the storage of a string with promises', function (done) {

        cacheClient.set(['test-string'], 20, config.duration).then((response) => {
            expect(response).not.toBeNull();
            done();
        }).catch(done.fail);
    });

    it('It will test the retreival of a string with promises', function (done) {
        cacheClient.get(['test-string']).then((response) => {
            expect(response).toEqual('20');
            done();
        }).catch(done.fail);

    });

    it('It will test the deletion of the cache with promises', function (done) {
        cacheClient.delete(['test-string']).then((response) => {
            expect(response).not.toBeNull();
            done();
        }).catch(done.fail);
    });

    it('It will test the retreival of a non-existence string with promises', function (done) {

        cacheClient.get(['test-string']).then((response) => {
            expect(response).toBeNull();
            done();
        }).catch(done.fail);

    });

    it('It will test the storage of an object with promises', function (done) {
        cacheClient.saveObject('test-object', {
            name: 'test',
            age: 20
        }, config.duration).then((response) => {
            expect(response).not.toBeNull();
            done();
        }).catch(done.fail);

    });



    it('It will test the retreival of an object with promises', function (done) {
        cacheClient.getObject(['test-object']).then((response) => {
            expect(response).not.toBeNull();
            done();
        }).catch(done.fail);


    });


    it('It will test the storage of an array with promises', function (done) {

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
        cacheClient.deepSaveObjectList(['User', '1'], "id", data, config.duration).then((response) => {

            expect(response).not.toBeNull();
            done();

        }).catch(done.fail);
    })

    it('It will test the append of data to the array in storage with promises', function (done) {

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
        cacheClient.deepSaveObjectList(['User', '1'], "id", data, config.duration).then((response) => {

            expect(response).not.toBeNull();
            done();

        }).catch(done.fail);
    })

    it('It will test the retreival of an stored array with promises', function (done) {
        cacheClient.getAllObjectsList(['User', '1']).then((response) => {

            expect(response.length).toBe(10);
            done();

        }).catch(done.fail);

    })

    it('It will test the range retreival of an stored array from 5 to 10 with promises', function (done) {

        cacheClient.getObjectsListByRange(['User', '1'], 5, 10).then((response) => {
            expect(response).not.toBeNull();
            done();
        }).catch(done.fail);
    })

    it('It will test the refresh of the storage of an array with promises', function (done) {

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
        cacheClient.refreshDeepSaveObjectList(['User', '1'], "id", data, config.duration).then((response) => {
            expect(response).not.toBeNull();
            done();

        }).catch(done.fail);
    })

    it('It will test the range retreival of an stored array from 0 to 5 with promises', function (done) {
        cacheClient.getObjectsListByRange(['User', '1'], 0, 4).then((data) => {

            expect(data.length).toBe(5);
            done();

        }).catch(done.fail);

    })

    it('It will test the update of an object in the list with promises', function (done) {
        let data = {
            id: 1,
            name: '3test 1',
            age: 35
        };
        cacheClient.addToCatalog('Test', ['User', '1']).then((response) => {
            return cacheClient.saveObjectInList(['User', '1'], '1', 1, data, config.duration);
        }).then((data) => {

            expect(data).not.toBeNull();
            done();
        }).catch(done.fail);

    })


    it('It will test the update of an object in the list with promises', function (done) {
        let data = {
            id: 1,
            name: '3test 1',
            age: 35
        };
        cacheClient.addToCatalog('Test', ['User', '2']).then((response) => {
            return cacheClient.saveObjectInList(['User', '2'], '1', 1, data, config.duration)
        }).then((data) => {

            expect(data).not.toBeNull();
            done();
        }).catch(done.fail);

    })


    it('It will test the deletion of an object in the list with promises', function (done) {
        cacheClient.deleteObjectFromList(['User', '1'], '2').then((data) => {

            expect(data).not.toBeNull();
            done();

        }).catch(done.fail);

    })

    it('It will test the range retreival of an stored array from 0 to 5 with promises', function (done) {
        cacheClient.getObjectsListByRange(['User', '1'], 0, 4).then((data) => {

            expect(data.length).toBe(4);
            done();

        }).catch(done.fail);

    })

    it('It will test the retreival of the catalog with promises', function (done) {
        cacheClient.getAllFromCatalog('Test').then((data) => {

            expect(data).not.toBeNull();
            done();

        }).catch(done.fail);

    })

    it('It will test the deletion of the catalog with promises', function (done) {
        cacheClient.deleteCatalog('Test').then((data) => {

            expect(data).not.toBeNull();
            done();
        }).catch(done.fail);

    })

    it('It will delete stored array with promises', function (done) {
        cacheClient.deleteAllList(['User', '1']).then((reponse) => {
            return cacheClient.getAllObjectsList(['User', '1']);
        }).then((data) => {
            expect(data.length).toBe(0);
            done();

        }).catch(done.fail);

    })
    it('It will delete all the cache that has a prefix with promises', function (done) {
        cacheClient.deleteDataByScan('test').then(data => {
            expect(data.length).toBeGreaterThanOrEqual(1);
            done();
        }).catch(done.fail);

    })


});