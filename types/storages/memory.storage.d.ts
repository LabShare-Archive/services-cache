import { IStorage } from './IStorage';
export declare class MemoryStorage implements IStorage {
    private memCache;
    constructor();
    getItem<T>(key: string): Promise<T>;
    setItem(key: string, content: any): Promise<void>;
    deleteItem(key: string): Promise<void>;
    clear(): Promise<void>;
}
