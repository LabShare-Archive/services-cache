import {StorageProvider} from './storage-provider';
import * as Bluebird from 'bluebird';
import * as Redis from 'redis';
import {ClientOpts} from 'redis';
import {RedisClient} from '../custom';
import * as _ from 'lodash';

(Bluebird as any).promisifyAll(Redis.RedisClient.prototype);
(Bluebird as any).promisifyAll(Redis.Multi.prototype);

enum redisStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
}

export class RedisStorage implements StorageProvider {
  private client: RedisClient;
  private connectionStatus: redisStatus = redisStatus.DISCONNECTED;

  constructor(redisOptions: ClientOpts) {
    this.client = Redis.createClient(redisOptions);

    try {
      this.client.on('connect', () => {
        this.connectionStatus = redisStatus.CONNECTED;
      });
      this.client.on('ready', () => {
        this.connectionStatus = redisStatus.CONNECTED;
      });
      this.client.on('reconnecting', () => {
        this.connectionStatus = redisStatus.DISCONNECTED;
      });
      this.client.on('end', () => {
        this.connectionStatus = redisStatus.DISCONNECTED;
      });
      this.client.on('error', () => {
        this.connectionStatus = redisStatus.DISCONNECTED;
      });
    } catch (error) {
      console.error('connection error', error);
      throw error;
    }
  }

  public async getItem<T>(key: string): Promise<T> {
    const entry: any = await this.client.getAsync(key);
    if (_.isString(entry)) {
      return JSON.parse(entry);
    }
    return entry;
  }

  public async setItem(key: string, content: any): Promise<void> {
    if (_.isObject(content)) {
      content = JSON.stringify(content);
    } else if (_.isUndefined(content)) {
      return this.client.delAsync(key);
    }
    return this.client.setAsync(key, content);
  }

  public async deleteItem(key: string): Promise<void> {
    if (this.connectionStatus === redisStatus.DISCONNECTED) {
      return;
    }
    this.client.del(key);
    return;
  }

  public async clear(): Promise<void> {
    if (this.connectionStatus === redisStatus.DISCONNECTED) {
      return;
    }
    return this.client.flushdbAsync();
  }
}
