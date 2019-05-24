import { IStorage } from './IStorage';
import { ClientOpts } from 'redis';
export declare class RedisStorage implements IStorage {
    private client;
    private connectionStatus;
    private failsafeMode;
    constructor(redisOptions: ClientOpts, failsafeMode?: boolean);
    getItem<T>(key: string | undefined): Promise<T>;
    setItem(key: string, content: any): Promise<void>;
    deleteItem(key: string): Promise<void>;
    clear(): Promise<void>;
}
