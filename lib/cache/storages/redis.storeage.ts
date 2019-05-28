import { IStorage } from './IStorage';
import * as Bluebird from 'bluebird';
import * as Redis from 'redis';
import { ClientOpts } from 'redis';
import { RedisClient } from '../custom';

Bluebird.promisifyAll(Redis.RedisClient.prototype);
Bluebird.promisifyAll(Redis.Multi.prototype);

enum redisStatus {
    CONNECTED = 'connected',
    DISCONNECTED = 'disconnected'
}


export class RedisStorage implements IStorage {

    private client: RedisClient;
    private connectionStatus: redisStatus = redisStatus.DISCONNECTED;
    private failsafeMode: boolean = true;

    constructor(redisOptions: ClientOpts, failsafeMode: boolean = true) {
        this.failsafeMode = failsafeMode;
        this.client =  Redis.createClient(redisOptions);
    
        try {
            if (failsafeMode) {
                this.client.on('connect', () => this.connectionStatus = redisStatus.CONNECTED);
                this.client.on('ready', () => this.connectionStatus = redisStatus.CONNECTED);
                this.client.on('reconnecting', () => this.connectionStatus = redisStatus.DISCONNECTED);
                this.client.on('end', () => this.connectionStatus = redisStatus.DISCONNECTED);
                this.client.on('error', () => this.connectionStatus = redisStatus.DISCONNECTED);
            }
        } catch (error) {
            console.log('connection error');
        }

    
    }

    public async getItem<T>(key: string | undefined): Promise<T> {
        if (this.failsafeMode && this.connectionStatus === redisStatus.DISCONNECTED) {
            return undefined;
        }

        const entry: any = await this.client.getAsync(key);
        let finalItem = entry;
        try {
            finalItem = JSON.parse(entry);
        } catch (error) {
        }

        return finalItem;
    }

    public async setItem(key: string, content: any): Promise<void> {
        if (this.failsafeMode && this.connectionStatus === redisStatus.DISCONNECTED) {
            return undefined;
        }
        if (typeof content === 'object') {
            content = JSON.stringify(content);
        } else if (content === undefined) {
            return this.client.delAsync(key);
        }
        return this.client.setAsync(key, content);
    }

    public async deleteItem(key: string): Promise<void> {
        if (this.failsafeMode && this.connectionStatus === redisStatus.DISCONNECTED) {
            return undefined;
        }
        this.client.del(key);
        return;
    }

    public async clear(): Promise<void> {
        if (this.failsafeMode && this.connectionStatus === redisStatus.DISCONNECTED) {
            return undefined;
        }
        return this.client.flushdbAsync();
    }
}