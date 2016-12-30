//TEST Scripts for Redis
let cClass = require('./../../../lib/class');
let config = require('./config');

describe("Base class test", function () {

    class testClass extends cClass 
    {

        get TestTime()
        {
            return this._testTime;

        }
        set TestTime(value)
        {
            this._testTime =value;
        }

        _dummyData(time)
        {
            return [
                {id:1 , name:"test1" , testTime : time},
                {id:2 , name:"test2" , testTime : time},
                {id:3 , name:"test3" , testTime : time},
                {id:4 , name:"test4" , testTime : time},
                {id:5 , name:"test5" , testTime : time}
            ];
        }

        getData()
        {
            return this._getCacheData(this._catalog,config.catalogDuration,"testClass",config.duration,this._dummyData,[this._testTime]);
        }
        updateData()
        {
            return this._refreshCache(this._catalog);
        }
        constructor()
        {
            
            super(config.redis,config.maxTime);
            this._catalog  = "TEST-CLASS-CATALOG";
            this._testTime = null;
            
        }
    }

    let testObject, testTime;
    //before any test ,all the pubsub objects are instantiated
    beforeAll(function () {

        testObject = new testClass();
        testTime = new Date().getTime();
        testObject.TestTime = testTime;
    });

    it('It will test the storage of the information in the class', function (done) {

    testObject.updateData().then((response)=>
      {
         return testObject.getData();
          
      }).then((data)=>
      {
          expect(data.length >0 && data[0].testTime == testTime ).toBeTruthy();
          done();
          
      },(error)=>{

          expect(error).toBeNull();
          done();
      })

    });

    it('It will test if the information is retreived from cache', function (done) {

      testObject.getData().then((data)=>
      {
          testTime = new Date().getTime();
          expect(data[0].testTime != testTime ).toBeTruthy();
          done();
          
      },(error)=>{

          expect(error).toBeNull();
          done();
      });
    });

    it('It will test if the information is updated', function (done) {

      testObject.updateData().then((response)=>
      {
          testObject.TestTime = testTime;
         return testObject.getData();
          
      }).then((data)=>
      {
          expect(data[0].testTime == testTime ).toBeTruthy();
          done();
      },(error)=>{

          expect(error).toBeNull();
          done();
      });

    })
    

});