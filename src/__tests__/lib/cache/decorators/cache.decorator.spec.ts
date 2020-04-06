import {LabShareCache} from '../../../../labshare.cache';
import * as Assert from 'assert';
import {Cache} from '../../../../decorators/cache.decorator';
import * as _ from 'lodash';
const data = ['user', 'max', 'test'];
let strategy: LabShareCache = new LabShareCache({});

class TestClassOne {
  @Cache({ttl: 1000})
  public getUsers(): string[] {
    return data;
  }

  @Cache({ttl: 1000})
  public getUsersPromise(): Promise<string[]> {
    return Promise.resolve(data);
  }
}

class TestClassTwo {
  @Cache({ttl: 20000})
  public async getUsers(): Promise<string[]> {
    return new Promise<string[]>(resolve => {
      setTimeout(() => resolve(data), 500);
    });
  }
}

describe('CacheDecorator - MemoryStorage', () => {
  beforeEach(() => {
    strategy = new LabShareCache({});
    _.set(global, 'LABSHARE_CACHE', strategy);
  });

  it('Should decorate function with LabShareCache correctly', async () => {
    const myClass = new TestClassOne();
    await myClass.getUsersPromise();
  });

  it('Should cache function call correctly', async () => {
    const myClass = new TestClassOne();

    const users = await myClass.getUsers(); // eslint-disable-line @typescript-eslint/await-thenable
    Assert.strictEqual(data, users);
    Assert.strictEqual(
      await strategy.getItem<string[]>('TestClassOne:getUsers'),
      data,
    );
  });

  it('Should cache Promise response correctly', async () => {
    const myClass = new TestClassOne();

    await myClass.getUsersPromise().then(async response => {
      Assert.strictEqual(data, response);
      Assert.strictEqual(
        await strategy.getItem<string[]>('TestClassOne:getUsersPromise'),
        data,
      );
    });
  });

  it('Should cache async response correctly', async () => {
    const myClass = new TestClassTwo();

    const users = await myClass.getUsers();
    Assert.strictEqual(data, users);
    Assert.strictEqual(
      await strategy.getItem<string[]>('TestClassTwo:getUsers'),
      data,
    );
  });
});
